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

// Filtri per Giornale Movimenti
let journalFilterSearch = '';
let journalFilterDate = '';
let journalFilterPcn = '';
let journalFilterSection = '';

// Filtri per Mastrini
let mastriniFilterSearch = '';

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

// Fisarmonica per P&L
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

// Fisarmonica per Bilan (Stato Patrimoniale)
window.toggleBilanGroup = function(groupId) {
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
            icon.style.color = '#3b82f6';
        } else {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
            icon.style.color = 'inherit';
        }
    }
};

window.toggleAllBilanGroups = function(expand) {
    document.querySelectorAll('.bilan-detail-row').forEach(r => {
        r.style.display = expand ? 'table-row' : 'none';
    });
    document.querySelectorAll('.bilan-group-icon').forEach(icon => {
        if (expand) {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
            icon.style.color = '#3b82f6';
        } else {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
            icon.style.color = 'inherit';
        }
    });
};

// Fisarmonica per Mastrini
window.toggleMastrino = function(mastrinoId) {
    const rows = document.querySelectorAll('.' + mastrinoId);
    const icon = document.getElementById('icon-' + mastrinoId);
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

window.toggleAllMastrini = function(expand) {
    document.querySelectorAll('.mastrino-detail-row').forEach(r => {
        r.style.display = expand ? 'table-row' : 'none';
    });
    document.querySelectorAll('.mastrino-group-icon').forEach(icon => {
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

// Gestione Filtri Giornale
window.onJournalFilterChange = function() {
    const sInput = document.getElementById('filter-journal-search');
    const dInput = document.getElementById('filter-journal-date');
    const pSelect = document.getElementById('filter-journal-pcn');
    const secSelect = document.getElementById('filter-journal-section');

    journalFilterSearch = sInput ? sInput.value.trim().toLowerCase() : '';
    journalFilterDate = dInput ? dInput.value.trim().toLowerCase() : '';
    journalFilterPcn = pSelect ? pSelect.value : '';
    journalFilterSection = secSelect ? secSelect.value : '';

    const filteredYearRecords = CONTABILITA_RECORDS.filter(r => {
        if (selectedYear === 'all') return true;
        return String(r.anno) === String(selectedYear);
    });

    renderJournalTable(filteredYearRecords);
};

window.resetJournalFilters = function() {
    const sInput = document.getElementById('filter-journal-search');
    const dInput = document.getElementById('filter-journal-date');
    const pSelect = document.getElementById('filter-journal-pcn');
    const secSelect = document.getElementById('filter-journal-section');

    if (sInput) sInput.value = '';
    if (dInput) dInput.value = '';
    if (pSelect) pSelect.value = '';
    if (secSelect) secSelect.value = '';

    journalFilterSearch = '';
    journalFilterDate = '';
    journalFilterPcn = '';
    journalFilterSection = '';

    const filteredYearRecords = CONTABILITA_RECORDS.filter(r => {
        if (selectedYear === 'all') return true;
        return String(r.anno) === String(selectedYear);
    });

    renderJournalTable(filteredYearRecords);
};

// Gestione Filtri Mastrini
window.onMastriniFilterChange = function() {
    const mInput = document.getElementById('filter-mastrini-search');
    mastriniFilterSearch = mInput ? mInput.value.trim().toLowerCase() : '';

    const filteredYearRecords = CONTABILITA_RECORDS.filter(r => {
        if (selectedYear === 'all') return true;
        return String(r.anno) === String(selectedYear);
    });

    renderMastriniTable(filteredYearRecords);
};

function populateJournalPcnDropdown() {
    const pSelect = document.getElementById('filter-journal-pcn');
    if (!pSelect) return;

    const currentVal = pSelect.value;
    const uniquePcns = new Set();

    CONTABILITA_RECORDS.forEach(r => {
        if (r.pcnCode) uniquePcns.add(r.pcnCode);
    });

    let optionsHtml = `<option value="">Tutti i conti PCN</option>`;
    Array.from(uniquePcns).sort().forEach(pcn => {
        optionsHtml += `<option value="${pcn}">${pcn}</option>`;
    });

    pSelect.innerHTML = optionsHtml;
    if (currentVal) pSelect.value = currentVal;
}

function renderContabilita() {
    const yearSelect = document.getElementById('filter-year');
    if (yearSelect) selectedYear = yearSelect.value;

    // Movimenti dell'esercizio corrente (per P&L, Giornale e Mastrini)
    const filtered = CONTABILITA_RECORDS.filter(r => {
        if (selectedYear === 'all') return true;
        return String(r.anno) === String(selectedYear);
    });

    // Movimenti cumulativi fino all'esercizio selezionato (per Stato Patrimoniale / Bilan)
    const cumFiltered = CONTABILITA_RECORDS.filter(r => {
        if (selectedYear === 'all') return true;
        return Number(r.anno) <= Number(selectedYear);
    });

    // Movimenti degli esercizi precedenti (per calcolare il Report à nouveau)
    const priorFiltered = CONTABILITA_RECORDS.filter(r => {
        if (selectedYear === 'all') return false;
        return Number(r.anno) < Number(selectedYear);
    });

    // 1. Calcoli Conto Economico (Pertes et Profits) per l'anno selezionato
    let totalCharges = 0;
    let totalProduits = 0;
    filtered.forEach(r => {
        const val = Number(r.totale) || 0;
        if (r.tipo === 'PP' && !r.isInternalOffset) {
            if (val < 0) {
                totalCharges += Math.abs(val);
            } else {
                totalProduits += val;
            }
        }
    });
    const currentNetResult = totalProduits - totalCharges;

    // 2. Calcolo Risultati Esercizi Precedenti (Report à nouveau - PCN 142/122)
    let priorNetResult = 0;
    priorFiltered.forEach(r => {
        const val = Number(r.totale) || 0;
        if (r.tipo === 'PP' && !r.isInternalOffset) {
            priorNetResult += val;
        }
    });

    // 3. Calcoli Stato Patrimoniale (Bilan) Cumulativi fino all'anno selezionato
    let totalBanque = 0;
    let totalImmob = 0;
    let totalCapital = 0;
    let totalDettes = 0;

    cumFiltered.forEach(r => {
        const val = Number(r.totale) || 0;
        const pcn = String(r.pcnCode || '');
        const tip = String(r.tipologia || '');
        const desc = String(r.desc || '');
        const ap = String(r.ap || '');

        // Saldo C/C Banca
        if (!r.isNonCashAccrual && !r.isInternalOffset) {
            totalBanque += val;
        }

        // Bilan Immobilisations (Immobilisations financières TRI STAR)
        if (ap === 'IMMOBILISATIONS' || tip.includes('PARTICIPATIONS') || pcn.startsWith('233') || pcn.startsWith('261')) {
            totalImmob += Math.abs(val);
        }

        // Bilan Capitale Sociale (Capital Souscrit)
        if (pcn.includes('CAPITAL') || tip.includes('CAPITAL') || desc.includes('101')) {
            totalCapital += val;
        }

        // Factures non parvenues / Dettes
        if (pcn.includes('472') || tip.includes('FACTURES NON PARVENUES')) {
            totalDettes += val;
        }
    });

    // Totale Attivo (Actif) = Immobilizzazioni + Disponibilità liquide
    const totalActif = totalImmob + totalBanque;

    // Totale Passivo e Patrimonio (Passif & Capitaux) = Capitale + Risultati Esercizi Prec. + Risultato Esercizio Corrente + Debiti
    const totalPassif = totalCapital + priorNetResult + currentNetResult + totalDettes;

    // Aggiornamento KPI Cards in Alto
    const elActif = document.getElementById('kpi-total-actif');
    if (elActif) elActif.textContent = formatCurrency(totalActif);

    const elPassif = document.getElementById('kpi-total-passif');
    if (elPassif) elPassif.textContent = formatCurrency(totalPassif);

    const elCapital = document.getElementById('kpi-capitale-netto');
    if (elCapital) elCapital.textContent = formatCurrency(totalCapital);

    const elResult = document.getElementById('kpi-risultato-esercizio');
    if (elResult) {
        elResult.textContent = formatCurrency(currentNetResult);
        elResult.style.color = currentNetResult >= 0 ? '#10b981' : '#f87171';
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

    // Popolamento select filtri PCN
    populateJournalPcnDropdown();

    // Render Tabelle
    renderPnlTable(filtered, totalCharges, totalProduits, currentNetResult);
    renderBilanTable(cumFiltered, filtered, totalImmob, totalBanque, totalActif, totalCapital, priorNetResult, currentNetResult, totalDettes, totalPassif);
    renderJournalTable(filtered);
    renderMastriniTable(filtered);
}

function renderPnlTable(records, totalCharges, totalProduits, netResult) {
    const tbody = document.getElementById('table-body-pnl');
    if (!tbody) return;

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

    html += `
        <tr style="background: rgba(255, 255, 255, 0.02); font-size: 0.82rem; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <td colspan="4" style="padding: 0.5rem 1rem; text-align: right;">
                <span style="color: var(--text-muted); margin-right: 1rem;"><i class="fa-solid fa-info-circle"></i> Clicca su un conto per aprire/chiudere il dettaglio</span>
                <button type="button" class="btn-action-contab" style="padding: 0.2rem 0.6rem; font-size: 0.78rem;" onclick="toggleAllPnlGroups(true)"><i class="fa-solid fa-folder-open"></i> Espandi Tutti</button>
                <button type="button" class="btn-action-contab" style="padding: 0.2rem 0.6rem; font-size: 0.78rem;" onclick="toggleAllPnlGroups(false)"><i class="fa-solid fa-folder"></i> Comprimi Tutti</button>
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

function renderBilanTable(cumRecords, yearRecords, immob, bank, totalActif, capital, priorNetResult, netResult, totalDettes, totalPassif) {
    const tbodyActif = document.getElementById('table-body-bilan-actif');
    const tbodyPassif = document.getElementById('table-body-bilan-passif');
    if (!tbodyActif || !tbodyPassif) return;

    // Estrazione movimenti per le voci di Stato Patrimoniale (cumulativi fino alla data/anno)
    const immobItems = [];
    const bankItems = [];
    const capItems = [];
    const dettesItems = [];
    const pnlItems = [];

    cumRecords.forEach(r => {
        const ap = String(r.ap || '');
        const pcn = String(r.pcnCode || '');
        const tip = String(r.tipologia || '');
        const desc = String(r.desc || '');

        if (ap === 'IMMOBILISATIONS' || tip.includes('PARTICIPATIONS') || pcn.startsWith('233') || pcn.startsWith('261')) {
            immobItems.push(r);
        }

        if (!r.isNonCashAccrual && !r.isInternalOffset) {
            bankItems.push(r);
        }

        if (pcn.includes('CAPITAL') || tip.includes('CAPITAL') || desc.includes('101')) {
            capItems.push(r);
        }

        if (pcn.includes('472') || tip.includes('FACTURES NON PARVENUES')) {
            dettesItems.push(r);
        }
    });

    // Voci di P&L dell'esercizio selezionato
    yearRecords.forEach(r => {
        if (r.tipo === 'PP' && !r.isInternalOffset) {
            pnlItems.push(r);
        }
    });

    // ----------------------------------------------------
    // ACTIF (ATTIVO)
    // ----------------------------------------------------
    let htmlActif = '';

    // 1. IMMOBILISATIONS FINANCIÈRES (233 / 261)
    const immobHasItems = immobItems.length > 0;
    const immobId = 'bilan-actif-immob';
    htmlActif += `
        <tr class="bilan-group-row" onclick="${immobHasItems ? `toggleBilanGroup('${immobId}')` : ''}" style="background: rgba(59, 130, 246, 0.12); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); ${immobHasItems ? 'cursor: pointer;' : ''} transition: background 0.2s;" title="${immobHasItems ? `Clicca per consultare i ${immobItems.length} investimenti` : ''}">
            <td style="padding: 0.8rem 0.5rem; font-family: monospace; color: #93c5fd; white-space: nowrap; width: 110px; font-size: 0.88rem;">
                ${immobHasItems ? `<i class="fa-solid fa-chevron-right bilan-group-icon" id="icon-${immobId}" style="margin-right: 6px; font-size: 0.75rem; color: var(--text-muted); transition: transform 0.2s;"></i>` : '<span style="display:inline-block; width:14px;"></span>'}
                233 / 261
            </td>
            <td style="padding: 0.8rem 0.5rem;">
                C. IMMOBILISATIONS FINANCIÈRES
                ${immobHasItems ? `<span style="font-size: 0.75rem; background: rgba(59, 130, 246, 0.25); color: #bfdbfe; padding: 0.15rem 0.45rem; border-radius: 4px; margin-left: 0.4rem; font-weight: normal;">${immobItems.length} mov.</span>` : ''}
                <br><small style="color: var(--text-muted); font-size: 0.8rem;">Partecipazione TRI STAR ENERBRAS ONE SCP</small>
            </td>
            <td style="padding: 0.8rem 0.5rem; text-align: right; color: var(--text-main, #ffffff); font-weight: bold; white-space: nowrap; width: 140px;">${formatCurrency(immob)}</td>
        </tr>
    `;

    if (immobHasItems) {
        immobItems.forEach(item => {
            const val = Math.abs(Number(item.totale) || 0);
            htmlActif += `
                <tr class="bilan-detail-row ${immobId}" style="display: none; background: rgba(0,0,0,0.22); border-bottom: 1px dashed rgba(255,255,255,0.05); font-size: 0.84rem; color: #cbd5e1;">
                    <td style="padding: 0.45rem 0.5rem 0.45rem 1.6rem; color: var(--text-muted); font-family: monospace; white-space: nowrap; font-size: 0.82rem;">
                        <i class="fa-solid fa-angle-right" style="opacity: 0.5; margin-right: 3px;"></i> ${item.data}
                    </td>
                    <td style="padding: 0.45rem 0.5rem;">
                        <span style="color: white; font-weight: 500;">${item.partner}</span> — <span style="color: var(--text-muted);">${item.desc}</span>
                        ${item.fattura && item.fattura !== '-' ? `<span style="font-size: 0.75rem; color: #fbbf24; margin-left: 0.35rem;"><i class="fa-solid fa-receipt"></i> ${item.fattura}</span>` : ''}
                    </td>
                    <td style="padding: 0.45rem 0.5rem; text-align: right; color: #93c5fd; font-weight: 600; white-space: nowrap;">+ ${formatCurrency(val)}</td>
                </tr>
            `;
        });
    }

    // 2. AVOIRS EN BANQUE (512 / 513)
    const bankHasItems = bankItems.length > 0;
    const bankId = 'bilan-actif-bank';
    htmlActif += `
        <tr class="bilan-group-row" onclick="${bankHasItems ? `toggleBilanGroup('${bankId}')` : ''}" style="background: rgba(16, 185, 129, 0.12); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); ${bankHasItems ? 'cursor: pointer;' : ''} transition: background 0.2s;" title="${bankHasItems ? `Clicca per consultare i ${bankItems.length} movimenti di conto corrente` : ''}">
            <td style="padding: 0.8rem 0.5rem; font-family: monospace; color: #6ee7b7; white-space: nowrap; width: 110px; font-size: 0.88rem;">
                ${bankHasItems ? `<i class="fa-solid fa-chevron-right bilan-group-icon" id="icon-${bankId}" style="margin-right: 6px; font-size: 0.75rem; color: var(--text-muted); transition: transform 0.2s;"></i>` : '<span style="display:inline-block; width:14px;"></span>'}
                512 / 513
            </td>
            <td style="padding: 0.8rem 0.5rem;">
                D. ACTIF CIRCULANT - BANQUE
                ${bankHasItems ? `<span style="font-size: 0.75rem; background: rgba(16, 185, 129, 0.25); color: #a7f3d0; padding: 0.15rem 0.45rem; border-radius: 4px; margin-left: 0.4rem; font-weight: normal;">${bankItems.length} mov.</span>` : ''}
                <br><small style="color: var(--text-muted); font-size: 0.8rem;">Banque de Luxembourg EUR (LU47...2001)</small>
            </td>
            <td style="padding: 0.8rem 0.5rem; text-align: right; color: #10b981; font-weight: bold; white-space: nowrap; width: 140px;">${formatCurrency(bank)}</td>
        </tr>
    `;

    if (bankHasItems) {
        bankItems.forEach(item => {
            const val = Number(item.totale) || 0;
            const isPos = val >= 0;
            const formattedVal = isPos ? ('+ ' + formatCurrency(val)) : ('- ' + formatCurrency(Math.abs(val)));
            const valColor = isPos ? '#10b981' : '#f87171';
            htmlActif += `
                <tr class="bilan-detail-row ${bankId}" style="display: none; background: rgba(0,0,0,0.22); border-bottom: 1px dashed rgba(255,255,255,0.05); font-size: 0.84rem; color: #cbd5e1;">
                    <td style="padding: 0.45rem 0.5rem 0.45rem 1.6rem; color: var(--text-muted); font-family: monospace; white-space: nowrap; font-size: 0.82rem;">
                        <i class="fa-solid fa-angle-right" style="opacity: 0.5; margin-right: 3px;"></i> ${item.data}
                    </td>
                    <td style="padding: 0.45rem 0.5rem;">
                        <span style="color: white; font-weight: 500;">${item.partner}</span> — <span style="color: var(--text-muted);">${item.desc}</span>
                        ${item.fattura && item.fattura !== '-' ? `<span style="font-size: 0.75rem; color: #fbbf24; margin-left: 0.35rem;"><i class="fa-solid fa-receipt"></i> ${item.fattura}</span>` : ''}
                    </td>
                    <td style="padding: 0.45rem 0.5rem; text-align: right; color: ${valColor}; font-weight: 600; white-space: nowrap;">${formattedVal}</td>
                </tr>
            `;
        });
    }

    // TOTAL ACTIF
    htmlActif += `
        <tr style="background: rgba(0,0,0,0.35); font-weight: 800; border-top: 2px solid #3b82f6;">
            <td colspan="2" style="padding: 0.85rem 0.5rem; color: #93c5fd; font-size: 0.95rem; white-space: nowrap;"><i class="fa-solid fa-wallet"></i> TOTAL ACTIF</td>
            <td style="padding: 0.85rem 0.5rem; text-align: right; color: #93c5fd; font-size: 0.95rem; font-weight: 800; white-space: nowrap;">${formatCurrency(totalActif)}</td>
        </tr>
    `;
    tbodyActif.innerHTML = htmlActif;

    // ----------------------------------------------------
    // PASSIF (PASSIVO E PATRIMONIO)
    // ----------------------------------------------------
    let htmlPassif = '';

    // 1. CAPITAL SOUSCRIT (1010000)
    const capHasItems = capItems.length > 0;
    const capId = 'bilan-passif-cap';
    htmlPassif += `
        <tr class="bilan-group-row" onclick="${capHasItems ? `toggleBilanGroup('${capId}')` : ''}" style="background: rgba(16, 185, 129, 0.12); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); ${capHasItems ? 'cursor: pointer;' : ''} transition: background 0.2s;" title="${capHasItems ? `Clicca per consultare i ${capItems.length} apporti di capitale` : ''}">
            <td style="padding: 0.8rem 0.5rem; font-family: monospace; color: #6ee7b7; white-space: nowrap; width: 110px; font-size: 0.88rem;">
                ${capHasItems ? `<i class="fa-solid fa-chevron-right bilan-group-icon" id="icon-${capId}" style="margin-right: 6px; font-size: 0.75rem; color: var(--text-muted); transition: transform 0.2s;"></i>` : '<span style="display:inline-block; width:14px;"></span>'}
                1010000
            </td>
            <td style="padding: 0.8rem 0.5rem;">
                A.I. CAPITAL SOUSCRIT
                ${capHasItems ? `<span style="font-size: 0.75rem; background: rgba(16, 185, 129, 0.25); color: #a7f3d0; padding: 0.15rem 0.45rem; border-radius: 4px; margin-left: 0.4rem; font-weight: normal;">${capItems.length} quote</span>` : ''}
                <br><small style="color: var(--text-muted); font-size: 0.8rem;">Apporti Associati (General Partner & LPs)</small>
            </td>
            <td style="padding: 0.8rem 0.5rem; text-align: right; color: var(--text-main, #ffffff); font-weight: bold; white-space: nowrap; width: 140px;">${formatCurrency(capital)}</td>
        </tr>
    `;

    if (capHasItems) {
        capItems.forEach(item => {
            const val = Number(item.totale) || 0;
            htmlPassif += `
                <tr class="bilan-detail-row ${capId}" style="display: none; background: rgba(0,0,0,0.22); border-bottom: 1px dashed rgba(255,255,255,0.05); font-size: 0.84rem; color: #cbd5e1;">
                    <td style="padding: 0.45rem 0.5rem 0.45rem 1.6rem; color: var(--text-muted); font-family: monospace; white-space: nowrap; font-size: 0.82rem;">
                        <i class="fa-solid fa-angle-right" style="opacity: 0.5; margin-right: 3px;"></i> ${item.data}
                    </td>
                    <td style="padding: 0.45rem 0.5rem;">
                        <span style="color: white; font-weight: 600;">${item.partner}</span> — <span style="color: var(--text-muted);">${item.desc}</span>
                    </td>
                    <td style="padding: 0.45rem 0.5rem; text-align: right; color: #6ee7b7; font-weight: 600; white-space: nowrap;">+ ${formatCurrency(val)}</td>
                </tr>
            `;
        });
    }

    // 2. RÉSULTATS REPORTÉS / REPORT À NOUVEAU (142 / 122) (se presenti da esercizi precedenti)
    if (Math.abs(priorNetResult) > 0.001) {
        const repColor = priorNetResult >= 0 ? '#10b981' : '#f87171';
        htmlPassif += `
            <tr class="bilan-group-row" style="background: rgba(147, 197, 253, 0.08); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); transition: background 0.2s;">
                <td style="padding: 0.8rem 0.5rem; font-family: monospace; color: #93c5fd; white-space: nowrap; width: 110px; font-size: 0.88rem;">
                    <span style="display:inline-block; width:14px;"></span>
                    142 / 122
                </td>
                <td style="padding: 0.8rem 0.5rem;">
                    A.IV. RÉSULTATS REPORTÉS (REPORT À NOUVEAU)
                    <br><small style="color: var(--text-muted); font-size: 0.8rem;">Risultati economici cumulati degli esercizi precedenti (2025)</small>
                </td>
                <td style="padding: 0.8rem 0.5rem; text-align: right; color: ${repColor}; font-weight: bold; white-space: nowrap; width: 140px;">${formatCurrency(priorNetResult)}</td>
            </tr>
        `;
    }

    // 3. RÉSULTAT NET DE L'EXERCICE (121 / 141)
    const pnlHasItems = pnlItems.length > 0;
    const resId = 'bilan-passif-res';
    const resColor = netResult >= 0 ? '#10b981' : '#f87171';
    htmlPassif += `
        <tr class="bilan-group-row" onclick="${pnlHasItems ? `toggleBilanGroup('${resId}')` : ''}" style="background: rgba(239, 68, 68, 0.12); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); ${pnlHasItems ? 'cursor: pointer;' : ''} transition: background 0.2s;" title="${pnlHasItems ? `Clicca per visualizzare le ${pnlItems.length} voci economiche` : ''}">
            <td style="padding: 0.8rem 0.5rem; font-family: monospace; color: #fca5a5; white-space: nowrap; width: 110px; font-size: 0.88rem;">
                ${pnlHasItems ? `<i class="fa-solid fa-chevron-right bilan-group-icon" id="icon-${resId}" style="margin-right: 6px; font-size: 0.75rem; color: var(--text-muted); transition: transform 0.2s;"></i>` : '<span style="display:inline-block; width:14px;"></span>'}
                121 / 141
            </td>
            <td style="padding: 0.8rem 0.5rem;">
                A.V. RÉSULTAT DE L'EXERCICE
                ${pnlHasItems ? `<span style="font-size: 0.75rem; background: rgba(239, 68, 68, 0.25); color: #fca5a5; padding: 0.15rem 0.45rem; border-radius: 4px; margin-left: 0.4rem; font-weight: normal;">${pnlItems.length} voci</span>` : ''}
                <br><small style="color: var(--text-muted); font-size: 0.8rem;">Risultato netto economico del periodo (${selectedYear === 'all' ? 'Tutti gli anni' : selectedYear})</small>
            </td>
            <td style="padding: 0.8rem 0.5rem; text-align: right; color: ${resColor}; font-weight: bold; white-space: nowrap; width: 140px;">${formatCurrency(netResult)}</td>
        </tr>
    `;

    if (pnlHasItems) {
        pnlItems.forEach(item => {
            const val = Number(item.totale) || 0;
            const isPos = val >= 0;
            const formattedVal = isPos ? ('+ ' + formatCurrency(val)) : ('- ' + formatCurrency(Math.abs(val)));
            const valColor = isPos ? '#10b981' : '#f87171';
            htmlPassif += `
                <tr class="bilan-detail-row ${resId}" style="display: none; background: rgba(0,0,0,0.22); border-bottom: 1px dashed rgba(255,255,255,0.05); font-size: 0.84rem; color: #cbd5e1;">
                    <td style="padding: 0.45rem 0.5rem 0.45rem 1.6rem; color: var(--text-muted); font-family: monospace; white-space: nowrap; font-size: 0.82rem;">
                        <i class="fa-solid fa-angle-right" style="opacity: 0.5; margin-right: 3px;"></i> ${item.pcnCode || 'PP'}
                    </td>
                    <td style="padding: 0.45rem 0.5rem;">
                        <span style="color: white; font-weight: 500;">${item.desc}</span> <span style="color: var(--text-muted);">(${item.partner})</span>
                    </td>
                    <td style="padding: 0.45rem 0.5rem; text-align: right; color: ${valColor}; font-weight: 600; white-space: nowrap;">${formattedVal}</td>
                </tr>
            `;
        });
    }

    // 4. DETTES / FACTURES NON PARVENUES (4720000) (se presente)
    if (Math.abs(totalDettes) > 0.01) {
        const dettesHasItems = dettesItems.length > 0;
        const dettesId = 'bilan-passif-dettes';
        htmlPassif += `
            <tr class="bilan-group-row" onclick="${dettesHasItems ? `toggleBilanGroup('${dettesId}')` : ''}" style="background: rgba(245, 158, 11, 0.12); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); ${dettesHasItems ? 'cursor: pointer;' : ''} transition: background 0.2s;" title="${dettesHasItems ? `Clicca per consultare i ${dettesItems.length} debiti/accruals` : ''}">
                <td style="padding: 0.8rem 0.5rem; font-family: monospace; color: #fbbf24; white-space: nowrap; width: 110px; font-size: 0.88rem;">
                    ${dettesHasItems ? `<i class="fa-solid fa-chevron-right bilan-group-icon" id="icon-${dettesId}" style="margin-right: 6px; font-size: 0.75rem; color: var(--text-muted); transition: transform 0.2s;"></i>` : '<span style="display:inline-block; width:14px;"></span>'}
                    4720000
                </td>
                <td style="padding: 0.8rem 0.5rem;">
                    D. DETTES - FACTURES NON PARVENUES
                    ${dettesHasItems ? `<span style="font-size: 0.75rem; background: rgba(245, 158, 11, 0.25); color: #fde68a; padding: 0.15rem 0.45rem; border-radius: 4px; margin-left: 0.4rem; font-weight: normal;">${dettesItems.length} scritture</span>` : ''}
                    <br><small style="color: var(--text-muted); font-size: 0.8rem;">Commissioni di partecipazione 2% GP (Note 013/2026)</small>
                </td>
                <td style="padding: 0.8rem 0.5rem; text-align: right; color: #fbbf24; font-weight: bold; white-space: nowrap; width: 140px;">${formatCurrency(totalDettes)}</td>
            </tr>
        `;

        if (dettesHasItems) {
            dettesItems.forEach(item => {
                const val = Number(item.totale) || 0;
                htmlPassif += `
                    <tr class="bilan-detail-row ${dettesId}" style="display: none; background: rgba(0,0,0,0.22); border-bottom: 1px dashed rgba(255,255,255,0.05); font-size: 0.84rem; color: #cbd5e1;">
                        <td style="padding: 0.45rem 0.5rem 0.45rem 1.6rem; color: var(--text-muted); font-family: monospace; white-space: nowrap; font-size: 0.82rem;">
                            <i class="fa-solid fa-angle-right" style="opacity: 0.5; margin-right: 3px;"></i> ${item.data}
                        </td>
                        <td style="padding: 0.45rem 0.5rem;">
                            <span style="color: white; font-weight: 500;">${item.partner}</span> — <span style="color: var(--text-muted);">${item.desc}</span>
                        </td>
                        <td style="padding: 0.45rem 0.5rem; text-align: right; color: #fbbf24; font-weight: 600; white-space: nowrap;">+ ${formatCurrency(val)}</td>
                    </tr>
                `;
            });
        }
    }

    // TOTAL PASSIF
    htmlPassif += `
        <tr style="background: rgba(0,0,0,0.35); font-weight: 800; border-top: 2px solid #10b981;">
            <td colspan="2" style="padding: 0.85rem 0.5rem; color: #6ee7b7; font-size: 0.95rem; white-space: nowrap;"><i class="fa-solid fa-scale-balanced"></i> TOTAL PASSIF & CAPITAUX</td>
            <td style="padding: 0.85rem 0.5rem; text-align: right; color: #6ee7b7; font-size: 0.95rem; font-weight: 800; white-space: nowrap;">${formatCurrency(totalPassif)}</td>
        </tr>
    `;
    tbodyPassif.innerHTML = htmlPassif;
}

function renderJournalTable(yearRecords) {
    const tbody = document.getElementById('table-body-journal');
    if (!tbody) return;

    // Applicazione filtri colonna / intestazione
    const filtered = yearRecords.filter(r => {
        if (journalFilterSearch) {
            const partner = (r.partner || '').toLowerCase();
            const desc = (r.desc || '').toLowerCase();
            const fatt = (r.fattura || '').toLowerCase();
            if (!partner.includes(journalFilterSearch) && !desc.includes(journalFilterSearch) && !fatt.includes(journalFilterSearch)) {
                return false;
            }
        }
        if (journalFilterDate) {
            const data = (r.data || '').toLowerCase();
            const valuta = (r.valuta || '').toLowerCase();
            if (!data.includes(journalFilterDate) && !valuta.includes(journalFilterDate)) {
                return false;
            }
        }
        if (journalFilterPcn) {
            if (String(r.pcnCode || '') !== journalFilterPcn) {
                return false;
            }
        }
        if (journalFilterSection) {
            if (String(r.tipo || '') !== journalFilterSection) {
                return false;
            }
        }
        return true;
    });

    // Aggiornamento badge statistiche filtri
    const statsEl = document.getElementById('journal-filter-stats');
    if (statsEl) {
        let sumFiltered = 0;
        filtered.forEach(r => {
            if (!r.isNonCashAccrual) sumFiltered += Number(r.totale) || 0;
        });
        const isFiltered = filtered.length !== yearRecords.length;
        statsEl.innerHTML = `
            <span style="background: ${isFiltered ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.06)'}; color: ${isFiltered ? '#93c5fd' : 'var(--text-muted)'}; padding: 0.35rem 0.75rem; border-radius: 6px; border: 1px solid ${isFiltered ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255,255,255,0.1)'};">
                <i class="fa-solid fa-list-check"></i> ${filtered.length} di ${yearRecords.length} scritture • Flusso Netto: <strong style="color: ${sumFiltered >= 0 ? '#10b981' : '#f87171'}">${formatCurrency(sumFiltered)}</strong>
            </span>
        `;
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--text-muted); font-size: 0.95rem;">
                    <i class="fa-solid fa-filter-circle-xmark" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block; opacity: 0.5;"></i>
                    Nessun movimento trovato con i filtri selezionati. Clicca su "Reset Filtri" per mostrare tutti i dati.
                </td>
            </tr>
        `;
        return;
    }

    let runningBalance = 0;
    let html = '';

    filtered.forEach((r, idx) => {
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

function renderMastriniTable(yearRecords) {
    const tbody = document.getElementById('table-body-mastrini');
    if (!tbody) return;

    // 1. Costruzione Mastrini per CONTI DI BILANCIO (Stato Patrimoniale)
    // Conti di bilancio: 5120000 (Banque), 1010000 (Capitale), 2330000/2610000 (Immobilizzazioni), 4720000 (Dettes)

    // A. BANQUE DE LUXEMBOURG (5120000)
    let bankSaldoPrec = 0;
    if (selectedYear !== 'all' && selectedYear !== '2025') {
        CONTABILITA_RECORDS.forEach(r => {
            if (Number(r.anno) < Number(selectedYear)) {
                if (!r.isNonCashAccrual && !r.isInternalOffset) {
                    bankSaldoPrec += Number(r.totale) || 0;
                }
            }
        });
    }

    let bankInflows = 0;
    let bankOutflows = 0;
    const bankItems = [];

    yearRecords.forEach(r => {
        if (!r.isNonCashAccrual && !r.isInternalOffset) {
            const val = Number(r.totale) || 0;
            bankItems.push(r);
            if (val >= 0) {
                bankInflows += val;
            } else {
                bankOutflows += Math.abs(val);
            }
        }
    });
    const bankNuovoSaldo = bankSaldoPrec + bankInflows - bankOutflows;

    // B. CAPITAL SOUSCRIT (1010000)
    let capSaldoPrec = 0;
    if (selectedYear !== 'all' && selectedYear !== '2025') {
        CONTABILITA_RECORDS.forEach(r => {
            if (Number(r.anno) < Number(selectedYear)) {
                const pcn = String(r.pcnCode || '');
                const tip = String(r.tipologia || '');
                const desc = String(r.desc || '');
                if (pcn.includes('CAPITAL') || tip.includes('CAPITAL') || desc.includes('101')) {
                    capSaldoPrec += Number(r.totale) || 0;
                }
            }
        });
    }

    let capInflows = 0;
    let capOutflows = 0;
    const capItems = [];

    yearRecords.forEach(r => {
        const pcn = String(r.pcnCode || '');
        const tip = String(r.tipologia || '');
        const desc = String(r.desc || '');
        if (pcn.includes('CAPITAL') || tip.includes('CAPITAL') || desc.includes('101')) {
            const val = Number(r.totale) || 0;
            capItems.push(r);
            if (val >= 0) capInflows += val;
            else capOutflows += Math.abs(val);
        }
    });
    const capNuovoSaldo = capSaldoPrec + capInflows - capOutflows;

    // C. IMMOBILISATIONS FINANCIÈRES (2330000 / 2610000)
    let immobSaldoPrec = 0;
    if (selectedYear !== 'all' && selectedYear !== '2025') {
        CONTABILITA_RECORDS.forEach(r => {
            if (Number(r.anno) < Number(selectedYear)) {
                const ap = String(r.ap || '');
                const pcn = String(r.pcnCode || '');
                const tip = String(r.tipologia || '');
                if (ap === 'IMMOBILISATIONS' || tip.includes('PARTICIPATIONS') || pcn.startsWith('233') || pcn.startsWith('261')) {
                    immobSaldoPrec += Math.abs(Number(r.totale) || 0);
                }
            }
        });
    }

    let immobInflows = 0;
    let immobOutflows = 0;
    const immobItems = [];

    yearRecords.forEach(r => {
        const ap = String(r.ap || '');
        const pcn = String(r.pcnCode || '');
        const tip = String(r.tipologia || '');
        if (ap === 'IMMOBILISATIONS' || tip.includes('PARTICIPATIONS') || pcn.startsWith('233') || pcn.startsWith('261')) {
            const val = Math.abs(Number(r.totale) || 0);
            immobItems.push(r);
            immobInflows += val;
        }
    });
    const immobNuovoSaldo = immobSaldoPrec + immobInflows - immobOutflows;

    // D. DETTES / FACTURES NON PARVENUES (4720000)
    let dettesSaldoPrec = 0;
    if (selectedYear !== 'all' && selectedYear !== '2025') {
        CONTABILITA_RECORDS.forEach(r => {
            if (Number(r.anno) < Number(selectedYear)) {
                const pcn = String(r.pcnCode || '');
                const tip = String(r.tipologia || '');
                if (pcn.includes('472') || tip.includes('FACTURES NON PARVENUES')) {
                    dettesSaldoPrec += Number(r.totale) || 0;
                }
            }
        });
    }

    let dettesInflows = 0; // Nuovi debiti / accruals
    let dettesOutflows = 0; // Regolamenti / pagamenti
    const dettesItems = [];

    yearRecords.forEach(r => {
        const pcn = String(r.pcnCode || '');
        const tip = String(r.tipologia || '');
        if (pcn.includes('472') || tip.includes('FACTURES NON PARVENUES')) {
            const val = Number(r.totale) || 0;
            dettesItems.push(r);
            if (val > 0) dettesInflows += val;
            else dettesOutflows += Math.abs(val);
        }
    });
    const dettesNuovoSaldo = dettesSaldoPrec + dettesInflows - dettesOutflows;

    // E. RESULTATS REPORTES / REPORT A NOUVEAU (1420000 / 1220000)
    let pnlSaldoPrec = 0;
    if (selectedYear !== 'all' && selectedYear !== '2025') {
        CONTABILITA_RECORDS.forEach(r => {
            if (Number(r.anno) < Number(selectedYear)) {
                if (r.tipo === 'PP' && !r.isInternalOffset) {
                    pnlSaldoPrec += Number(r.totale) || 0;
                }
            }
        });
    }

    const bilMastrini = [
        {
            code: '1010000',
            title: 'Capital Souscrit (Apporti Associati GP & LPs)',
            section: 'BILAN',
            saldoPrec: capSaldoPrec,
            col1: capInflows, // Entrate / Apporti
            col2: capOutflows, // Rimborsi
            nuovoSaldo: capNuovoSaldo,
            items: capItems
        },
        {
            code: '233 / 261',
            title: 'Immobilisations Financières (Partecipazione TRI STAR SCP)',
            section: 'BILAN',
            saldoPrec: immobSaldoPrec,
            col1: immobInflows, // Incrementi investimenti
            col2: immobOutflows,
            nuovoSaldo: immobNuovoSaldo,
            items: immobItems
        }
    ];

    if (Math.abs(pnlSaldoPrec) > 0.001) {
        bilMastrini.push({
            code: '142 / 122',
            title: 'Résultats reportés / Report à nouveau (Esercizi Precedenti)',
            section: 'BILAN',
            saldoPrec: pnlSaldoPrec,
            col1: 0,
            col2: 0,
            nuovoSaldo: pnlSaldoPrec,
            items: []
        });
    }

    bilMastrini.push({
        code: '4720000',
        title: 'Dettes - Factures non parvenues (Debiti verso GP)',
        section: 'BILAN',
        saldoPrec: dettesSaldoPrec,
        col1: dettesInflows, // Nuovi debiti
        col2: dettesOutflows, // Debiti pagati
        nuovoSaldo: dettesNuovoSaldo,
        items: dettesItems
    });

    bilMastrini.push({
        code: '512 / 513',
        title: 'Avoirs en Banque (Banque de Luxembourg EUR)',
        section: 'BILAN',
        saldoPrec: bankSaldoPrec,
        col1: bankInflows, // Entrate / Incassi
        col2: bankOutflows, // Uscite / Bonifici
        nuovoSaldo: bankNuovoSaldo,
        items: bankItems
    });

    // 2. Costruzione Mastrini per CONTI DI PERDITE E PROFITTI (P&L)
    const pnlGroups = {};
    const pnlRecords = yearRecords.filter(r => r.tipo === 'PP' && !r.isInternalOffset);

    pnlRecords.forEach(r => {
        const code = r.pcnCode || '6999999';
        if (!pnlGroups[code]) {
            pnlGroups[code] = {
                code: code,
                title: r.tipologia || r.desc,
                section: 'P&L',
                saldoPrec: 0, // I conti di P&L ripartono da 0 a inizio esercizio
                col1: 0, // Costi
                col2: 0, // Ricavi
                nuovoSaldo: 0,
                items: []
            };
        }
        pnlGroups[code].items.push(r);
        const val = Number(r.totale) || 0;
        if (val < 0) {
            pnlGroups[code].col1 += Math.abs(val); // Costi
        } else {
            pnlGroups[code].col2 += val; // Ricavi
        }
    });

    Object.values(pnlGroups).forEach(grp => {
        grp.nuovoSaldo = grp.col2 - grp.col1; // Saldo netto P&L
    });

    const pnlMastrini = Object.values(pnlGroups).sort((a, b) => String(a.code).localeCompare(String(b.code)));

    // Se non ci sono ricavi operativi, aggiungiamo una riga esplicativa se non presente
    if (!pnlGroups['7000000'] && !pnlGroups['7010000']) {
        pnlMastrini.push({
            code: '7000000',
            title: "Produits d'exploitation (Ricavi Vendite Energia)",
            section: 'P&L',
            saldoPrec: 0,
            col1: 0,
            col2: 0,
            nuovoSaldo: 0,
            items: []
        });
    }

    // Filtro di ricerca per i Mastrini
    const filterFn = (m) => {
        if (!mastriniFilterSearch) return true;
        const code = String(m.code).toLowerCase();
        const title = String(m.title).toLowerCase();
        return code.includes(mastriniFilterSearch) || title.includes(mastriniFilterSearch);
    };

    const displayBil = bilMastrini.filter(filterFn);
    const displayPnl = pnlMastrini.filter(filterFn);

    let html = '';

    // SEZIONE 1: CONTI DI BILANCIO
    let bilTotPrec = 0, bilTotCol1 = 0, bilTotCol2 = 0, bilTotNuovo = 0;
    displayBil.forEach(m => {
        bilTotPrec += m.saldoPrec;
        bilTotCol1 += m.col1;
        bilTotCol2 += m.col2;
        bilTotNuovo += m.nuovoSaldo;
    });

    html += `
        <tr class="mastrino-group-header" style="background: rgba(59, 130, 246, 0.18); font-weight: 800; border-top: 2px solid rgba(59, 130, 246, 0.5); border-bottom: 1px solid rgba(59, 130, 246, 0.3);">
            <td colspan="3" style="padding: 0.9rem 1rem; color: #93c5fd; font-size: 1rem;">
                <i class="fa-solid fa-scale-balanced"></i> 1. CONTI DI BILANCIO (STATO PATRIMONIALE - ACTIF / PASSIF)
            </td>
            <td style="padding: 0.9rem 0.75rem; text-align: right; color: #93c5fd; font-weight: 700;">${formatCurrency(bilTotPrec)}</td>
            <td style="padding: 0.9rem 0.75rem; text-align: right; color: #34d399; font-weight: 700;">+ ${formatCurrency(bilTotCol1)}</td>
            <td style="padding: 0.9rem 0.75rem; text-align: right; color: #f87171; font-weight: 700;">- ${formatCurrency(bilTotCol2)}</td>
            <td style="padding: 0.9rem 0.75rem; text-align: right; color: #93c5fd; font-weight: 800; font-size: 1.05rem;">${formatCurrency(bilTotNuovo)}</td>
        </tr>
    `;

    displayBil.forEach((m, idx) => {
        const mastrinoId = `mastrino-bil-${idx}`;
        const hasItems = m.items && m.items.length > 0;
        html += `
            <tr class="mastrino-row" onclick="${hasItems ? `toggleMastrino('${mastrinoId}')` : ''}" style="background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.92rem; ${hasItems ? 'cursor: pointer;' : ''} transition: background 0.2s;" title="${hasItems ? `Clicca per consultare i ${m.items.length} movimenti` : ''}">
                <td style="padding: 0.85rem 0.75rem; font-family: monospace; font-weight: bold; color: #93c5fd; white-space: nowrap;">
                    ${hasItems ? `<i class="fa-solid fa-chevron-right mastrino-group-icon" id="icon-${mastrinoId}" style="margin-right: 6px; font-size: 0.75rem; color: var(--text-muted); transition: transform 0.2s;"></i>` : '<span style="display:inline-block; width:14px;"></span>'}
                    ${m.code}
                </td>
                <td style="padding: 0.85rem 0.75rem; font-weight: 600; color: white;">
                    ${m.title}
                    ${hasItems ? `<span style="font-size: 0.75rem; background: rgba(59, 130, 246, 0.15); color: #93c5fd; padding: 0.15rem 0.45rem; border-radius: 4px; margin-left: 0.5rem; font-weight: normal;">${m.items.length} mov.</span>` : ''}
                </td>
                <td style="padding: 0.85rem 0.75rem; text-align: center;">
                    <span style="padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; background: rgba(59, 130, 246, 0.2); color: #60a5fa;">BILAN</span>
                </td>
                <td style="padding: 0.85rem 0.75rem; text-align: right; color: var(--text-muted); font-family: monospace;">${formatCurrency(m.saldoPrec)}</td>
                <td style="padding: 0.85rem 0.75rem; text-align: right; color: #10b981; font-weight: 600; font-family: monospace;">${m.col1 > 0 ? ('+ ' + formatCurrency(m.col1)) : '-'}</td>
                <td style="padding: 0.85rem 0.75rem; text-align: right; color: #f87171; font-weight: 600; font-family: monospace;">${m.col2 > 0 ? ('- ' + formatCurrency(m.col2)) : '-'}</td>
                <td style="padding: 0.85rem 0.75rem; text-align: right; font-weight: 800; color: #38bdf8; font-size: 0.95rem; font-family: monospace;">${formatCurrency(m.nuovoSaldo)}</td>
            </tr>
        `;

        if (hasItems) {
            m.items.forEach(item => {
                const val = Number(item.totale) || 0;
                const isPos = val >= 0;
                const formattedVal = isPos ? ('+ ' + formatCurrency(val)) : ('- ' + formatCurrency(Math.abs(val)));
                const valColor = isPos ? '#10b981' : '#f87171';

                html += `
                    <tr class="mastrino-detail-row ${mastrinoId}" style="display: none; background: rgba(0,0,0,0.22); border-bottom: 1px dashed rgba(255,255,255,0.05); font-size: 0.84rem; color: #cbd5e1;">
                        <td style="padding: 0.5rem 0.75rem 0.5rem 2rem; color: var(--text-muted); font-family: monospace;">
                            <i class="fa-solid fa-angle-right" style="opacity: 0.5; margin-right: 4px;"></i> ${item.data}
                        </td>
                        <td colspan="2" style="padding: 0.5rem 0.75rem;">
                            <span style="color: white; font-weight: 500;">${item.partner}</span> — <span style="color: var(--text-muted);">${item.desc}</span>
                            ${item.fattura && item.fattura !== '-' ? `<span style="font-size: 0.75rem; color: #fbbf24; margin-left: 0.5rem;"><i class="fa-solid fa-receipt"></i> ${item.fattura}</span>` : ''}
                        </td>
                        <td style="padding: 0.5rem 0.75rem; text-align: right; color: var(--text-muted); font-size: 0.8rem;">${item.tipo}</td>
                        <td style="padding: 0.5rem 0.75rem; text-align: right; color: #10b981;">${isPos ? formattedVal : '-'}</td>
                        <td style="padding: 0.5rem 0.75rem; text-align: right; color: #f87171;">${!isPos ? formattedVal : '-'}</td>
                        <td style="padding: 0.5rem 0.75rem; text-align: right; color: ${valColor}; font-weight: 600;">${formattedVal}</td>
                    </tr>
                `;
            });
        }
    });

    // SEZIONE 2: CONTI DI PERDITE E PROFITTI (P&L)
    let pnlTotPrec = 0, pnlTotCol1 = 0, pnlTotCol2 = 0, pnlTotNuovo = 0;
    displayPnl.forEach(m => {
        pnlTotPrec += m.saldoPrec;
        pnlTotCol1 += m.col1;
        pnlTotCol2 += m.col2;
        pnlTotNuovo += m.nuovoSaldo;
    });

    html += `
        <tr class="mastrino-group-header" style="background: rgba(239, 68, 68, 0.18); font-weight: 800; border-top: 2px solid rgba(239, 68, 68, 0.5); border-bottom: 1px solid rgba(239, 68, 68, 0.3); margin-top: 1rem;">
            <td colspan="3" style="padding: 0.9rem 1rem; color: #fca5a5; font-size: 1rem;">
                <i class="fa-solid fa-file-invoice-dollar"></i> 2. CONTI DI PERDITE E PROFITTI (P&L - CHARGES & PRODUITS)
            </td>
            <td style="padding: 0.9rem 0.75rem; text-align: right; color: var(--text-muted); font-weight: 700;">${formatCurrency(pnlTotPrec)}</td>
            <td style="padding: 0.9rem 0.75rem; text-align: right; color: #fca5a5; font-weight: 700;">- ${formatCurrency(pnlTotCol1)}</td>
            <td style="padding: 0.9rem 0.75rem; text-align: right; color: #6ee7b7; font-weight: 700;">+ ${formatCurrency(pnlTotCol2)}</td>
            <td style="padding: 0.9rem 0.75rem; text-align: right; color: ${pnlTotNuovo >= 0 ? '#6ee7b7' : '#fca5a5'}; font-weight: 800; font-size: 1.05rem;">${formatCurrency(pnlTotNuovo)}</td>
        </tr>
    `;

    displayPnl.forEach((m, idx) => {
        const mastrinoId = `mastrino-pnl-${idx}`;
        const hasItems = m.items && m.items.length > 0;
        const resColor = m.nuovoSaldo >= 0 ? (m.nuovoSaldo === 0 ? 'var(--text-muted)' : '#6ee7b7') : '#fca5a5';

        html += `
            <tr class="mastrino-row" onclick="${hasItems ? `toggleMastrino('${mastrinoId}')` : ''}" style="background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.92rem; ${hasItems ? 'cursor: pointer;' : ''} transition: background 0.2s;" title="${hasItems ? `Clicca per consultare i ${m.items.length} movimenti` : ''}">
                <td style="padding: 0.85rem 0.75rem; font-family: monospace; font-weight: bold; color: #6ee7b7; white-space: nowrap;">
                    ${hasItems ? `<i class="fa-solid fa-chevron-right mastrino-group-icon" id="icon-${mastrinoId}" style="margin-right: 6px; font-size: 0.75rem; color: var(--text-muted); transition: transform 0.2s;"></i>` : '<span style="display:inline-block; width:14px;"></span>'}
                    ${m.code}
                </td>
                <td style="padding: 0.85rem 0.75rem; font-weight: 600; color: white;">
                    ${m.title}
                    ${hasItems ? `<span style="font-size: 0.75rem; background: rgba(239, 68, 68, 0.15); color: #fca5a5; padding: 0.15rem 0.45rem; border-radius: 4px; margin-left: 0.5rem; font-weight: normal;">${m.items.length} scritture</span>` : ''}
                </td>
                <td style="padding: 0.85rem 0.75rem; text-align: center;">
                    <span style="padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; background: rgba(239, 68, 68, 0.2); color: #fca5a5;">P&L</span>
                </td>
                <td style="padding: 0.85rem 0.75rem; text-align: right; color: var(--text-muted); font-family: monospace;">${formatCurrency(m.saldoPrec)}</td>
                <td style="padding: 0.85rem 0.75rem; text-align: right; color: #fca5a5; font-weight: 600; font-family: monospace;">${m.col1 > 0 ? ('- ' + formatCurrency(m.col1)) : '-'}</td>
                <td style="padding: 0.85rem 0.75rem; text-align: right; color: #6ee7b7; font-weight: 600; font-family: monospace;">${m.col2 > 0 ? ('+ ' + formatCurrency(m.col2)) : '-'}</td>
                <td style="padding: 0.85rem 0.75rem; text-align: right; font-weight: 800; color: ${resColor}; font-size: 0.95rem; font-family: monospace;">${formatCurrency(m.nuovoSaldo)}</td>
            </tr>
        `;

        if (hasItems) {
            m.items.forEach(item => {
                const val = Number(item.totale) || 0;
                const isPos = val >= 0;
                const formattedVal = isPos ? ('+ ' + formatCurrency(val)) : ('- ' + formatCurrency(Math.abs(val)));
                const valColor = isPos ? '#10b981' : '#f87171';

                html += `
                    <tr class="mastrino-detail-row ${mastrinoId}" style="display: none; background: rgba(0,0,0,0.22); border-bottom: 1px dashed rgba(255,255,255,0.05); font-size: 0.84rem; color: #cbd5e1;">
                        <td style="padding: 0.5rem 0.75rem 0.5rem 2rem; color: var(--text-muted); font-family: monospace;">
                            <i class="fa-solid fa-angle-right" style="opacity: 0.5; margin-right: 4px;"></i> ${item.data}
                        </td>
                        <td colspan="2" style="padding: 0.5rem 0.75rem;">
                            <span style="color: white; font-weight: 500;">${item.desc}</span> <span style="color: var(--text-muted);">(${item.partner})</span>
                            ${item.fattura && item.fattura !== '-' ? `<span style="font-size: 0.75rem; color: #fbbf24; margin-left: 0.5rem;"><i class="fa-solid fa-receipt"></i> ${item.fattura}</span>` : ''}
                        </td>
                        <td style="padding: 0.5rem 0.75rem; text-align: right; color: var(--text-muted); font-size: 0.8rem;">P&L</td>
                        <td style="padding: 0.5rem 0.75rem; text-align: right; color: #f87171;">${!isPos ? formattedVal : '-'}</td>
                        <td style="padding: 0.5rem 0.75rem; text-align: right; color: #10b981;">${isPos ? formattedVal : '-'}</td>
                        <td style="padding: 0.5rem 0.75rem; text-align: right; color: ${valColor}; font-weight: 600;">${formattedVal}</td>
                    </tr>
                `;
            });
        }
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

    // Foglio 1: Giornale Movimenti (Journal)
    const wsJournalData = [
        ['Nr', 'Data Contabile', 'Data Valuta', 'Anno', 'Conto PCN', 'Controparte / Partner', 'Descrizione', 'Tipo (BIL/PP)', 'Imponibile EUR', 'TVA EUR', 'Totale EUR', 'Rif. Fattura', 'Pagato']
    ];

    filtered.forEach((r, i) => {
        wsJournalData.push([
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

    const wsJournal = XLSX.utils.aoa_to_sheet(wsJournalData);
    XLSX.utils.book_append_sheet(wb, wsJournal, `Giornale_${selectedYear}`);

    // Foglio 2: Mastrini (Grand Livre dei Conti)
    const wsMastriniData = [
        ['Sezione', 'Conto PCN', 'Titolo del Conto', 'Saldo Precedente EUR', 'Entrate / Costi EUR', 'Uscite / Ricavi EUR', 'Nuovo Saldo EUR']
    ];

    // Calcolo Mastrini per export
    const bilRows = document.querySelectorAll('#table-body-mastrini tr.mastrino-row');
    bilRows.forEach(tr => {
        const tds = tr.querySelectorAll('td');
        if (tds.length >= 7) {
            wsMastriniData.push([
                tds[2].textContent.trim(),
                tds[0].textContent.trim(),
                tds[1].textContent.trim(),
                tds[3].textContent.trim(),
                tds[4].textContent.trim(),
                tds[5].textContent.trim(),
                tds[6].textContent.trim()
            ]);
        }
    });

    const wsMastrini = XLSX.utils.aoa_to_sheet(wsMastriniData);
    XLSX.utils.book_append_sheet(wb, wsMastrini, `Mastrini_${selectedYear}`);

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

    // Se l'utente è nel tab Giornale Movimenti
    if (activeTab === 'tab-journal' || activeTab === 'tab-grand-livre') {
        doc.setFontSize(15);
        doc.setTextColor(16, 185, 129);
        doc.text(`GREEN ENERBRAS ONE SCSp - Giornale Movimenti ${yearLabel}`, 14, 18);

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

        doc.save(`GREEN_ENERBRAS_Giornale_Movimenti_${selectedYear}.pdf`);
        return;
    }

    // Se l'utente è nel tab Mastrini
    if (activeTab === 'tab-mastrini') {
        doc.setFontSize(15);
        doc.setTextColor(16, 185, 129);
        doc.text(`GREEN ENERBRAS ONE SCSp - Mastrini dei Conti (Grand Livre) ${yearLabel}`, 14, 18);

        doc.setFontSize(8.5);
        doc.setTextColor(100);
        doc.text(`Société en Commandite Spéciale - RCS: B295061 - Matricule: 2025 5805 747 - Date d'export: ${new Date().toLocaleDateString('it-IT')}`, 14, 24);

        const rows = [];
        const mastriniRows = document.querySelectorAll('#table-body-mastrini tr.mastrino-row');
        mastriniRows.forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length >= 7) {
                rows.push([
                    tds[0].textContent.trim(),
                    tds[1].textContent.trim(),
                    tds[2].textContent.trim(),
                    tds[3].textContent.trim(),
                    tds[4].textContent.trim(),
                    tds[5].textContent.trim(),
                    tds[6].textContent.trim()
                ]);
            }
        });

        doc.autoTable({
            startY: 28,
            head: [['N° Conto', 'Titolo del Conto', 'Sezione', 'Saldo Precedente', 'Entrate / Costi', 'Uscite / Ricavi', 'Nuovo Saldo']],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
            styles: { fontSize: 7.5, cellPadding: 2.2 },
            columnStyles: {
                0: { cellWidth: 24 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 16, halign: 'center' },
                3: { cellWidth: 25, halign: 'right' },
                4: { cellWidth: 25, halign: 'right' },
                5: { cellWidth: 25, halign: 'right' },
                6: { cellWidth: 28, halign: 'right' }
            }
        });

        doc.save(`GREEN_ENERBRAS_Mastrini_${selectedYear}.pdf`);
        return;
    }

    // Modalità standard: P&L e Bilan
    let totalBanque = 0;
    let totalCharges = 0;
    let totalProduits = 0;
    let totalImmob = 0;
    let totalCapital = 0;
    let totalDettes = 0;

    const cumFiltered = CONTABILITA_RECORDS.filter(r => selectedYear === 'all' || Number(r.anno) <= Number(selectedYear));
    const priorFiltered = CONTABILITA_RECORDS.filter(r => selectedYear !== 'all' && Number(r.anno) < Number(selectedYear));

    cumFiltered.forEach(r => {
        const val = Number(r.totale) || 0;
        const pcn = String(r.pcnCode || '');
        const tip = String(r.tipologia || '');
        const desc = String(r.desc || '');
        const ap = String(r.ap || '');

        if (!r.isNonCashAccrual && !r.isInternalOffset) {
            totalBanque += val;
        }
        if (ap === 'IMMOBILISATIONS' || tip.includes('PARTICIPATIONS') || pcn.startsWith('233') || pcn.startsWith('261')) {
            totalImmob += Math.abs(val);
        }
        if (pcn.includes('CAPITAL') || tip.includes('CAPITAL') || desc.includes('101')) {
            totalCapital += val;
        }
        if (pcn.includes('472') || tip.includes('FACTURES NON PARVENUES')) {
            totalDettes += val;
        }
    });

    filtered.forEach(r => {
        const val = Number(r.totale) || 0;
        if (r.tipo === 'PP' && !r.isInternalOffset) {
            if (val < 0) totalCharges += Math.abs(val);
            else totalProduits += val;
        }
    });

    let priorNetResult = 0;
    priorFiltered.forEach(r => {
        if (r.tipo === 'PP' && !r.isInternalOffset) {
            priorNetResult += Number(r.totale) || 0;
        }
    });

    const netResult = totalProduits - totalCharges;
    const totalActif = totalImmob + totalBanque;
    const totalPassif = totalCapital + priorNetResult + netResult + totalDettes;

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

    const resNetLabel = netResult >= 0 ? "BÉNÉFICE DE L'EXERCICE (UTILE)" : "PERTE DE L'EXERCICE (PERDITA D'ESERCIZIO)";
    const resNetColor = netResult >= 0 ? [4, 120, 87] : [220, 38, 38];
    pnlBody.push([
        { content: `RÉSULTAT NET (PCN 121 / 141) - ${resNetLabel}`, colSpan: 3, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42], fontSize: 8.5 } },
        { content: formatCurrency(netResult), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249], textColor: resNetColor, fontSize: 8.5 } }
    ]);

    doc.setFontSize(15);
    doc.setTextColor(16, 185, 129);
    doc.text(`GREEN ENERBRAS ONE SCSp - Bilancio PCN ${yearLabel}`, 14, 16);

    doc.setFontSize(8.5);
    doc.setTextColor(100);
    const modeDesc = isAnyExpanded ? 'Versione Dettagliata (Voci Espanse)' : 'Versione Sintetica (Dati Raggruppati)';
    doc.text(`Société en Commandite Spéciale • RCS: B295061 • Matricule: 2025 5805 747 • ${modeDesc}`, 14, 22);
    doc.text(`Data di esportazione: ${new Date().toLocaleDateString('it-IT')}`, 14, 26);

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

    let nextY = doc.lastAutoTable.finalY + 10;
    if (nextY > 230) {
        doc.addPage();
        nextY = 20;
    }

    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text("2. BILAN COMPTABLE (STATO PATRIMONIALE)", 14, nextY);

    const bilanBody = [
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
        [
            { content: "PASSIVO & PATRIMONIO (PASSIF)", colSpan: 2, styles: { fontStyle: 'bold', fillColor: [209, 250, 229], textColor: [4, 120, 87] } },
            { content: formatCurrency(totalPassif), styles: { fontStyle: 'bold', halign: 'right', fillColor: [209, 250, 229], textColor: [4, 120, 87] } }
        ],
        [
            { content: "1010000", styles: { fontStyle: 'normal' } },
            { content: "A.I. CAPITAL SOUSCRIT (Apporti Associati GP & LPs)", styles: { fontStyle: 'normal' } },
            { content: formatCurrency(totalCapital), styles: { halign: 'right', fontStyle: 'bold' } }
        ]
    ];

    if (Math.abs(priorNetResult) > 0.001) {
        bilanBody.push([
            { content: "142 / 122", styles: { fontStyle: 'normal' } },
            { content: "A.IV. RÉSULTATS REPORTÉS (Report à nouveau esercizi prec.)", styles: { fontStyle: 'normal' } },
            { content: formatCurrency(priorNetResult), styles: { halign: 'right', fontStyle: 'bold', textColor: priorNetResult >= 0 ? [4, 120, 87] : [220, 38, 38] } }
        ]);
    }

    bilanBody.push([
        { content: "121 / 141", styles: { fontStyle: 'normal' } },
        { content: `A.V. RÉSULTAT DE L'EXERCICE (Risultato netto ${selectedYear === 'all' ? 'Tutti gli anni' : selectedYear})`, styles: { fontStyle: 'normal' } },
        { content: formatCurrency(netResult), styles: { halign: 'right', fontStyle: 'bold', textColor: resNetColor } }
    ]);

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
