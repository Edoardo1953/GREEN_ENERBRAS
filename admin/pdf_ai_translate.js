
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
}

async function translateTextGemini(fileBase64, targetLang, apiKey, modelName, retries = 6) {
    const cleanKey = apiKey.trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${cleanKey}`;
    const prompt = `Sei un traduttore professionale. Traduci il documento PDF allegato in ${targetLang}. Restituisci SOLO il testo tradotto, preservando i paragrafi, la struttura logica (liste, punti) e tutti i dati. Non aggiungere introduzioni, non dire 'ecco la traduzione'. Mantieni il tono formale del documento.`;
    
    let lastError = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 secondi per i PDF
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: "application/pdf",
                                    data: fileBase64
                                }
                            }
                        ]
                    }]
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                let errorMsg = `Gemini API Error: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData.error && errorData.error.message) {
                        errorMsg = `Errore API Gemini: ${errorData.error.message}`;
                    }
                } catch (e) {}
                
                // Se è un errore temporaneo (5xx o 429), lancia errore per triggerare il retry
                if (response.status === 429 || response.status >= 500) {
                    throw new Error(errorMsg + " (Temporary)");
                }
                // Altrimenti, errore fatale, interrompi i tentativi
                throw new Error("FATAL: " + errorMsg);
            }
            
            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].finishReason === 'SAFETY') {
                return "[Errore: Il documento contiene contenuti bloccati dai filtri di sicurezza di Google. Impossibile tradurre.]";
            }
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
                return data.candidates[0].content.parts[0].text;
            }
            
            console.error("Risposta imprevista da Gemini:", JSON.stringify(data));
            return "[Errore: Risposta imprevista da Gemini] Dettagli: " + JSON.stringify(data);
            
        } catch (err) {
            clearTimeout(timeoutId);
            
            if (err.message && err.message.startsWith("FATAL:")) {
                throw new Error(err.message.replace("FATAL: ", ""));
            }
            
            lastError = err;
            console.warn(`Tentativo ${attempt} fallito per ${targetLang}:`, err.message);
            
            if (attempt < retries) {
                let waitTime = 12000; // default 12s
                const match = err.message.match(/retry in (\d+(?:\.\d+)?)s/);
                if (match) {
                    waitTime = (parseFloat(match[1]) + 2) * 1000; // add 2s padding
                } else {
                    waitTime = attempt * 15000; // 15s then 30s
                }
                console.warn(`Attendo ${waitTime/1000} secondi prima del tentativo ${attempt+1}...`);
                await new Promise(r => setTimeout(r, waitTime));
            }
        }
    }
    
    // Se siamo arrivati qui, tutti i tentativi sono falliti
    if (lastError && lastError.name === 'AbortError') {
        throw new Error(`Timeout: Impossibile tradurre in ${targetLang} dopo ${retries} tentativi (la connessione a Google si blocca). Il PDF potrebbe essere troppo pesante.`);
    }
    
    throw lastError;
}

async function generatePdfFromText(text, lang, originalName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setTextColor(255, 0, 0);
    doc.setFontSize(10);
    const disclaimer = `Traduzione via IA dell'originale in lingua originale - ${lang.toUpperCase()}`;
    doc.text(disclaimer, 10, 10);
    
    // Body
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    
    // Split text into lines to fit page
    const splitText = doc.splitTextToSize(text, 190);
    
    let y = 20;
    for (let i = 0; i < splitText.length; i++) {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
        doc.text(splitText[i], 10, y);
        y += 7; // line height
    }
    
    const blob = doc.output('blob');
    return new File([blob], `${lang.toUpperCase()}_${originalName}`, { type: 'application/pdf' });
}

async function processPdfWithAI(file, apiKey, progressCallback, langs = ['it', 'en', 'fr']) {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    progressCallback('Verifica modelli disponibili con la tua API Key...');
    let modelName = 'models/gemini-1.5-flash';
    try {
        const cleanKey = apiKey.trim();
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
        if (modelsRes.ok) {
            const data = await modelsRes.json();
            if (data.models) {
                const validModels = data.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent') && m.name.includes('gemini'));
                if (validModels.length > 0) {
                    const flash8b = validModels.find(m => m.name.includes('1.5-flash-8b'));
                    const flash = validModels.find(m => m.name.includes('1.5-flash') || m.name.includes('2.5-flash') || m.name.includes('2.0-flash'));
                    const pro = validModels.find(m => m.name.includes('1.5-pro') || m.name.includes('2.5-pro'));
                    // Forza l'uso del modello principale flash (non l'8b che è troppo basico per le traduzioni complesse)
                    modelName = flash ? flash.name : (pro ? pro.name : (flash8b ? flash8b.name : validModels[0].name));
                    console.log("Modello IA selezionato per qualità e velocità:", modelName);
                }
            }
        }
    } catch (e) {
        console.warn("Errore durante il recupero dei modelli, uso il default.", e);
    }

    progressCallback('Lettura del documento PDF originale...');
    const fileBase64 = await fileToBase64(file);
    
    let resultFiles = {};

    if (langs.includes('it')) {
        progressCallback('Traduzione IT in corso...');
        const textIT = await translateTextGemini(fileBase64, 'Italiano', apiKey, modelName);
        resultFiles.fileIT = await generatePdfFromText(textIT, 'it', file.name);
        if (langs.includes('en') || langs.includes('fr')) await delay(8000);
    }
    
    if (langs.includes('en')) {
        progressCallback('Traduzione EN in corso...');
        const textEN = await translateTextGemini(fileBase64, 'Inglese', apiKey, modelName);
        resultFiles.fileEN = await generatePdfFromText(textEN, 'en', file.name);
        if (langs.includes('fr')) await delay(8000);
    }
    
    if (langs.includes('fr')) {
        progressCallback('Traduzione FR in corso...');
        const textFR = await translateTextGemini(fileBase64, 'Francese', apiKey, modelName);
        resultFiles.fileFR = await generatePdfFromText(textFR, 'fr', file.name);
    }
    
    return resultFiles;
}

async function uploadSingleFileToFirebase(file, folderPath = 'uploads/impianti/') {
    const safeName = Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const storageRef = firebase.storage().ref().child(folderPath + safeName);
    const uploadTask = storageRef.put(file);
    await uploadTask;
    let downloadURL = '';
    try {
        downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
    } catch(urlErr) {
        const bucket = 'green-enerbras.firebasestorage.app';
        const path = encodeURIComponent(folderPath + safeName);
        downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${path}?alt=media`;
    }
    return { downloadURL, storagePath: folderPath + safeName };
}
