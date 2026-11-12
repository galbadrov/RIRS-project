# BuildManager

BuildManager je interna spletna aplikacija za načrtovanje in spremljanje gradbenih projektov. Omogočala bo upravljanje projektov, zaposlenih in strank, dodeljevanje zaposlenih na projekte ter beleženje delovnih ur in porabljenega materiala.

Na podlagi zbranih podatkov bo aplikacija samodejno izračunala stroške in donosnost projekta, omogočala generiranje računov ter prikaz lokacij projektov na zemljevidu. Dostop do funkcionalnosti bo prilagojen vlogam administratorja, projektnega vodje in delavca.

## Tehnologije

- **Frontend:** React, Vite, TypeScript
- **Backend:** Node.js, Express.js, TypeScript, REST API
- **Podatkovna baza:** Supabase PostgreSQL
- **Avtentikacija:** Supabase Auth
- **Zemljevid:** Google Maps API

Podrobnejša projektna dokumentacija je na voljo v mapi [`docs`](docs/).

## Lokalni razvoj

### Predpogoji

Za lokalni zagon potrebuješ:

- [Node.js](https://nodejs.org/) `20.19+` (uporabiš lahko tudi `22.12+`),
- npm

Projekt je sestavljen iz dveh ločenih aplikacij:

- `backend` – Express REST API (privzeto na `http://localhost:3000`),
- `BuildManager` – React/Vite frontend (privzeto na `http://localhost:5173`).

### 1. Namestitev odvisnosti

Iz korenske mape projekta namesti odvisnosti za oba dela aplikacije:

```bash
cd backend
npm ci

cd ../BuildManager
npm ci
```

### 2. Nastavitev okoljskih spremenljivk

Ustvari lokalni konfiguracijski datoteki iz priloženih primerov:

```bash
cp backend/.env.example backend/.env
cp BuildManager/.env.example BuildManager/.env
```

V `backend/.env` nato vnesi podatke svojega Supabase projekta:

```dotenv
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
SUPABASE_SECRET_KEY=sb_secret_your-key
DATABASE_URL=postgresql://postgres.project-ref:password@pooler-host:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres
```

- `DATABASE_URL` je povezava prek Supabase transaction poolerja in jo uporablja aplikacija med delovanjem.
- `DIRECT_URL` je neposredna povezava do baze, ki jo uporabljajo Prisma CLI ukazi.
- Supabase secret ključ sodi samo v backend `.env` in ga ne izpostavljaj v frontendu ali repozitoriju.

Frontend `BuildManager/.env` naj kaže na lokalni backend:

```dotenv
VITE_API_URL=http://localhost:3000
```

Datoteki `.env` sta prezrti z Gitom in ju ne commitaj.

### 3. Priprava podatkovne baze in Prisma odjemalca

Če uporabljaš novo oziroma prazno Supabase bazo, lahko tabele iz [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) vanjo ustvariš neposredno s Prisma ukazom:

```bash
cd backend
npx prisma db push
```

Ukaz prebere `DIRECT_URL` iz `backend/.env` in trenutno Prisma shemo uskladi s povezano Supabase bazo. Pred izvedbo zato preveri, da `DIRECT_URL` res kaže na tvojo razvojno bazo. Na bazi z obstoječimi podatki pozorno preberi prikazane spremembe; ne uporabljaj možnosti `--accept-data-loss` ali `--force-reset`, razen če namerno želiš spremeniti oziroma izbrisati podatke.

`prisma db push` ustvari aplikacijske tabele v PostgreSQL bazi, ne ustvari pa uporabnikov v Supabase Auth. Te moraš dodati ločeno prek Supabase nadzorne plošče oziroma aplikacije.

Po prvi namestitvi oziroma po vsaki spremembi Prisma sheme zaženi:

```bash
cd backend
npm run prisma:generate
```

Projekt trenutno nima migracij; za razvojno bazo se struktura vzpostavi oziroma posodobi z `npx prisma db push`. Za pregled podatkovne baze lahko uporabiš `npm run prisma:studio`.

### 4. Zagon aplikacije

Backend in frontend zaženi v dveh ločenih terminalih iz korenske mape projekta.

Terminal 1 – backend:

```bash
cd backend
npm run dev
```

Delovanje API-ja lahko preveriš na [http://localhost:3000/api/health](http://localhost:3000/api/health). Pričakovani odgovor je `{"status":"OK"}`.

Terminal 2 – frontend:

```bash
cd BuildManager
npm run dev
```

Aplikacijo nato odpri na [http://localhost:5173](http://localhost:5173). Oba razvojna strežnika spremljata spremembe datotek in se med razvojem samodejno osvežujeta.

Za prijavo mora uporabnik obstajati v Supabase Auth, pripadajoči zapis pa mora obstajati tudi v tabeli `Zaposleni`.

### Uporabni ukazi

Backend (v mapi `backend`):

```bash
npm run dev              # razvojni strežnik
npm run build            # generiranje Prisma odjemalca in TypeScript build
npm start                # zagon predhodno zgrajenega backenda
npx prisma db push       # uskladitev razvojne baze s Prisma shemo
npm run prisma:generate  # generiranje Prisma odjemalca
npm run prisma:pull      # posodobitev sheme iz obstoječe baze
npm run prisma:studio    # grafični pregled podatkov v bazi
```

Frontend (v mapi `BuildManager`):

```bash
npm run dev      # razvojni strežnik
npm run build    # produkcijski build
npm run lint     # preverjanje kode z ESLint
npm run preview  # lokalni predogled produkcijskega builda
```
