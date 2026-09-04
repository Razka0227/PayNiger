# PayNiger — plateforme de paiement mobile unifiée (Niger)

Aggrégateur de paiement unifié qui connecte **Airtel Money, Moov Money, Orange Money et les banques locales** dans un seul portefeuille, avec tontines numériques, paiement de factures (NIGELEC, SPEN…), agents cash-in/out et authentification 2FA par SMS.

> MVP démonstrateur « runnable » : tous les opérateurs sont **simulés** en mode `mock` (latence + 2% d'échecs). Le passage en production ne nécessite que de remplacer les adaptateurs par les passerelles réelles.

## Stack

| Couche | Techno |
|---|---|
| Backend | NestJS 10 + TypeORM + PostgreSQL 16 + Redis 7 |
| Web | React 18 + Vite + React Router |
| Mobile | React Native (Expo SDK 51) |
| Partagé | `@payniger/shared` (types & constantes, compilé TS) |

## Architecture

```
                    ┌─────────────────────────────────────┐
   Web :5173 ───────┤  API REST /api/v1 (NestJS :3000)    │
   Mobile (Expo) ───┤  auth · wallets · transactions      │
                    │  bills · tontines · agents · admin  │
                    └──────┬──────────────┬───────────────┘
                           │              │
              ┌────────────▼─────┐  ┌─────▼──────────┐
              │  PostgreSQL 16   │  │   Redis 7      │
              │  (comptes, KV)   │  │  OTP 2FA,      │
              └──────────────────┘  │  idempotence,  │
                                    │  blacklist JWT │
                                    └────────────────┘
   Opérateurs :  Airtel Money · Moov Money · Orange Money · Banques  (adaptateurs mock)
```

## Démarrage rapide

Prérequis : Node 20+, Docker Desktop.

```bash
# 1. Infrastructure (PostgreSQL + Redis)
docker compose up -d

# 2. Types partagés
cd shared && npm install && npm run build && cd ..

# 3. Backend
cp .env.example server/.env
cd server && npm install
npm run build
node dist/database/seed.js        # compte de démo + données
node dist/main.js                 # API sur http://localhost:3000

# 4. Web
cd web && npm install && npm run dev   # http://localhost:5173

# 5. Mobile (optionnel)
cd mobile && npm install
npx expo start                    # scannner le QR (Expo Go)
# Adresse de l'API : éditer app.json → extra.apiUrl
# (10.0.2.2 = émulateur Android ; votre IP LAN sur appareil réel)
```

## Comptes de démonstration (mdp `payniger123`, PIN `1234`)

| Rôle | Nom | Téléphone |
|---|---|---|
| ADMIN | Aminata Diallo | +22790123456 |
| AGENT | Issoufou Bako | +22791123456 |
| MERCHANT | Mariama Ousmane | +22796123456 |
| USER | Seydou Maiga | +22792123456 |
| USER | Fatouma Cissé | +22794123456 |

Seydou et Fatouma ont la **2FA activée** : au login, le code est affiché dans l'interface en mode démo (`devCode`).

## Fonctionnalités du MVP

- **Comptes** : inscription (téléphone+mdp+PIN), login, refresh token, logout (blacklist JWT), **2FA SMS** (OTP en Redis, 5 min).
- **Portefeuilles** : wallet PayNiger principal + wallets opérateurs, débit avec **verrou pessimiste** (anti double-dépense), lien OAuth opérateur simulé.
- **Transferts P2P** : instantanés et **idempotents** (clé Redis — une double soumission ne crée pas de doublon), frais selon KYC.
- **Factures** : vérification + paiement NIGELEC, SPEN, recharges mobiles (Airtel/Moov/Orange).
- **Tontines** : création, cotisation au pot du trésorier, versement du « sort » à tour de rôle, cycle automatique.
- **Agents** : enregistrement de point, **cash-in / cash-out** avec caisse (float) et commission 5%.
- **Admin** : health check (Redis, volume, taux de succès), utilisateurs, transactions, approbation **KYC** (tiers 0→3).
- **KYC** : limites de transaction par niveau de vérification.

## Tests effectués (smoke E2E via API)

Login, `/users/me`, transfert P2P + idempotence (même référence), cotisation tontine, facture NIGELEC (check→pay), recharge mobile, cash-in agent, `/admin/health`, cycle 2FA complet (enable → login → verify).

## Limites / pistes d'amélioration

- Opérateurs en mode `mock` — brancher les passerelles réelles (Airtel/Moov/Orange, NIGELEC, SPEN).
- Paiement **QR** marchand : type de transaction prévu dans `@payniger/shared`, endpoint à exposer.
- SMS réel (Orange/Twilio), webhooks de confirmation asynchrones, rapprochement bancaire.
- Cache sur les listes, rate-limiting fin par ressource, table d'audit, chiffrement de bout en bout des PIN.
- Les montants sont en **FCFA entiers** (le FCFA n'a pas de sous-unité) malgré le suffixe `Cents` des propriétés.

## Structure

```
server/src/
  auth/       2FA, PIN, JWT, refresh, logout
  wallets/    portefeuilles + lien opérateurs
  transactions/  P2P, cash-in/out, topup, factures, règlement (ledger-first)
  bills/      factures (NIGELEC, SPEN…)
  tontines/   tontines numériques
  agents/     cash-in / cash-out
  admin/      supervision + KYC
  providers/  adaptateurs opérateurs (Airtel/Moov/Orange/Bank)
  sms/        envoi SMS (mock)
  redis/      client ioredis
  database/   entités TypeORM + seed
web/src/      React (Vite) — 7 pages + auth context
mobile/src/   Expo — login, dashboard, transfert, factures
shared/src/   constantes + types partagés
```
