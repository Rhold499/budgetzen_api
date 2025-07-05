# Financial SaaS Backend

Une application backend NestJS complète pour la gestion et le suivi de transactions financières avec une architecture SaaS multi-tenant hybride.

## 🚀 Fonctionnalités

### 🔐 Authentification & Sécurité
- Authentification JWT avec Supabase Auth
- Système de rôles : SUPERADMIN, ADMIN, MEMBER, USER
- Guards de sécurité et middleware de tenant
- Validation des données avec class-validator
- Rate limiting et protection CORS

### 🧠 Architecture Multi-Tenant
- Séparation logique des données par tenant
- Détection automatique du tenant
- Support des sous-domaines
- Gestion des permissions par tenant

### 📦 Plans d'Abonnement
- **FREE** : Plan gratuit de base (1 utilisateur, 1 compte)
- **FAMILY** : Gestion familiale des finances (5 utilisateurs, 3 comptes)
- **PRO** : Fonctionnalités avancées pour entreprises (illimité + IA)
- **ENTERPRISE** : Solution complète pour grandes entreprises

### 💸 Gestion des Transactions
- Création et validation de transactions
- États : PENDING, VALIDATED, REJECTED, FAILED
- Types : DEBIT, CREDIT, TRANSFER, DEPOSIT, WITHDRAWAL, PAYMENT
- Transactions atomiques avec Prisma
- Audit trail complet

### 🤖 Intelligence Artificielle
- Analyse automatique des transactions
- Recommandations intelligentes
- Détection d'anomalies
- Insights mensuels personnalisés
- Scoring de risque

### 📊 Rapports et Analytics
- Génération de rapports personnalisés
- Analyses mensuelles et annuelles
- Export de données
- Statistiques en temps réel

## 🛠️ Stack Technique

- **Framework** : NestJS
- **Base de données** : PostgreSQL avec Prisma ORM
- **Authentification** : Supabase Auth
- **Documentation** : Swagger/OpenAPI
- **Validation** : class-validator & class-transformer
- **Sécurité** : Helmet, CORS, Rate limiting
- **IA** : Préparé pour intégration GPT/Claude

## 📦 Installation

### Prérequis
- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL
- Compte Supabase

### Configuration

1. **Cloner le projet**
```bash
git clone <repository-url>
cd financial-saas-backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env
```

Remplir les variables d'environnement dans `.env` :

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/financial_saas?schema=public"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# App
NODE_ENV="development"
PORT=3000
API_PREFIX="api/v1"
```

4. **Configuration de la base de données**
```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Ou pousser le schéma directement (développement)
npm run db:push
```

5. **Démarrer l'application**
```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

## 📚 Documentation API

Une fois l'application démarrée, la documentation Swagger est disponible à :
`http://localhost:3000/api/v1/docs`

## 🏗️ Structure du Projet

```
src/
├── auth/                 # Authentification et autorisation
├── users/               # Gestion des utilisateurs
├── tenants/             # Gestion des tenants
├── accounts/            # Gestion des comptes
├── transactions/        # Gestion des transactions
├── reports/             # Génération de rapports
├── plans/               # Gestion des abonnements
├── ai/                  # Intelligence artificielle
├── admin/               # Administration système
├── common/              # Utilitaires partagés
├── prisma/              # Configuration Prisma
└── supabase/            # Intégration Supabase
```

## 🔑 Modèle de Données

### Entités Principales

- **Tenant** : Organisation/Entreprise/Famille
- **User** : Utilisateur avec rôles
- **Account** : Compte financier
- **Transaction** : Transaction financière
- **Report** : Rapport généré
- **AuditLog** : Journal d'audit

## 🚦 Endpoints Principaux

### Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/refresh` - Rafraîchir le token

### Plans & Abonnements
- `GET /plans/current/limits` - Limites du plan actuel
- `GET /plans/check/:resource` - Vérifier les quotas
- `POST /plans/upgrade` - Mettre à niveau le plan

### Intelligence Artificielle
- `GET /ai/analyze/transactions` - Analyser les transactions
- `GET /ai/insights/monthly` - Insights mensuels
- `GET /ai/recommendations` - Recommandations intelligentes

### Utilisateurs
- `GET /users` - Liste des utilisateurs
- `GET /users/me` - Profil utilisateur
- `POST /users` - Créer un utilisateur

### Comptes
- `GET /accounts` - Liste des comptes
- `POST /accounts` - Créer un compte
- `GET /accounts/:id/balance` - Solde du compte

### Transactions
- `GET /transactions` - Liste des transactions
- `POST /transactions` - Créer une transaction
- `POST /transactions/:id/validate` - Valider une transaction

## 🔒 Système d'Abonnement

### Plan FREE
- 1 utilisateur maximum
- 1 compte maximum
- Transactions de base
- Rapports simples

### Plan FAMILY
- 5 utilisateurs maximum
- 3 comptes maximum
- Upload de reçus
- Historique des transactions
- Tableau de bord simple

### Plan PRO
- Utilisateurs illimités
- Comptes illimités
- Multi-devises
- Analyse IA
- Rapports PDF
- Automatisation
- API access

### Plan ENTERPRISE
- Toutes les fonctionnalités PRO
- White label
- Intégrations personnalisées
- Support dédié
- SLA garanti

## 🤖 Intelligence Artificielle

### Fonctionnalités IA
- **Analyse des transactions** : Détection de patterns et anomalies
- **Recommandations** : Suggestions personnalisées d'optimisation
- **Scoring de risque** : Évaluation automatique des risques
- **Insights mensuels** : Analyses approfondies des tendances

### Préparation pour IA Avancée
- Structure modulaire pour intégration GPT/Claude
- Endpoints prêts pour l'analyse sémantique
- Système de recommandations extensible

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture de code
npm run test:cov
```

### Tests Inclus
- Tests d'authentification
- Tests des plans et quotas
- Tests des endpoints principaux

## 🧪 Couverture de tests & Robustesse

### Objectif recommandé
- Viser **90% ou plus** de couverture de code sur tous les modules critiques (auth, transactions, comptes, budgets, plans, webhooks, etc.).
- Tester tous les cas d’usage métier, les erreurs, les permissions et les guards.

### Vérifier la couverture
- Lancer la commande suivante pour générer un rapport de couverture :
  ```bash
  npm run test:cov
  ```
- Un rapport HTML sera généré dans `coverage/`. Ouvre `coverage/lcov-report/index.html` dans ton navigateur pour une vue détaillée.

### Bonnes pratiques
- Ajoute des tests e2e pour chaque endpoint critique (voir `test/*.e2e-spec.ts`).
- Ajoute des tests unitaires pour chaque service métier.
- Mocke les dépendances externes (Supabase, Prisma, etc.) dans les tests unitaires.
- Vérifie les cas d’erreur, les accès refusés, les quotas, les guards, etc.
- Utilise des jeux de données réalistes pour les tests e2e.

### Dépannage
- Si la couverture baisse, le pipeline CI échouera (à personnaliser dans le pipeline si besoin).
- Pour forcer la couverture minimale, ajoute l’option `--coverageThreshold` dans la config Jest.
- Pour des exemples de tests, regarde les fichiers dans `test/`.

---

## 📈 Monitoring & Audit

### Audit Trail
Toutes les opérations sensibles sont enregistrées :
- Création/modification/suppression d'entités
- Validation/rejet de transactions
- Connexions utilisateurs
- Changements de plan

### Métriques
- Statistiques des transactions
- Analyses par tenant
- Santé du système
- Utilisation des quotas

## 📈 Monitoring & Sentry (Erreurs en production)

### Intégration Sentry
- Un module d'initialisation Sentry est disponible dans `src/monitoring/sentry.ts`.
- Pour activer la collecte d'erreurs en production :
  1. Crée un compte Sentry.io et récupère ton DSN (clé de projet).
  2. Ajoute la variable `SENTRY_DSN` dans ton `.env` de production.
  3. Dans `src/main.ts`, importe et appelle `initSentry()` au tout début du bootstrap :
     ```ts
     import { initSentry } from './monitoring/sentry';
     initSentry();
     ```
  4. Les erreurs non catchées et les traces seront envoyées à Sentry automatiquement.

### Conseils
- Utilise Sentry pour recevoir des alertes en cas d'erreur critique en prod.
- Tu peux enrichir les logs avec des infos utilisateur, tenant, etc. via `Sentry.setUser`, `Sentry.setContext`.
- Pour monitorer les performances, active `tracesSampleRate`.

### Alternatives
- Pour des métriques système/app : Prometheus, Grafana, Datadog...
- Pour logs centralisés : Loki, ELK, Papertrail...

## 🚀 Déploiement

### Variables d'Environnement de Production
```env
NODE_ENV=production
DATABASE_URL=<production-database-url>
JWT_SECRET=<strong-production-secret>
SUPABASE_URL=<production-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<production-service-key>
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 🚀 CI/CD & Déploiement Automatique

### Pipeline GitHub Actions (CI/CD)

- Le projet inclut un pipeline CI/CD complet dans `.github/workflows/ci-cd.yml`.
- À chaque push/PR sur `main` :
  - Lint, tests unitaires, tests e2e, build de l'app.
  - Build et push automatique de l'image Docker sur DockerHub.
  - Déploiement automatique sur ton VPS via SSH (pull, restart du conteneur).

#### Configuration des secrets GitHub nécessaires :
- `DOCKERHUB_USERNAME` : ton identifiant DockerHub
- `DOCKERHUB_TOKEN` : un token DockerHub avec droits de push
- `VPS_HOST` : IP ou domaine de ton VPS
- `VPS_USER` : utilisateur SSH sur le VPS
- `VPS_SSH_KEY` : clé privée SSH (format PEM) de ce user (ajoute la clé publique sur le VPS dans `~/.ssh/authorized_keys`)

#### Bonnes pratiques :
- Place ton fichier `.env` de production sur le VPS à l'emplacement `/home/<VPS_USER>/.env` (jamais dans le repo !)
- Le conteneur Docker sera automatiquement relancé avec la nouvelle image à chaque push sur `main`.
- Pour vérifier les logs : `docker logs -f financial-saas-backend`
- Pour forcer un redéploiement : push un commit sur `main`.

#### Dépannage rapide :
- Si le déploiement échoue, vérifie les logs GitHub Actions et Docker (`docker ps`, `docker logs ...`).
- Vérifie que le port 3000 est ouvert sur le VPS.
- Pour réinitialiser le conteneur :
  ```bash
  docker stop financial-saas-backend || true
  docker rm financial-saas-backend || true
  docker pull <ton_dockerhub>/financial-saas-backend:latest
  docker run -d --name financial-saas-backend -p 3000:3000 --env-file /home/<VPS_USER>/.env <ton_dockerhub>/financial-saas-backend:latest
  ```

---

**Note** : Cette application est conçue pour être évolutive et sécurisée. Elle peut facilement être étendue avec des fonctionnalités supplémentaires comme l'intégration d'IA avancée, les webhooks, ou des connecteurs vers des services externes.

## 🎯 Prochaines Étapes

1. **Intégration IA Avancée** : Connexion avec GPT-4 pour analyses sémantiques
2. **Webhooks** : Système de notifications en temps réel
3. **Mobile API** : Endpoints optimisés pour applications mobiles
4. **Intégrations Bancaires** : Connexion avec APIs bancaires
5. **Blockchain** : Support des crypto-monnaies

## 🚧 Prochaine évolution majeure : Support des transactions crypto

- Le modèle de données et les services sont prêts à accueillir la gestion des comptes et transactions crypto (Bitcoin, Ethereum, etc.).
- Ajout du type de compte CRYPTO, du champ d’adresse wallet, et du champ réseau blockchain dans Prisma.
- La logique métier sera ajoutée dans une prochaine version (intégration API blockchain, gestion des confirmations, etc.).

## 🔒 Gestion des secrets & variables d'environnement

### Bonnes pratiques
- **Ne jamais** commit de secrets (clés, tokens, mots de passe) dans le code ou le repo.
- Utilise un fichier `.env` (non versionné) pour stocker les variables sensibles.
- Sur le VPS ou en cloud, place le `.env` dans un dossier sécurisé (ex : `/home/<user>/.env`).
- Pour les secrets CI/CD (GitHub Actions), utilise l'onglet **Settings > Secrets** du repo.
- Pour une gestion avancée : utilise un secret manager cloud (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault, etc.).

### Variables d'environnement critiques à définir en production
- `DATABASE_URL` : URL de connexion PostgreSQL
- `JWT_SECRET` : clé secrète JWT forte et unique
- `SUPABASE_SERVICE_ROLE_KEY` : clé privée Supabase
- `SENTRY_DSN` : DSN Sentry (si monitoring activé)
- ...et toutes les autres variables listées dans `.env.example`

### Dépannage
- Si une variable est manquante, l'app refusera de démarrer ou plantera au runtime.
- Pour vérifier les variables chargées :
  ```bash
  printenv | grep <NOM_VARIABLE>
  ```
- Pour changer un secret en prod : modifie le `.env` puis redémarre le conteneur Docker.

---

## 💾 Backups & Migrations automatisées (PostgreSQL/Prisma)

### Sauvegarde automatique de la base PostgreSQL
- Utilise `pg_dump` pour automatiser les backups réguliers.
- Exemple de script bash à placer dans un cron sur le VPS :
  ```bash
  #!/bin/bash
  export PGPASSWORD="<mot_de_passe_postgres>"
  BACKUP_DIR="/home/<user>/db_backups"
  mkdir -p $BACKUP_DIR
  pg_dump -h localhost -U <user> -d financial_saas -F c -b -v -f "$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).dump"
  # Pour supprimer les backups de plus de 7 jours :
  find $BACKUP_DIR -type f -mtime +7 -delete
  ```
- Ajoute ce script dans la crontab pour un backup quotidien :
  ```bash
  0 3 * * * /home/<user>/backup_pg.sh
  ```

### Restauration d'un backup
- Pour restaurer :
  ```bash
  pg_restore -h localhost -U <user> -d financial_saas -v /chemin/vers/backup_xxx.dump
  ```

### Migrations Prisma en production
- Pour appliquer les migrations Prisma sur la prod :
  ```bash
  npm run db:migrate
  # ou
  npx prisma migrate deploy
  ```
- À faire après chaque déploiement si le schéma a changé.
- Les migrations sont idempotentes et versionnées dans le dossier `prisma/migrations`.

### Conseils
- Stocke les backups sur un disque séparé ou dans le cloud (S3, etc.) pour plus de sécurité.
- Teste la restauration sur une base de test avant de faire confiance à tes backups.
- Surveille l’espace disque du VPS.

---

## 🚦 Tests de charge (k6)

### Pourquoi ?
- Pour vérifier la robustesse de l’API sous forte charge et détecter les goulets d’étranglement.

### Exemple de test (inclus)
- Un script de test de charge est fourni dans `test/loadtest.k6` (50 utilisateurs virtuels sur /transactions).

### Lancer un test de charge
1. Installe k6 :
   ```bash
   sudo apt install k6 # ou brew install k6
   ```
2. Lance le test :
   ```bash
   k6 run test/loadtest.k6
   ```
3. Observe le résultat (taux de succès, latence, erreurs).

### Conseils
- Teste différents endpoints critiques (auth, transactions, comptes, etc.).
- Augmente progressivement le nombre de VUs et la durée.
- Surveille la RAM/CPU du serveur pendant le test.
- Utilise les résultats pour ajuster la scalabilité (Docker, base, code).

---

## 🆘 Procédures d’incident & restauration

### Runbook incident (exemple)
- **API ne répond plus** :
  1. Vérifie l’état du conteneur Docker :
     ```bash
     docker ps -a
     docker logs -f financial-saas-backend
     ```
  2. Redémarre le conteneur si besoin :
     ```bash
     docker restart financial-saas-backend
     ```
  3. Vérifie la base PostgreSQL :
     ```bash
     systemctl status postgresql
     sudo systemctl restart postgresql
     ```
- **Erreur critique en prod** :
  1. Consulte Sentry (ou les logs Docker).
  2. Identifie le commit fautif, rollback si besoin (`git checkout <commit>` puis redeploy).
- **Perte de données** :
  1. Restaure le dernier backup PostgreSQL (voir section backup ci-dessus).
  2. Vérifie l’intégrité des données après restauration.
- **Migration échouée** :
  1. Corrige le schéma Prisma.
  2. Relance la migration :
     ```bash
     npm run db:migrate
     # ou
     npx prisma migrate deploy
     ```

### Conseils
- Documente chaque incident (date, cause, résolution) dans un fichier `INCIDENTS.md`.
- Teste régulièrement la restauration sur une base de test.
- Prépare un plan de communication pour les utilisateurs en cas d’incident majeur.

## 🛡️ Audit de sécurité des dépendances

### Pourquoi ?
- Pour détecter et corriger rapidement les failles de sécurité dans les packages utilisés.

### Audit avec npm
- Lancer un audit de sécurité :
  ```bash
  npm audit
  ```
- Pour corriger automatiquement les failles :
  ```bash
  npm audit fix
  ```
- Pour un rapport détaillé :
  ```bash
  npm audit --json > audit-report.json
  ```

### Audit avancé avec Snyk
- Crée un compte gratuit sur https://snyk.io
- Installe Snyk CLI :
  ```bash
  npm install -g snyk
  ```
- Lance un scan :
  ```bash
  snyk test
  ```
- Pour monitorer le projet en continu :
  ```bash
  snyk monitor
  ```

### Conseils
- Lance un audit après chaque ajout/mise à jour de dépendance.
- Corrige les failles critiques avant tout déploiement en production.
- Surveille les alertes de sécurité GitHub sur le repo.

---