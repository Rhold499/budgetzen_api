# Documentation des modules principaux

## 1. Authentification (`auth`)
- Gestion de l’inscription, connexion, refresh token (JWT)
- Stratégies : JWT, Local
- Guards : protection des routes, gestion des rôles
- DTOs : RegisterDto, LoginDto, etc.

## 2. Utilisateurs (`users`)
- CRUD utilisateurs (admin, membre, etc.)
- Attribution au tenant
- Gestion des rôles et permissions
- Profil utilisateur

## 3. Comptes (`accounts`)
- CRUD comptes bancaires et autres
- Gestion des soldes, historique, propriétaire
- Support multi-tenant

## 4. Transactions (`transactions`)
- CRUD transactions (dépenses, revenus, transferts)
- Validation, rejet, audit
- Filtres avancés, pagination

## 5. Catégories (`categories`)
- CRUD catégories personnalisées
- Statistiques d’utilisation
- Catégories par tenant

## 6. Budgets (`budgets`)
- CRUD budgets mensuels par catégorie
- Synthèse, alertes, suivi des dépenses

## 7. Objectifs/Goals (`goals`)
- CRUD objectifs financiers
- Contributions, suivi d’avancement
- Statistiques sur les objectifs

## 8. Plans & Abonnements (`plans`)
- Gestion des plans (FREE, PRO, etc.)
- Limites, quotas, upgrade

## 9. Tenants (`tenants`)
- Gestion multi-tenant (création, modification, suppression)
- Statistiques par tenant

## 10. Rapports (`reports`)
- Génération de rapports PDF/Excel
- Export, historique, suppression

## 11. Analytics & IA (`budget-analytics`, `ai`)
- Synthèse analytique, dashboards
- Insights IA, recommandations, scoring

## 12. Banque & Intégrations (`banking`)
- Connexion comptes bancaires (open banking, scraping)
- Synchronisation, gestion des connexions

## 13. Webhooks (`webhooks`)
- Création, gestion et suppression de webhooks
- Intégration avec des outils externes

## 14. Administration (`admin`)
- Dashboard superadmin
- Logs d’audit, analytics globaux
- Statut système, gestion avancée

## 15. Mobile (`mobile`)
- Endpoints optimisés pour l’app mobile
- Dashboard, comptes, transactions simplifiés

## 16. Commun (`common`)
- Décorateurs, guards, DTOs partagés
- Utilitaires transverses

## 17. Prisma (`prisma`)
- Accès base de données, schéma, migrations

## 18. Supabase (`supabase`)
- Intégration Supabase (auth, storage, events)

## 19. Monitoring (`monitoring`)
- Intégration Sentry, logs, alertes

---

Chaque module est découpé en controller, service, DTOs, et parfois module spécifique.
Les modules sont pensés pour être extensibles, testables et multi-tenant.

# Structure des données par module et endpoint

## 1. Authentification (`auth`)
- **register**: { email, password, firstName, lastName, role?, tenantId? }
- **login**: { email, password }
- **refresh**: { access_token, user: { id, email, role, tenantId, ... } }

## 2. Utilisateurs (`users`)
- **User**: { id, email, firstName, lastName, role, isActive, tenantId, createdAt, updatedAt }
- **GET /users**: { data: User[], meta: { total, page, limit, totalPages } }
- **GET /users/:id**: User
- **POST /users**: User
- **PATCH /users/:id**: User
- **DELETE /users/:id**: { success: boolean }

## 3. Comptes (`accounts`)
- **Account**: { id, name, type, balance, currency, isActive, description?, address?, tenantId, ownerId, createdAt, updatedAt }
- **GET /accounts**: { data: Account[], meta: { total, page, limit } }
- **GET /accounts/:id**: Account
- **POST /accounts**: Account
- **PATCH /accounts/:id**: Account
- **DELETE /accounts/:id**: { success: boolean }
- **GET /accounts/:id/balance**: { balance, currency }
- **GET /accounts/:id/transactions**: { data: Transaction[], meta: { ... } }

## 4. Transactions (`transactions`)
- **Transaction**: { id, amount, currency, type, status, description?, reference?, metadata?, receiptUrl?, createdAt, updatedAt, tenantId, createdById, debitAccountId?, creditAccountId?, categoryId?, network? }
- **GET /transactions**: { data: Transaction[], meta: { ... } }
- **GET /transactions/:id**: Transaction
- **POST /transactions**: Transaction
- **PATCH /transactions/:id**: Transaction
- **DELETE /transactions/:id**: { success: boolean }
- **POST /transactions/:id/validate**: Transaction
- **POST /transactions/:id/reject**: Transaction

## 5. Catégories (`categories`)
- **Category**: { id, name, description?, color?, icon?, type, isActive, isDefault, tenantId, createdById, createdAt, updatedAt }
- **GET /categories**: Category[]
- **POST /categories**: Category
- **PATCH /categories/:id**: Category
- **DELETE /categories/:id**: { success: boolean }
- **GET /categories/stats**: { totalTransactions, totalAmount, monthlyStats }

## 6. Budgets (`budgets`)
- **Budget**: { id, amount, currency, month, year, spent, isActive, alertAt?, tenantId, categoryId, createdById, createdAt, updatedAt }
- **GET /budgets**: Budget[]
- **POST /budgets**: Budget
- **PATCH /budgets/:id**: Budget
- **DELETE /budgets/:id**: { success: boolean }
- **GET /budgets/summary**: { totalBudget, totalSpent, byCategory: [{ categoryId, amount, spent }] }

## 7. Objectifs/Goals (`goals`)
- **Goal**: { id, title, description?, targetAmount, currentAmount, currency, targetDate?, status, priority, isPublic, metadata?, tenantId, createdById, createdAt, updatedAt }
- **GET /goals**: Goal[]
- **POST /goals**: Goal
- **PATCH /goals/:id**: Goal
- **DELETE /goals/:id**: { success: boolean }
- **GET /goals/stats**: { totalGoals, completedGoals, activeGoals, ... }
- **GET /goals/:id/contributions**: Contribution[]
- **POST /goals/:id/contributions**: Contribution

## 8. Plans & Abonnements (`plans`)
- **Plan**: { type, limits: { users, accounts, ... } }
- **GET /plans/current/limits**: Plan
- **GET /plans/check/:resource**: { canAdd: boolean, resource }
- **POST /plans/upgrade**: { message, newPlan }

## 9. Tenants (`tenants`)
- **Tenant**: { id, name, subdomain?, planType, isActive, settings?, createdAt, updatedAt }
- **GET /tenants**: { data: Tenant[], meta: { ... } }
- **POST /tenants**: Tenant
- **PATCH /tenants/:id**: Tenant
- **DELETE /tenants/:id**: { success: boolean }
- **GET /tenants/current**: Tenant
- **GET /tenants/current/stats**: { users, accounts, transactions, totalBalance }

## 10. Rapports (`reports`)
- **Report**: { id, title, type, filters?, data?, fileUrl?, tenantId, createdById, createdAt, updatedAt }
- **GET /reports**: { data: Report[], meta: { ... } }
- **POST /reports**: Report
- **GET /reports/:id**: Report
- **DELETE /reports/:id**: { success: boolean }
- **GET /reports/:id/export**: (fichier binaire)

## 11. Analytics & IA (`budget-analytics`, `ai`)
- **GET /budget-analytics/dashboard**: { ...dashboardData }
- **GET /budget-analytics/expenses-by-category**: [{ category, amount, transactionCount }]
- **GET /budget-analytics/monthly-evolution**: [{ month, total }]
- **GET /budget-analytics/budget-vs-actual**: [{ category, budget, spent }]
- **GET /budget-analytics/goal-progress**: [{ goalId, progress }]
- **GET /ai/analyze/transactions**: { insights: any[] }
- **GET /ai/insights/monthly**: { ... }
- **GET /ai/recommendations**: { recommendations: any[] }

## 12. Banque & Intégrations (`banking`)
- **BankConnection**: { id, tenantId, bankName, accountNumber, connectionType, isActive, lastSync }
- **GET /banking/connections**: BankConnection[]
- **POST /banking/connect**: BankConnection
- **POST /banking/connections/:id/sync**: { imported, errors }
- **GET /banking/accounts/:id**: [{ ...bankAccount }]
- **DELETE /banking/connections/:id**: { message }
- **GET /banking/supported-banks**: { banks: [{ name, country, connectionTypes, logo }] }

## 13. Webhooks (`webhooks`)
- **Webhook**: { id, url, event, tenantId, createdAt }
- **GET /webhooks**: Webhook[]
- **POST /webhooks**: Webhook
- **DELETE /webhooks/:id**: { success: boolean }

## 14. Administration (`admin`)
- **GET /admin/dashboard**: { ...globalStats }
- **GET /admin/health**: { status, details }
- **GET /admin/audit-logs**: { data: AuditLog[], meta: { ... } }
- **GET /admin/analytics/tenants**: { byPlan, byStatus, monthlyGrowth }

## 15. Mobile (`mobile`)
- **GET /mobile/dashboard**: { ... }
- **GET /mobile/accounts**: Account[]
- **GET /mobile/transactions**: Transaction[]

---

Chaque structure de données correspond à la réponse JSON attendue pour chaque endpoint principal. Les modules secondaires (DTOs, guards, etc.) ne renvoient pas de données mais structurent les entrées/sorties.
