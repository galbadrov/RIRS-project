# US-10 – Upravljanje strank

- **Povezana funkcionalnost:** Upravljanje strank in njihovih kontaktnih podatkov
- **Uporabniška vloga:** Administrator
- **Uporabniška zgodba:** Kot administrator želim upravljati podatke strank, da lahko projekte in račune povežem s pravilnimi naročniki.
- **Sprejemni kriteriji:**
  - Administrator lahko ustvari stranko z nazivom, veljavnim e-poštnim naslovom, telefonsko številko, naslovom in davčno številko.
  - Sistem zavrne shranjevanje, če manjkata naziv ali veljaven e-poštni naslov.
  - Administrator lahko spremeni kontaktne podatke obstoječe stranke, spremembe pa so po shranjevanju vidne v podrobnostih stranke.
  - Sistem prepreči izbris stranke, če je povezana z najmanj enim projektom, in prikaže razlog za zavrnitev.
  - Uporabnik brez vloge `ADMIN` ne more ustvarjati, spreminjati ali brisati strank.

