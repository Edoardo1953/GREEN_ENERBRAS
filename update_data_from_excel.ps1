Add-Type -AssemblyName System.IO.Compression.FileSystem

function ToDouble([string]$val) {
    if (!$val) { return 0.0 }
    $clean = $val.Trim().Replace(',', '.')
    $num = 0.0
    if ([double]::TryParse($clean, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$num)) {
        return $num
    }
    return 0.0
}

function ColToNum([string]$col) {
    $num = 0
    foreach ($char in $col.ToCharArray()) {
        $num = $num * 26 + ([int]$char - [int][char]'A' + 1)
    }
    return $num
}

function NumToCol([int]$num) {
    $col = ""
    while ($num -gt 0) {
        $rem = ($num - 1) % 26
        $col = [char]([int][char]'A' + $rem) + $col
        $num = [Math]::Floor(($num - 1) / 26)
    }
    return $col
}

function Get-TransfertsExchangeData {
    param([string]$projectDir = "C:\Users\Utilisateur\Desktop\Documents\GitHub\GREEN_ENERBRAS")
    
    $transfertsPath = Join-Path $projectDir "uploads\TRANSFERTS.xlsx"
    if (!(Test-Path $transfertsPath)) {
        return @{ avgExchangeRate = 6.0164; currentExchangeRate = 5.8823 }
    }

    $tempCopy = Join-Path $projectDir "scratch_temp_transferts.xlsx"
    try {
        Copy-Item -Path $transfertsPath -Destination $tempCopy -Force
        $zip = [System.IO.Compression.ZipFile]::OpenRead($tempCopy)

        $ssEntry = $zip.GetEntry("xl/sharedStrings.xml")
        $sharedStrings = @()
        if ($ssEntry) {
            $reader = New-Object System.IO.StreamReader($ssEntry.Open())
            $ssXml = [xml]$reader.ReadToEnd()
            $reader.Close()
            foreach ($si in $ssXml.sst.si) {
                if ($si.t) { $sharedStrings += $si.t.InnerText }
                elseif ($si.r) { $sharedStrings += ($si.r | ForEach-Object { $_.t.InnerText }) -join '' }
                else { $sharedStrings += "" }
            }
        }

        $sheetEntry = $zip.GetEntry("xl/worksheets/sheet1.xml")
        $reader = New-Object System.IO.StreamReader($sheetEntry.Open())
        $sheetXml = [xml]$reader.ReadToEnd()
        $reader.Close()
        $zip.Dispose()
        if (Test-Path $tempCopy) { Remove-Item $tempCopy -Force }

        $sheetRows = @{}
        foreach ($row in $sheetXml.worksheet.sheetData.row) {
            $rNum = [int]$row.r
            $rowDict = @{}
            foreach ($c in $row.c) {
                $colLetter = $c.r -replace '[0-9]', ''
                $val = ""
                if ($c.v) {
                    if ($c.t -eq "s") { $val = $sharedStrings[[int]$c.v] }
                    else { $val = $c.v }
                }
                $rowDict[$colLetter] = $val
            }
            $sheetRows[$rNum] = $rowDict
        }

        $avgRate = 0.0
        $currentRate = 0.0

        # Current rate in H1
        if ($sheetRows[1] -and $sheetRows[1]['H']) {
            $currentRate = [double]::Parse($sheetRows[1]['H'].Replace(',', '.'), [System.Globalization.CultureInfo]::InvariantCulture)
        }

        # Look for "Cambio medio" in column G
        foreach ($rNum in $sheetRows.Keys) {
            $rDict = $sheetRows[$rNum]
            if ($rDict['G'] -and $rDict['G'] -like "*Cambio medio*") {
                $valRow = $rNum - 1
                if ($sheetRows[$valRow] -and $sheetRows[$valRow]['G']) {
                    $avgRate = [double]::Parse($sheetRows[$valRow]['G'].Replace(',', '.'), [System.Globalization.CultureInfo]::InvariantCulture)
                }
                break
            }
        }

        # Fallback to G48 if not found by label
        if ($avgRate -eq 0.0 -and $sheetRows[48] -and $sheetRows[48]['G']) {
            $avgRate = [double]::Parse($sheetRows[48]['G'].Replace(',', '.'), [System.Globalization.CultureInfo]::InvariantCulture)
        }

        if ($avgRate -eq 0.0) { $avgRate = 6.0164 }
        if ($currentRate -eq 0.0) { $currentRate = 5.8823 }

        return @{
            avgExchangeRate = $avgRate
            currentExchangeRate = $currentRate
        }
    } catch {
        Write-Host "Error parsing TRANSFERTS: $($_.Exception.Message)"
        if (Test-Path $tempCopy) { Remove-Item $tempCopy -Force }
        return @{ avgExchangeRate = 6.0164; currentExchangeRate = 5.8823 }
    }
}

function Get-ContabilitaBankTransactions {
    param([string]$projectDir = "C:\Users\Utilisateur\Desktop\Documents\GitHub\GREEN_ENERBRAS")
    
    $searchPaths = @(
        (Join-Path $projectDir "uploads\CONTABILITA Green Enerbras One SCSp.xlsx"),
        "C:\Users\Utilisateur\Desktop\CONTABILITA Green Enerbras One SCSp.xlsx",
        "C:\Users\Utilisateur\OneDrive\Desktop\CONTABILITA Green Enerbras One SCSp.xlsx",
        (Join-Path $projectDir "CONTABILITA Green Enerbras One SCSp.xlsx")
    )
    
    $xlsxPath = ""
    foreach ($p in $searchPaths) {
        if (Test-Path $p) {
            $xlsxPath = $p
            break
        }
    }
    
    if (!$xlsxPath) {
        return $null
    }
    
    Write-Host "Trovato file CONTABILITA: $xlsxPath"
    $tempCopy = Join-Path $projectDir "scratch_temp_contabilita.xlsx"
    
    try {
        Copy-Item -Path $xlsxPath -Destination $tempCopy -Force
        $zip = [System.IO.Compression.ZipFile]::OpenRead($tempCopy)
        
        # 1. Read shared strings
        $ssEntry = $zip.GetEntry('xl/sharedStrings.xml')
        $sharedStrings = @()
        if ($ssEntry) {
            $reader = New-Object System.IO.StreamReader($ssEntry.Open())
            $sXml = [xml]$reader.ReadToEnd()
            $reader.Close()
            foreach ($si in $sXml.sst.si) {
                $sharedStrings += $si.InnerText
            }
        }
        
        # 2. Find Compte Banque worksheet
        $wbEntry = $zip.GetEntry("xl/workbook.xml")
        $reader = New-Object System.IO.StreamReader($wbEntry.Open())
        $wbXml = [xml]$reader.ReadToEnd()
        $reader.Close()
        
        $sheetObj = $wbXml.workbook.sheets.sheet | Where-Object { $_.name -like "*Compte*Banque*" -or $_.name -like "*Banque*" } | Select-Object -First 1
        if (!$sheetObj) {
            Write-Host "Foglio 'Compte Banque' non trovato in CONTABILITA!"
            $zip.Dispose()
            if (Test-Path $tempCopy) { Remove-Item $tempCopy -Force }
            return $null
        }
        
        $rId = $sheetObj.GetAttribute("id", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
        $relsEntry = $zip.GetEntry("xl/_rels/workbook.xml.rels")
        $reader = New-Object System.IO.StreamReader($relsEntry.Open())
        $relsXml = [xml]$reader.ReadToEnd()
        $reader.Close()
        
        $rel = $relsXml.Relationships.Relationship | Where-Object { $_.Id -eq $rId }
        $target = $rel.Target
        if ($target.StartsWith("/")) { $target = $target.Substring(1) } else { $target = "xl/" + $target }
        
        $sheetEntry = $zip.GetEntry($target)
        $reader = New-Object System.IO.StreamReader($sheetEntry.Open())
        $shXml = [xml]$reader.ReadToEnd()
        $reader.Close()
        $zip.Dispose()
        if (Test-Path $tempCopy) { Remove-Item $tempCopy -Force }
        
        # 3. Parse transactions
        $transactions = @()
        
        foreach ($row in $shXml.worksheet.sheetData.row) {
            $rNum = [int]$row.r
            if ($rNum -lt 7) { continue }
            
            $rowDict = @{}
            foreach ($c in $row.c) {
                $colLetter = $c.r -replace '[0-9]', ''
                $tAttr = $c.GetAttribute("t")
                $vVal = if ($c.v -is [System.Array]) { $c.v[0] } else { $c.v }
                $val = ""
                if ($vVal) {
                    if ($tAttr -eq "s") {
                        $idx = [int]$vVal
                        if ($idx -lt $sharedStrings.Count) {
                            $val = $sharedStrings[$idx]
                        }
                    } else {
                        $val = $vVal
                    }
                }
                $rowDict[$colLetter] = $val
            }
            
            $rawDate = if ($rowDict.ContainsKey('C')) { $rowDict['C'] } else { "" }
            $category = if ($rowDict.ContainsKey('I') -and $rowDict['I']) { $rowDict['I'].Trim() } else { "" }
            $description = if ($rowDict.ContainsKey('J') -and $rowDict['J']) { $rowDict['J'].Trim() } else { "" }
            $partner = if ($rowDict.ContainsKey('L') -and $rowDict['L']) { $rowDict['L'].Trim() } else { "" }
            $rawAmount = if ($rowDict.ContainsKey('Q')) { $rowDict['Q'] } else { "" }
            $statut = if ($rowDict.ContainsKey('H')) { $rowDict['H'].Trim() } else { "" }
            
            # Format date
            $formattedDate = ""
            if ($rawDate) {
                $numDate = 0.0
                if ([double]::TryParse($rawDate.Replace(',', '.'), [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$numDate)) {
                    if ($numDate -gt 30000 -and $numDate -lt 60000) {
                        $dt = [DateTime]::FromOADate($numDate)
                        $formattedDate = $dt.ToString("dd/MM/yyyy")
                    }
                } else {
                    $formattedDate = $rawDate.Trim()
                }
            }
            
            # Format amount
            $numAmount = 0.0
            if ($rawAmount) {
                $cleanAmt = $rawAmount.Trim().Replace(',', '.')
                [void][double]::TryParse($cleanAmt, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$numAmount)
            }
            
            # Row 7 is Saldo iniziale
            if ($rNum -eq 7) {
                $category = "Saldo iniziale"
                $formattedDate = ""
                $description = ""
                $partner = ""
                $numAmount = 0.0
            } else {
                # For all other rows, must have a valid date and not be draft/unpaid
                if (!$formattedDate) { continue }
                if ($statut -eq "NON") { continue }
            }
            
            $tx = [PSCustomObject]@{
                date = $formattedDate
                category = $category
                description = $description
                partner = $partner
                amount = [Math]::Round($numAmount, 4)
            }
            $transactions += $tx
        }
        
        Write-Host "Totale movimenti bancari estratti da Compte Banque: $($transactions.Count)"
        return $transactions
    } catch {
        Write-Host "Errore durante estrazione CONTABILITA: $($_.Exception.Message)"
        if (Test-Path $tempCopy) { Remove-Item $tempCopy -Force }
        return $null
    }
}

function Get-CosernInflationData {
    param([string]$projectDir = "C:\Users\Utilisateur\Desktop\Documents\GitHub\GREEN_ENERBRAS")
    
    $cosernSearchPaths = @(
        (Join-Path $projectDir "uploads\COSERN_Prezzi_Energia_Definitivo.xlsx"),
        "C:\Users\Utilisateur\Desktop\COSERN_Prezzi_Energia_Definitivo.xlsx",
        "C:\Users\Utilisateur\OneDrive\Desktop\COSERN_Prezzi_Energia_Definitivo.xlsx",
        (Join-Path $projectDir "COSERN_Prezzi_Energia_Definitivo.xlsx")
    )

    $cosernPath = ""
    foreach ($p in $cosernSearchPaths) {
        if (Test-Path $p) {
            $cosernPath = $p
            break
        }
    }

    if (!$cosernPath) {
        Write-Host "File COSERN_Prezzi_Energia_Definitivo.xlsx non trovato."
        return $null
    }

    Write-Host "Trovato file COSERN Inflazione: $cosernPath"
    $tempCopy = Join-Path $projectDir "scratch_temp_cosern.xlsx"
    try {
        Copy-Item $cosernPath $tempCopy -Force
        $zip = [System.IO.Compression.ZipFile]::OpenRead($tempCopy)

        $ssEntry = $zip.GetEntry('xl/sharedStrings.xml')
        $sharedStrings = @()
        if ($ssEntry) {
            $reader = New-Object System.IO.StreamReader($ssEntry.Open())
            $sXml = [xml]$reader.ReadToEnd()
            $reader.Close()
            foreach ($si in $sXml.sst.si) {
                if ($si.t) { $sharedStrings += $si.t.InnerText }
                elseif ($si.r) { $sharedStrings += ($si.r | ForEach-Object { $_.t.InnerText }) -join '' }
                else { $sharedStrings += '' }
            }
        }

        $wbEntry = $zip.GetEntry('xl/workbook.xml')
        $reader = New-Object System.IO.StreamReader($wbEntry.Open())
        $wbXml = [xml]$reader.ReadToEnd()
        $reader.Close()

        $relsEntry = $zip.GetEntry('xl/_rels/workbook.xml.rels')
        $reader = New-Object System.IO.StreamReader($relsEntry.Open())
        $relsXml = [xml]$reader.ReadToEnd()
        $reader.Close()

        $sheetObj = $wbXml.workbook.sheets.sheet | Where-Object { $_.name -eq 'Antigravity' } | Select-Object -First 1
        if (!$sheetObj) {
            $sheetObj = $wbXml.workbook.sheets.sheet | Where-Object { $_.name -like '*Antigravity*' } | Select-Object -First 1
        }
        if (!$sheetObj) {
            $sheetObj = $wbXml.workbook.sheets.sheet[0]
        }
        
        $rId = $sheetObj.GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
        $rel = $relsXml.Relationships.Relationship | Where-Object { $_.Id -eq $rId }
        $target = if ($rel.Target.StartsWith('/')) { $rel.Target.Substring(1) } else { 'xl/' + $rel.Target }

        $sheetEntry = $zip.GetEntry($target)
        $reader = New-Object System.IO.StreamReader($sheetEntry.Open())
        $shXml = [xml]$reader.ReadToEnd()
        $reader.Close()
        $zip.Dispose()
        if (Test-Path $tempCopy) { Remove-Item $tempCopy -Force }

        $rows = @{}
        foreach ($row in $shXml.worksheet.sheetData.row) {
            $rNum = [int]$row.r
            $rowDict = @{}
            foreach ($c in $row.c) {
                $colLetter = $c.r -replace '[0-9]', ''
                $tAttr = $c.GetAttribute('t')
                $val = $c.v
                if ($val -and $tAttr -eq 's') { $val = $sharedStrings[[int]$val] }
                $rowDict[$colLetter] = $val
            }
            $rows[$rNum] = $rowDict
        }

        $result = @()
        $baseTariff = 0.0
        $currentInflationIndex = 100.0

        $rowNums = $rows.Keys | Where-Object { $_ -ge 2 } | Sort-Object
        
        foreach ($r in $rowNums) {
            $rDict = $rows[$r]
            $rawDate = if ($rDict.ContainsKey('A')) { $rDict['A'] } else { '' }
            if (!$rawDate) { continue }
            
            $numDate = 0.0
            $formattedDate = ''
            $periodCode = ''
            if ([double]::TryParse($rawDate.Replace(',', '.'), [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$numDate)) {
                if ($numDate -gt 30000 -and $numDate -lt 60000) {
                    $dt = [DateTime]::FromOADate($numDate)
                    $formattedDate = $dt.ToString('MM/yyyy')
                    $periodCode = $dt.ToString('MMM-yy', [System.Globalization.CultureInfo]::InvariantCulture)
                }
            } else {
                $formattedDate = $rawDate.Trim()
                $periodCode = $rawDate.Trim()
            }
            if (!$formattedDate) { continue }

            $rawTariff = if ($rDict.ContainsKey('B')) { $rDict['B'] } else { '' }
            $numTariff = 0.0
            if ($rawTariff) {
                [void][double]::TryParse($rawTariff.Trim().Replace(',', '.'), [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$numTariff)
            }

            $rawInflation = if ($rDict.ContainsKey('C')) { $rDict['C'] } else { '' }
            $numInflation = 0.0
            $hasInflation = $false
            if ($rawInflation -ne '' -and $rawInflation -ne $null) {
                $hasInflation = [double]::TryParse($rawInflation.Trim().Replace(',', '.'), [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$numInflation)
            }

            if ($numTariff -eq 0.0 -and !$hasInflation) { continue }

            if ($baseTariff -eq 0.0 -and $numTariff -gt 0) {
                $baseTariff = $numTariff
            }

            $tariffIndex = if ($baseTariff -gt 0 -and $numTariff -gt 0) { [Math]::Round(($numTariff / $baseTariff) * 100, 2) } else { $null }

            $rawTariffIdxFromSheet = if ($rDict.ContainsKey('D')) { $rDict['D'] } else { '' }
            if ($rawTariffIdxFromSheet) {
                $sheetTariffIdx = 0.0
                if ([double]::TryParse($rawTariffIdxFromSheet.Trim().Replace(',', '.'), [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$sheetTariffIdx)) {
                    $tariffIndex = [Math]::Round($sheetTariffIdx, 2)
                }
            }

            $rawInfIdxFromSheet = if ($rDict.ContainsKey('E')) { $rDict['E'] } else { '' }
            $inflationIndex = $null
            if ($rawInfIdxFromSheet) {
                $sheetInfIdx = 0.0
                if ([double]::TryParse($rawInfIdxFromSheet.Trim().Replace(',', '.'), [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$sheetInfIdx)) {
                    $inflationIndex = [Math]::Round($sheetInfIdx, 2)
                }
            } elseif ($hasInflation) {
                if ($result.Count -eq 0) {
                    $currentInflationIndex = 100.0
                } else {
                    $currentInflationIndex = $currentInflationIndex * (1.0 + ($numInflation / 100.0))
                }
                $inflationIndex = [Math]::Round($currentInflationIndex, 2)
            }

            $result += [PSCustomObject]@{
                period = $formattedDate
                periodCode = $periodCode
                tariff = [Math]::Round($numTariff, 8)
                inflation = if ($hasInflation) { [Math]::Round($numInflation, 2) } else { $null }
                tariffIndex = $tariffIndex
                inflationIndex = $inflationIndex
            }
        }

        Write-Host "Dati COSERN Inflazione estratti: $($result.Count) mesi."
        return $result
    } catch {
        Write-Host "Errore parsing Cosern Inflation: $($_.Exception.Message)"
        if (Test-Path $tempCopy) { Remove-Item $tempCopy -Force }
        return $null
    }
}

function Update-GreenEnerbrasData {
    $projectDir = "C:\Users\Utilisateur\Desktop\Documents\GitHub\GREEN_ENERBRAS"
    $searchPaths = @(
        "C:\Users\Utilisateur\Desktop\Controle_GD_TriStarOne.xlsx",
        "C:\Users\Utilisateur\OneDrive\Desktop\Controle_GD_TriStarOne.xlsx",
        (Join-Path $projectDir "Controle_GD_TriStarOne.xlsx")
    )

    $xlsxPath = ""
    foreach ($p in $searchPaths) {
        if (Test-Path $p) {
            $xlsxPath = $p
            break
        }
    }

    if (!$xlsxPath) {
        Write-Error "File Controle_GD_TriStarOne.xlsx non trovato!"
        return
    }

    Write-Host "Trovato file Excel: $xlsxPath"
    $localCopy = Join-Path $projectDir "Controle_GD_TriStarOne.xlsx"
    if ($xlsxPath -ne $localCopy) {
        Copy-Item -Path $xlsxPath -Destination $localCopy -Force
        Write-Host "Copiato in: $localCopy"
    }

    # Open and extract XMLs
    $zip = [System.IO.Compression.ZipFile]::OpenRead($localCopy)
    
    # Shared strings
    $ssEntry = $zip.GetEntry("xl/sharedStrings.xml")
    $sharedStrings = @()
    if ($ssEntry) {
        $reader = New-Object System.IO.StreamReader($ssEntry.Open())
        $ssXml = [xml]$reader.ReadToEnd()
        $reader.Close()
        foreach ($si in $ssXml.sst.si) {
            if ($si.t) { $sharedStrings += $si.t }
            elseif ($si.r) { $sharedStrings += ($si.r | ForEach-Object { $_.t }) -join '' }
            else { $sharedStrings += "" }
        }
    }

    # Find Faturamento sheet
    $wbEntry = $zip.GetEntry("xl/workbook.xml")
    $reader = New-Object System.IO.StreamReader($wbEntry.Open())
    $wbXml = [xml]$reader.ReadToEnd()
    $reader.Close()
    
    $sheetObj = $wbXml.workbook.sheets.sheet | Where-Object { $_.name -like "*Faturamento*" } | Select-Object -First 1
    if (!$sheetObj) {
        $zip.Dispose()
        throw "Foglio 'Faturamento (Nao Editar)' non trovato!"
    }
    $rId = $sheetObj.GetAttribute("id", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
    
    $relsEntry = $zip.GetEntry("xl/_rels/workbook.xml.rels")
    $reader = New-Object System.IO.StreamReader($relsEntry.Open())
    $relsXml = [xml]$reader.ReadToEnd()
    $reader.Close()
    $rel = $relsXml.Relationships.Relationship | Where-Object { $_.Id -eq $rId }
    $target = $rel.Target
    if ($target.StartsWith("/")) { $target = $target.Substring(1) } else { $target = "xl/" + $target }
    
    $wsEntry = $zip.GetEntry($target)
    $reader = New-Object System.IO.StreamReader($wsEntry.Open())
    $wsXml = [xml]$reader.ReadToEnd()
    $reader.Close()
    $zip.Dispose()

    # Parse rows into dictionary
    $sheetRows = @{}
    foreach ($row in $wsXml.worksheet.sheetData.row) {
        $rNum = [int]$row.r
        $rowDict = @{}
        foreach ($c in $row.c) {
            $colLetter = $c.r -replace '[0-9]', ''
            $val = ""
            if ($c.v) {
                if ($c.t -eq "s") { $val = $sharedStrings[[int]$c.v] }
                else { $val = $c.v }
            }
            $rowDict[$colLetter] = $val
        }
        $sheetRows[$rNum] = $rowDict
    }

    $row5 = $sheetRows[5]
    $row6 = $sheetRows[6]
    
    # 1. Detect price columns
    $priceCosernCol = ""
    $priceDiscountCol = ""
    $maxColNum = 50
    for ($i = 2; $i -le $maxColNum; $i++) {
        $colLet = NumToCol $i
        $val6 = if ($row6.ContainsKey($colLet)) { $row6[$colLet].Trim() } else { "" }
        if ($val6 -like "*Pre*o*R$*KWh*(-)*" -or $val6 -like "*(-) 30%*") {
            $priceDiscountCol = $colLet
        } elseif ($val6 -like "*Pre*o*R$*KWh*") {
            $priceCosernCol = $colLet
        }
    }
    
    $priceCosernColNum = if ($priceCosernCol) { ColToNum $priceCosernCol } else { 7 }
    
    # 2. Detect Usina columns (from column B until priceCosernCol)
    $usinaCols = @()
    for ($i = 2; $i -lt $priceCosernColNum; $i++) {
        $colLet = NumToCol $i
        $val6 = if ($row6.ContainsKey($colLet)) { $row6[$colLet].Trim() } else { "" }
        if ($val6 -ne "") {
            $usinaCols += $colLet
        }
    }
    
    # 3. Detect Client columns (starting after priceDiscountCol until TOTAL / empty)
    $startClientColNum = if ($priceDiscountCol) { (ColToNum $priceDiscountCol) + 1 } else { 10 }
    while ($startClientColNum -le $maxColNum) {
        $colLet = NumToCol $startClientColNum
        $val6 = if ($row6.ContainsKey($colLet)) { $row6[$colLet].Trim() } else { "" }
        if ($val6 -ne "") { break }
        $startClientColNum++
    }
    
    $clientCols = @()
    for ($i = $startClientColNum; $i -le $maxColNum; $i++) {
        $colLet = NumToCol $i
        $val6 = if ($row6.ContainsKey($colLet)) { $row6[$colLet].Trim() } else { "" }
        $val5 = if ($row5.ContainsKey($colLet)) { $row5[$colLet].Trim() } else { "" }
        if ($val6 -like "*TOTAL*") { break }
        if ($val6 -eq "" -and $val5 -eq "") { break }
        if ($val6 -ne "") {
            $clientCols += $colLet
        }
    }

    Write-Host "Usinas rilevate: $($usinaCols.Count) colonne ($($usinaCols -join ', '))"
    Write-Host "Clienti rilevati: $($clientCols.Count) colonne ($($clientCols -join ', '))"

    # 4. Extract data rows
    $newProduction = @()
    $rowKeys = $sheetRows.Keys | Where-Object { $_ -ge 7 } | Sort-Object
    
    foreach ($r in $rowKeys) {
        $rDict = $sheetRows[$r]
        $compVal = if ($rDict.ContainsKey('A')) { $rDict['A'] } else { "" }
        if (!$compVal -or $compVal -eq "0") { continue }
        
        $period = ""
        $numericDate = 0.0
        if ([double]::TryParse($compVal.Replace(',', '.'), [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$numericDate)) {
            if ($numericDate -gt 30000 -and $numericDate -lt 60000) {
                $dt = [DateTime]::FromOADate($numericDate)
                $period = $dt.ToString("MM/yyyy")
            }
        } else {
            $period = $compVal.Trim()
        }
        if (!$period) { continue }

        # Check if row has data
        $hasData = $false
        for ($uIdx = 0; $uIdx -lt $usinaCols.Count; $uIdx++) {
            $uCol = $usinaCols[$uIdx]
            $kwhRaw = if ($rDict.ContainsKey($uCol)) { $rDict[$uCol] } else { "" }
            $kwhVal = ToDouble $kwhRaw
            if ($kwhVal -gt 0) {
                $hasData = $true
                break
            }
        }
        if (!$hasData) { continue }

        for ($uIdx = 0; $uIdx -lt $usinaCols.Count; $uIdx++) {
            $uCol = $usinaCols[$uIdx]
            $usinaId = ($uIdx + 1).ToString()
            $usinaName = $row6[$uCol].Trim()

            $kwhRaw = if ($rDict.ContainsKey($uCol)) { $rDict[$uCol] } else { "0" }
            $kwhVal = ToDouble $kwhRaw

            $cCol = if ($uIdx -lt $clientCols.Count) { $clientCols[$uIdx] } else { "" }
            $clientName = if ($cCol -and $row6.ContainsKey($cCol)) { $row6[$cCol].Trim() } else { $usinaName }

            $revRaw = if ($cCol -and $rDict.ContainsKey($cCol)) { $rDict[$cCol] } else { "0" }
            $revVal = ToDouble $revRaw

            $newProduction += [PSCustomObject]@{
                period = $period
                id = $usinaId
                kwh = [Math]::Round($kwhVal, 2)
                revenues = [Math]::Round($revVal, 2)
                client = $clientName
            }
        }
    }

    Write-Host "Totale record di produzione generati: $($newProduction.Count)"

    # 5. Read and update data.js
    $dataPath = Join-Path $projectDir "data.js"
    $jsContent = Get-Content -Path $dataPath -Raw
    $idxStart = $jsContent.IndexOf('{')
    $idxEnd = $jsContent.IndexOf("`r`nwindow.")
    if ($idxEnd -eq -1) { $idxEnd = $jsContent.IndexOf("`nwindow.") }
    if ($idxEnd -eq -1) { $idxEnd = $jsContent.LastIndexOf('}') + 1 }
    $jsonStr = $jsContent.Substring($idxStart, $idxEnd - $idxStart).Trim().TrimEnd(';')
    $appData = $jsonStr | ConvertFrom-Json

    # Replace production
    $appData.production = $newProduction
    $appData.lastUpdated = (Get-Date).ToString("dd/MM/yyyy HH:mm")

    # Extract exchange rates from TRANSFERTS.xlsx
    $fxData = Get-TransfertsExchangeData -projectDir $projectDir
    if ($appData.psobject.Properties['avgExchangeRate']) {
        $appData.avgExchangeRate = $fxData.avgExchangeRate
    } else {
        $appData | Add-Member -NotePropertyName 'avgExchangeRate' -NotePropertyValue $fxData.avgExchangeRate
    }
    if ($appData.psobject.Properties['currentExchangeRate']) {
        $appData.currentExchangeRate = $fxData.currentExchangeRate
    } else {
        $appData | Add-Member -NotePropertyName 'currentExchangeRate' -NotePropertyValue $fxData.currentExchangeRate
    }
    Write-Host "Tassi di cambio estratti: Avg = $($fxData.avgExchangeRate), Current = $($fxData.currentExchangeRate)"

    # Extract bank transactions from CONTABILITA Green Enerbras One SCSp.xlsx (Foglio Compte Banque)
    $bankTxs = Get-ContabilitaBankTransactions -projectDir $projectDir
    if ($bankTxs -and $bankTxs.Count -gt 0) {
        $appData.transactions = $bankTxs
        $totalCap = 0.0
        foreach ($tx in $bankTxs) {
            if ($tx.category -and ($tx.category -like "*Capital Contribution*" -or $tx.category -like "*Capital*")) {
                $totalCap += $tx.amount
            }
        }
        if ($totalCap -gt 0) {
            $appData.totalCollected = [Math]::Round($totalCap, 2)
        }
        Write-Host "Movimenti Conto Bancario aggiornati da Excel: $($bankTxs.Count) operazioni (Totale Capitale: $($appData.totalCollected) €)."
    } else {
        Write-Host "Movimenti Conto Bancario invariati (nessun nuovo file o dati non disponibili)."
    }

    # Extract COSERN prices and Inflation data from COSERN_Prezzi_Energia_Definitivo.xlsx
    $cosernInfData = Get-CosernInflationData -projectDir $projectDir
    if ($cosernInfData -and $cosernInfData.Count -gt 0) {
        if ($appData.psobject.Properties['cosernInflation']) {
            $appData.cosernInflation = $cosernInfData
        } else {
            $appData | Add-Member -NotePropertyName 'cosernInflation' -NotePropertyValue $cosernInfData
        }
        Write-Host "Dati COSERN e Inflazione aggiornati: $($cosernInfData.Count) mesi."
    }

    # Save data.js with unified color helpers
    $updatedJson = $appData | ConvertTo-Json -Depth 10
    $colorHelpers = @"

window.USINA_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#14b8a6', '#6366f1', '#0ea5e9', '#2dd4bf', '#2563eb', '#059669', '#4f46e5', '#0891b2', '#15803d'];
window.CLIENT_COLORS = ['#f59e0b', '#ec4899', '#8b5cf6', '#f97316', '#d946ef', '#ef4444', '#e11d48', '#a855f7', '#fb923c', '#f43f5e', '#c026d3', '#ea580c'];

window.getUsinaColor = function(id, index) {
    if (typeof index === 'number' && index >= 0) return window.USINA_COLORS[index % window.USINA_COLORS.length];
    const num = parseInt(id, 10);
    if (!isNaN(num) && num > 0) return window.USINA_COLORS[(num - 1) % window.USINA_COLORS.length];
    return window.USINA_COLORS[0];
};

window.getClientColor = function(client, index, allClientsList) {
    if (typeof index === 'number' && index >= 0) return window.CLIENT_COLORS[index % window.CLIENT_COLORS.length];
    if (allClientsList && Array.isArray(allClientsList)) {
        const foundIdx = allClientsList.indexOf(client);
        if (foundIdx >= 0) return window.CLIENT_COLORS[foundIdx % window.CLIENT_COLORS.length];
    }
    return window.CLIENT_COLORS[0];
};

window.getAvailableYears = function() {
    const dataYears = new Set();
    if (typeof APP_DATA !== 'undefined') {
        if (APP_DATA.production) {
            APP_DATA.production.forEach(r => {
                const y = String(r.period).split('/')[1];
                if (y && !isNaN(Number(y))) dataYears.add(Number(y));
            });
        }
        if (APP_DATA.transactions) {
            APP_DATA.transactions.forEach(t => {
                if (t.date) {
                    const parts = t.date.split('/');
                    const y = parts.length === 3 ? parts[2] : (t.date.split('-')[0]);
                    if (y && !isNaN(Number(y))) dataYears.add(Number(y));
                }
            });
        }
    }
    const currYear = new Date().getFullYear();
    const baseYears = [2024, 2025, 2026, 2027, 2028, currYear];
    const allNums = [...baseYears, ...Array.from(dataYears)];
    const min = Math.min(...allNums);
    const max = Math.max(...allNums);
    const result = [];
    for (let yr = max; yr >= min; yr--) {
        result.push(String(yr));
    }
    return result;
};

window.getAvailableMonths = function() {
    const years = (typeof window.getAvailableYears === 'function') ? window.getAvailableYears() : ['2028', '2027', '2026', '2025', '2024'];
    const allMonths = [];
    years.forEach(y => {
        ['12', '11', '10', '09', '08', '07', '06', '05', '04', '03', '02', '01'].forEach(m => {
            allMonths.push(m + '/' + y);
        });
    });
    return allMonths;
};
"@
    $newJsContent = "const APP_DATA = " + $updatedJson + ";" + "`r`n" + $colorHelpers
    [System.IO.File]::WriteAllText($dataPath, $newJsContent, [System.Text.Encoding]::UTF8)
    Write-Host "File data.js aggiornato con successo!"
}

Update-GreenEnerbrasData