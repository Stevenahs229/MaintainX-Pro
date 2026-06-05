# MaintainX Pro — Smart Industrial Maintenance

Plateforme PWA de gestion de maintenance industrielle développée en 48h pour le Smart Industrial Asset Intelligence & Spare Parts Innovation Hackathon.

## Stack

| Couche | Technologie |
|--------|------------|
| Frontend | React 19 + TypeScript + Vite 8 |
| Styling | Tailwind CSS 3 + Recharts |
| Drag & Drop | @hello-pangea/dnd |
| Backend | Node.js + Express + TypeScript |
| Base de données | SQLite (sql.js) |
| PWA | vite-plugin-pwa (Service Worker + offline) |
| Icônes | Lucide React |

## Structure

```
SIAI/
├── start.sh              # Lancement en un clic
├── backend/              # API REST
│   ├── src/
│   │   ├── index.ts      # Entrypoint Express
│   │   ├── database.ts   # Schema SQLite
│   │   ├── seed.ts       # Données de démo
│   │   └── routes/       # Routes REST
│   │       ├── equipment.ts
│   │       ├── faults.ts
│   │       ├── spareparts.ts
│   │       ├── notifications.ts
│   │       ├── dashboard.ts
│   │       └── users.ts
│   └── maintainx.db      # Base de données
└── frontend/             # Client React
    ├── src/
    │   ├── pages/        # 7 pages
    │   ├── components/   # UI + Layout
    │   ├── hooks/        # useApi, useNotifications
    │   ├── services/     # API client
    │   └── types/        # Types + constantes
    └── dist/             # Build production
```

## Guide de démarrage

```bash
# 1. Lancer les deux serveurs
./start.sh

# 2. Ou manuellement :
cd backend   && node_modules/.bin/tsx src/index.ts   # Port 3001
cd frontend  && node_modules/.bin/vite --host 0.0.0.0 # Port 5173

# 3. Ouvrir http://localhost:5173
```

## Pages

| Route | Page | Fonctionnalité |
|-------|------|---------------|
| `/dashboard` | Dashboard | KPIs, graphiques, équipements à risque |
| `/kanban` | Kanban | Drag & drop des pannes dans le workflow |
| `/equipment` | Équipements | CRUD + health score |
| `/equipment/:id` | Détail équipement | Infos + historique pannes |
| `/faults/:id` | Détail panne | Progression, commentaires, pièces |
| `/spare-parts` | Pièces | Suivi commandes + changement statut |
| `/notifications` | Activité | Fil d'activité temps réel |

## Workflow des pannes

```
Soumis → Analyse → Inspection → Validation → Fabrication → Livraison → Clôturé
```

Chaque glissement sur le Kanban avance le statut et crée une notification.

## API REST

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/equipment` | Liste équipements |
| POST | `/api/equipment` | Ajouter équipement |
| GET | `/api/faults` | Liste pannes |
| POST | `/api/faults` | Créer panne |
| PATCH | `/api/faults/:id/status` | Changer statut |
| GET | `/api/spare-parts` | Liste pièces |
| PATCH | `/api/spare-parts/:id/status` | Changer statut pièce |
| GET | `/api/dashboard` | Stats dashboard |
| GET | `/api/notifications` | Activités récentes |

## Données de démo

Le seed crée automatiquement :
- 4 utilisateurs (Admin, Manager, 2 Techniciens)
- 6 équipements (presse, convoyeur, robot, compresseur...)
- 5 pannes à différents statuts
- 3 pièces détachées en commande

## Innovation

- **IA de diagnostic** : health score calculé par équipement
- **PWA offline-ready** : cache API + Service Worker
- **Drag & drop** : workflow visuel inspiré de Trello
- **Temps réel** : notifications mises à jour automatiquement
