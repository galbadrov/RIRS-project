# Izvajanje poslovne logike na backendu

## Context and Problem Statement

BuildManager obdeluje podatke o projektih, delovnih urah, materialu in računih. Izračuni stroškov in donosnosti projektov ter generiranje računov morajo biti dosledni in zaščiteni pred nepooblaščenimi spremembami. Odločiti se moramo, kje se bo izvajala ta poslovna logika.

## Considered Options

- Izvajanje poslovne logike na backendu
- Izvajanje poslovne logike na frontendu
- Delitev ključnih izračunov med frontend in backend

## Decision Outcome

izbrana opcija: "Izvajanje poslovne logike na backendu", ker omogoča centralizirano izvajanje izračunov in generiranja računov, neodvisno od uporabnikovega brskalnika. Backend lahko pred obdelavo preveri uporabnikove pravice in zagotovi enotna poslovna pravila. Frontend je tako namenjen predvsem prikazu in vnosu podatkov.

### Consequences

- Dobro, ker se poslovna pravila izvajajo na enem mestu in so rezultati izračunov dosledni.
- Dobro, ker uporabnik ne more z neposrednim spreminjanjem frontend kode obiti preverjanj na backendu.
- Dobro, ker je frontend manj obremenjen z zahtevnimi poslovnimi operacijami.
- Slabo, ker vsaka operacija, ki zahteva poslovno logiko, vključuje komunikacijo s strežnikom.
- Slabo, ker backend prevzame več procesne obremenitve in odgovornosti za pravilnost izračunov.
