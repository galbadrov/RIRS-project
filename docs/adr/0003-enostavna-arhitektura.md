# Enoten backend z ločenim frontendom

## Context and Problem Statement

BuildManager je interna aplikacija za upravljanje gradbenih projektov, zaposlenih, delovnih ur in računov. Za predvideni obseg projekta potrebujemo arhitekturo, ki je razumljiva, preprosta za razvoj in ne zahteva nepotrebne infrastrukture.

## Considered Options

- Enoten backend z ločenim frontendom (odjemalec–strežnik)
- Arhitektura z več mikrostoritvami
- Ena aplikacija, ki na strežniku izrisuje tudi uporabniški vmesnik

## Decision Outcome

Izbrana opcija: "Enoten backend z ločenim frontendom (odjemalec–strežnik)", ker je glede na predvideni obseg interne aplikacije enostavnejša za implementacijo in vzdrževanje kot mikrostoritve. Ločen frontend omogoča samostojen razvoj uporabniškega vmesnika, enoten backend pa združuje REST API, preverjanje pravic in poslovno logiko.

### Consequences

- Dobro, ker je razvoj, testiranje in lokalni zagon sistema manj kompleksen kot pri mikrostoritvah.
- Dobro, ker so poslovna logika in dostop do podatkov zbrani na enem mestu.
- Dobro, ker je mogoče frontend in backend razvijati ločeno.
- Slabo, ker lahko z rastjo sistema enoten backend postane zahtevnejši za vzdrževanje.
- Slabo, ker posameznih funkcionalnih delov backenda ni mogoče neodvisno nameščati in skalirati brez dodatnih arhitekturnih sprememb.
