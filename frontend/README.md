# Tappauf ZT Frontend

Astro-Frontend fuer die Website von Tappauf ZT mit lokalem Keystatic-CMS fuer Redaktion, Referenzen und Inhaltswartung.

## Setup

Voraussetzung:

- Node.js `>= 22.12.0`

```sh
npm install
npm run dev
```

Standardmaessig laeuft die Entwicklung unter `http://localhost:4321`.

## Befehle

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Startet die lokale Entwicklungsumgebung inklusive Keystatic |
| `npm run build` | Erzeugt den statischen Build in `dist/` |
| `npm run check` | Fuehrt den Astro-Typecheck und die Projekt-Diagnosen aus |
| `npm run preview` | Zeigt den gebauten Stand lokal an |
| `npm run astro ...` | Fuehrt Astro-CLI-Befehle aus |

## Build-Profile

Standard-Build:

```sh
npm run build
```

Build fuer einen Unterordner auf einem Testserver:

```sh
SITE_URL="https://yard.starbase11.com/html/clemens/" \
BASE_PATH="/html/clemens/" \
npm run build
```

Dabei gilt:

- `SITE_URL` setzt Canonicals, Sitemap-URLs und absolute SEO-Links
- `BASE_PATH` sorgt dafuer, dass Routen, Assets und interne Links unter dem Zielpfad gebaut werden

## Keystatic

Keystatic ist fuer die lokale Redaktion gedacht und unter `/keystatic` im Dev-Server erreichbar.

Wichtig:

- Fuer Redaktion und Inhaltsbearbeitung immer `npm run dev` verwenden.
- Nach Aenderungen an `keystatic.config.mjs` den Dev-Server neu starten.
- Im statischen Build oder in `preview` ist Keystatic nicht als Redaktionsoberflaeche vorgesehen.
- Keystatic baut aktuell auch unter Astro 6, deklariert die Kompatibilitaet aber noch nicht offiziell per Peer-Dependency. Das sollte bei Updates von `@keystatic/astro` im Blick bleiben.
- Das sichtbare Keystatic-Branding kommt nativ aus `keystatic.config.mjs` ueber `ui.brand`.
- Der Browser-Tab fuer `/keystatic` wird zusaetzlich ueber den lokalen Patch auf `Tappauf ZT CMS` gesetzt.

## Inhaltsstruktur

Die redaktionellen Inhalte liegen unter `src/content/`.

Wichtige Bereiche:

- `src/content/home/` fuer die Startseite
- `src/content/settings/` fuer globale Firmendaten und Meta-Angaben
- `src/content/references/entries/` fuer Referenzen
- `src/content/services/entries/` fuer Leistungen
- `src/content/team/entries/` fuer Teamprofile
- `src/content/jobs/` fuer Stellenanzeigen
- `src/content/publications/entries/` fuer Publikationen
- `src/content/partners/entries/` fuer Auftraggeber und Partner

## Referenzen

Die Referenzen-Seite arbeitet statisch, aber mit clientseitiger Suche und Filterung.

Aktuelle Logik:

- Wenn im Feld `Beschreibung` Inhalt steht, wird eine Detailseite unter `/projekte/[slug]` gebaut.
- Wenn `Beschreibung` leer ist, bleibt die Karte auf der Uebersichtsseite statisch und ist nicht verlinkt.
- Die Regel ist zentral in `src/lib/referenceContent.ts` gekapselt.

Suche:

- Die Suchoberflaeche sitzt auf `/projekte`.
- Die Suche funktioniert auch im statischen Build, weil der Suchindex beim Build aus den Referenzen erzeugt und dann im Browser gefiltert wird.
- Die Seite unterstuetzt URL-Parameter wie `/projekte?q=museum` oder `/projekte?category=hochbau`.

## Globale Command Palette

Die Command Palette ist global im Layout verankert und nicht nur auf die Referenzen begrenzt.

- Ueber `Strg + K` oeffnet sich die Palette auf der gesamten Website.
- Die Palette bleibt ohne Eingabe zunaechst leer und zeigt erst nach Suchtext Treffer an.
- Sie durchsucht Inhalte aus Leistungen, Referenzen, Jobs, Team und Publikationen.
- Sie enthaelt zusaetzlich Schnellaktionen fuer `Hell`, `Dunkel`, `System`, hoeheren Kontrast und reduzierte Bewegung.
- Kontaktinformationen und Logo werden direkt aus Keystatic (`settings/global`) gezogen.

Wichtig:

- Auf `/keystatic` wird der globale Suchindex bewusst nicht aufgebaut, damit CMS und Website sich lokal nicht stoeren.
- `Team` und `Publikationen` verlinken auf ihre jeweiligen Inhaltsseiten, auch wenn sie keine eigenen Detailseiten haben.

## Bilder und Uploads

- Projekt- und Partnerbilder liegen ueberwiegend in `src/assets/references/`
- Teamfotos liegen in `src/assets/team/`
- Publikations-PDFs liegen in `public/uploads/publications/`

## Keystatic-Spaltenreihenfolge

Keystatic zeigt den `Slug` standardmaessig vor den Inhaltsfeldern an. Fuer dieses Projekt wird die Tabellenreihenfolge lokal gepatcht, damit in Collections zuerst die inhaltlichen Spalten und danach der `Slug` erscheinen.

Relevant:

- `scripts/patch-keystatic-ui.mjs`
- `postinstall` in `package.json`

Nach `npm install` wird der Patch automatisch erneut angewendet.

Der Patch uebernimmt aktuell drei Aufgaben:

- Spaltenreihenfolge in Keystatic-Collections anpassen
- Astro-6-Env-Guard in `@keystatic/astro` absichern
- Keystatic-Seitenkopf fuer Titel und Favicon branden

Wichtig fuer Updates:

- `@keystatic/core` und `@keystatic/astro` sind bewusst auf feste Versionen gepinnt.
- Das Patch-Script bricht absichtlich mit Fehlermeldung ab, wenn Upstream-Dateien oder Versionen nicht mehr zu den erwarteten Zielstellen passen.

## SEO

Die Seite nutzt in `BaseLayout.astro` zentrale SEO-Basisdaten:

- `title`, `description`, `canonical`
- Open Graph und Twitter Cards
- `og:image:alt`
- JSON-LD fuer `Organization`, `WebSite`, `WebPage`
- `SearchAction` fuer die Referenzsuche unter `/projekte?q=...`

Ergaenzende strukturierte Daten:

- Referenzen: `BreadcrumbList` und `CreativeWork`
- Leistungen: `BreadcrumbList` und `Service`
- Jobs: `BreadcrumbList` und `JobPosting`
- Kontakt: `ContactPage`
- Team und Publikationen: `CollectionPage`

Technische SEO-Dateien:

- `src/pages/robots.txt.ts`
- `src/pages/sitemap.xml.ts`

## Page Transitions

Die Seite verwendet Astro View Transitions ueber `ClientRouter`.

Aktueller Stand:

- ruhige Aufloesungs-/Erscheinungs-Transition statt starkem Seitenschieben
- persistenter Hintergrund fuer weniger Flackern
- Theme-Umschaltung mit den Modi `Hell`, `Dunkel`, `System`

Nach Aenderungen an den Transitions immer pruefen:

- Home -> Referenzen
- Referenzen -> Detailseite
- Detailseite -> Home
- Light/Dark Toggle waehrend Navigation

## Redaktionshinweise fuer Referenzen

Fuer eine saubere Referenzseite sollten pro Eintrag mindestens gepflegt werden:

- `title`
- `details`
- `category`
- `year`
- `client`
- Beschreibungstext im Body

Optional, aber empfohlen:

- `heroImage`

Hinweise:

- Zeilenumbrueche aus dem Keystatic-Editor bleiben im Frontend auf Referenz-Detailseiten erhalten.
- Ohne Body-Inhalt wird keine Detailseite gebaut.
- Mit Body-Inhalt wird die Karte verlinkt und die Detailseite automatisch in die Sitemap aufgenommen.

## UI-Architektur

- Die groessere clientseitige UI-Logik liegt in `public/scripts/site-ui.js`.
- Die Referenzfilter- und Suchlogik auf `/projekte` liegt in `public/scripts/reference-filters.js`.
- Das Layout selbst enthaelt nur noch den fruehen Inline-Theme-Init fuer moeglichst wenig Flackern vor dem ersten Paint.
- Wenn Theme, Command Palette, Cookie-Consent oder Mobile Menu angepasst werden, zuerst `site-ui.js` pruefen und danach `npm run check` sowie `npm run build` ausfuehren.

## Wartung

- Wenn `@keystatic/core` aktualisiert wird, Keystatic-Collections und Spaltenreihenfolge pruefen.
- Vor jedem Deploy `npm run build` ausfuehren.
- Nach SEO-Aenderungen die generierten Dateien in `dist/` kurz gegenpruefen.
- Bei Navigationseffekten immer reale Browserwechsel testen, nicht nur den Build.
