# US-03 – Ustvarjanje in načrtovanje projekta

- **Povezana funkcionalnost:** Načrtovanje projektov in določanje rokov, podrobnosti ter statusa
- **Uporabniška vloga:** Administrator
- **Uporabniška zgodba:** Kot administrator želim ustvariti gradbeni projekt z rokom, lokacijo, odgovornim vodjo in dogovorjeno ceno, da se lahko izvedba projekta načrtuje in spremlja.
- **Sprejemni kriteriji:**
  - Administrator lahko projekt shrani, ko izbere obstoječo stranko in aktivnega projektnega vodjo ter vnese naziv, lokacijo, datum začetka, datum zaključka in dogovorjeno ceno.
  - Sistem zavrne projekt, pri katerem je datum zaključka pred datumom začetka ali je dogovorjena cena negativna.
  - Ob ustvarjanju sistem projektu dodeli začetni status in ga prikaže na seznamu projektov.
  - Po uspešnem shranjevanju so v podrobnostih projekta prikazani vneseni opis, stranka, vodja, lokacija, roki, dogovorjena cena in status.
  - Uporabnik brez vloge `ADMIN` ne more ustvariti novega projekta.

