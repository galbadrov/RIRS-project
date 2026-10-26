# US-09 – Generiranje računa

- **Povezana funkcionalnost:** Generiranje računov iz evidentiranih podatkov gradnje
- **Uporabniška vloga:** Administrator
- **Uporabniška zgodba:** Kot administrator želim po zaključenem projektu ustvariti račun iz evidentiranih podatkov, da lahko stranki obračunam izvedena dela in porabljen material.
- **Sprejemni kriteriji:**
  - Sistem omogoči generiranje računa samo za projekt s statusom »Zaključen«.
  - Račun vsebuje enolično številko računa, datum izdaje, datum zapadlosti, podatke stranke in sklic na projekt.
  - Sistem v račun vključi evidentirane postavke dela in materiala ter iz njih izračuna skupni znesek.
  - Sistem zavrne shranjevanje, če datum zapadlosti ni enak datumu izdaje ali poznejši.
  - Uspešno ustvarjen račun se shrani pri projektu z začetnim statusom »Osnutek«.
