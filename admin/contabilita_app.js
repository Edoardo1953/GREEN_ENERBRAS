/**
 * GREEN ENERBRAS ONE SCSp - CONTABILITA PCN LUSSEMBURGO
 * Gestione Bilancio (Bilan), Conto Economico (Pertes et Profits) e Grand Livre
 * Basato sul Plan Comptable Normalisé (PCN) lussemburghese
 */

const CONTABILITA_RECORDS = [
  {
    "data": "2025-08-29",
    "valuta": "2025-08-29",
    "mese": 8,
    "anno": 2025,
    "imp": 1000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": 1000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "1010000 / 1111",
    "desc": "1010000 - Capital Souscrit",
    "partner": "NEW LIFE Sarl",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-09-01",
    "valuta": "2025-09-01",
    "mese": 9,
    "anno": 2025,
    "imp": 10000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": 10000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "1010000 / 1112",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Tubia Edoardo",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-03-31",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "imp": -105.91,
    "tvaPerc": 0.17,
    "tva": -18.0,
    "totale": -123.91,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Immatriculationn - Frais administratifs",
    "partner": "R.C.S. Luxembourg",
    "fattura": "001-2025",
    "paye": "OUI"
  },
  {
    "data": "2025-03-31",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "imp": -12.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -12.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Frais d'extrait RCS",
    "partner": "R.C.S. Luxembourg",
    "fattura": "001-2025",
    "paye": "OUI"
  },
  {
    "data": "2025-04-07",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "imp": -21.43,
    "tvaPerc": 0.17,
    "tva": -3.64,
    "totale": -25.07,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Frais d'extrait RCS - Papier Securise",
    "partner": "R.C.S. Luxembourg",
    "fattura": "002-2025",
    "paye": "OUI"
  },
  {
    "data": "2025-04-07",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "imp": -15.0,
    "tvaPerc": 0.17,
    "tva": -2.55,
    "totale": -17.55,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Inscription au RBE des Beneficiaires effectifs",
    "partner": "R.B.E. Luxembourg",
    "fattura": "003-2025",
    "paye": "OUI"
  },
  {
    "data": "2025-04-07",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "imp": -60.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -60.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Apostille sur documentation Ministere des Affaires Etrangeres et Europeennes",
    "partner": "Ministere des Affaires Etrangeres et Europeennes",
    "fattura": "004-2025",
    "paye": "OUI"
  },
  {
    "data": "2025-04-08",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "imp": -40.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -40.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Apostille sur documentation Ministere des Affaires Etrangeres et Europeennes",
    "partner": "Ministere des Affaires Etrangeres et Europeennes",
    "fattura": "005-2025",
    "paye": "OUI"
  },
  {
    "data": "2025-05-02",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "imp": -25.64,
    "tvaPerc": 0.17,
    "tva": -4.36,
    "totale": -30.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Legalisation documentation",
    "partner": "Notaire Martine Schaeffer",
    "fattura": "006-2025 - Invoice 2501657",
    "paye": "OUI"
  },
  {
    "data": "2025-05-19",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "imp": -96.92,
    "tvaPerc": 0.17,
    "tva": -16.48,
    "totale": -113.4,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Legalisation documentation",
    "partner": "Notaire Martine Schaeffer",
    "fattura": "007-2025 - Invoice 2501874",
    "paye": "OUI"
  },
  {
    "data": "2025-05-19",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "imp": -60.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -60.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Legalisation documentation",
    "partner": "Notaire Martine Schaeffer",
    "fattura": "007-2025 - Invoice 2501874",
    "paye": "OUI"
  },
  {
    "data": "2025-07-22",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "imp": -15.0,
    "tvaPerc": 0.17,
    "tva": -2.55,
    "totale": -17.55,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Inscription au RBE des Beneficiaires effectifs",
    "partner": "R.B.E. Luxembourg",
    "fattura": "008-2025",
    "paye": "OUI"
  },
  {
    "data": "2025-09-09",
    "valuta": "2025-09-09",
    "mese": 9,
    "anno": 2025,
    "imp": 10000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": 10000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "1010000 / 1112",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Tubia Edoardo",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-09-29",
    "valuta": "2025-09-29",
    "mese": 9,
    "anno": 2025,
    "imp": 20000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "1010000 / 1112",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Tubia Silvia",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-10-01",
    "valuta": "2025-10-01",
    "mese": 10,
    "anno": 2025,
    "imp": 20000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "1010000 / 1112",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Tubia Edoardo",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-10-15",
    "valuta": "2025-10-15",
    "mese": 10,
    "anno": 2025,
    "imp": -250.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -250.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333 / 66",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-11-12",
    "valuta": "2025-11-12",
    "mese": 11,
    "anno": 2025,
    "imp": -50000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -50000.0,
    "tipo": "BIL",
    "ap": "IMMOBILISATIONS",
    "classe": "23 - IMMOBILISATIONS FINANCIERES",
    "tipologia": "233 - PARTICIPATIONS",
    "pcnCode": "233 / 261",
    "desc": "Acquisition de participation ",
    "partner": "TRI STAR ENERBRAS ONE SCP",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-11-12",
    "valuta": "2025-11-12",
    "mese": 11,
    "anno": 2025,
    "imp": -5.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -5.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333 / 66",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-11-12",
    "valuta": "2025-11-12",
    "mese": 11,
    "anno": 2025,
    "imp": -4.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -4.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333 / 66",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-11-26",
    "valuta": "2025-11-26",
    "mese": 11,
    "anno": 2025,
    "imp": 20000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "1010000 / 1112",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Bertozzi Stefano",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-11-26",
    "valuta": "2025-11-26",
    "mese": 11,
    "anno": 2025,
    "imp": 20000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "1010000 / 1112",
    "desc": "1010000 - Capital Souscrit",
    "partner": "De Miguel Bellvis Maria",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-11-27",
    "valuta": "2025-11-27",
    "mese": 11,
    "anno": 2025,
    "imp": 40000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": 40000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "1010000 / 1112",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Desiderio Salvatore",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-12-02",
    "valuta": "2025-12-02",
    "mese": 12,
    "anno": 2025,
    "imp": -50000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -50000.0,
    "tipo": "BIL",
    "ap": "IMMOBILISATIONS",
    "classe": "23 - IMMOBILISATIONS FINANCIERES",
    "tipologia": "233 - PARTICIPATIONS",
    "pcnCode": "233 / 261",
    "desc": "Acquisition de participation ",
    "partner": "TRI STAR ENERBRAS ONE SCP",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-12-02",
    "valuta": "2025-12-02",
    "mese": 12,
    "anno": 2025,
    "imp": -5.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -5.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333 / 66",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-12-02",
    "valuta": "2025-12-02",
    "mese": 12,
    "anno": 2025,
    "imp": -4.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -4.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333 / 66",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-12-03",
    "valuta": "2025-12-03",
    "mese": 12,
    "anno": 2025,
    "imp": 20000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "1010000 / 1112",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Tubia Enrico",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-12-09",
    "valuta": "2025-12-09",
    "mese": 12,
    "anno": 2025,
    "imp": 20000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "1010000 / 1112",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Zaniboni Elisa",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-12-11",
    "valuta": "2025-12-11",
    "mese": 12,
    "anno": 2025,
    "imp": 20000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "1010000 / 1112",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Zaniboni Greta",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-12-15",
    "valuta": "2025-12-15",
    "mese": 12,
    "anno": 2025,
    "imp": -50000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -50000.0,
    "tipo": "BIL",
    "ap": "IMMOBILISATIONS",
    "classe": "23 - IMMOBILISATIONS FINANCIERES",
    "tipologia": "233 - PARTICIPATIONS",
    "pcnCode": "233 / 261",
    "desc": "Acquisition de participation ",
    "partner": "TRI STAR ENERBRAS ONE SCP",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-12-15",
    "valuta": "2025-12-15",
    "mese": 12,
    "anno": 2025,
    "imp": -5.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -5.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333 / 66",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2025-12-15",
    "valuta": "2025-12-15",
    "mese": 12,
    "anno": 2025,
    "imp": -4.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -4.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333 / 66",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2026-01-15",
    "valuta": "2026-01-15",
    "mese": 1,
    "anno": 2026,
    "imp": -250.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -250.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333 / 66",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2026-01-26",
    "valuta": "2026-01-26",
    "mese": 1,
    "anno": 2026,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": -58.12,
    "totale": -400.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "",
    "pcnCode": "6138 / 61",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 013/2026",
    "paye": "OUI"
  },
  {
    "data": "2026-01-26",
    "valuta": "2026-01-26",
    "mese": 1,
    "anno": 2026,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": -58.12,
    "totale": -400.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "",
    "pcnCode": "6138 / 61",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 013/2026",
    "paye": "OUI"
  },
  {
    "data": "2026-01-26",
    "valuta": "2026-01-26",
    "mese": 1,
    "anno": 2026,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": -58.12,
    "totale": -400.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "",
    "pcnCode": "6138 / 61",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 013/2026",
    "paye": "OUI"
  },
  {
    "data": "2026-01-26",
    "valuta": "2026-01-26",
    "mese": 1,
    "anno": 2026,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": -58.12,
    "totale": -400.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "",
    "pcnCode": "6138 / 61",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 013/2026",
    "paye": "OUI"
  },
  {
    "data": "2026-01-26",
    "valuta": "2026-01-26",
    "mese": 1,
    "anno": 2026,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": -58.12,
    "totale": -400.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "",
    "pcnCode": "6138 / 61",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 013/2026",
    "paye": "OUI"
  },
  {
    "data": "2026-01-26",
    "valuta": "2026-01-26",
    "mese": 1,
    "anno": 2026,
    "imp": -683.76,
    "tvaPerc": 0.17,
    "tva": -116.24,
    "totale": -800.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "",
    "pcnCode": "6138 / 61",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 013/2026",
    "paye": "OUI"
  },
  {
    "data": "2026-01-26",
    "valuta": "2026-01-26",
    "mese": 1,
    "anno": 2026,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": -58.12,
    "totale": -400.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "",
    "pcnCode": "6138 / 61",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 013/2026",
    "paye": "OUI"
  },
  {
    "data": "2026-01-26",
    "valuta": "2026-01-26",
    "mese": 1,
    "anno": 2026,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": -58.12,
    "totale": -400.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "",
    "pcnCode": "6138 / 61",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 013/2026",
    "paye": "OUI"
  },
  {
    "data": "2026-01-26",
    "valuta": "2026-01-26",
    "mese": 1,
    "anno": 2026,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": -58.12,
    "totale": -400.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "",
    "pcnCode": "6138 / 61",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 013/2026",
    "paye": "OUI"
  },
  {
    "data": "2026-04-17",
    "valuta": "2026-04-17",
    "mese": 4,
    "anno": 2026,
    "imp": -250.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -250.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333 / 66",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2026-04-27",
    "valuta": "2026-04-27",
    "mese": 4,
    "anno": 2026,
    "imp": -15.0,
    "tvaPerc": 0.17,
    "tva": -2.55,
    "totale": -17.55,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Inscription au RBE des Beneficiaires effectifs",
    "partner": "R.B.E. Luxembourg",
    "fattura": "008-2025",
    "paye": "OUI"
  },
  {
    "data": "2026-05-07",
    "valuta": "2026-05-07",
    "mese": 5,
    "anno": 2026,
    "imp": -40000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -40000.0,
    "tipo": "BIL",
    "ap": "IMMOBILISATIONS",
    "classe": "23 - IMMOBILISATIONS FINANCIERES",
    "tipologia": "233 - PARTICIPATIONS",
    "pcnCode": "233 / 261",
    "desc": "Acquisition de participation ",
    "partner": "TRI STAR ENERBRAS ONE SCP",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2026-05-07",
    "valuta": "2026-05-07",
    "mese": 5,
    "anno": 2026,
    "imp": -5.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -5.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333 / 66",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2026-05-07",
    "valuta": "2026-05-07",
    "mese": 5,
    "anno": 2026,
    "imp": -4.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -4.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333 / 66",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2026-07-17",
    "valuta": "2026-07-17",
    "mese": 7,
    "anno": 2026,
    "imp": 40000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": 40000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "1010000 / 1112",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Sterzi Marco",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2026-07-17",
    "valuta": "2026-07-17",
    "mese": 7,
    "anno": 2026,
    "imp": 20000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "1010000 / 1112",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Miletti Giovanni",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2026-07-17",
    "valuta": "2026-07-17",
    "mese": 7,
    "anno": 2026,
    "imp": -683.76,
    "tvaPerc": 0.17,
    "tva": -116.24,
    "totale": -800.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "",
    "pcnCode": "6138 / 61",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 014/2026",
    "paye": "OUI"
  },
  {
    "data": "2026-07-17",
    "valuta": "2026-07-17",
    "mese": 7,
    "anno": 2026,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": -58.12,
    "totale": -400.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "",
    "pcnCode": "6138 / 61",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 014/2026",
    "paye": "OUI"
  },
  {
    "data": "2026-07-21",
    "valuta": "2026-07-21",
    "mese": 7,
    "anno": 2026,
    "imp": -250.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -250.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333 / 66",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2026-07-27",
    "valuta": "2026-07-27",
    "mese": 7,
    "anno": 2026,
    "imp": -50000.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -50000.0,
    "tipo": "BIL",
    "ap": "IMMOBILISATIONS",
    "classe": "23 - IMMOBILISATIONS FINANCIERES",
    "tipologia": "233 - PARTICIPATIONS",
    "pcnCode": "233 / 261",
    "desc": "Acquisition de participation ",
    "partner": "TRI STAR ENERBRAS ONE SCP",
    "fattura": "-",
    "paye": "OUI"
  },
  {
    "data": "2026-07-27",
    "valuta": "2026-07-27",
    "mese": 7,
    "anno": 2026,
    "imp": -25.0,
    "tvaPerc": 0,
    "tva": 0,
    "totale": -25.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333 / 66",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI"
  }
];

let selectedYear = '2025';
let activeTab = 'tab-pnl';

function formatCurrency(num) {
    if (num === null || num === undefined || isNaN(num) || num === '') return '0,00 €';
    const n = Number(num);
    const isNegative = n < 0;
    const absVal = Math.abs(n);
    const parts = absVal.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const formatted = parts.join(',') + ' €';
    return isNegative ? ('- ' + formatted) : formatted;
}

function switchTab(tabId) {
    activeTab = tabId;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.borderBottom = '3px solid transparent';
        btn.style.opacity = '0.7';
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });

    const activeBtn = document.querySelector(`[onclick="switchTab('${tabId}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.borderBottom = '3px solid #10b981';
        activeBtn.style.opacity = '1';
    }

    const target = document.getElementById(tabId);
    if (target) target.style.display = 'block';
}

function renderContabilita() {
    const yearSelect = document.getElementById('filter-year');
    if (yearSelect) selectedYear = yearSelect.value;

    const filtered = CONTABILITA_RECORDS.filter(r => {
        if (selectedYear === 'all') return true;
        return String(r.anno) === String(selectedYear);
    });

    // 1. Calculate Aggregates
    let totalCapitale = 0;
    let totalImmobilisations = 0;
    let totalCharges = 0;
    let totalProduits = 0;
    let bankMovementsSum = 0;

    filtered.forEach(r => {
        const valTot = Number(r.totale) || 0;
        
        if (r.tipo === 'BIL') {
            if (r.pcnCode.startsWith('1010000') || r.tipologia.includes('CAPITAL SOUSCRIT')) {
                totalCapitale += valTot;
            } else if (r.pcnCode.startsWith('233') || r.tipologia.includes('PARTICIPATIONS') || r.classe.includes('IMMOBILISATIONS')) {
                totalImmobilisations += Math.abs(valTot);
            }
        } else if (r.tipo === 'PP') {
            if (!r.isInternalOffset) {
                if (valTot < 0) {
                    totalCharges += Math.abs(valTot);
                } else {
                    totalProduits += valTot;
                }
            }
        }
        
        // Bank balance reflects real movement
        bankMovementsSum += valTot;
    });

    // Risultato Netto
    const netResult = totalProduits - totalCharges;
    const bankBalance = bankMovementsSum;
    const totalActif = totalImmobilisations + bankBalance;
    const totalPassif = totalCapitale + netResult;
    const quadraturaDiff = totalActif - totalPassif;

    // Update KPI Cards
    const elActif = document.getElementById('kpi-total-actif');
    const elPassif = document.getElementById('kpi-total-passif');
    const elCapitale = document.getElementById('kpi-capitale-netto');
    const elRisultato = document.getElementById('kpi-risultato-esercizio');
    const elBanca = document.getElementById('kpi-disponibilita-banca');
    const elImmob = document.getElementById('kpi-partecipazioni');

    if (elActif) elActif.textContent = formatCurrency(totalActif);
    if (elPassif) elPassif.textContent = formatCurrency(totalPassif);
    if (elCapitale) elCapitale.textContent = formatCurrency(totalCapitale);
    if (elRisultato) {
        elRisultato.textContent = formatCurrency(netResult);
        elRisultato.style.color = netResult >= 0 ? '#10b981' : '#f87171';
    }
    if (elBanca) elBanca.textContent = formatCurrency(bankBalance);
    if (elImmob) elImmob.textContent = formatCurrency(totalImmobilisations);

    // Update Quadratura Badge
    const elQuadBadge = document.getElementById('quadratura-badge');
    if (elQuadBadge) {
        if (Math.abs(quadraturaDiff) < 0.01) {
            elQuadBadge.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.4); font-size: 0.9rem;"><i class="fa-solid fa-check-double"></i> BILANCIO QUADRATO (Actif = Passif)</span>`;
        } else {
            elQuadBadge.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; border: 1px solid rgba(239, 68, 68, 0.4); font-size: 0.9rem;"><i class="fa-solid fa-triangle-exclamation"></i> Sbilancio: ${formatCurrency(quadraturaDiff)}</span>`;
        }
    }

    // Render Tabs
    renderPnlTable(filtered, totalCharges, totalProduits, netResult);
    renderBilanTable(totalImmobilisations, bankBalance, totalActif, totalCapitale, netResult, totalPassif);
    renderGrandLivreTable(filtered);
}

function renderPnlTable(records, totalCharges, totalProduits, netResult) {
    const tbody = document.getElementById('table-body-pnl');
    if (!tbody) return;

    // Filter real P&L charges (excluding internal reimbursement technical offsets)
    const pnlRecords = records.filter(r => r.tipo === 'PP' && !r.isInternalOffset);
    const pcnGroups = {};

    pnlRecords.forEach(r => {
        const key = r.pcnCode || 'Autre';
        if (!pcnGroups[key]) {
            pcnGroups[key] = {
                code: r.pcnCode,
                classe: r.classe,
                tipologia: r.tipologia || r.desc,
                desc: r.desc,
                items: [],
                total: 0
            };
        }
        pcnGroups[key].items.push(r);
        pcnGroups[key].total += r.totale;
    });

    let html = '';

    // SEZIONE CHARGES (COSTI)
    html += `
        <tr style="background: rgba(239, 68, 68, 0.15); font-weight: 800; border-top: 2px solid rgba(239, 68, 68, 0.4);">
            <td colspan="3" style="padding: 1rem; color: #fca5a5; font-size: 1.05rem;">
                <i class="fa-solid fa-file-invoice-dollar"></i> CHARGES D'EXPLOITATION ET FINANCIÈRES (CLASSE 6)
            </td>
            <td style="padding: 1rem; text-align: right; color: #fca5a5; font-size: 1.05rem;">- ${formatCurrency(totalCharges)}</td>
        </tr>
    `;

    Object.values(pcnGroups).forEach(group => {
        const isGroupPos = group.total > 0;
        const grpFormatted = isGroupPos ? ('+ ' + formatCurrency(group.total)) : (group.total < 0 ? ('- ' + formatCurrency(Math.abs(group.total))) : '0,00 €');
        const grpColor = isGroupPos ? '#6ee7b7' : (group.total < 0 ? '#fca5a5' : '#ffffff');

        html += `
            <tr style="background: rgba(255,255,255,0.03); font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.08);">
                <td style="padding: 0.8rem 1rem; color: #6ee7b7; font-family: monospace; font-size: 0.95rem;">${group.code}</td>
                <td style="padding: 0.8rem 1rem;">${group.tipologia}</td>
                <td style="padding: 0.8rem 1rem; color: var(--text-muted); font-size: 0.85rem;">${group.items.length} scrittura/e</td>
                <td style="padding: 0.8rem 1rem; text-align: right; color: ${grpColor}; font-weight: bold;">${grpFormatted}</td>
            </tr>
        `;
        group.items.forEach(item => {
            const isItemPos = item.totale > 0;
            const itemColor = isItemPos ? '#10b981' : (item.totale < 0 ? '#f87171' : '#cbd5e1');
            const itemFormatted = isItemPos ? ('+ ' + formatCurrency(item.totale)) : (item.totale < 0 ? ('- ' + formatCurrency(Math.abs(item.totale))) : '0,00 €');

            html += `
                <tr style="border-bottom: 1px dashed rgba(255,255,255,0.05); font-size: 0.88rem; color: #cbd5e1;">
                    <td style="padding: 0.5rem 0.75rem 0.5rem 1.25rem; color: var(--text-muted); white-space: nowrap; font-family: monospace; font-size: 0.85rem;"><i class="fa-solid fa-angle-right" style="font-size: 0.7rem;"></i> ${item.data}</td>
                    <td style="padding: 0.5rem 1rem;">${item.desc} <span style="color: var(--text-muted);">(${item.partner})</span></td>
                    <td style="padding: 0.5rem 1rem; color: var(--text-muted);">${item.fattura || '-'}</td>
                    <td style="padding: 0.5rem 1rem; text-align: right; color: ${itemColor}; white-space: nowrap; font-weight: 600;">${itemFormatted}</td>
                </tr>
            `;
        });
    });

    // SEZIONE PRODUITS (RICAVI)
    html += `
        <tr style="background: rgba(16, 185, 129, 0.15); font-weight: 800; border-top: 2px solid rgba(16, 185, 129, 0.4); margin-top: 1rem;">
            <td colspan="3" style="padding: 1rem; color: #6ee7b7; font-size: 1.05rem;">
                <i class="fa-solid fa-chart-line"></i> PRODUITS D'EXPLOITATION ET FINANCIERS (CLASSE 7)
            </td>
            <td style="padding: 1rem; text-align: right; color: #6ee7b7; font-size: 1.05rem;">+ ${formatCurrency(totalProduits)}</td>
        </tr>
    `;

    if (totalProduits === 0) {
        html += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.9rem; color: var(--text-muted);">
                <td style="padding: 0.8rem 1rem; font-family: monospace;">7000000</td>
                <td colspan="2" style="padding: 0.8rem 1rem;">Nessun ricavo operativo nel periodo (Fase di avviamento / investimenti)</td>
                <td style="padding: 0.8rem 1rem; text-align: right;">0,00 €</td>
            </tr>
        `;
    }

    // RÉSULTAT NET DE L'EXERCICE
    const resultColor = netResult >= 0 ? '#10b981' : '#f87171';
    const resultLabel = netResult >= 0 ? "BÉNÉFICE DE L'EXERCICE (UTILE)" : "PERTE DE L'EXERCICE (PERDITA D'ESERCIZIO)";
    html += `
        <tr style="background: rgba(0,0,0,0.3); font-weight: 800; font-size: 1.15rem; border-top: 2px solid var(--border-color);">
            <td colspan="3" style="padding: 1.2rem; color: white;">
                <i class="fa-solid fa-scale-balanced"></i> RÉSULTAT NET (PCN COMPTE 121 / 141) - ${resultLabel}
            </td>
            <td style="padding: 1.2rem; text-align: right; color: ${resultColor};">${formatCurrency(netResult)}</td>
        </tr>
    `;

    tbody.innerHTML = html;
}

function renderBilanTable(immob, bank, totalActif, capital, netResult, totalPassif) {
    const tbodyActif = document.getElementById('table-body-bilan-actif');
    const tbodyPassif = document.getElementById('table-body-bilan-passif');
    if (!tbodyActif || !tbodyPassif) return;

    // ACTIF
    let htmlActif = `
        <!-- CLASSE 2: IMMOBILISATIONS -->
        <tr style="background: rgba(59, 130, 246, 0.12); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 0.8rem 0.5rem; font-family: monospace; color: #93c5fd; white-space: nowrap; width: 110px; font-size: 0.88rem;">233 / 261</td>
            <td style="padding: 0.8rem 0.5rem;">C. IMMOBILISATIONS FINANCIÈRES<br><small style="color: var(--text-muted); font-size: 0.8rem;">Partecipazione TRI STAR ENERBRAS ONE SCP</small></td>
            <td style="padding: 0.8rem 0.5rem; text-align: right; color: var(--text-main, #ffffff); font-weight: bold; white-space: nowrap; width: 140px;">${formatCurrency(immob)}</td>
        </tr>
        <!-- CLASSE 5: AVOIRS EN BANQUE -->
        <tr style="background: rgba(16, 185, 129, 0.12); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 0.8rem 0.5rem; font-family: monospace; color: #6ee7b7; white-space: nowrap; width: 110px; font-size: 0.88rem;">512 / 513</td>
            <td style="padding: 0.8rem 0.5rem;">D. ACTIF CIRCULANT - BANQUE<br><small style="color: var(--text-muted); font-size: 0.8rem;">Banque de Luxembourg EUR (LU47...2001)</small></td>
            <td style="padding: 0.8rem 0.5rem; text-align: right; color: #10b981; font-weight: bold; white-space: nowrap; width: 140px;">${formatCurrency(bank)}</td>
        </tr>
        <!-- TOTAL ACTIF -->
        <tr style="background: rgba(0,0,0,0.35); font-weight: 800; border-top: 2px solid #3b82f6;">
            <td colspan="2" style="padding: 0.85rem 0.5rem; color: #93c5fd; font-size: 0.95rem; white-space: nowrap;"><i class="fa-solid fa-wallet"></i> TOTAL ACTIF</td>
            <td style="padding: 0.85rem 0.5rem; text-align: right; color: #93c5fd; font-size: 0.95rem; font-weight: 800; white-space: nowrap;">${formatCurrency(totalActif)}</td>
        </tr>
    `;
    tbodyActif.innerHTML = htmlActif;

    // PASSIF
    const resColor = netResult >= 0 ? '#10b981' : '#f87171';
    let htmlPassif = `
        <!-- CLASSE 1: CAPITAL SOUSCRIT -->
        <tr style="background: rgba(16, 185, 129, 0.12); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 0.8rem 0.5rem; font-family: monospace; color: #6ee7b7; white-space: nowrap; width: 110px; font-size: 0.88rem;">1010000</td>
            <td style="padding: 0.8rem 0.5rem;">A.I. CAPITAL SOUSCRIT<br><small style="color: var(--text-muted); font-size: 0.8rem;">Apporti Associati (General Partner & LPs)</small></td>
            <td style="padding: 0.8rem 0.5rem; text-align: right; color: var(--text-main, #ffffff); font-weight: bold; white-space: nowrap; width: 140px;">${formatCurrency(capital)}</td>
        </tr>
        <!-- RÉSULTAT NET DE L'EXERCICE -->
        <tr style="background: rgba(239, 68, 68, 0.12); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06);">
            <td style="padding: 0.8rem 0.5rem; font-family: monospace; color: #fca5a5; white-space: nowrap; width: 110px; font-size: 0.88rem;">121 / 141</td>
            <td style="padding: 0.8rem 0.5rem;">A.V. RÉSULTAT DE L'EXERCICE<br><small style="color: var(--text-muted); font-size: 0.8rem;">Risultato netto economico del periodo</small></td>
            <td style="padding: 0.8rem 0.5rem; text-align: right; color: ${resColor}; font-weight: bold; white-space: nowrap; width: 140px;">${formatCurrency(netResult)}</td>
        </tr>
        <!-- TOTAL PASSIF -->
        <tr style="background: rgba(0,0,0,0.35); font-weight: 800; border-top: 2px solid #10b981;">
            <td colspan="2" style="padding: 0.85rem 0.5rem; color: #6ee7b7; font-size: 0.95rem; white-space: nowrap;"><i class="fa-solid fa-scale-balanced"></i> TOTAL PASSIF & CAPITAUX</td>
            <td style="padding: 0.85rem 0.5rem; text-align: right; color: #6ee7b7; font-size: 0.95rem; font-weight: 800; white-space: nowrap;">${formatCurrency(totalPassif)}</td>
        </tr>
    `;
    tbodyPassif.innerHTML = htmlPassif;
}

function renderGrandLivreTable(records) {
    const tbody = document.getElementById('table-body-grand-livre');
    if (!tbody) return;

    let runningBalance = 0;
    let html = '';

    records.forEach((r, idx) => {
        const val = Number(r.totale) || 0;
        runningBalance += val;
        const valColor = val >= 0 ? '#10b981' : '#f87171';
        const badgeClass = r.tipo === 'BIL' ? 'badge-bilan' : 'badge-pnl';
        const badgeText = r.tipo === 'BIL' ? 'BILAN' : 'P&L';

        html += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.9rem;">
                <td style="padding: 0.75rem 0.5rem; text-align: center; color: var(--text-muted);">${idx + 1}</td>
                <td style="padding: 0.75rem 0.5rem; font-family: monospace; white-space: nowrap;">${r.data}</td>
                <td style="padding: 0.75rem 0.5rem;">
                    <span style="font-weight: 600; color: white;">${r.partner}</span><br>
                    <small style="color: var(--text-muted);">${r.desc}</small>
                </td>
                <td style="padding: 0.75rem 0.5rem; font-family: monospace; color: #93c5fd;">${r.pcnCode || '-'}</td>
                <td style="padding: 0.75rem 0.5rem; text-align: center;">
                    <span style="padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; background: ${r.tipo === 'BIL' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${r.tipo === 'BIL' ? '#60a5fa' : '#fca5a5'};">${badgeText}</span>
                </td>
                <td style="padding: 0.75rem 0.5rem; text-align: right; color: ${valColor}; font-weight: 600;">${formatCurrency(r.imp)}</td>
                <td style="padding: 0.75rem 0.5rem; text-align: right; color: var(--text-muted);">${r.tva ? formatCurrency(r.tva) : '-'}</td>
                <td style="padding: 0.75rem 0.5rem; text-align: right; color: ${valColor}; font-weight: bold;">${formatCurrency(val)}</td>
                <td style="padding: 0.75rem 0.5rem; text-align: right; font-weight: bold; color: #38bdf8;">${formatCurrency(runningBalance)}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ==========================================
// EXPORT FUNCTIONS (EXCEL & PDF)
// ==========================================

function exportContabilitaExcel() {
    if (typeof XLSX === 'undefined') {
        alert('Libreria XLSX in fase di caricamento. Riprova tra un istante.');
        return;
    }

    const filtered = CONTABILITA_RECORDS.filter(r => {
        if (selectedYear === 'all') return true;
        return String(r.anno) === String(selectedYear);
    });

    const wb = XLSX.utils.book_new();

    const wsData = [
        ['Nr', 'Data Contabile', 'Data Valuta', 'Anno', 'Conto PCN', 'Controparte / Partner', 'Descrizione', 'Tipo (BIL/PP)', 'Imponibile EUR', 'TVA EUR', 'Totale EUR', 'Rif. Fattura', 'Pagato']
    ];

    filtered.forEach((r, i) => {
        wsData.push([
            i + 1,
            r.data,
            r.valuta,
            r.anno,
            r.pcnCode,
            r.partner,
            r.desc,
            r.tipo,
            r.imp,
            r.tva || 0,
            r.totale,
            r.fattura || '',
            r.paye
        ]);
    });

    const wsJournal = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, wsJournal, `Journal_${selectedYear}`);

    XLSX.writeFile(wb, `GREEN_ENERBRAS_Contabilita_PCN_${selectedYear}.xlsx`);
}

function exportContabilitaPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        window.print();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text(`GREEN ENERBRAS ONE SCSp - Bilancio PCN ${selectedYear}`, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Société en Commandite Spéciale - RCS Luxembourg: B295061 - Date: ${new Date().toLocaleDateString()}`, 14, 26);

    const filtered = CONTABILITA_RECORDS.filter(r => {
        if (selectedYear === 'all') return true;
        return String(r.anno) === String(selectedYear);
    });

    const rows = filtered.map((r, i) => [
        i + 1,
        r.data,
        r.pcnCode,
        r.partner,
        r.desc,
        formatCurrency(r.totale)
    ]);

    doc.autoTable({
        startY: 32,
        head: [['#', 'Data', 'PCN', 'Partner', 'Descrizione', 'Importo']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 8 }
    });

    doc.save(`Bilancio_PCN_${selectedYear}_Green_Enerbras.pdf`);
}

// Inizializzazione pagina
document.addEventListener('DOMContentLoaded', () => {
    const yearSelect = document.getElementById('filter-year');
    if (yearSelect) {
        yearSelect.addEventListener('change', () => {
            renderContabilita();
        });
    }

    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated) {
        lastUpdated.textContent = new Date().toLocaleDateString('it-IT');
    }

    renderContabilita();
});
