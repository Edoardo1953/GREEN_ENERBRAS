#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur de Manuels et Guides Méthodologiques AML / LBC-FT pour GREEN ENERBRAS ONE SCSp
Génère les versions IT, FR et EN en formats Markdown (.md) et PDF (.pdf) haute qualité.
"""

import os
import fitz  # PyMuPDF

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
ADMIN_DOCS_DIR = os.path.join(BASE_DIR, "admin", "docs")
os.makedirs(DOCS_DIR, exist_ok=True)
os.makedirs(ADMIN_DOCS_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# 1. CONTENUTI IN MARKDOWN
# -----------------------------------------------------------------------------

MANUAL_MD_IT = """# GREEN ENERBRAS ONE SCSp - Luxembourg
## Guida Metodologica & Manuale d'Uso del Modulo AML / Antiriciclaggio
### Conformità LBC-FT (Supervisione AED / Legge 12 Nov 2004), Controllo Apporti Soci & Investimenti
**Società :** GREEN ENERBRAS ONE SCSp &bull; **R.C.S. Luxembourg :** B 278.900 &bull; **Matricola Nazionale :** 2023 2450 123 &bull; **TVA :** LU 34891234
**General Partner & Gérant :** NEW LIFE Sàrl (R.C.S. B 225.643) &bull; **Versione :** 2.0 (Esercizio 2026) &bull; **Stato :** Documento Ufficiale Interno

---

## 1. Quadro Normativo Lussemburghese per Veicoli Societari SCSp

### 1.1. Autorità di Vigilanza Competente : L'AED
Nel Granducato di Lussemburgo, la supervisione in materia di Prevenzione del Riciclaggio e del Finanziamento del Terrorismo (AML / LBC-FT) è ripartita tra diverse autorità:
- **La CSSF (Commission de Surveillance du Secteur Financier)**: vigila sul settore finanziario regolamentato e fondi autorizzati (SICAV, SIF, RAIF regolamentati, banche, SGR).
- **L'AED (Administration de l'Enregistrement, des Domaines et de la TVA)**: è l'autorità di vigilanza legale competente per le **società commerciali e i veicoli societari lussemburghesi non regolamentati da CSSF**, tra cui le **Società in Accomandita Speciale (SCSp)** disciplinate dalla Legge del 10 agosto 1915.

In quanto veicolo societario di investimento e partecipazione in energie rinnovabili, **GREEN ENERBRAS ONE SCSp ricade sotto la competenza e vigilanza diretta dell'AED** ai sensi della Legge modificata del 12 novembre 2004.

### 1.2. Fonti Normative di Riferimento
1. **Legge del 12 novembre 2004 (LBC/FT)** relativa alla lotta contro il riciclaggio e il finanziamento del terrorismo (e successive modifiche).
2. **Legge del 13 gennaio 2019** che istituisce il Registro dei Titolari Effettivi (RBE / LBR).
3. **Legge del 10 agosto 1915 sulle Società Commerciali** (regime delle SCSp introdotto e modernizzato nel 2013).
4. **Circolari AED (in particolare Circolari n° 779 e n° 800)** con le linee guida operative e il questionario annuale di conformità AML.
5. **Codice Penale Lussemburghese (Articoli 506-1 a 506-8)** sul reato di riciclaggio di capitali.

---

## 2. Obblighi di Conformità per GREEN ENERBRAS ONE SCSp

### 2.1. Adeguata Verifica dei Soci (Customer Due Diligence - CDD)
Per ciascun socio accomandatario (*General Partner*) e socio accomandante (*Limited Partner*), la società applica la procedura formale:
- **Identificazione dell'investitore :** Dati anagrafici, codice fiscale/matricola, documento d'identità valido, residenza e nazionalità.
- **Identificazione dei Titolari Effettivi (UBO / RBE) :** Verifica di ogni persona fisica detentrice di oltre il 25% delle quote o che eserciti il controllo effettivo.
- **Consultazione obbligatoria del Registro RBE :** Deposito e verifica sistematica della visura RBE presso il registro ufficiale LBR (*Luxembourg Business Registers*).
- **Screening PEP (Persone Politicamente Esposte) :** Rilevazione di soci o esponenti con cariche pubbliche di rilievo o loro stretti familiari (*RCAs*).
- **Verifica dell'Origine dei Fondi (Source of Wealth & Source of Funds) :** Tracciabilità bancaria rigorosa di tutti gli apporti di capitale versati sul conto corrente bancario (Banque de Luxembourg).

### 2.2. Flussi in Entrata di Capitale & Futuri Dividendi
- **Apporti di Capitale dei Soci (Esercizi 2025/2026) :** 13 versamenti per un totale di **261.000,00 €** interamente tracciati e verificati, suddivisi tra il General Partner NEW LIFE Sàrl (1.000 €) e i 10 Limited Partners (Edoardo Tubia, Salvatore Desiderio, Marco Sterzi, Silvia Tubia, Stefano Bertozzi, Maria De Miguel Bellvis, Enrico Tubia, Greta Zaniboni, Elisa Zaniboni, Giovanni Miletti).
- **Futuri Dividendi & Proventi :** Al momento non sono ancora stati percepiti dividendi in quanto la produzione dei parchi solari in Brasile (Tri Star Enerbras One SCP) è nella fase di avvio e autorizzazioni COSERN. Il registro AML è predisposto per monitorare e verificare ogni futuro flusso di dividendi e rimborsi in arrivo.

### 2.3. Soglie di Vigilanza e Graduazione del Controllo
- **Tutti i Versamenti (≥ 0 €)** : Tracciabilità contabile e bancaria sistematica di ogni accredito.
- **≥ 5.000 € (Soglia Standard)** : Verifica di conformità con il Contratto Sociale SCSp e l'Accordo di Sottoscrizione Quote.
- **≥ 10.000 € (Soglia Legale UE/AED)** : Due Diligence completa, visura RBE aggiornata e conservazione documentale per 5 anni.
- **≥ 25.000 € (Grandi Quote & Apporti)** : Esame approfondito della giustificazione economica e della provenienza dei patrimoni conferiti.

### 2.4. Conservazione Obbligatoria dei Documenti (5 Anni)
Tutti i documenti di identificazione (carte d'identità, contratti sociali, schede KYC, visure RBE e contabili bancarie) sono conservati per **almeno 5 anni** dalla cessazione del rapporto sociale.

### 2.5. Obbligo di Segnalazione di Operazioni Sospette (STR)
Ogni transazione o conferimento anomalo o non giustificato deve essere segnalato tempestivamente alla **Cellule de Renseignement Financier (CRF)** della Procura di Lussemburgo.

---

## 3. Guida Operativa all'Uso del Modulo nell'App

Il modulo **Conformità AML / LBC-FT** (`aml.html`) include 4 sezioni specializzate:

### 3.1. Tab 1 : Registro delle Entrate Quote & Controllo AML
- **Ordinamento cronologico decrescente :** Le operazioni del **2026** e i versamenti più recenti sono visualizzati in cima al registro.
- **Filtri avanzati :** Filtro per anno, socio conferente, tipologia di quota (GP / LP), stato KYC e soglie di importo (5k, 10k, 25k).
- **Perimetro pulito :** Include i **13 versamenti reali di capitale dei soci** (pari a 261.000 €), escludendo storni interni e spese di gestione.
- **Pulsante Fascicolo KYC :** Accesso immediato con un click alla scheda di conformità per ciascun socio.

### 3.2. Tab 2 : Mappatura Soci & Investitori
- Schede anagrafiche complete per tutti gli 11 soci della SCSp (NEW LIFE Sàrl, Tubia Edoardo, Desiderio Salvatore, Sterzi Marco, Tubia Silvia, Bertozzi Stefano, De Miguel Bellvis Maria, Tubia Enrico, Zaniboni Greta, Zaniboni Elisa, Miletti Giovanni) e l'entità target di investimento (*Tri Star Enerbras One SCP*).
- Visualizzazione del capitale sottoscritto e versato, quota percentuale di detenzione (detention %), titolari effettivi UBO e checklist documentale.

### 3.3. Tab 3 : Quadro Legale SCSp & Matrice dei Rischi
- Sintesi delle autorità di controllo (AED, CSSF, CRF) e matrice di valutazione dei fattori di rischio per veicoli di investimento ed energie rinnovabili.

### 3.4. Scheda Modale KYC & Salvataggio Persistente
- Cliccando su **« KYC »**, è possibile consultare e aggiornare dati anagrafici, UBO, livello di rischio (Basso/Medio/Alto), stato PEP e note di audit.
- Ogni modifica viene **salvata in modo permanente nella memoria locale del browser (`localStorage`)**.

### 3.5. Esportazioni di Conformità
- 📊 **Excel (.xlsx) :** Foglio normato con **25 colonne di conformità AML**.
- 📄 **CSV :** Esportazione tabellare standardizzata.
- 🖨️ **Rapporto Ufficiale PDF :** Documento formale pronto per la stampa con riepilogo statistico e intestazione GREEN ENERBRAS ONE SCSp.

---

## 4. Il Simulatore di Due Diligence (Risk-Based Approach)

La sezione **« 4. Simulateur Due Diligence »** consente di calcolare il profilo di rischio per qualsiasi nuovo investitore, socio o progetto d'investimento su 5 assi:

### 4.1. Modello di Punteggio (Score 0 - 100)
1. **Forma Giuridica :**
   - Persona Fisica / Residente UE : `+5 pt` (Rischio standard controllato).
   - Società Commerciale (SA / Sàrl) : `+10 pt` (Rischio societario ordinario).
   - SCSp / Partnership d'Investimento : `+15 pt` (Verifica catena soci).
   - Entità Estera / Veicolo Internazionale : `+25 pt` (Vigilanza investimenti transfrontalieri).
2. **Giurisdizione di Residenza / Sede :**
   - Lussemburgo / Zona Euro : `+5 pt` (Quadro UE equivalente).
   - Svizzera / UK / USA : `+10 pt` (Paesi terzi equivalenti GAFI).
   - Brasile / Paesi Terzi : `+30 pt` (Vigilanza investimenti internazionali).
3. **Fattore PEP (Persone Politicamente Esposte) :**
   - Presenza di PEP : `+35 pt` &rarr; Attivazione automatica della **Vigilanza Rafforzata (EDD)**.
4. **Complessità dell'Origine Fondi :**
   - Redditi da lavoro / Patrimonio personale diretto : `+0 pt`.
   - Vendita partecipazioni / Disinvestimenti aziendali : `+10 pt`.
   - Strutture fiduciarie / Trust : `+30 pt`.
5. **Volume della Quota Sottoscritta :**
   - < 25.000 € : `+0 pt` | 25.000 € – 50.000 € : `+10 pt` | ≥ 50.000 € : `+15 pt`.

### 4.2. Classi di Rischio e Misure Applicabili
- 🟢 **Basso (Score < 35) :** Due Diligence ordinaria (Documento d'identità, codice fiscale, contratto di sottoscrizione).
- 🟡 **Medio (Score 35 – 59) :** Vigilanza attiva, visura RBE verificata, monitoraggio periodico biennale.
- 🔴 **Elevato (Score ≥ 60 o PEP) :** Vigilanza Rafforzata (*Enhanced Due Diligence*), documentazione probatoria origine patrimonio (*Source of Wealth*), approvazione del General Partner e audit annuale.
"""

MANUAL_MD_FR = """# GREEN ENERBRAS ONE SCSp - Luxembourg
## Guide Méthodologique & Manuel d'Utilisation du Module AML / LBC-FT
### Conformité Anti-Blanchiment (AED / Loi 12 Nov 2004), Contrôle des Apports Associés & Investissements
**Société :** GREEN ENERBRAS ONE SCSp &bull; **R.C.S. Luxembourg :** B 278.900 &bull; **Matricule National :** 2023 2450 123 &bull; **TVA :** LU 34891234
**General Partner & Gérant :** NEW LIFE Sàrl (R.C.S. B 225.643) &bull; **Version :** 2.0 (Exercice 2026) &bull; **Statut :** Document Officiel Interne

---

## 1. Cadre Réglementaire Luxembourgeois pour Véhicules SCSp

### 1.1. Autorité de Surveillance Compétente : L'AED
Au Grand-Duché de Luxembourg, la surveillance de la Lutte Contre le Blanchiment et le Financement du Terrorisme (LBC/FT) est répartie entre plusieurs autorités :
- **La CSSF (Commission de Surveillance du Secteur Financier)** : compétente pour le secteur financier régulé (banques, SICAV, fonds agréés, PSF).
- **L'AED (Administration de l'Enregistrement, des Domaines et de la TVA)** : autorité de contrôle légale pour les **sociétés commerciales et véhicules d'investissement non régulés par la CSSF**, notamment les **Sociétés en Commandite Spéciale (SCSp)** régies par la Loi du 10 août 1915.

En tant que véhicule d'investissement et de détention d'actifs dans les énergies renouvelables, **GREEN ENERBRAS ONE SCSp relève de la compétence de contrôle de l'AED** au titre de la Loi modifiée du 12 novembre 2004.

### 1.2. Textes Législatifs Fondamentaux
1. **Loi du 12 novembre 2004 (LBC/FT)** relative à la lutte contre le blanchiment et contre le financement du terrorisme (modifiée).
2. **Loi du 13 janvier 2019** instituant le Registre des Bénéficiaires Effectifs (RBE / LBR).
3. **Loi du 10 août 1915 sur les Sociétés Commerciales** (régime modernisé des SCSp).
4. **Circulaires AED (notamment Circulaires n° 779 et n° 800)** précisant les lignes directrices et le questionnaire annuel d'évaluation AML.
5. **Code Pénal Luxembourgeois (Articles 506-1 à 506-8)** définissant l'infraction de blanchiment de capitaux.

---

## 2. Obligations Légales de GREEN ENERBRAS ONE SCSp

### 2.1. Obligation de Vigilance Associés (Customer Due Diligence - CDD)
Pour chaque associé commandité (*General Partner*) et associé commanditaire (*Limited Partner*), la société applique la procédure d'identification :
- **Identification de l'investisseur :** État civil, pièce d'identité en cours de validité, domicile et nationalité.
- **Identification des Bénéficiaires Effectifs (UBO / RBE) :** Toute personne physique détenant directement ou indirectement plus de 25% des parts ou des droits de vote, ou exerçant le contrôle effectif.
- **Consultation obligatoire du RBE :** Vérification systématique de l'extrait RBE auprès de Luxembourg Business Registers (LBR).
- **Criblage PEP (Personne Politiquement Exposée) :** Détection des investisseurs exerçant des fonctions publiques éminentes ou de leurs proches (*RCAs*).
- **Contrôle de l'Origine des Fonds (Source of Wealth & Source of Funds) :** Traçabilité bancaire systématique de tous les apports de capitaux reçus sur le compte bancaire de la société (Banque de Luxembourg).

### 2.2. Flux en Entrée de Capital & Dividendes Futurs
- **Apports de Capital des Associés (2025/2026) :** 13 versements d'apports pour un total de **261.000,00 €** intégralement vérifiés et documentés, répartis entre le General Partner NEW LIFE Sàrl (1.000 €) et les 10 Limited Partners.
- **Dividendes & Produits Futurs :** À ce stade, aucun dividende n'a encore été encaissé car la production des parchi solaires au Brésil (Tri Star Enerbras One SCP) est en cours de déploiement et autorisations COSERN. Le registre AML est d'ores et déjà structuré pour enregistrer et contrôler tout futur versement de dividende.

### 2.3. Seuils de Vigilance et Gradation du Contrôle
- **Tous les Apports (≥ 0 €)** : Traçabilité comptable et bancaire systématique de chaque encaissement.
- **≥ 5.000 € (Seuil Standard)** : Vérification de conformité avec le Contrat Social de la SCSp.
- **≥ 10.000 € (Seuil Réglementaire UE/AED)** : Due Diligence complète, validation de l'extrait RBE et conservation 5 ans.
- **≥ 25.000 € (Grands Apports)** : Examen approfondi de la cohérence économique et de l'origine du patrimoine de l'associé.

### 2.4. Conservation Obligatoire des Pièces (5 Ans)
Tous les justificatifs d'identification (pièces d'identité, contrats de souscription, déclarations RBE et relevés bancaires) sont conservés pendant **au moins 5 ans** à compter de la fin de la relation d'affaires.

### 2.5. Obligation de Déclaration de Soupçon (STR)
Toute opération suspecte ou non justifiée économiquement doit faire l'objet d'une déclaration immédiate sans délai auprès de la **Cellule de Renseignement Financier (CRF)** du Parquet de Luxembourg.

---

## 3. Guide Pratique d'Utilisation du Module dans l'App

Le module **Conformité AML / LBC-FT** (`aml.html`) est articulé autour de 4 onglets spécialisés :

### 3.1. Onglet 1 : Registre des Entrées & Contrôle AML
- **Affichage chronologique inversé :** Les apports de **2026** et les plus récents apparaissent en haut du tableau.
- **Filtres multicritères :** Filtrage par année, associé, statut de part (GP/LP), statut KYC et seuils AML (5k, 10k, 25k).
- **Périmètre strict :** Inclut les **13 versements effectifs de capitaux** (totalisant 261.000 €), excluant les flux de gestion interne.
- **Bouton Fiche KYC :** Accès direct au dossier de conformité pour chaque associé.

### 3.2. Onglet 2 : Cartographie des Associés & Investisseurs
- Fiches synthétiques détaillées pour l'ensemble des 11 associés de la SCSp et l'entité cible d'investissement (*Tri Star Enerbras One SCP*).
- Visualisation du capital versé, pourcentage de détention (% detention), UBO déclarés et pièces au dossier.

### 3.3. Onglet 3 : Cadre Légal SCSp & Matrice des Risques
- Synthèse des autorités de contrôle (AED, CSSF, CRF) et matrice d'analyse des facteurs de risque.

### 3.4. Fiche Modale Interactive & Persistance
- En cliquant sur **« KYC »**, une fenêtre modale permet de consulter et mettre à jour les coordonnées, UBO, niveau de risque (Faible/Moyen/Élevé), statut PEP et notes d'audit.
- Les modifications sont **automatiquement sauvegardées dans le navigateur (`localStorage`)**.

### 3.5. Exportations Réglementaires
- 📊 **Excel (.xlsx) :** Feuille normée de **25 colonnes de conformité**.
- 📄 **CSV :** Export tabulaire standardisé.
- 🖨️ **Rapport PDF :** Document officiel structuré avec totaux consolidés et en-tête GREEN ENERBRAS ONE SCSp.

---

## 4. Le Simulateur de Due Diligence (Risk-Based Approach)

L'onglet **« 4. Simulateur Due Diligence »** permet d'évaluer le risque de tout nouvel investisseur ou projet selon 5 critères :

### 4.1. Modèle de Notation (Score 0 à 100)
1. **Forme Juridique :**
   - Personne Physique / Résident UE : `+5 pts` (Risque standard).
   - Société Commerciale (SA / Sàrl) : `+10 pts` (Risque ordinaire).
   - SCSp / Véhicule d'Investissement : `+15 pts` (Contrôle des associés).
   - Entité Internationale Hors UE : `+25 pts` (Vigilance transfrontalière).
2. **Juridiction de Résidence / Siège :**
   - Luxembourg / Zone Euro : `+5 pts` (Cadre équivalent UE).
   - Suisse / UK / USA : `+10 pts` (Pays tiers équivalent GAFI).
   - Brésil / Pays Tiers : `+30 pts` (Vigilance investissement international).
3. **Statut PEP (Personne Politiquement Exposée) :**
   - Présence PEP : `+35 pts` &rarr; Déclenchement automatique de la **Vigilance Renforcée (EDD)**.
4. **Origine des Capitaux :**
   - Revenus personnels / Épargne directe : `+0 pt`.
   - Cession d'actifs / Dividendes antérieurs : `+10 pts`.
   - Structure fiduciaire / Trust : `+30 pts`.
5. **Volume de la Souscription :**
   - < 25.000 € : `+0 pt` | 25.000 € – 50.000 € : `+10 pts` | ≥ 50.000 € : `+15 pts`.

### 4.2. Classes de Risque & Actions
- 🟢 **Faible (Score < 35) :** Due Diligence standard (CNI, justificatif domicile, contrat de souscription).
- 🟡 **Moyen (Score 35 – 59) :** Vigilance active, extrait RBE vérifié, revue périodique tous les 2 ans.
- 🔴 **Élevé (Score ≥ 60 ou PEP) :** Vigilance Renforcée (*Enhanced Due Diligence*), justification de l'origine des fonds (*Source of Wealth*), validation de la gérance et revue annuelle.
"""

MANUAL_MD_EN = """# GREEN ENERBRAS ONE SCSp - Luxembourg
## Methodological Guide & User Manual for the AML / CFT Compliance Module
### Anti-Money Laundering Compliance (AED Oversight / Law of 12 Nov 2004), Partner Capital Monitoring & Investments
**Company :** GREEN ENERBRAS ONE SCSp &bull; **R.C.S. Luxembourg :** B 278.900 &bull; **National ID (Matricule) :** 2023 2450 123 &bull; **VAT :** LU 34891234
**General Partner & Manager :** NEW LIFE Sàrl (R.C.S. B 225.643) &bull; **Version :** 2.0 (Fiscal Year 2026) &bull; **Status :** Official Internal Compliance Policy

---

## 1. Luxembourg AML Legal Framework for SCSp Investment Vehicles

### 1.1. Competent Supervisory Authority : The AED
In the Grand Duchy of Luxembourg, oversight for Anti-Money Laundering and Countering the Financing of Terrorism (AML / CFT) is allocated across dedicated regulators:
- **The CSSF (Commission de Surveillance du Secteur Financier)**: exclusively supervises regulated financial institutions and authorized funds (banks, UCITS, SIFs, management companies).
- **The AED (Administration de l'Enregistrement, des Domaines et de la TVA)**: is the statutory supervisory authority for **unregulated Luxembourg commercial companies and investment partnerships**, specifically **Special Limited Partnerships (SCSp)** governed by the Law of 10 August 1915.

As an investment and clean energy asset-holding vehicle, **GREEN ENERBRAS ONE SCSp is subject to the direct oversight of the AED** pursuant to the amended Law of 12 November 2004.

### 1.2. Key Legislative References
1. **Law of 12 November 2004 (AML/CFT)** on the prevention of money laundering and terrorist financing (as amended).
2. **Law of 13 January 2019** establishing the Register of Beneficial Owners (RBE / LBR).
3. **Law of 10 August 1915 on Commercial Companies** (modernized SCSp partnership regime).
4. **AED Circulars (notably Circulars No. 779 & No. 800)** outlining compliance guidelines and the annual AML self-assessment questionnaire.
5. **Luxembourg Penal Code (Articles 506-1 to 506-8)** defining money laundering offences.

---

## 2. Compliance Obligations for GREEN ENERBRAS ONE SCSp

### 2.1. Partner Customer Due Diligence (CDD) Obligations
For each General Partner and Limited Partner, GREEN ENERBRAS ONE SCSp enforces rigorous onboarding and verification procedures:
- **Investor Identification:** Certified identity card/passport, tax number, registered residence, and nationality.
- **Beneficial Ownership Identification (UBO / RBE):** Any natural person holding directly or indirectly more than 25% of partnership units or exercising effective control.
- **Mandatory RBE Consultation:** Systematic verification and maintenance of official filings with the Luxembourg Register of Beneficial Owners (RBE / LBR).
- **PEP Screening:** Detection of Politically Exposed Persons holding prominent public functions or their close family members (*RCAs*).
- **Source of Wealth & Source of Funds Verification:** Complete banking audit trail for all capital contributions paid into the company's dedicated account (Banque de Luxembourg).

### 2.2. Capital Inflows & Future Solar Park Dividends
- **Partner Capital Contributions (2025/2026):** 13 capital installments totaling **€261,000.00** fully verified and documented across the General Partner NEW LIFE Sàrl (€1,000) and the 10 Limited Partners.
- **Future Dividends & Proceeds:** As the Brazilian photovoltaic parks (Tri Star Enerbras One SCP) are currently completing deployment and COSERN grid authorizations, no dividend distributions have occurred yet. The AML system is fully calibrated to track, vet, and register all forthcoming dividend inflows from Brazil.

### 2.3. Vigilance Thresholds and Risk Levels
- **All Contributions (≥ €0)**: Full accounting and banking traceability of every receipt.
- **≥ €5,000 (Standard Vigilance)**: Verification of alignment with the SCSp Partnership Agreement and Subscription Form.
- **≥ €10,000 (EU / AED Legal Threshold)**: Comprehensive Customer Due Diligence, valid RBE extract, and 5-year data retention.
- **≥ €25,000 (Major Contributions)**: Enhanced scrutiny of source of wealth and economic justification.

### 2.4. Mandatory Document Retention (5 Years)
All identification files (ID cards, subscription agreements, RBE filings, and bank statements) must be retained for **at least 5 years** following the termination of the partnership relationship.

### 2.5. Suspicious Transaction Reporting (STR)
Any anomalous or economically unjustifiable transaction must be reported without delay to the **Financial Intelligence Unit (CRF / FIU Luxembourg)**.

---

## 3. Practical User Guide for the AML Module in the App

The **AML / CFT Compliance** module (`aml.html`) comprises 4 specialized tabs:

### 3.1. Tab 1 : Capital Inflows & AML Register
- **Descending Chronological Order:** Transactions from **2026** and the latest contributions appear at the top of the table.
- **Advanced Filters:** Filter by fiscal year, partner name, partnership role (GP/LP), KYC status, and AML thresholds (5k, 10k, 25k).
- **Clean Scope:** Tracks the **13 authentic capital contributions** totaling €261,000.
- **KYC File Button:** Instant one-click modal opening for compliance review on any partner.

### 3.2. Tab 2 : Partners & Investors Map
- Comprehensive profile cards for all 11 SCSp partners and the Brazilian target vehicle (*Tri Star Enerbras One SCP*).
- Display of subscribed and paid-in capital, equity stake percentage (detention %), identified UBOs, and document checklist.

### 3.3. Tab 3 : SCSp Legal Framework & Risk Matrix
- Summary of competent authorities (AED, CSSF, CRF) and comprehensive risk factor matrix for renewable energy investment vehicles.

### 3.4. Interactive KYC Modal & Local Storage Persistence
- Clicking **"KYC"** enables viewing and editing partner details, UBOs, risk rating (Low/Medium/High), PEP status, and compliance audit notes.
- All modifications are **automatically persisted in local browser storage (`localStorage`)**.

### 3.5. Regulatory Exports
- 📊 **Excel (.xlsx):** Standardized **25-column AML compliance spreadsheet**.
- 📄 **CSV:** Standardized tabular export.
- 🖨️ **Official PDF Report:** Formatted audit report with GREEN ENERBRAS ONE SCSp corporate header and consolidated statistics.

---

## 4. Due Diligence Risk Simulator (Risk-Based Approach)

The **"4. Due Diligence Simulator"** tab assesses investor and project risk using a weighted 5-pillar scoring model:

### 4.1. Scoring Model (0 to 100 Points)
1. **Investor Entity Type:**
   - Natural Person / EU Resident: `+5 pts` (Standard verified risk).
   - Commercial Company (SA / Sàrl): `+10 pts` (Ordinary corporate risk).
   - SCSp / Investment Partnership: `+15 pts` (Partner chain vetting).
   - Non-EU International Entity: `+25 pts` (Cross-border vigilance).
2. **Registered Office / Residence Jurisdiction:**
   - Luxembourg / Eurozone: `+5 pts` (Equivalent EU framework).
   - Switzerland / UK / USA: `+10 pts` (Equivalent FATF third country).
   - Brazil / International Non-EU: `+30 pts` (International investment vigilance).
3. **PEP Exposure:**
   - PEP Involved: `+35 pts` &rarr; Automatic trigger of **Enhanced Due Diligence (EDD)**.
4. **Source of Funds Origin:**
   - Personal employment income / Direct savings: `+0 pts`.
   - Business divestment / Accumulated dividends: `+10 pts`.
   - Trust / Fiduciary structure: `+30 pts`.
5. **Subscription Volume:**
   - < €25,000: `+0 pts` | €25,000 – €50,000: `+10 pts` | ≥ €50,000: `+15 pts`.

### 4.2. Risk Classes & Recommended Measures
- 🟢 **Low Risk (Score < 35):** Standard Due Diligence (ID card, proof of address, subscription agreement).
- 🟡 **Medium Risk (Score 35 – 59):** Active vigilance, verified RBE extract, biennial review.
- 🔴 **High Risk (Score ≥ 60 or PEP):** Enhanced Due Diligence (*EDD*), documented source of wealth (*Source of Wealth*), management sign-off, and mandatory annual audit.
"""

# -----------------------------------------------------------------------------
# 2. GENERAZIONE DEI FILE PDF CON PYMUPDF
# -----------------------------------------------------------------------------

def create_pdf_from_text(title, subtitle, lang_code, sections, output_pdf_path):
    doc = fitz.open()
    
    # Dimensioni A4 : 595.3 x 841.9 points
    PAGE_WIDTH = 595.3
    PAGE_HEIGHT = 841.9
    MARGIN_X = 45.0
    MARGIN_TOP = 50.0
    MARGIN_BOTTOM = 50.0
    CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN_X
    
    # Colori
    COLOR_HEADER_BG = (0.06, 0.73, 0.49) # Emerald #10b981
    COLOR_DARK = (0.06, 0.09, 0.16) # #0f172a
    COLOR_MUTED = (0.40, 0.45, 0.55) # #64748b
    COLOR_BORDER = (0.85, 0.88, 0.92)
    COLOR_LIGHT_BG = (0.96, 0.98, 0.99)
    COLOR_ACCENT_BLUE = (0.15, 0.45, 0.85)

    def new_page_with_header(page_num, total_pages=None):
        page = doc.new_page(width=PAGE_WIDTH, height=PAGE_HEIGHT)
        
        # En-tête supérieur
        page.draw_rect(fitz.Rect(MARGIN_X, 25, PAGE_WIDTH - MARGIN_X, 27), color=COLOR_HEADER_BG, fill=COLOR_HEADER_BG)
        page.insert_text(fitz.Point(MARGIN_X, 40), "GREEN ENERBRAS ONE SCSp • Luxembourg (R.C.S. B 278.900)", fontsize=8, color=COLOR_MUTED)
        page.insert_text(fitz.Point(PAGE_WIDTH - MARGIN_X - 190, 40), f"Conformità AML / LBC-FT (AED / Loi 2004)", fontsize=8, color=COLOR_HEADER_BG)
        
        # Ligne de séparation
        page.draw_line(fitz.Point(MARGIN_X, 45), fitz.Point(PAGE_WIDTH - MARGIN_X, 45), color=COLOR_BORDER, width=0.5)
        
        # Pied de page
        page.draw_line(fitz.Point(MARGIN_X, PAGE_HEIGHT - 35), fitz.Point(PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 35), color=COLOR_BORDER, width=0.5)
        page.insert_text(fitz.Point(MARGIN_X, PAGE_HEIGHT - 22), "Documento di Conformità Interno • Loi modifiée du 12 novembre 2004", fontsize=7.5, color=COLOR_MUTED)
        page.insert_text(fitz.Point(PAGE_WIDTH - MARGIN_X - 55, PAGE_HEIGHT - 22), f"Pagina {page_num}", fontsize=8, color=COLOR_DARK)
        
        return page

    # Pagina 1
    p_num = 1
    page = new_page_with_header(p_num)
    
    y = 70.0
    
    # Titolo Principale Box
    page.draw_rect(fitz.Rect(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y + 75), color=COLOR_BORDER, fill=COLOR_LIGHT_BG)
    page.draw_rect(fitz.Rect(MARGIN_X, y, MARGIN_X + 6, y + 75), color=COLOR_HEADER_BG, fill=COLOR_HEADER_BG)
    
    page.insert_text(fitz.Point(MARGIN_X + 18, y + 26), title, fontsize=14, color=COLOR_DARK, fontname="hebo")
    page.insert_text(fitz.Point(MARGIN_X + 18, y + 46), subtitle, fontsize=9.5, color=COLOR_HEADER_BG, fontname="hebo")
    page.insert_text(fitz.Point(MARGIN_X + 18, y + 62), "GREEN ENERBRAS ONE SCSp • R.C.S. Luxembourg B 278.900 • GP: NEW LIFE Sàrl (B 225.643)", fontsize=8, color=COLOR_MUTED)
    
    y += 95.0
    
    for sec_idx, sec in enumerate(sections):
        # Verifica salto pagina
        estimated_height = 40 + len(sec.get("items", [])) * 32 + len(sec.get("paras", [])) * 28
        if y + estimated_height > PAGE_HEIGHT - MARGIN_BOTTOM:
            p_num += 1
            page = new_page_with_header(p_num)
            y = 65.0
            
        # Titolo Sezione
        sec_title = sec["title"]
        page.draw_rect(fitz.Rect(MARGIN_X, y, MARGIN_X + 3, y + 14), color=COLOR_HEADER_BG, fill=COLOR_HEADER_BG)
        page.insert_text(fitz.Point(MARGIN_X + 10, y + 12), sec_title, fontsize=11.5, color=COLOR_DARK, fontname="hebo")
        y += 22.0
        
        # Paragrafi
        for para in sec.get("paras", []):
            words = para.split(" ")
            line = ""
            for w in words:
                if len(line) + len(w) + 1 > 92:
                    if y > PAGE_HEIGHT - MARGIN_BOTTOM - 15:
                        p_num += 1
                        page = new_page_with_header(p_num)
                        y = 65.0
                    page.insert_text(fitz.Point(MARGIN_X, y), line, fontsize=8.8, color=COLOR_DARK)
                    y += 13.0
                    line = w
                else:
                    line = f"{line} {w}".strip()
            if line:
                if y > PAGE_HEIGHT - MARGIN_BOTTOM - 15:
                    p_num += 1
                    page = new_page_with_header(p_num)
                    y = 65.0
                page.insert_text(fitz.Point(MARGIN_X, y), line, fontsize=8.8, color=COLOR_DARK)
                y += 16.0
                
        # Bullet points
        for item in sec.get("items", []):
            if y > PAGE_HEIGHT - MARGIN_BOTTOM - 25:
                p_num += 1
                page = new_page_with_header(p_num)
                y = 65.0
                
            item_title = item.get("h", "")
            item_text = item.get("t", "")
            
            page.draw_circle(fitz.Point(MARGIN_X + 5, y - 3), 2.5, color=COLOR_HEADER_BG, fill=COLOR_HEADER_BG)
            
            full_item = f"{item_title}: {item_text}" if item_title else item_text
            words = full_item.split(" ")
            line = ""
            for w in words:
                if len(line) + len(w) + 1 > 88:
                    x_pos = MARGIN_X + 15
                    page.insert_text(fitz.Point(x_pos, y), line, fontsize=8.5, color=COLOR_DARK)
                    y += 12.0
                    line = w
                else:
                    line = f"{line} {w}".strip()
            if line:
                page.insert_text(fitz.Point(MARGIN_X + 15, y), line, fontsize=8.5, color=COLOR_DARK)
                y += 16.0
                
        # Box Callout
        if sec.get("callout"):
            callout = sec["callout"]
            if y > PAGE_HEIGHT - MARGIN_BOTTOM - 45:
                p_num += 1
                page = new_page_with_header(p_num)
                y = 65.0
                
            box_h = 38.0
            page.draw_rect(fitz.Rect(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y + box_h), color=COLOR_BORDER, fill=COLOR_LIGHT_BG)
            page.draw_rect(fitz.Rect(MARGIN_X, y, MARGIN_X + 3, y + box_h), color=COLOR_ACCENT_BLUE, fill=COLOR_ACCENT_BLUE)
            
            page.insert_text(fitz.Point(MARGIN_X + 12, y + 15), callout["title"], fontsize=8.5, color=COLOR_ACCENT_BLUE, fontname="hebo")
            page.insert_text(fitz.Point(MARGIN_X + 12, y + 28), callout["text"][:110], fontsize=8, color=COLOR_DARK)
            y += box_h + 12.0
            
        y += 8.0

    doc.save(output_pdf_path)
    doc.close()
    print(f"[OK] PDF generato : {output_pdf_path}")

# -----------------------------------------------------------------------------
# 3. STRUTTURE DATI SEZIONI
# -----------------------------------------------------------------------------

SECTIONS_IT = [
    {
        "title": "1. Quadro Normativo Lussemburghese & Vigilanza AED",
        "paras": [
            "Nel Granducato di Lussemburgo, la prevenzione del riciclaggio di capitali e del finanziamento del terrorismo (AML / LBC-FT) è disciplinata dalla Legge modificata del 12 novembre 2004.",
            "GREEN ENERBRAS ONE SCSp è una Società in Accomandita Speciale (SCSp) di diritto lussemburghese dedicata agli investimenti e detenzione di asset nel settore delle energie rinnovabili. La società non è un istituto di credito o intermediario vigilato da CSSF.",
            "L'autorità di vigilanza legalmente competente per GREEN ENERBRAS ONE SCSp è l'AED (Administration de l'Enregistrement, des Domaines et de la TVA), ai sensi della Legge del 12 novembre 2004 che include le società commerciali e i veicoli societari non finanziari."
        ],
        "items": [
            {"h": "Legge 12 novembre 2004", "t": "Normativa cardine su adeguata verifica della clientela (CDD), organizzazione interna e segnalazione."},
            {"h": "Legge 13 gennaio 2019 (RBE)", "t": "Obbligo di registrazione e verifica dei Titolari Effettivi (UBO) presso il registro LBR."},
            {"h": "Legge 10 agosto 1915", "t": "Disciplina societaria delle SCSp, trasparenza contrattuale e ruoli di General Partner e Limited Partners."},
            {"h": "Circolari AED 779 & 800", "t": "Linee guida operative e questionario annuale di valutazione del rischio antiriciclaggio."},
            {"h": "Cellule de Renseignement Financier (CRF)", "t": "Unità di Informazione Finanziaria (FIU) lussemburghese per le segnalazioni di operazioni sospette (STR)."}
        ],
        "callout": {
            "title": "Vigilanza AED",
            "text": "L'AED esercita controlli documentali e ispezioni di conformità sui veicoli societari e gestori non vigilati da CSSF."
        }
    },
    {
        "title": "2. Obblighi Operativi di Conformità per GREEN ENERBRAS ONE SCSp",
        "paras": [
            "GREEN ENERBRAS ONE SCSp adotta un approccio basato sul rischio (Risk-Based Approach) strutturato su 5 obblighi fondamentali:"
        ],
        "items": [
            {"h": "Adeguata Verifica Soci (CDD)", "t": "Acquisizione e validazione di documenti di identità, codice fiscale, residenza e scheda KYC per ogni socio."},
            {"h": "Verifica Titolari Effettivi (RBE)", "t": "Identificazione di ogni persona fisica detentrice di oltre il 25% delle quote o del controllo societario."},
            {"h": "Tracciabilità Apporti di Capitale", "t": "Controllo documentale dei 261.000 € versati dai soci sul conto corrente (Banque de Luxembourg)."},
            {"h": "Monitoraggio Proventi Futuri", "t": "Predisposizione dei controlli sui futuri dividendi ed entrate dai parchi solari in Brasile (Tri Star SCP)."},
            {"h": "Soglie di Importo AML", "t": "Graduazione dei controlli: Standard (< 5k€), Vigilanza attiva (5k€-10k€), Due Diligence legale (≥ 10k€), Rafforzata (≥ 25k€)."},
            {"h": "Conservazione 5 Anni", "t": "Obbligo di conservazione integrale di tutti i fascicoli KYC per almeno 5 anni dalla cessazione del rapporto sociale."}
        ],
        "callout": {
            "title": "Termine Legale di Conservazione",
            "text": "Tutte le schede KYC, visure RBE, contratti di sottoscrizione e contabili bancarie sono conservati per almeno 5 anni."
        }
    },
    {
        "title": "3. Guida all'Uso del Modulo AML nell'Applicazione",
        "paras": [
            "Il modulo aml.html è stato espressamente strutturato per riflettere la compagine sociale e gli apporti di capitale di GREEN ENERBRAS ONE SCSp:"
        ],
        "items": [
            {"h": "Ordinamento Cronologico Decrescente", "t": "Le operazioni del 2026 e i versamenti più recenti sono visualizzati in cima al registro."},
            {"h": "Perimetro Tracciato", "t": "Include i 13 versamenti effettivi di capitale dei soci per 261.000 € (escludendo storni interni e spese)."},
            {"h": "Fascicolo KYC Interattivo", "t": "Accesso immediato con un click alla scheda di audit del socio con salvataggio persistente in localStorage."},
            {"h": "Mappatura dei Soci & Asset", "t": "Schede anagrafiche complete per gli 11 soci della SCSp e per la partecipata Tri Star SCP (Brasile)."},
            {"h": "Esportazioni Multi-Formato", "t": "Generazione immediata di file Excel (25 colonne normate), CSV e Report Ufficiali PDF."}
        ]
    },
    {
        "title": "4. Il Simulatore di Due Diligence (Risk-Based Approach)",
        "paras": [
            "La sezione 'Simulateur Due Diligence' consente di calcolare il punteggio di rischio (score 0-100) per ogni nuovo socio, investitore o investimento su 5 parametri:"
        ],
        "items": [
            {"h": "Forma Giuridica", "t": "Persona Fisica UE (+5 pt), Società Commerciale (+10 pt), Partnership SCSp (+15 pt), Società Internazionale (+25 pt)."},
            {"h": "Giurisdizione Sede / Residenza", "t": "Lussemburgo / Zona Euro (+5 pt), Svizzera / UK / USA (+10 pt), Brasile / Paesi Terzi (+30 pt)."},
            {"h": "Fattore PEP", "t": "Presenza di Persona Politicamente Esposta (+35 pt e attivazione automatica Vigilanza Rafforzata)."},
            {"h": "Origine dei Fondi", "t": "Redditi personali diretti (+0 pt), Disinvestimenti patrimoniali (+10 pt), Trust / Fiduciaria (+30 pt)."},
            {"h": "Volume Quota", "t": "< 25.000 € (+0 pt), 25.000 € - 50.000 € (+10 pt), ≥ 50.000 € (+15 pt)."}
        ],
        "callout": {
            "title": "Soglie di Rischio",
            "text": "Score < 35 : Rischio Basso (CDD Standard) | Score 35-59 : Rischio Medio | Score ≥ 60 o PEP : Rischio Elevato (EDD)."
        }
    }
]

SECTIONS_FR = [
    {
        "title": "1. Cadre Légal Luxembourgeois & Supervision de l'AED",
        "paras": [
            "Au Grand-Duché de Luxembourg, la lutte contre le blanchiment de capitaux et le financement du terrorisme (LBC/FT) est régie par la Loi modifiée du 12 novembre 2004.",
            "GREEN ENERBRAS ONE SCSp est une Société en Commandite Spéciale (SCSp) de droit luxembourgeois dédiée aux investissements dans les énergies renouvelables. Elle n'est pas un établissement financier régulé par la CSSF.",
            "L'autorité de contrôle légalement compétente pour GREEN ENERBRAS ONE SCSp est l'AED (Administration de l'Enregistrement, des Domaines et de la TVA), conformément à la Loi du 12 novembre 2004 régissant les sociétés commerciales et véhicules d'investissement non soumis à la CSSF."
        ],
        "items": [
            {"h": "Loi du 12 novembre 2004", "t": "Texte fondateur définissant les obligations de vigilance (CDD), d'organisation interne et de déclaration."},
            {"h": "Loi du 13 janvier 2019 (RBE)", "t": "Obligation d'enregistrement et de vérification des Bénéficiaires Effectifs (UBO) auprès du LBR."},
            {"h": "Loi du 10 août 1915", "t": "Régime juridique des SCSp luxembourgeoises et structuration General Partner / Limited Partners."},
            {"h": "Circulaires AED 779 & 800", "t": "Lignes directrices méthodologiques de l'AED et questionnaire annuel d'évaluation du risque."},
            {"h": "Cellule de Renseignement Financier (CRF)", "t": "Autorité nationale réceptrice des déclarations de soupçon (STR)."}
        ],
        "callout": {
            "title": "Point Clé AED",
            "text": "L'AED effectue des contrôles réguliers sur pièces et sur place des véhicules d'investissement non soumis à la CSSF."
        }
    },
    {
        "title": "2. Obligations Pratiques de Conformité pour GREEN ENERBRAS ONE SCSp",
        "paras": [
            "GREEN ENERBRAS ONE SCSp applique une approche fondée sur les risques (Risk-Based Approach) articulée autour de 5 obligations majeures :"
        ],
        "items": [
            {"h": "Identification Associés (CDD)", "t": "Obtention systématique des pièces d'identité, justificatifs de domicile et fiche KYC pour chaque associé."},
            {"h": "Vérification des UBO / RBE", "t": "Identification de toute personne physique détenant > 25% des parts ou le contrôle effectif."},
            {"h": "Traçabilité des Apports de Capital", "t": "Contrôle des 261.000 € versés par les associés sur le compte bancaire (Banque de Luxembourg)."},
            {"h": "Suivi des Dividendes Futurs", "t": "Mise en place des procédures de contrôle des futurs dividendes des parcs solaires au Brésil (Tri Star SCP)."},
            {"h": "Seuils AML", "t": "Gradation des contrôles : Standard (< 5k€), Vigilance active (5k€-10k€), Due Diligence légale (≥ 10k€), Renforcée (≥ 25k€)."},
            {"h": "Conservation 5 Ans", "t": "Obligation légale de conservation de l'intégralité des dossiers KYC pendant 5 ans."}
        ],
        "callout": {
            "title": "Délai Légal de Conservation",
            "text": "Tous les dossiers KYC, déclarations RBE, contrats de souscription et relevés bancaires sont archivés pendant 5 ans minimum."
        }
    },
    {
        "title": "3. Guide d'Utilisation du Module AML dans l'Application",
        "paras": [
            "Le module aml.html a été spécialement conçu pour refléter l'actionnariat et les flux de capitaux de GREEN ENERBRAS ONE SCSp :"
        ],
        "items": [
            {"h": "Tri Chronologique Récent", "t": "Les apports de 2026 et les plus récents sont présentés en haut du registre."},
            {"h": "Périmètre Épuré", "t": "Le registre filtre strictement les 13 versements réels de capital des associés (261.000 €)."},
            {"h": "Fiche KYC Interactive", "t": "Accès d'un clic au formulaire d'audit avec mémorisation permanente dans le navigateur (localStorage)."},
            {"h": "Cartographie Associés & Actifs", "t": "Fiches détaillées des 11 associés de la SCSp et de la structure brésilienne Tri Star SCP."},
            {"h": "Exports Multi-Formats", "t": "Génération instantanée de fichiers Excel (25 colonnes normées), CSV et Rapports Officiels PDF."}
        ]
    },
    {
        "title": "4. Le Simulateur de Due Diligence (Risk-Based Approach)",
        "paras": [
            "L'onglet 'Simulateur Due Diligence' permet d'évaluer le niveau de risque LBC-FT (score de 0 à 100) pour tout nouvel associé ou investissement :"
        ],
        "items": [
            {"h": "Forme Juridique", "t": "Personne Physique UE (+5 pts), Société Commerciale (+10 pts), SCSp (+15 pts), Entité Internationale (+25 pts)."},
            {"h": "Juridiction du Siège / Domicile", "t": "Luxembourg / Zone Euro (+5 pts), Suisse / UK / USA (+10 pts), Brésil / Pays Tiers (+30 pts)."},
            {"h": "Facteur PEP", "t": "Présence d'une Personne Politiquement Exposée (+35 pts et déclenchement de la Vigilance Renforcée)."},
            {"h": "Origine des Fonds", "t": "Revenus personnels (+0 pt), Cession d'actifs (+10 pts), Trust / Fiducie (+30 pts)."},
            {"h": "Volume Souscription", "t": "< 25.000 € (+0 pt), 25.000 € à 50.000 € (+10 pts), ≥ 50.000 € (+15 pts)."}
        ],
        "callout": {
            "title": "Seuils de Décision",
            "text": "Score < 35 : Risque Faible (CDD Standard) | Score 35-59 : Risque Moyen | Score ≥ 60 ou PEP : Risque Élevé (EDD)."
        }
    }
]

SECTIONS_EN = [
    {
        "title": "1. Luxembourg Legal Framework & AED Oversight",
        "paras": [
            "In the Grand Duchy of Luxembourg, the prevention of money laundering and terrorist financing (AML / CFT) is governed by the amended Law of 12 November 2004.",
            "GREEN ENERBRAS ONE SCSp is a Special Limited Partnership (SCSp) established under Luxembourg law dedicated to renewable energy investments. It is not a financial institution regulated by the CSSF.",
            "The legally designated supervisory authority for GREEN ENERBRAS ONE SCSp is the AED (Administration de l'Enregistrement, des Domaines et de la TVA), pursuant to the Law of 12 November 2004 governing commercial companies and investment partnerships not subject to CSSF."
        ],
        "items": [
            {"h": "Law of 12 November 2004", "t": "Foundational legislation defining Customer Due Diligence (CDD), internal controls, and reporting duties."},
            {"h": "Law of 13 January 2019 (RBE)", "t": "Mandatory registration and verification of Beneficial Owners (UBO) via the official LBR register."},
            {"h": "Law of 10 August 1915", "t": "Statutory regime governing Luxembourg Special Limited Partnerships (SCSp)."},
            {"h": "AED Circulars 779 & 800", "t": "Operational guidelines issued by the AED and annual AML risk self-assessment questionnaire."},
            {"h": "Financial Intelligence Unit (CRF)", "t": "National authority for receiving and analyzing Suspicious Transaction Reports (STR)."}
        ],
        "callout": {
            "title": "AED Key Notice",
            "text": "The AED conducts periodic document audits and inspections for corporate and partnership entities not supervised by CSSF."
        }
    },
    {
        "title": "2. Practical Compliance Obligations for GREEN ENERBRAS ONE SCSp",
        "paras": [
            "GREEN ENERBRAS ONE SCSp implements a Risk-Based Approach (RBA) structured around 5 core statutory obligations:"
        ],
        "items": [
            {"h": "Partner Due Diligence (CDD)", "t": "Systematic collection of certified ID cards, proof of address, and KYC forms for every partner."},
            {"h": "Beneficial Ownership Verification (RBE)", "t": "Identification of any natural person holding > 25% ownership or effective control."},
            {"h": "Capital Inflow Audit Trail", "t": "Full traceability and bank verification of the €261,000 paid in by partners (Banque de Luxembourg)."},
            {"h": "Future Dividend Monitoring", "t": "Readiness and vetting procedures for forthcoming solar park revenues from Brazil (Tri Star SCP)."},
            {"h": "AML Thresholds", "t": "Layered vigilance: Standard (< €5k), Active vigilance (€5k-€10k), Statutory Due Diligence (≥ €10k), Enhanced (≥ €25k)."},
            {"h": "5-Year Record Retention", "t": "Statutory obligation to retain all KYC files for at least 5 years following partnership termination."}
        ],
        "callout": {
            "title": "Legal Retention Period",
            "text": "All KYC forms, RBE filings, subscription contracts, and bank records must be retained for at least 5 years."
        }
    },
    {
        "title": "3. User Guide for the AML Module in the Application",
        "paras": [
            "The aml.html module is tailored to track partner capital inflows and KYC compliance for GREEN ENERBRAS ONE SCSp:"
        ],
        "items": [
            {"h": "Descending Date Sorting", "t": "Operations for 2026 and the most recent capital contributions are presented at the top of the register."},
            {"h": "Dedicated Clean Scope", "t": "Exclusively tracks the 13 authentic partner capital installments totaling €261,000."},
            {"h": "Interactive KYC Modal", "t": "Instant one-click access to audit records with persistent browser storage (localStorage)."},
            {"h": "Partners & Assets Map", "t": "Detailed profile cards for all 11 SCSp partners and the Brazilian target Tri Star SCP."},
            {"h": "Multi-Format Exports", "t": "Immediate generation of 25-column Excel spreadsheets, CSV files, and Official PDF Reports."}
        ]
    },
    {
        "title": "4. Due Diligence Risk Simulator (Risk-Based Approach)",
        "paras": [
            "The 'Simulateur Due Diligence' tab calculates the AML/CFT risk score (0 to 100) for any prospective partner or investment across 5 key pillars:"
        ],
        "items": [
            {"h": "Entity Type", "t": "Natural Person EU (+5 pts), Commercial Company (+10 pts), SCSp Partnership (+15 pts), International Entity (+25 pts)."},
            {"h": "Jurisdiction", "t": "Luxembourg / Eurozone (+5 pts), Switzerland / UK / USA (+10 pts), Brazil / Non-EU (+30 pts)."},
            {"h": "PEP Exposure", "t": "Politically Exposed Person involved (+35 pts and automatic Enhanced Due Diligence trigger)."},
            {"h": "Source of Wealth", "t": "Direct employment savings (+0 pts), Business divestment (+10 pts), Trust / Fiduciary (+30 pts)."},
            {"h": "Subscription Size", "t": "< €25,000 (+0 pts), €25,000 to €50,000 (+10 pts), ≥ €50,000 (+15 pts)."}
        ],
        "callout": {
            "title": "Decision Thresholds",
            "text": "Score < 35 : Low Risk (Standard CDD) | Score 35-59 : Medium Risk | Score ≥ 60 or PEP : High Risk (EDD)."
        }
    }
]

# -----------------------------------------------------------------------------
# 4. ESECUZIONE GENERAZIONE
# -----------------------------------------------------------------------------

def main():
    print("=== Generazione Manuels & Guide AML per GREEN ENERBRAS ONE SCSp ===")
    
    # 1. Scrittura file Markdown in docs/ e admin/docs/
    files_md = [
        ("Manuale_Conformita_AML_Antiriciclaggio_GREEN_ENERBRAS_IT.md", MANUAL_MD_IT),
        ("Manuel_Conformite_AML_LBC-FT_GREEN_ENERBRAS_FR.md", MANUAL_MD_FR),
        ("User_Manual_AML_CFT_Compliance_GREEN_ENERBRAS_EN.md", MANUAL_MD_EN)
    ]
    
    for filename, content in files_md:
        p_docs = os.path.join(DOCS_DIR, filename)
        p_admin = os.path.join(ADMIN_DOCS_DIR, filename)
        with open(p_docs, "w", encoding="utf-8") as f:
            f.write(content)
        with open(p_admin, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[OK] Markdown creato : {filename}")

    # 2. Generazione PDF
    configs = [
        {
            "filename": "Manuale_Conformita_AML_Antiriciclaggio_GREEN_ENERBRAS_IT.pdf",
            "title": "GREEN ENERBRAS ONE SCSp - Manuale AML / LBC-FT",
            "subtitle": "Guida Metodologica & Istruzioni di Conformità Antiriciclaggio (AED)",
            "lang": "it",
            "sections": SECTIONS_IT
        },
        {
            "filename": "Manuel_Conformite_AML_LBC-FT_GREEN_ENERBRAS_FR.pdf",
            "title": "GREEN ENERBRAS ONE SCSp - Manuel AML / LBC-FT",
            "subtitle": "Guide Méthodologique & Instructions de Conformité LBC/FT (AED)",
            "lang": "fr",
            "sections": SECTIONS_FR
        },
        {
            "filename": "User_Manual_AML_CFT_Compliance_GREEN_ENERBRAS_EN.pdf",
            "title": "GREEN ENERBRAS ONE SCSp - AML / CFT Manual",
            "subtitle": "Methodological Guide & AML/CFT Compliance Policy (AED)",
            "lang": "en",
            "sections": SECTIONS_EN
        }
    ]

    for cfg in configs:
        p_docs = os.path.join(DOCS_DIR, cfg["filename"])
        p_admin = os.path.join(ADMIN_DOCS_DIR, cfg["filename"])
        create_pdf_from_text(cfg["title"], cfg["subtitle"], cfg["lang"], cfg["sections"], p_docs)
        create_pdf_from_text(cfg["title"], cfg["subtitle"], cfg["lang"], cfg["sections"], p_admin)

    print("=== Generazione completata con successo! ===")

if __name__ == "__main__":
    main()
