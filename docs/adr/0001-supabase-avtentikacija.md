# Uporaba Supabase Authentication za prijavo uporabnikov

## Context and Problem Statement

BuildManager potrebuje varno prijavo zaposlenih in upravljanje dostopa do podatkov glede na njihove vloge. Ker projekt že uporablja Supabase PostgreSQL, se moramo odločiti, ali bomo avtentikacijo razvili sami ali uporabili obstoječo storitev.

## Considered Options

- Supabase Authentication
- Firebase Authentication
- Lastna implementacija avtentikacije na backendu

## Decision Outcome

Izbrana opcija: "Supabase Authentication", ker omogoča uporabo avtentikacije znotraj iste platforme, na kateri gostuje podatkovna baza, ter zmanjša potrebo po razvoju in vzdrževanju lastnega sistema za prijavo. Gesel aplikacija ne bo samostojno shranjevala v svojih poslovnih tabelah. Backend bo moral preverjati veljavnost prijave in pravice zaposlenih glede na njihove vloge.

### Consequences

- Dobro, ker je za avtentikacijo in podatkovno bazo uporabljena ista platforma, kar poenostavi integracijo in upravljanje storitev.
- Dobro, ker ni treba razvijati lastnega mehanizma za shranjevanje in preverjanje gesel.
- Slabo, ker je prijava odvisna od razpoložljivosti in pravilnega delovanja storitve Supabase Auth.
- Slabo, ker morebitna zamenjava ponudnika zahteva prilagoditev avtentikacijskega dela aplikacije.
