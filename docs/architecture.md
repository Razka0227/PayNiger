# Architecture PayNiger

## Principes

1. **Ledger-first** : chaque opération d'argent passe par `TransactionsService.executeSettlement`, un débit/crédit dans une **transaction de base de données** (verrous pessimistes sur les wallets). Aucune mise à jour directe de solde hors du flux transactionnel.
2. **Idempotence** : clés Redis (`idem:p2p:…`) avec TTL — une même requête renvoyée ne crée pas de doublon, elle retourne la référence existante.
3. **Adaptateurs opérateurs** : `ProvidersGateway` indexe les adaptateurs par opérateur. En `mock`, chaque adaptateur simule latence + 2% d'échec ; en `live`, on branche les SDK réels.
4. **Sécurité** : mots de passe et PIN hachés (bcrypt 12 rounds), JWT access (15 min) + refresh (30 j) stocké en DB, access tokens en **blacklist Redis** au logout, 2FA SMS avec OTP à usage unique (Redis, 5 min), verrouillage du PIN après 5 erreurs (15 min).

## Flux clés

### Transfert P2P
```
POST /transactions/p2p {toPhone, amountCents, pin}
  → vérifier PIN (5 essais / verrouillage)
  → vérifier limites KYC (plafond unitaire + quotidien)
  → calculer frais (FEE_RATE_P2P, selon tier)
  → TRANSACTION (BEGIN)
        debit(wallet expéditeur)   -- SELECT … FOR UPDATE
        credit(wallet destinataire)
        journal: P2P + FEE
  → COMMIT → SMS → {reference}
```
Retry identique → renvoie la référence déjà créée.

### Tontine (« sort »)
- Création : le créateur est trésorier (admin) ; les membres doivent exister sur PayNiger.
- Cotisation : transfert interne membre → trésorier (`TONTINE_DEPOSIT`).
- Versement : le trésorier déclenche `TONTINE_PAYOUT` ; le pot (cotisation × n) est versé au membre `payoutOrder[nextPayoutIndex]`, puis l'index avance en rotation (cycle++ à la boucle).

### 2FA
```
POST /auth/login            → {requiresTwoFactor, challengeToken, devCode?}
POST /auth/2fa/verify       → {accessToken, refreshToken, user}
```
Le `challengeToken` (JWT `type: challenge`, 5 min) lie l'OTP au login en cours. En `SMS_PROVIDER=mock`, le code est renvoyé en `devCode` pour la démo.

## Décisions notables

- **FCFA entiers** : le franc CFA n'a pas de centime → les montants sont stockés en entiers FCFA (propriétés nommées `…Cents` par cohérence de code). Aucune conversion `/100`.
- **`synchronize: true`** en dev (démo) — passer à des migrations TypeORM en production.
- Les wallets opérateurs (Airtel/Moov/Orange) sont des lignes `wallets` liées au user ; le wallet `PAYNIGER` est le compte de règlement interne.

## Modèle de données (résumé)

- `users` : phone, passwordHash, pinHash, role, kycTier, status, language, twoFactorEnabled, refreshToken
- `wallets` : userId, provider, accountNumber, balanceCents, isPrimary
- `transactions` : reference, type, status, amountCents, feeCents, from/to (userId+walletId), providerRef, metadata JSONB
- `bills` : userId, operator, accountNumber, amountCents, status (PAID/FAILED), providerRef, paidAt
- `tontines` : adminId, name, contributionCents, frequency, status, cycle, memberIds JSONB, payoutOrder JSONB, nextPayoutIndex
- `agents` : userId, businessName, city, district, floatCents, commissionRateBps
- `kyc_documents` : userId, type, status, tier → approuvé par l'admin

## Points d'API (préfixe `/api/v1`)

| Méthode | Route | Accès |
|---|---|---|
| POST | /auth/register · /login · /2fa/verify · /refresh | public |
| POST | /auth/logout · GET /auth/2fa · POST /auth/2fa/enable | auth |
| GET | /users/me · POST /users/kyc | auth |
| GET | /wallets · /wallets/operators · /wallets/operators/:provider/authorize | auth |
| POST | /wallets/link · /:id/primary | auth |
| GET/POST | /transactions · /transactions/by-reference · /transactions/p2p · /cash-in · /cash-out · /topup · /bill-payment | auth |
| GET/POST | /bills · /bills/operators · /bills/check · /bills/pay | auth |
| GET/POST | /tontines · /tontines/contribute · /tontines/payout | auth |
| GET/POST | /agents/me · /agents/register | auth |
| GET/POST | /admin/health · /admin/users · /admin/transactions · /admin/kyc/pending · /admin/kyc/:userId/approve | ADMIN |

## Brancher la production

1. Implémenter `PaymentProviderAdapter` (Airtel, Moov, Orange, Bank) dans `server/src/providers/adapters` et passer `PROVIDER_MODE=live`.
2. Brancher un fournisseur SMS (`SMS_PROVIDER=orange|twilio`).
3. Migrations TypeORM à la place de `synchronize`, backups PITR PostgreSQL.
4. Webhooks asynchrones côté agrégateur + table `provider_events` pour le rapprochement.
5. Hébergement : conteneurs (le `docker-compose.yml` couvre déjà DB + Redis), reverse proxy HTTPS, monitoring.
