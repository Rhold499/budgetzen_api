# Utilisation de l'API BudgetZen

Bienvenue dans la documentation avancée de l'API BudgetZen. Cette page détaille l'utilisation de toutes les fonctions principales, les relations entre les entités, le fonctionnement des tables, et fournit des exemples concrets pour chaque cas d'usage.

---

## Table des matières
- [Introduction](#introduction)
- [Authentification & Sécurité](#authentification--sécurité)
- [Gestion des utilisateurs](#gestion-des-utilisateurs)
- [Gestion des tenants (organisations)](#gestion-des-tenants-organisations)
- [Comptes & Transactions](#comptes--transactions)
- [Catégories & Budgets](#catégories--budgets)
- [Plans & Abonnements](#plans--abonnements)
- [Relations entre les tables](#relations-entre-les-tables)
- [Exemples de requêtes](#exemples-de-requêtes)
- [Gestion des erreurs](#gestion-des-erreurs)
- [Annexes](#annexes)

---

## Introduction
L'API BudgetZen est une solution SaaS multi-tenant pour la gestion budgétaire collaborative. Elle repose sur une architecture sécurisée, des rôles utilisateurs avancés, et une gestion fine des droits d'accès.

## Authentification & Sécurité
- Authentification JWT (Bearer Token)
- Invitation par email avec token sécurisé
- Garde multi-tenant (`UserTenantGuard`)
- Rôles : SUPERADMIN, ADMIN, MEMBER, USER

## Gestion des utilisateurs
- Création, invitation, acceptation d'invitation
- Association à un ou plusieurs tenants via la table pivot `user_tenants`
- Statuts d'invitation : PENDING, ACCEPTED, REJECTED
- Exemples d'utilisation (curl, Swagger)

## Gestion des tenants (organisations)
- Création de tenant
- Ajout/suppression d'utilisateurs
- Attribution de rôles et gestion des statuts

## Comptes & Transactions
- Création de comptes (avec ajout automatique des catégories par défaut)
- Transactions : création, validation, affectation de catégories
- Gestion des soldes et des mouvements
- Types de transactions : DEBIT, CREDIT, TRANSFER, DEPOSIT, WITHDRAWAL, PAYMENT

## Catégories & Budgets
- Catégories par défaut et personnalisées
- Budgets par catégorie et par période
- Suivi des dépenses et alertes

## Plans & Abonnements
- Types de plans : FREE, FAMILY, PRO, ENTERPRISE
- Limites par plan (nombre de comptes, utilisateurs, etc.)

## Relations entre les tables
- `users` <-> `user_tenants` <-> `tenants`
- `accounts` liés à un `tenant` et un `owner`
- `transactions` liés à des `accounts` et des `categories`
- `categories` liés à un `tenant`
- Diagramme relationnel (voir annexe)

## Exemples de requêtes
- Invitation d'utilisateur
- Acceptation d'invitation
- Création de compte
- Création de transaction
- Récupération des budgets

## Gestion des erreurs
- Structure des erreurs (`statusCode`, `message`, `error`)
- Codes d'erreur personnalisés
- Exemples d'erreurs courantes

## Annexes
- Diagramme de la base de données
- Glossaire des rôles et statuts
- Liens utiles

---

> Utilisez la barre latérale pour naviguer entre les sections détaillées.
