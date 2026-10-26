# US-11 – Pošiljanje računa stranki

- **Povezana funkcionalnost:** Pošiljanje generiranih računov strankam
- **Uporabniška vloga:** Administrator
- **Uporabniška zgodba:** Kot administrator želim generirani račun poslati na e-poštni naslov stranke, da stranka pravočasno prejme račun za izvedeni projekt.
- **Sprejemni kriteriji:**
  - Administrator lahko pošlje samo že ustvarjen račun, ki je povezan s projektom in stranko z veljavnim e-poštnim naslovom.
  - Pred pošiljanjem sistem prikaže prejemnikov e-poštni naslov, številko računa in skupni znesek v potrditev.
  - Ob uspešnem pošiljanju sistem prikaže potrditev in spremeni status računa iz »Osnutek« v »Poslan«.
  - Če pošiljanje ne uspe, sistem prikaže napako in statusa računa ne spremeni v »Poslan«.
  - Uporabnik brez vloge `ADMIN` ne more poslati računa.

