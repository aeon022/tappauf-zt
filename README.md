# TAPPAUF ZT - Omniscient Core (v1.0)

Dieses Repository enthält das Full-Stack-Ökosystem für die Webpräsenz der **Tappauf ZT GmbH**. 
Architektur-Ansatz: **"Less Noise. Nice Data. No Bloat."**

## 🏗 Tech-Stack

### Frontend & Core
* **Astro v5 (Latest):** Hochperformantes Web-Framework im Hybrid-Mode.
* **Tailwind CSS v4:** Utility-First Styling via `@tailwindcss/vite` Plugin (kein Legacy-Config-Bloat).
* **Zod:** Strikt typisierte Content-Validierung zur Runtime.
* **Markdoc:** Semantisches Content-Format für komplexe Dokumentstrukturen.

### Content Management (Git-based)
* **Keystatic:** Lokales CMS zur Verwaltung der Content-Collections ohne externe Datenbank-Abhängigkeit.
* **Collections:** Referenzen, Team, Leistungen, Jobs und Publikationen.

### DevOps & Tools
* **Runtime:** Node.js (Standalone Mode via `@astrojs/node` Adapter).
* **Migration:** Custom Scripts zum Parsen von WordPress-Daten via `fast-xml-parser`.

## 📂 Projekt-Struktur

```text
.
├── frontend/               # Astro Application & Keystatic Admin
│   ├── src/
│   │   ├── content/        # Source of Truth (.mdoc Files)
│   │   ├── assets/         # Managed Assets (Images, Icons)
│   │   └── pages/          # File-based Routing
│   ├── astro.config.mjs    # Integration-Logic (Keystatic, Tailwind v4)
│   └── keystatic.config.mjs # CMS Schema Definitionen
├── scripts/                # Automatisierung & Migration (WP-Import etc.)
└── package.json            # Root-Utilities & Migration-Deps
