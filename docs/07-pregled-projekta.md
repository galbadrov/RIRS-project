# 07 – Pregled projekta

Pregled projekta BuildManager ob prevzemu (november 2026). Preverjeno je, katere MVP funkcionalnosti so implementirane in ali zadoščajo uporabniškim zgodbam iz [05 – Uporabniške zgodbe](05-uporabniske-zgodbe/).

## Način pregleda

- Aplikacija je bila zagnana lokalno po navodilih iz [README](../README.md), z lastnim Supabase projektom
- Prvi administrator je bil dodan ročno (Supabase Auth in tabela `Zaposleni`), ostali podatki prek aplikacije: projektni vodja, dva delavca, stranke, projekti, dodelitve in vnosi ur
- Vsaka MVP zgodba je bila preizkušena v aplikaciji s prijavo v vseh treh vlogah (`ADMIN`, `PROJECT_MANAGER`, `WORKER`)
- Pravila, ki jih v vmesniku ni mogoče preizkusiti (npr. zaščita API-ja po vlogah), so bila preverjena v kodi backenda, validacije pa tudi z neposrednim klicem backend funkcij

Oznake:

| Oznaka | Pomen |
|---|---|
| ✅ | kriterij je izpolnjen |
| ⚠️ | kriterij je izpolnjen delno |
| ❌ | kriterij ni izpolnjen |

## Povzetek

V [02 – Funkcionalnosti in obseg](02-funkcionalnosti-in-obseg.md) je kot MVP označenih šest funkcionalnosti. Pregledane so vse, skupaj z osmimi pripadajočimi uporabniškimi zgodbami.

| MVP funkcionalnost | Uporabniška zgodba | Ocena |
|---|---|---|
| Prijava in upravljanje računov zaposlenih | US-01 Prijava v aplikacijo | ✅ |
| | US-02 Upravljanje računov zaposlenih | ✅ |
| Načrtovanje projektov, roki, podrobnosti in statusi | US-03 Ustvarjanje in načrtovanje projekta | ✅ |
| | US-04 Posodabljanje načrta in statusa projekta | ✅ |
| Dodeljevanje zaposlenih na projekt | US-05 Dodeljevanje zaposlenih na projekt | ⚠️ |
| Beleženje opravljenih delovnih ur po projektu | US-06 Beleženje opravljenih delovnih ur | ⚠️ |
| Upravljanje strank in njihovih kontaktnih podatkov | US-10 Upravljanje strank | ⚠️ |
| Samodejni izračun stroškov projekta | US-08 Samodejni izračun stroškov projekta | ❌ |

## Pregled po uporabniških zgodbah

### US-01 – Prijava v aplikacijo ✅

| Kriterij | Ocena | Opomba |
|---|---|---|
| Prijava z veljavnimi podatki aktivnega računa | ✅ | |
| Prikaz vsebin in dejanj glede na vlogo | ✅ | meni je prilagojen vlogi; backend vsak zahtevek dodatno preveri po vlogi |
| Napačni podatki ne razkrijejo, kateri podatek je napačen | ✅ | »E-poštni naslov ali geslo ni pravilno.« |
| Neaktiven račun je zavrnjen z obvestilom | ✅ | »Uporabniški račun ni aktiven.« |

### US-02 – Upravljanje računov zaposlenih ✅

| Kriterij | Ocena | Opomba |
|---|---|---|
| Ustvarjanje računa z obveznimi podatki in nenegativno urno postavko | ✅ | |
| Sprememba podatkov, vloge in urne postavke | ✅ | |
| Zavrnitev podvojenega e-poštnega naslova | ✅ | preverjeno v kodi |
| Deaktivacija ohrani podatke in prepreči prijavo | ✅ | brisanja računa ni, kar je v skladu z zgodbo |
| Uporabnik brez vloge `ADMIN` ne more upravljati računov | ✅ | backend vrne 403 |

### US-03 – Ustvarjanje in načrtovanje projekta ✅

| Kriterij | Ocena | Opomba |
|---|---|---|
| Shranjevanje projekta s stranko, aktivnim vodjo in obveznimi podatki | ✅ | |
| Zavrnitev zaključka pred začetkom in negativne cene | ✅ | |
| Začetni status in prikaz na seznamu | ✅ | status `NACRTOVAN` |
| Prikaz vnesenih podatkov v podrobnostih projekta | ✅ | |
| Uporabnik brez vloge `ADMIN` ne more ustvariti projekta | ✅ | |

### US-04 – Posodabljanje načrta in statusa projekta ✅

| Kriterij | Ocena | Opomba |
|---|---|---|
| Vodja spreminja opis, datuma in status samo pri svojem projektu | ✅ | |
| Zavrnitev zaključka pred začetkom | ✅ | preverjeno v vmesniku in na backendu |
| Prikaz posodobljenih podatkov | ✅ | |
| Vodja ne more spreminjati tujih projektov, cene ali stranke | ✅ | urejati je mogoče samo opis, datuma in status |

### US-05 – Dodeljevanje zaposlenih na projekt ⚠️

| Kriterij | Ocena | Opomba |
|---|---|---|
| Dodelitev samo aktivnih zaposlenih | ✅ | |
| Prikaz člana z datumom dodelitve; zaposleni vidi projekt med svojimi | ⚠️ | datum dodelitve ni prikazan; delavec nima pregleda dodeljenih projektov, projekt vidi samo v spustnem seznamu pri vnosu ur |
| Preprečena podvojena dodelitev | ✅ | |
| Odstranitev dodelitve ohrani evidentirane ure | ✅ | |
| Vodja ne more urejati dodelitev tujih projektov | ✅ | |

### US-06 – Beleženje opravljenih delovnih ur ⚠️

| Kriterij | Ocena | Opomba |
|---|---|---|
| Vnos ur samo za dodeljen projekt | ✅ | |
| Število ur večje od 0 in največ 24 na vnos | ✅ | 0 in 25 ur sta zavrnjena |
| Vnos je povezan z delavcem in projektom, shrani se veljavna urna postavka | ✅ | |
| Vnos je prikazan v mesečni evidenci in pri ustreznem projektu | ⚠️ | mesečna evidenca deluje; v podrobnostih projekta ure niso prikazane |
| Delavec ne more vnašati ur v imenu drugega | ✅ | zaposleni se določi iz prijave, ne iz zahtevka |

Odstopanje od [02 – Funkcionalnosti in obseg](02-funkcionalnosti-in-obseg.md): projektni vodja naj bi beležil lastne ure, vendar jih lahko vnese šele, ko se sam doda med člane projekta. Vodenje projekta samo po sebi ne zadošča.

### US-10 – Upravljanje strank ⚠️

| Kriterij | Ocena | Opomba |
|---|---|---|
| Ustvarjanje stranke s kontaktnimi podatki | ✅ | |
| Zavrnitev brez naziva ali z neveljavnim e-poštnim naslovom | ✅ | |
| Sprememba kontaktnih podatkov stranke | ❌ | urejanje ni implementirano; stranke na seznamu ni mogoče odpreti |
| Preprečen izbris stranke, povezane s projektom | ⚠️ | brisanja strank ni, zato pravilo formalno drži, a funkcija ni narejena |
| Uporabnik brez vloge `ADMIN` ne more upravljati strank | ✅ | |

### US-08 – Samodejni izračun stroškov projekta ❌

| Kriterij | Ocena | Opomba |
|---|---|---|
| Strošek dela kot vsota ur × urna postavka | ❌ | izračun ni implementiran nikjer v aplikaciji |
| Strošek materiala | – | evidenca materiala (US-07) ni del MVP, tabel za material ni |
| Ločen prikaz stroška dela in materiala ter skupni strošek | ❌ | |
| Ponoven izračun po spremembi vnosov | ❌ | |
| Manjkajoči strošek prikazan kot 0,00 EUR | ❌ | |

Podatki za izračun stroška dela že obstajajo: vsak vnos ur hrani število ur in urno postavko, veljavno ob vnosu.

## Ali implementacija zadošča uporabniškim zgodbam

- **V celoti zadošča:** US-01, US-02, US-03 in US-04 (prijava, računi zaposlenih, ustvarjanje in urejanje projektov)
- **Večinoma zadošča:** US-05 in US-06; osnovni potek (dodelitev, vnos ur, mesečna evidenca) deluje, manjkajo prikazi (datum dodelitve, pregled projektov za delavca, ure pri projektu)
- **Delno zadošča:** US-10; stranke je mogoče dodajati, ne pa urejati
- **Ne zadošča:** US-08; samodejni izračun stroškov, ena od šestih MVP funkcionalnosti, ni implementiran

Pet od šestih MVP funkcionalnosti je implementiranih v celoti ali delno. Aplikacija je uporabna za evidenco projektov, zaposlenih in ur, ne pa še za spremljanje stroškov projekta.

## Predlogi izboljšav

Predlogi ne izhajajo neposredno iz sprejemnih kriterijev, opaženi pa so bili pri uporabi.

| Predlog | Zakaj |
|---|---|
| Preverjanje dnevne vsote ur zaposlenega | zdaj je omejen le posamezen vnos (24 ur), z vnosi na več projektov je skupaj na dan mogoče vnesti več kot 24 ur |
| Omejitev vnosa ur na pretekle dni in današnji dan | zdaj je mogoče vnesti ure za prihodnost |
| Urejanje in brisanje vnosov ur | napačnega vnosa ni mogoče popraviti; US-08 predvideva ponoven izračun po spremembi vnosa |
| Projektni vodja lahko vnaša ure na projekte, ki jih vodi | usklajenost z opisom vlog v `docs/02` |
| Administrator brez zavihka za vnos lastnih ur | po `docs/02` administrator ure pregleduje, ne vnaša; zdaj vidi obvestilo, da ni dodeljen nobenemu projektu |
| Popravek dogovorjene cene (administrator) | cene po ustvarjanju projekta ni mogoče spremeniti, tudi če pride do novega dogovora |
| Brisanje oziroma arhiviranje projekta | napačno ustvarjenega projekta ni mogoče odstraniti |
| Zaščita strani po vlogah tudi v frontendu | delavec lahko z vpisom naslova (npr. `/racuni`) odpre stran za administratorja; podatki so zaščiteni na backendu, stran pa prikaže le napako |

## Dokumentacija in lokalni zagon

- Navodila za lokalni zagon v README so jasna in delujejo; potreben je lasten Supabase projekt
- Testnih podatkov ni, prvega administratorja je treba dodati ročno v Supabase Auth in tabelo `Zaposleni` (v README je to omenjeno le na kratko)
- Registracija (`/register`) vrne »Registracija še ni implementirana.«; ker račune po zasnovi ustvarja administrator, to ni napaka MVP
- [04 – Arhitektura in tehnološki sklad](04-arhitektura-in-tehnoloski-sklad.md) za prijavo še navaja Firebase Authentication, koda in [ADR-0001](adr/0001-supabase-avtentikacija.md) pa uporabljata Supabase Auth
- Projekt nima avtomatskih testov
