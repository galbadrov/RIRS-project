# US-02 – Upravljanje računov zaposlenih

- **Povezana funkcionalnost:** Upravljanje računov zaposlenih
- **Uporabniška vloga:** Administrator
- **Uporabniška zgodba:** Kot administrator želim ustvarjati, urejati in deaktivirati račune zaposlenih, da lahko nadzorujem njihov dostop in uporabniške pravice.
- **Sprejemni kriteriji:**
  - Administrator lahko ustvari račun, če vnese ime, priimek, enoličen veljaven e-poštni naslov, vlogo in nenegativno urno postavko.
  - Administrator lahko obstoječemu zaposlenemu spremeni osebne podatke, vlogo in urno postavko, spremembe pa so vidne po shranjevanju.
  - Sistem zavrne ustvarjanje ali spremembo računa, če je e-poštni naslov že povezan z drugim zaposlenim.
  - Administrator lahko račun deaktivira, pri čemer se podatki zaposlenega in njegove pretekle evidence ohranijo, nadaljnja prijava pa ni dovoljena.
  - Uporabnik brez vloge `ADMIN` ne more ustvarjati, spreminjati ali deaktivirati računov zaposlenih.

