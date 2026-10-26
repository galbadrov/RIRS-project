# US-15 – Izvoz poročila o projektu in stroških

- **Povezana funkcionalnost:** Izvoz poročil o projektih in stroških
- **Uporabniška vloga:** Administrator
- **Uporabniška zgodba:** Kot administrator želim izvoziti poročilo o projektu in njegovih stroških, da lahko podatke arhiviram ali uporabim za nadaljnjo analizo.
- **Sprejemni kriteriji:**
  - Administrator lahko izbere projekt in izvozi poročilo v datoteko CSV.
  - Izvoz vsebuje naziv projekta, stranko, roke, status, dogovorjeno ceno, strošek dela, strošek materiala, skupne stroške in izračunani dobiček.
  - Denarni zneski v izvozu se ujemajo z vrednostmi, ki so ob izvozu prikazane v aplikaciji.
  - Če izbrani projekt nima evidentiranih ur ali materiala, izvoz manjkajoče stroške zapiše kot 0,00 EUR in se vseeno uspešno ustvari.
  - Uporabnik brez vloge `ADMIN` ne more izvoziti poročila s finančnimi podatki.

