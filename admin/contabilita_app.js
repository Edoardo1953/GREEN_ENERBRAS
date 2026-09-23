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
    "competenza": 2025,
    "imp": 1000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 1000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "I. CAPITAL SOUSCRIT",
    "desc": "1010000 - Capital Souscrit",
    "partner": "NEW LIFE Sarl",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-09-01",
    "valuta": "2025-09-01",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": 10000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 10000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "I. CAPITAL SOUSCRIT",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Tubia Edoardo",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-03-31",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": -105.91,
    "tvaPerc": 0.17,
    "tva": -18.0,
    "totale": -105.91,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Immatriculationn - Frais administratifs",
    "partner": "R.C.S. Luxembourg",
    "fattura": "001-2025",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-03-31",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": -12.0,
    "tvaPerc": 0.0,
    "tva": -0.0,
    "totale": -12.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Frais d'extrait RCS",
    "partner": "R.C.S. Luxembourg",
    "fattura": "001-2025",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-04-07",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": -21.43,
    "tvaPerc": 0.17,
    "tva": -3.64,
    "totale": -21.43,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Frais d'extrait RCS - Papier Securise",
    "partner": "R.C.S. Luxembourg",
    "fattura": "002-2025",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-04-07",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": -15.0,
    "tvaPerc": 0.17,
    "tva": -2.55,
    "totale": -15.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Inscription au RBE des Beneficiaires effectifs",
    "partner": "R.B.E. Luxembourg",
    "fattura": "003-2025",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-04-07",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": -60.0,
    "tvaPerc": 0.0,
    "tva": -0.0,
    "totale": -60.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Apostille sur documentation Ministere des Affaires Etrangeres et Europeennes",
    "partner": "Ministere des Affaires Etrangeres et Europeennes",
    "fattura": "004-2025",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-04-08",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": -40.0,
    "tvaPerc": 0.0,
    "tva": -0.0,
    "totale": -40.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Apostille sur documentation Ministere des Affaires Etrangeres et Europeennes",
    "partner": "Ministere des Affaires Etrangeres et Europeennes",
    "fattura": "005-2025",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-05-02",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": -25.64,
    "tvaPerc": 0.17,
    "tva": -4.36,
    "totale": -25.64,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Legalisation documentation",
    "partner": "Notaire Martine Schaeffer",
    "fattura": "006-2025 - Invoice 2501657",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-05-19",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": -96.92,
    "tvaPerc": 0.17,
    "tva": -16.48,
    "totale": -96.92,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Legalisation documentation",
    "partner": "Notaire Martine Schaeffer",
    "fattura": "007-2025 - Invoice 2501874",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-05-19",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": -60.0,
    "tvaPerc": 0.0,
    "tva": -0.0,
    "totale": -60.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Legalisation documentation",
    "partner": "Notaire Martine Schaeffer",
    "fattura": "007-2025 - Invoice 2501874",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-07-22",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": -15.0,
    "tvaPerc": 0.17,
    "tva": -2.55,
    "totale": -15.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Inscription au RBE des Beneficiaires effectifs",
    "partner": "R.B.E. Luxembourg",
    "fattura": "008-2025",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-09-02",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": -47.58,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -47.58,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6511200 - TVA NON RECUPERABLE",
    "pcnCode": "6511200",
    "desc": "TVA non recuperabile su frais d'actes notaries et administratifs",
    "partner": "Administration de l'Enregistrement, des Domaines et de la TVA",
    "fattura": "001..008-2025",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-09-02",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": 499.48,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 499.48,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Remboursement des Frais",
    "partner": "Tubia Edoardo",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": true
  },
  {
    "data": "2025-09-02",
    "valuta": "2025-09-02",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": -499.48,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -499.48,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Remboursement des Frais",
    "partner": "Tubia Edoardo",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": true
  },
  {
    "data": "2025-09-09",
    "valuta": "2025-09-09",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": 10000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 10000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "I. CAPITAL SOUSCRIT",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Tubia Edoardo",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-09-29",
    "valuta": "2025-09-29",
    "mese": 9,
    "anno": 2025,
    "competenza": 2025,
    "imp": 20000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "I. CAPITAL SOUSCRIT",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Tubia Silvia",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-10-01",
    "valuta": "2025-10-01",
    "mese": 10,
    "anno": 2025,
    "competenza": 2025,
    "imp": 20000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "I. CAPITAL SOUSCRIT",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Tubia Edoardo",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-10-15",
    "valuta": "2025-10-15",
    "mese": 10,
    "anno": 2025,
    "competenza": 2025,
    "imp": -250.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -250.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-11-12",
    "valuta": "2025-11-12",
    "mese": 11,
    "anno": 2025,
    "competenza": 2025,
    "imp": -50000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -50000.0,
    "tipo": "BIL",
    "ap": "IMMOBILISATIONS",
    "classe": "23 - IMMOBILISATIONS FINANCIERES",
    "tipologia": "233 - PARTICIPATIONS",
    "pcnCode": "233",
    "desc": "Acquisition de participation ",
    "partner": "TRI STAR ENERBRAS ONE SCP",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-11-12",
    "valuta": "2025-11-12",
    "mese": 11,
    "anno": 2025,
    "competenza": 2025,
    "imp": -5.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -5.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-11-12",
    "valuta": "2025-11-12",
    "mese": 11,
    "anno": 2025,
    "competenza": 2025,
    "imp": -4.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -4.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-11-26",
    "valuta": "2025-11-26",
    "mese": 11,
    "anno": 2025,
    "competenza": 2025,
    "imp": 20000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "I. CAPITAL SOUSCRIT",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Bertozzi Stefano",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-11-26",
    "valuta": "2025-11-26",
    "mese": 11,
    "anno": 2025,
    "competenza": 2025,
    "imp": 20000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "I. CAPITAL SOUSCRIT",
    "desc": "1010000 - Capital Souscrit",
    "partner": "De Miguel Bellvis Maria",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-11-27",
    "valuta": "2025-11-27",
    "mese": 11,
    "anno": 2025,
    "competenza": 2025,
    "imp": 40000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 40000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "I. CAPITAL SOUSCRIT",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Desiderio Salvatore",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-12-02",
    "valuta": "2025-12-02",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": -50000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -50000.0,
    "tipo": "BIL",
    "ap": "IMMOBILISATIONS",
    "classe": "23 - IMMOBILISATIONS FINANCIERES",
    "tipologia": "233 - PARTICIPATIONS",
    "pcnCode": "233",
    "desc": "Acquisition de participation ",
    "partner": "TRI STAR ENERBRAS ONE SCP",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-12-02",
    "valuta": "2025-12-02",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": -5.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -5.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-12-02",
    "valuta": "2025-12-02",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": -4.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -4.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-12-03",
    "valuta": "2025-12-03",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": 20000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "I. CAPITAL SOUSCRIT",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Tubia Enrico",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-12-09",
    "valuta": "2025-12-09",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": 20000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "I. CAPITAL SOUSCRIT",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Zaniboni Elisa",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-12-11",
    "valuta": "2025-12-11",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": 20000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "I. CAPITAL SOUSCRIT",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Zaniboni Greta",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-12-15",
    "valuta": "2025-12-15",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": -50000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -50000.0,
    "tipo": "BIL",
    "ap": "IMMOBILISATIONS",
    "classe": "23 - IMMOBILISATIONS FINANCIERES",
    "tipologia": "233 - PARTICIPATIONS",
    "pcnCode": "233",
    "desc": "Acquisition de participation ",
    "partner": "TRI STAR ENERBRAS ONE SCP",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-12-15",
    "valuta": "2025-12-15",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": -5.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -5.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-12-15",
    "valuta": "2025-12-15",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": -4.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -4.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2026-01-15",
    "valuta": "2026-01-15",
    "mese": 1,
    "anno": 2026,
    "competenza": 2026,
    "imp": -250.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -250.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-12-31",
    "valuta": "2025-12-31",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": 0.0,
    "totale": -341.88,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "61 - AUTRES CHARGES EXTERNES",
    "tipologia": "6188000 - HONORAIRES ET COMMISSIONS",
    "pcnCode": "6188000",
    "desc": "Participation Fee 2% (NEW LIFE Sarl) - Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "013/2026",
    "paye": "OUI",
    "isInternalOffset": false,
    "isNonCashAccrual": true
  },
  {
    "data": "2025-12-31",
    "valuta": "2025-12-31",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": 0.0,
    "totale": -341.88,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "61 - AUTRES CHARGES EXTERNES",
    "tipologia": "6188000 - HONORAIRES ET COMMISSIONS",
    "pcnCode": "6188000",
    "desc": "Participation Fee 2% (NEW LIFE Sarl) - Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "013/2026",
    "paye": "OUI",
    "isInternalOffset": false,
    "isNonCashAccrual": true
  },
  {
    "data": "2025-12-31",
    "valuta": "2025-12-31",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": 0.0,
    "totale": -341.88,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "61 - AUTRES CHARGES EXTERNES",
    "tipologia": "6188000 - HONORAIRES ET COMMISSIONS",
    "pcnCode": "6188000",
    "desc": "Participation Fee 2% (NEW LIFE Sarl) - Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "013/2026",
    "paye": "OUI",
    "isInternalOffset": false,
    "isNonCashAccrual": true
  },
  {
    "data": "2025-12-31",
    "valuta": "2025-12-31",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": 0.0,
    "totale": -341.88,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "61 - AUTRES CHARGES EXTERNES",
    "tipologia": "6188000 - HONORAIRES ET COMMISSIONS",
    "pcnCode": "6188000",
    "desc": "Participation Fee 2% (NEW LIFE Sarl) - Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "013/2026",
    "paye": "OUI",
    "isInternalOffset": false,
    "isNonCashAccrual": true
  },
  {
    "data": "2025-12-31",
    "valuta": "2025-12-31",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": 0.0,
    "totale": -341.88,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "61 - AUTRES CHARGES EXTERNES",
    "tipologia": "6188000 - HONORAIRES ET COMMISSIONS",
    "pcnCode": "6188000",
    "desc": "Participation Fee 2% (NEW LIFE Sarl) - Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "013/2026",
    "paye": "OUI",
    "isInternalOffset": false,
    "isNonCashAccrual": true
  },
  {
    "data": "2025-12-31",
    "valuta": "2025-12-31",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": -683.76,
    "tvaPerc": 0.17,
    "tva": 0.0,
    "totale": -683.76,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "61 - AUTRES CHARGES EXTERNES",
    "tipologia": "6188000 - HONORAIRES ET COMMISSIONS",
    "pcnCode": "6188000",
    "desc": "Participation Fee 2% (NEW LIFE Sarl) - Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "013/2026",
    "paye": "OUI",
    "isInternalOffset": false,
    "isNonCashAccrual": true
  },
  {
    "data": "2025-12-31",
    "valuta": "2025-12-31",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": 0.0,
    "totale": -341.88,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "61 - AUTRES CHARGES EXTERNES",
    "tipologia": "6188000 - HONORAIRES ET COMMISSIONS",
    "pcnCode": "6188000",
    "desc": "Participation Fee 2% (NEW LIFE Sarl) - Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "013/2026",
    "paye": "OUI",
    "isInternalOffset": false,
    "isNonCashAccrual": true
  },
  {
    "data": "2025-12-31",
    "valuta": "2025-12-31",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": 0.0,
    "totale": -341.88,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "61 - AUTRES CHARGES EXTERNES",
    "tipologia": "6188000 - HONORAIRES ET COMMISSIONS",
    "pcnCode": "6188000",
    "desc": "Participation Fee 2% (NEW LIFE Sarl) - Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "013/2026",
    "paye": "OUI",
    "isInternalOffset": false,
    "isNonCashAccrual": true
  },
  {
    "data": "2025-12-31",
    "valuta": "2025-12-31",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": 0.0,
    "totale": -341.88,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "61 - AUTRES CHARGES EXTERNES",
    "tipologia": "6188000 - HONORAIRES ET COMMISSIONS",
    "pcnCode": "6188000",
    "desc": "Participation Fee 2% (NEW LIFE Sarl) - Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "013/2026",
    "paye": "OUI",
    "isInternalOffset": false,
    "isNonCashAccrual": true
  },
  {
    "data": "2026-01-26",
    "valuta": "2026-01-26",
    "mese": 1,
    "anno": 2026,
    "competenza": 2025,
    "imp": 3418.8,
    "tvaPerc": 0.17,
    "tva": 581.2,
    "totale": 4000.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6188000 - HONORAIRES ET COMMISSIONS",
    "pcnCode": "6188000",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 013/2026",
    "paye": "OUI",
    "isInternalOffset": true
  },
  {
    "data": "2026-01-26",
    "valuta": "2026-01-26",
    "mese": 1,
    "anno": 2026,
    "competenza": 2025,
    "imp": -3418.8,
    "tvaPerc": 0.17,
    "tva": -581.2,
    "totale": -4000.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6188000 - HONORAIRES ET COMMISSIONS",
    "pcnCode": "6188000",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 013/2026",
    "paye": "OUI",
    "isInternalOffset": true
  },
  {
    "data": "2026-04-17",
    "valuta": "2026-04-17",
    "mese": 4,
    "anno": 2026,
    "competenza": 2026,
    "imp": -250.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -250.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2026-04-27",
    "valuta": "2026-04-27",
    "mese": 4,
    "anno": 2026,
    "competenza": 2025,
    "imp": -15.0,
    "tvaPerc": 0.17,
    "tva": -2.55,
    "totale": -15.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Inscription au RBE des Beneficiaires effectifs",
    "partner": "R.B.E. Luxembourg",
    "fattura": "008-2025",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2026-04-27",
    "valuta": "2026-04-27",
    "mese": 4,
    "anno": 2026,
    "competenza": 2025,
    "imp": -2.55,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -2.55,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6511200 - TVA NON RECUPERABLE",
    "pcnCode": "6511200",
    "desc": "TVA non recuperabile - Inscription au RBE",
    "partner": "R.B.E. Luxembourg",
    "fattura": "008-2025",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2026-04-27",
    "valuta": "2026-04-27",
    "mese": 4,
    "anno": 2026,
    "competenza": 2025,
    "imp": 17.55,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 17.55,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Remboursement des Frais",
    "partner": "Tubia Edoardo",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": true
  },
  {
    "data": "2026-04-27",
    "valuta": "2026-04-27",
    "mese": 4,
    "anno": 2026,
    "competenza": 2025,
    "imp": -17.55,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -17.55,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6135000 - FRAIS D'ACTES NOTARIES ET ASSIMILES",
    "pcnCode": "6135000",
    "desc": "Remboursement des Frais",
    "partner": "Tubia Edoardo",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": true
  },
  {
    "data": "2026-05-07",
    "valuta": "2026-05-07",
    "mese": 5,
    "anno": 2026,
    "competenza": 2026,
    "imp": -40000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -40000.0,
    "tipo": "BIL",
    "ap": "IMMOBILISATIONS",
    "classe": "23 - IMMOBILISATIONS FINANCIERES",
    "tipologia": "233 - PARTICIPATIONS",
    "pcnCode": "233",
    "desc": "Acquisition de participation ",
    "partner": "TRI STAR ENERBRAS ONE SCP",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2026-05-07",
    "valuta": "2026-05-07",
    "mese": 5,
    "anno": 2026,
    "competenza": 2026,
    "imp": -5.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -5.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2026-05-07",
    "valuta": "2026-05-07",
    "mese": 5,
    "anno": 2026,
    "competenza": 2026,
    "imp": -4.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -4.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2026-07-17",
    "valuta": "2026-07-17",
    "mese": 7,
    "anno": 2026,
    "competenza": 2026,
    "imp": 40000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 40000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "I. CAPITAL SOUSCRIT",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Sterzi Marco",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2026-07-17",
    "valuta": "2026-07-17",
    "mese": 7,
    "anno": 2026,
    "competenza": 2026,
    "imp": 20000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 20000.0,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "A. CAPITAUX PROPRES",
    "tipologia": "I. CAPITAL SOUSCRIT",
    "pcnCode": "I. CAPITAL SOUSCRIT",
    "desc": "1010000 - Capital Souscrit",
    "partner": "Miletti Giovanni",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2026-07-17",
    "valuta": "2026-07-17",
    "mese": 7,
    "anno": 2026,
    "competenza": 2026,
    "imp": -683.76,
    "tvaPerc": 0.17,
    "tva": -116.24,
    "totale": -683.76,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6188000 - HONORAIRES ET COMMISSIONS",
    "pcnCode": "6188000",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 014/2026",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2026-07-17",
    "valuta": "2026-07-17",
    "mese": 7,
    "anno": 2026,
    "competenza": 2026,
    "imp": -341.88,
    "tvaPerc": 0.17,
    "tva": -58.12,
    "totale": -341.88,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6188000 - HONORAIRES ET COMMISSIONS",
    "pcnCode": "6188000",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 014/2026",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2026-07-17",
    "valuta": "2026-07-17",
    "mese": 7,
    "anno": 2026,
    "competenza": 2026,
    "imp": 1025.64,
    "tvaPerc": 0.17,
    "tva": 174.36,
    "totale": 1200.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6188000 - HONORAIRES ET COMMISSIONS",
    "pcnCode": "6188000",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 014/2026",
    "paye": "OUI",
    "isInternalOffset": true
  },
  {
    "data": "2026-07-17",
    "valuta": "2026-07-17",
    "mese": 7,
    "anno": 2026,
    "competenza": 2026,
    "imp": -1025.64,
    "tvaPerc": 0.17,
    "tva": -174.36,
    "totale": -1200.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "6188000 - HONORAIRES ET COMMISSIONS",
    "pcnCode": "6188000",
    "desc": "Participation Fee 2%",
    "partner": "NEW LIFE Sarl",
    "fattura": "New Life Sàrl 014/2026",
    "paye": "OUI",
    "isInternalOffset": true
  },
  {
    "data": "2026-07-21",
    "valuta": "2026-07-21",
    "mese": 7,
    "anno": 2026,
    "competenza": 2026,
    "imp": -250.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -250.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2026-07-27",
    "valuta": "2026-07-27",
    "mese": 7,
    "anno": 2026,
    "competenza": 2026,
    "imp": -50000.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -50000.0,
    "tipo": "BIL",
    "ap": "IMMOBILISATIONS",
    "classe": "23 - IMMOBILISATIONS FINANCIERES",
    "tipologia": "233 - PARTICIPATIONS",
    "pcnCode": "233",
    "desc": "Acquisition de participation ",
    "partner": "TRI STAR ENERBRAS ONE SCP",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2026-07-27",
    "valuta": "2026-07-27",
    "mese": 7,
    "anno": 2026,
    "competenza": 2026,
    "imp": -25.0,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -25.0,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "",
    "tipologia": "61333 - FRAIS DE COMPTE BANQUE",
    "pcnCode": "61333",
    "desc": "Frais bancaires",
    "partner": "Banque de Luxembourg",
    "fattura": "-",
    "paye": "OUI",
    "isInternalOffset": false
  },
  {
    "data": "2025-12-31",
    "valuta": "2025-12-31",
    "mese": 12,
    "anno": 2025,
    "competenza": 2025,
    "imp": 3418.8,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": 3418.8,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "D. DETTES",
    "tipologia": "4720000 - FACTURES NON PARVENUES (DETTE GP)",
    "pcnCode": "4720000",
    "desc": "Facture non parvenue - Rémunération GP (Note 013/2026)",
    "partner": "NEW LIFE Sarl",
    "fattura": "013/2026",
    "paye": "OUI",
    "isInternalOffset": false,
    "isNonCashAccrual": true
  },
  {
    "data": "2026-01-26",
    "valuta": "2026-01-26",
    "mese": 1,
    "anno": 2026,
    "competenza": 2026,
    "imp": -3418.8,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -3418.8,
    "tipo": "BIL",
    "ap": "CAPITAUX PROPRES ET PASSIF",
    "classe": "D. DETTES",
    "tipologia": "4720000 - FACTURES NON PARVENUES (DETTE GP)",
    "pcnCode": "4720000",
    "desc": "Règlement Facture non parvenue 013/2026 - Rémunération GP",
    "partner": "NEW LIFE Sarl",
    "fattura": "013/2026",
    "paye": "OUI",
    "isInternalOffset": false,
    "isNonCashAccrual": false
  },
  {
    "data": "2026-01-26",
    "valuta": "2026-01-26",
    "mese": 1,
    "anno": 2026,
    "competenza": 2026,
    "imp": -581.2,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -581.2,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "65 - AUTRES CHARGES D'EXPLOITATION",
    "tipologia": "6511200 - TVA NON RECUPERABLE",
    "pcnCode": "6511200",
    "desc": "TVA non recuperabile su Facture 013/2026 (Participation Fee 2%)",
    "partner": "NEW LIFE Sarl",
    "fattura": "013/2026",
    "paye": "OUI",
    "isInternalOffset": false,
    "isNonCashAccrual": false
  },
  {
    "data": "2026-07-17",
    "valuta": "2026-07-17",
    "mese": 7,
    "anno": 2026,
    "competenza": 2026,
    "imp": -174.36,
    "tvaPerc": 0.0,
    "tva": 0.0,
    "totale": -174.36,
    "tipo": "PP",
    "ap": "COSTS",
    "classe": "65 - AUTRES CHARGES D'EXPLOITATION",
    "tipologia": "6511200 - TVA NON RECUPERABLE",
    "pcnCode": "6511200",
    "desc": "TVA non recuperabile su Facture 014/2026 (Participation Fee 2%)",
    "partner": "NEW LIFE Sarl",
    "fattura": "014/2026",
    "paye": "OUI",
    "isInternalOffset": false,
    "isNonCashAccrual": false
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

window.togglePnlGroup = function(groupId) {
    const rows = document.querySelectorAll('.' + groupId);
    const icon = document.getElementById('icon-' + groupId);
    if (!rows.length) return;
    
    const isHidden = rows[0].style.display === 'none';
    
    rows.forEach(r => {
        r.style.display = isHidden ? 'table-row' : 'none';
    });
    
    if (icon) {
        if (isHidden) {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
            icon.style.color = '#10b981';
        } else {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
            icon.style.color = 'inherit';
        }
    }
};

window.toggleAllPnlGroups = function(expand) {
    document.querySelectorAll('.pnl-detail-row').forEach(r => {
        r.style.display = expand ? 'table-row' : 'none';
    });
    document.querySelectorAll('.pnl-group-icon').forEach(icon => {
        if (expand) {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
            icon.style.color = '#10b981';
        } else {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
            icon.style.color = 'inherit';
        }
    });
};

function renderContabilita() {
    const yearSelect = document.getElementById('filter-year');
    if (yearSelect) selectedYear = yearSelect.value;

    const filtered = CONTABILITA_RECORDS.filter(r => {
        if (selectedYear === 'all') return true;
        return String(r.anno) === String(selectedYear);
    });

    // 1. Calcoli KPI Principali e Quadratura
    let totalBanque = 0;
    let totalCharges = 0;
    let totalProduits = 0;
    let totalImmob = 0;
    let totalCapital = 0;
    let totalDettes = 0;

    // Saldo c/c Banca (cumulativo fino all'anno selezionato)
    CONTABILITA_RECORDS.forEach(r => {
        if (selectedYear === 'all' || Number(r.anno) <= Number(selectedYear)) {
            if (!r.isNonCashAccrual && !r.isInternalOffset) {
                totalBanque += Number(r.totale) || 0;
            }
        }
    });

    filtered.forEach(r => {
        const val = Number(r.totale) || 0;
        const pcn = String(r.pcnCode || '');
        const tip = String(r.tipologia || '');
        const desc = String(r.desc || '');
        const ap = String(r.ap || '');

        // Bilan Immobilisations (Immobilisations financières TRI STAR)
        if (ap === 'IMMOBILISATIONS' || tip.includes('PARTICIPATIONS') || pcn.startsWith('233') || pcn.startsWith('261')) {
            totalImmob += Math.abs(val);
        }

        // Bilan Capitale Sociale
        if (pcn.includes('CAPITAL') || tip.includes('CAPITAL') || desc.includes('101')) {
            totalCapital += val;
        }

        // Factures non parvenues / Dettes
        if (pcn.includes('472') || tip.includes('FACTURES NON PARVENUES')) {
            totalDettes += val;
        }

        // Pertes et Profits
        if (r.tipo === 'PP' && !r.isInternalOffset) {
            if (val < 0) {
                totalCharges += Math.abs(val);
            } else {
                totalProduits += val;
            }
        }
    });

    const netResult = totalProduits - totalCharges;

    let totalActif = 0;
    let totalPassif = 0;

    if (selectedYear === '2026') {
        // Variazione di periodo banca nel 2026
        let banquePeriodo = 0;
        filtered.forEach(r => {
            if (!r.isNonCashAccrual && !r.isInternalOffset) {
                banquePeriodo += Number(r.totale) || 0;
            }
        });
        totalActif = totalImmob + banquePeriodo;
        totalPassif = totalCapital + netResult + totalDettes;
    } else {
        totalActif = totalImmob + totalBanque;
        totalPassif = totalCapital + netResult + totalDettes;
    }

    // Aggiornamento KPI Cards in Alto
    const elActif = document.getElementById('kpi-total-actif');
    if (elActif) elActif.textContent = formatCurrency(totalActif);

    const elPassif = document.getElementById('kpi-total-passif');
    if (elPassif) elPassif.textContent = formatCurrency(totalPassif);

    const elCapital = document.getElementById('kpi-capitale-netto');
    if (elCapital) elCapital.textContent = formatCurrency(totalCapital);

    const elResult = document.getElementById('kpi-risultato-esercizio');
    if (elResult) {
        elResult.textContent = formatCurrency(netResult);
        elResult.style.color = netResult >= 0 ? '#10b981' : '#f87171';
    }

    const elBanque = document.getElementById('kpi-disponibilita-banca');
    if (elBanque) elBanque.textContent = formatCurrency(totalBanque);

    const elImmob = document.getElementById('kpi-partecipazioni');
    if (elImmob) elImmob.textContent = formatCurrency(totalImmob);

    // Badge Quadratura
    const diffQuadratura = Math.abs(totalActif - totalPassif);
    const elQuad = document.getElementById('quadratura-badge');
    if (elQuad) {
        if (diffQuadratura < 0.01) {
            elQuad.innerHTML = '<span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 0.35rem 0.75rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; border: 1px solid rgba(16, 185, 129, 0.4);"><i class="fa-solid fa-circle-check"></i> Quadratura Bilan: 0,00 € (Bilanciato)</span>';
        } else {
            elQuad.innerHTML = `<span style="background: rgba(239, 68, 68, 0.2); color: #f87171; padding: 0.35rem 0.75rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; border: 1px solid rgba(239, 68, 68, 0.4);"><i class="fa-solid fa-triangle-exclamation"></i> Sbilancio: ${formatCurrency(diffQuadratura)}</span>`;
        }
    }

    // Render Tabelle
    renderPnlTable(filtered, totalCharges, totalProduits, netResult);
    renderBilanTable(totalImmob, totalBanque, totalActif, totalCapital, netResult, totalDettes, totalPassif);
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

    // Header Controls for P&L (Expand/Collapse All)
    html += `
        <tr style="background: rgba(255, 255, 255, 0.02); font-size: 0.82rem; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <td colspan="4" style="padding: 0.5rem 1rem; text-align: right;">
                <span style="color: var(--text-muted); margin-right: 1rem;"><i class="fa-solid fa-info-circle"></i> Clicca su un conto per aprire/chiudere il dettaglio</span>
                <button type="button" class="btn-action-contab" style="padding: 0.2rem 0.6rem; font-size: 0.78rem;" onclick="toggleAllPnlGroups(true)"><i class="fa-solid fa-folder-open"></i> Espandi Tutti</button>
                <button type="button" class="btn-action-contab" style="padding: 0.2rem 0.6rem; font-size: 0.78rem; margin-left: 0.4rem;" onclick="toggleAllPnlGroups(false)"><i class="fa-solid fa-folder"></i> Comprimi Tutti</button>
            </td>
        </tr>
    `;

    // SEZIONE CHARGES (COSTI)
    html += `
        <tr style="background: rgba(239, 68, 68, 0.15); font-weight: 800; border-top: 2px solid rgba(239, 68, 68, 0.4);">
            <td colspan="3" style="padding: 1rem; color: #fca5a5; font-size: 1.05rem;">
                <i class="fa-solid fa-file-invoice-dollar"></i> CHARGES D'EXPLOITATION ET FINANCIÈRES (CLASSE 6)
            </td>
            <td style="padding: 1rem; text-align: right; color: #fca5a5; font-size: 1.05rem;">- ${formatCurrency(totalCharges)}</td>
        </tr>
    `;

    Object.values(pcnGroups).forEach((group, idx) => {
        const isGroupPos = group.total > 0;
        const grpFormatted = isGroupPos ? ('+ ' + formatCurrency(group.total)) : (group.total < 0 ? ('- ' + formatCurrency(Math.abs(group.total))) : '0,00 €');
        const grpColor = isGroupPos ? '#6ee7b7' : (group.total < 0 ? '#fca5a5' : '#ffffff');
        const groupId = `pnl-grp-${idx}`;

        html += `
            <tr class="pnl-group-row" onclick="togglePnlGroup('${groupId}')" style="background: rgba(255,255,255,0.04); font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: background 0.2s;" title="Clicca per visualizzare/nascondere il dettaglio delle ${group.items.length} scritture">
                <td style="padding: 0.85rem 1rem; color: #6ee7b7; font-family: monospace; font-size: 0.95rem;">
                    <i class="fa-solid fa-chevron-right pnl-group-icon" id="icon-${groupId}" style="margin-right: 8px; font-size: 0.8rem; transition: transform 0.2s; color: var(--text-muted);"></i>
                    ${group.code}
                </td>
                <td style="padding: 0.85rem 1rem;">
                    <span style="font-weight: 700; color: white;">${group.tipologia}</span>
                </td>
                <td style="padding: 0.85rem 1rem;">
                    <span style="font-size: 0.8rem; background: rgba(255,255,255,0.08); padding: 0.25rem 0.6rem; border-radius: 6px; color: var(--text-muted); display: inline-flex; align-items: center; gap: 0.35rem;">
                        <i class="fa-solid fa-list-ul"></i> ${group.items.length} scrittura/e
                    </span>
                </td>
                <td style="padding: 0.85rem 1rem; text-align: right; color: ${grpColor}; font-weight: bold; font-size: 1rem;">${grpFormatted}</td>
            </tr>
        `;

        group.items.forEach(item => {
            const isItemPos = item.totale > 0;
            const itemColor = isItemPos ? '#10b981' : (item.totale < 0 ? '#f87171' : '#cbd5e1');
            const itemFormatted = isItemPos ? ('+ ' + formatCurrency(item.totale)) : (item.totale < 0 ? ('- ' + formatCurrency(Math.abs(item.totale))) : '0,00 €');

            html += `
                <tr class="pnl-detail-row ${groupId}" style="display: none; background: rgba(0,0,0,0.18); border-bottom: 1px dashed rgba(255,255,255,0.05); font-size: 0.88rem; color: #cbd5e1;">
                    <td style="padding: 0.55rem 0.75rem 0.55rem 2.25rem; color: var(--text-muted); white-space: nowrap; font-family: monospace; font-size: 0.85rem;">
                        <i class="fa-solid fa-angle-right" style="font-size: 0.7rem; margin-right: 4px; opacity: 0.6;"></i> ${item.data}
                    </td>
                    <td style="padding: 0.55rem 1rem;">${item.desc} <span style="color: var(--text-muted);">(${item.partner})</span></td>
                    <td style="padding: 0.55rem 1rem; color: var(--text-muted); font-size: 0.85rem;">${item.fattura || '-'}</td>
                    <td style="padding: 0.55rem 1rem; text-align: right; color: ${itemColor}; white-space: nowrap; font-weight: 600;">${itemFormatted}</td>
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

function renderBilanTable(immob, bank, totalActif, capital, netResult, totalDettes, totalPassif) {
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
    `;

    // DETTES / FACTURES NON PARVENUES (se presente)
    if (Math.abs(totalDettes) > 0.01) {
        htmlPassif += `
            <tr style="background: rgba(245, 158, 11, 0.12); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 0.8rem 0.5rem; font-family: monospace; color: #fbbf24; white-space: nowrap; width: 110px; font-size: 0.88rem;">4720000</td>
                <td style="padding: 0.8rem 0.5rem;">D. DETTES - FACTURES NON PARVENUES<br><small style="color: var(--text-muted); font-size: 0.8rem;">Commissioni di partecipazione 2% GP (Note 013/2026)</small></td>
                <td style="padding: 0.8rem 0.5rem; text-align: right; color: #fbbf24; font-weight: bold; white-space: nowrap; width: 140px;">${formatCurrency(totalDettes)}</td>
            </tr>
        `;
    }

    htmlPassif += `
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
        if (!r.isNonCashAccrual) {
            runningBalance += val;
        }
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
    const yearLabel = selectedYear === 'all' ? 'Tutti gli anni (Storico)' : selectedYear;

    const filtered = CONTABILITA_RECORDS.filter(r => {
        if (selectedYear === 'all') return true;
        return String(r.anno) === String(selectedYear);
    });

    // Se l'utente è specificamente nel tab Grand Livre
    if (activeTab === 'tab-grand-livre') {
        doc.setFontSize(15);
        doc.setTextColor(16, 185, 129);
        doc.text(`GREEN ENERBRAS ONE SCSp - Grand Livre Journal ${yearLabel}`, 14, 18);

        doc.setFontSize(8.5);
        doc.setTextColor(100);
        doc.text(`Société en Commandite Spéciale - RCS: B295061 - Matricule: 2025 5805 747 - Date d'export: ${new Date().toLocaleDateString('it-IT')}`, 14, 24);

        let running = 0;
        const rows = filtered.map((r, i) => {
            if (!r.isNonCashAccrual) running += Number(r.totale) || 0;
            return [
                i + 1,
                r.data,
                r.partner + ' - ' + r.desc,
                r.pcnCode || '-',
                r.tipo,
                formatCurrency(r.imp),
                r.tva ? formatCurrency(r.tva) : '-',
                formatCurrency(r.totale),
                formatCurrency(running)
            ];
        });

        doc.autoTable({
            startY: 28,
            head: [['#', 'Data', 'Partner / Descrizione', 'PCN', 'Sez.', 'Imponibile', 'TVA', 'Totale', 'Saldo']],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
            styles: { fontSize: 7.5, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center' },
                1: { cellWidth: 20 },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 18 },
                4: { cellWidth: 12, halign: 'center' },
                5: { cellWidth: 20, halign: 'right' },
                6: { cellWidth: 18, halign: 'right' },
                7: { cellWidth: 22, halign: 'right' },
                8: { cellWidth: 24, halign: 'right' }
            }
        });

        doc.save(`GREEN_ENERBRAS_Grand_Livre_${selectedYear}.pdf`);
        return;
    }

    // Modalità standard: P&L e Bilan
    let totalBanque = 0;
    let totalCharges = 0;
    let totalProduits = 0;
    let totalImmob = 0;
    let totalCapital = 0;
    let totalDettes = 0;

    CONTABILITA_RECORDS.forEach(r => {
        if (selectedYear === 'all' || Number(r.anno) <= Number(selectedYear)) {
            if (!r.isNonCashAccrual && !r.isInternalOffset) {
                totalBanque += Number(r.totale) || 0;
            }
        }
    });

    filtered.forEach(r => {
        const val = Number(r.totale) || 0;
        const pcn = String(r.pcnCode || '');
        const tip = String(r.tipologia || '');
        const desc = String(r.desc || '');
        const ap = String(r.ap || '');

        if (ap === 'IMMOBILISATIONS' || tip.includes('PARTICIPATIONS') || pcn.startsWith('233') || pcn.startsWith('261')) {
            totalImmob += Math.abs(val);
        }
        if (pcn.includes('CAPITAL') || tip.includes('CAPITAL') || desc.includes('101')) {
            totalCapital += val;
        }
        if (pcn.includes('472') || tip.includes('FACTURES NON PARVENUES')) {
            totalDettes += val;
        }
        if (r.tipo === 'PP' && !r.isInternalOffset) {
            if (val < 0) totalCharges += Math.abs(val);
            else totalProduits += val;
        }
    });

    const netResult = totalProduits - totalCharges;

    let totalActif = 0;
    let totalPassif = 0;

    if (selectedYear === '2026') {
        let banquePeriodo = 0;
        filtered.forEach(r => {
            if (!r.isNonCashAccrual && !r.isInternalOffset) banquePeriodo += Number(r.totale) || 0;
        });
        totalActif = totalImmob + banquePeriodo;
        totalPassif = totalCapital + netResult + totalDettes;
    } else {
        totalActif = totalImmob + totalBanque;
        totalPassif = totalCapital + netResult + totalDettes;
    }

    // Raggruppamento P&L e controllo stato accordion
    const pnlRecords = filtered.filter(r => r.tipo === 'PP' && !r.isInternalOffset);
    const pcnGroups = {};

    pnlRecords.forEach(r => {
        const key = r.pcnCode || 'Autre';
        if (!pcnGroups[key]) {
            pcnGroups[key] = {
                code: r.pcnCode,
                tipologia: r.tipologia || r.desc,
                items: [],
                total: 0
            };
        }
        pcnGroups[key].items.push(r);
        pcnGroups[key].total += r.totale;
    });

    let isAnyExpanded = false;
    const pnlBody = [];

    // Header Sezione CHARGES
    pnlBody.push([
        { content: "CHARGES D'EXPLOITATION ET FINANCIÈRES (CLASSE 6)", colSpan: 3, styles: { fontStyle: 'bold', fillColor: [254, 226, 226], textColor: [185, 28, 28] } },
        { content: "- " + formatCurrency(totalCharges), styles: { fontStyle: 'bold', halign: 'right', fillColor: [254, 226, 226], textColor: [185, 28, 28] } }
    ]);

    Object.values(pcnGroups).forEach((group, idx) => {
        const isGroupPos = group.total > 0;
        const grpFormatted = isGroupPos ? ('+ ' + formatCurrency(group.total)) : (group.total < 0 ? ('- ' + formatCurrency(Math.abs(group.total))) : '0,00 €');
        const grpColor = isGroupPos ? [5, 150, 105] : (group.total < 0 ? [220, 38, 38] : [30, 41, 59]);

        const detailRows = document.querySelectorAll('.pnl-grp-' + idx);
        const isExpanded = detailRows.length > 0 && detailRows[0].style.display !== 'none';
        if (isExpanded) isAnyExpanded = true;

        pnlBody.push([
            { content: String(group.code), styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [15, 23, 42] } },
            { content: group.tipologia, styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [15, 23, 42] } },
            { content: isExpanded ? `Dettaglio (${group.items.length} scritture)` : `${group.items.length} scrittura/e`, styles: { fontStyle: 'italic', fillColor: [248, 250, 252], textColor: [100, 116, 139] } },
            { content: grpFormatted, styles: { fontStyle: 'bold', halign: 'right', fillColor: [248, 250, 252], textColor: grpColor } }
        ]);

        if (isExpanded) {
            group.items.forEach(item => {
                const isItemPos = item.totale > 0;
                const itemFormatted = isItemPos ? ('+ ' + formatCurrency(item.totale)) : (item.totale < 0 ? ('- ' + formatCurrency(Math.abs(item.totale))) : '0,00 €');
                const itemColor = isItemPos ? [5, 150, 105] : (item.totale < 0 ? [220, 38, 38] : [100, 116, 139]);

                pnlBody.push([
                    { content: `   ↳ ${item.data}`, styles: { fontStyle: 'normal', textColor: [100, 116, 139], fontSize: 7.5 } },
                    { content: `${item.desc} (${item.partner})`, styles: { fontStyle: 'normal', textColor: [51, 65, 85], fontSize: 8 } },
                    { content: item.fattura || '-', styles: { fontStyle: 'normal', textColor: [100, 116, 139], fontSize: 7.5 } },
                    { content: itemFormatted, styles: { fontStyle: 'normal', halign: 'right', textColor: itemColor, fontSize: 8 } }
                ]);
            });
        }
    });

    // Header Sezione PRODUITS
    pnlBody.push([
        { content: "PRODUITS D'EXPLOITATION ET FINANCIERS (CLASSE 7)", colSpan: 3, styles: { fontStyle: 'bold', fillColor: [209, 250, 229], textColor: [4, 120, 87] } },
        { content: "+ " + formatCurrency(totalProduits), styles: { fontStyle: 'bold', halign: 'right', fillColor: [209, 250, 229], textColor: [4, 120, 87] } }
    ]);

    if (totalProduits === 0) {
        pnlBody.push([
            { content: "7000000", styles: { textColor: [100, 116, 139] } },
            { content: "Nessun ricavo operativo nel periodo (Fase di avviamento / investimenti)", colSpan: 2, styles: { textColor: [100, 116, 139], fontStyle: 'italic' } },
            { content: "0,00 €", styles: { halign: 'right', textColor: [100, 116, 139] } }
        ]);
    }

    // RÉSULTAT NET
    const resNetLabel = netResult >= 0 ? "BÉNÉFICE DE L'EXERCICE (UTILE)" : "PERTE DE L'EXERCICE (PERDITA D'ESERCIZIO)";
    const resNetColor = netResult >= 0 ? [4, 120, 87] : [220, 38, 38];
    pnlBody.push([
        { content: `RÉSULTAT NET (PCN 121 / 141) - ${resNetLabel}`, colSpan: 3, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42], fontSize: 8.5 } },
        { content: formatCurrency(netResult), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249], textColor: resNetColor, fontSize: 8.5 } }
    ]);

    // Intestazione PDF
    doc.setFontSize(15);
    doc.setTextColor(16, 185, 129);
    doc.text(`GREEN ENERBRAS ONE SCSp - Bilancio PCN ${yearLabel}`, 14, 16);

    doc.setFontSize(8.5);
    doc.setTextColor(100);
    const modeDesc = isAnyExpanded ? 'Versione Dettagliata (Voci Espanse)' : 'Versione Sintetica (Dati Raggruppati)';
    doc.text(`Société en Commandite Spéciale • RCS: B295061 • Matricule: 2025 5805 747 • ${modeDesc}`, 14, 22);
    doc.text(`Data di esportazione: ${new Date().toLocaleDateString('it-IT')}`, 14, 26);

    // Titolo Tabella 1: Pertes et Profits
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text("1. COMPTE DE PERTES ET PROFITS (CONTO ECONOMICO)", 14, 33);

    doc.autoTable({
        startY: 36,
        head: [['Conto PCN', 'Descrizione Voce Contabile', 'Note / Rif.', 'Importo (€)']],
        body: pnlBody,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2.2 },
        columnStyles: {
            0: { cellWidth: 32 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 38 },
            3: { cellWidth: 32, halign: 'right' }
        }
    });

    // Tabella 2: Bilan Comptable
    let nextY = doc.lastAutoTable.finalY + 10;
    if (nextY > 230) {
        doc.addPage();
        nextY = 20;
    }

    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text("2. BILAN COMPTABLE (STATO PATRIMONIALE)", 14, nextY);

    const bilanBody = [
        // ATTIVO
        [
            { content: "ATTIVO (ACTIF)", colSpan: 2, styles: { fontStyle: 'bold', fillColor: [224, 242, 254], textColor: [3, 105, 161] } },
            { content: formatCurrency(totalActif), styles: { fontStyle: 'bold', halign: 'right', fillColor: [224, 242, 254], textColor: [3, 105, 161] } }
        ],
        [
            { content: "233 / 261", styles: { fontStyle: 'normal' } },
            { content: "C. IMMOBILISATIONS FINANCIÈRES (Partecipazione TRI STAR SCP)", styles: { fontStyle: 'normal' } },
            { content: formatCurrency(totalImmob), styles: { halign: 'right', fontStyle: 'bold' } }
        ],
        [
            { content: "512 / 513", styles: { fontStyle: 'normal' } },
            { content: "D. ACTIF CIRCULANT - BANQUE (Banque de Luxembourg EUR)", styles: { fontStyle: 'normal' } },
            { content: formatCurrency(totalBanque), styles: { halign: 'right', fontStyle: 'bold', textColor: [5, 150, 105] } }
        ],
        // PASSIVO
        [
            { content: "PASSIVO & PATRIMONIO (PASSIF)", colSpan: 2, styles: { fontStyle: 'bold', fillColor: [209, 250, 229], textColor: [4, 120, 87] } },
            { content: formatCurrency(totalPassif), styles: { fontStyle: 'bold', halign: 'right', fillColor: [209, 250, 229], textColor: [4, 120, 87] } }
        ],
        [
            { content: "1010000", styles: { fontStyle: 'normal' } },
            { content: "A.I. CAPITAL SOUSCRIT (Apporti Associati GP & LPs)", styles: { fontStyle: 'normal' } },
            { content: formatCurrency(totalCapital), styles: { halign: 'right', fontStyle: 'bold' } }
        ],
        [
            { content: "121 / 141", styles: { fontStyle: 'normal' } },
            { content: "A.V. RÉSULTAT DE L'EXERCICE (Risultato netto economico)", styles: { fontStyle: 'normal' } },
            { content: formatCurrency(netResult), styles: { halign: 'right', fontStyle: 'bold', textColor: resNetColor } }
        ]
    ];

    if (Math.abs(totalDettes) > 0.01) {
        bilanBody.push([
            { content: "4720000", styles: { fontStyle: 'normal' } },
            { content: "D. DETTES - FACTURES NON PARVENUES (Dette GP Note 013/2026)", styles: { fontStyle: 'normal' } },
            { content: formatCurrency(totalDettes), styles: { halign: 'right', fontStyle: 'bold', textColor: [217, 119, 6] } }
        ]);
    }

    doc.autoTable({
        startY: nextY + 4,
        head: [['PCN', 'Voce di Bilancio (Actif / Passif)', 'Importo (€)']],
        body: bilanBody,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2.2 },
        columnStyles: {
            0: { cellWidth: 32 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 38, halign: 'right' }
        }
    });

    const fileSuffix = isAnyExpanded ? 'Dettagliato' : 'Sintetico';
    doc.save(`GREEN_ENERBRAS_Rapport_Comptable_${selectedYear}_${fileSuffix}.pdf`);
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
