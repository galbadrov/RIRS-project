# US-08 – Samodejni izračun stroškov projekta

- **Povezana funkcionalnost:** Samodejni izračun stroškov projekta
- **Uporabniška vloga:** Administrator
- **Uporabniška zgodba:** Kot administrator želim videti samodejno izračunane stroške dela in materiala, da poznam skupne stroške posameznega projekta.
- **Sprejemni kriteriji:**
  - Sistem strošek dela izračuna kot vsoto zmnožkov evidentiranih ur in urnih postavk, shranjenih pri teh vnosih.
  - Sistem strošek materiala izračuna kot vsoto zmnožkov evidentiranih količin in cen na enoto, shranjenih pri teh vnosih.
  - Skupni strošek projekta je enak vsoti stroška dela in stroška materiala, oba delna zneska pa sta prikazana ločeno.
  - Po dodajanju, spremembi ali odstranitvi vnosa ur oziroma materiala se prikazani stroški ponovno izračunajo iz aktualnih podatkov.
  - Če projekt nima evidentiranih ur ali materiala, sistem manjkajočo vrsto stroška prikaže kot 0,00 EUR.

