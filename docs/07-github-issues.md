# Predlog GitHub Issues za MVP

Za GitHub Project ustvarite pogled **Board** s stolpci `To Do`, `Doing` in `Done`.
Za vsako uporabniško zgodbo MVP ustvarite istoimensko oznako (`US-01`–`US-08`) in
jo dodajte pripadajočim Issues. Spodnji zapisi so pripravljeni za ločen vnos v GitHub.

## US-01 – Prijava v aplikacijo

### Issue: Izdelava obrazca za prijavo

**Opis:** Izdelati obrazec za vnos e-poštnega naslova in gesla ter dodati osnovno preverjanje obveznih polj.

**Oznaka:** `US-01`

### Issue: Implementacija prijave uporabnika

**Opis:** Povezati prijavni obrazec z avtentikacijskim sistemom in po uspešni prijavi uporabnika preusmeriti v aplikacijo.

**Oznaka:** `US-01`

### Issue: Obravnava neuspešne in zavrnjene prijave

**Opis:** Prikazati ustrezno sporočilo pri napačnih prijavnih podatkih ali neaktivnem računu, ne da bi sistem razkril, kateri podatek je napačen.

**Oznaka:** `US-01`

## US-02 – Upravljanje računov zaposlenih

### Issue: Prikaz seznama zaposlenih

**Opis:** Izdelati administratorski pregled zaposlenih z osnovnimi podatki, vlogo in stanjem računa.

**Oznaka:** `US-02`

### Issue: Ustvarjanje računa zaposlenega

**Opis:** Izdelati obrazec in zaledno logiko za ustvarjanje zaposlenega z enoličnim e-poštnim naslovom, vlogo in nenegativno urno postavko.

**Oznaka:** `US-02`

### Issue: Urejanje in deaktivacija računa zaposlenega

**Opis:** Omogočiti administratorju spremembo podatkov, vloge in urne postavke ter deaktivacijo računa brez izbrisa preteklih evidenc.

**Oznaka:** `US-02`

## US-03 – Ustvarjanje in načrtovanje projekta

### Issue: Izdelava obrazca za nov projekt

**Opis:** Izdelati obrazec za naziv, opis, stranko, projektnega vodjo, lokacijo, roke in dogovorjeno ceno projekta.

**Oznaka:** `US-03`

### Issue: Validacija in shranjevanje novega projekta

**Opis:** Preveriti obvezna polja, vrstni red datumov in nenegativno ceno ter veljaven projekt shraniti z začetnim statusom.

**Oznaka:** `US-03`

### Issue: Prikaz seznama in podrobnosti projektov

**Opis:** Po shranjevanju prikazati projekt na seznamu ter omogočiti pregled vseh vnesenih podatkov in trenutnega statusa.

**Oznaka:** `US-03`

## US-04 – Posodabljanje načrta in statusa projekta

### Issue: Obrazec za urejanje načrta projekta

**Opis:** Projektnemu vodji omogočiti urejanje opisa, datuma začetka, datuma zaključka in statusa projekta, ki ga vodi.

**Oznaka:** `US-04`

### Issue: Preverjanje dovoljenj pri urejanju projekta

**Opis:** Na zaledju preprečiti urejanje tujega projekta ter spremembo dogovorjene cene ali stranke s strani projektnega vodje.

**Oznaka:** `US-04`

### Issue: Validacija in prikaz posodobljenih podatkov projekta

**Opis:** Zavrniti neveljavno časovno obdobje in po uspešnem shranjevanju osvežiti prikaz podrobnosti projekta.

**Oznaka:** `US-04`

## US-05 – Dodeljevanje zaposlenih na projekt

### Issue: Prikaz aktivnih zaposlenih za dodelitev

**Opis:** Na projektu prikazati seznam aktivnih zaposlenih, ki jih lahko projektni vodja dodeli projektu.

**Oznaka:** `US-05`

### Issue: Dodajanje zaposlenega na projekt

**Opis:** Omogočiti dodelitev zaposlenega z datumom dodelitve in preprečiti podvojeno dodelitev istega zaposlenega.

**Oznaka:** `US-05`

### Issue: Odstranjevanje zaposlenega s projekta

**Opis:** Omogočiti odstranitev dodelitve brez brisanja že evidentiranih delovnih ur ter preveriti, da vodja upravlja samo svoj projekt.

**Oznaka:** `US-05`

## US-06 – Beleženje opravljenih delovnih ur

### Issue: Obrazec za vnos delovnih ur

**Opis:** Delavcu omogočiti izbiro dodeljenega projekta ter vnos datuma in števila opravljenih ur.

**Oznaka:** `US-06`

### Issue: Validacija in shranjevanje delovnih ur

**Opis:** Sprejeti le vrednosti nad 0 in do 24 ur ter vnos povezati s prijavljenim delavcem, projektom in trenutno urno postavko.

**Oznaka:** `US-06`

### Issue: Prikaz evidentiranih ur

**Opis:** Uspešno shranjen vnos prikazati v delavčevi mesečni evidenci in v evidenci izbranega projekta.

**Oznaka:** `US-06`

## US-07 – Evidentiranje porabljenega materiala

### Issue: Priprava kataloga materialov

**Opis:** Omogočiti shranjevanje in pridobivanje materialov z nazivom, enoto ter trenutno ceno na enoto.

**Oznaka:** `US-07`

### Issue: Obrazec za vnos porabe materiala

**Opis:** Projektnemu vodji omogočiti izbiro materiala iz kataloga ter vnos datuma in porabljene količine za projekt, ki ga vodi.

**Oznaka:** `US-07`

### Issue: Izračun in shranjevanje stroška materiala

**Opis:** Preveriti pozitivno količino, shraniti trenutno ceno na enoto in izračunati strošek posameznega vnosa porabe.

**Oznaka:** `US-07`

## US-08 – Samodejni izračun stroškov projekta

### Issue: Izračun stroška dela

**Opis:** Izračunati strošek dela kot vsoto zmnožkov evidentiranih ur in urnih postavk, shranjenih pri posameznih vnosih.

**Oznaka:** `US-08`

### Issue: Izračun stroška materiala in skupnih stroškov

**Opis:** Sešteti stroške materialnih vnosov ter izračunati skupni strošek projekta kot vsoto dela in materiala.

**Oznaka:** `US-08`

### Issue: Prikaz in samodejno osveževanje stroškov

**Opis:** Ločeno prikazati strošek dela, materiala in skupni strošek ter vrednosti ponovno izračunati ob spremembi evidenc.

**Oznaka:** `US-08`
