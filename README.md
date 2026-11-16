# Tappauf ZT: Website

Astro (statisch) mit **Lander** als Redaktion, wie psychiaterin-graz.at. Beides läuft auf einem normalen PHP-Webhost:

- **Website** = Ordner `frontend/dist/` (reine HTML/CSS/JS-Dateien), Wurzel der Domain
- **Redaktion** = Lander, z. B. unter `https://redaktion.tappauf-zt.at` (eigene Subdomain, Document Root = `public/` von Lander)

Texte, Bilder, Team, Referenzen, Leistungen, Jobs, Partner und Publikationen (mit PDF) pflegt man in Lander. Die Seite liest beim Bauen die öffentliche Lese-API (`/api/public/…`). Nach Änderungen die Seite neu bauen und hochladen.

## Bauen und hochladen

```bash
cd frontend
cp .env.example .env          # PUBLIC_LANDER_URL auf die Lander-Adresse setzen
npm ci
npm run build                 # → frontend/dist/
```

`dist/` komplett auf den Webhost laden (Wurzel der Domain). Lander muss beim Bauen erreichbar sein. Entwicklung: `npm run dev`.
Node ≥ 22.23.4.

## Lander einrichten (einmalig)

1. Lander (aktuelles Release von github.com/aeon022/lander) auf die Subdomain laden, `lander.config.php` anlegen (`public_origins` = Website-Domain, `media_url` = volle URL), `data/` und `public/media/` beschreibbar machen.
2. Inhalte: Lokal mit `frontend/scripts/migrate-to-lander.mjs` aus den früheren Keystatic-Dateien (Git-Verlauf vor „Keystatic entfernt") übertragen und per *Einstellungen → Pod → Backup & Wiederherstellen* (ZIP mit Medien) auf dem Server einspielen.
3. Ab Lander 0.3.1 aktualisiert sich Lander per Klick (Einstellungen → Pod, ganz unten; der Knopf erscheint nur, wenn es eine neuere Version gibt).

## Sammlungen in Lander

`settings` (Kontakt, Firma), `home` (Startseite), `references`, `services`, `team`, `jobs`, `partners`, `publications`. Reihenfolge über das Feld «Sortierung».

## Verzeichnis

```
frontend/src/lib/content.ts      liest Lander (getCollection/getEntry), Markdown
frontend/src/components/ui/Img.astro   Bild aus Lander in passenden Größen
frontend/scripts/migrate-to-lander.mjs  einmalige Übernahme der alten Inhalte
scripts/                         Altlast: WordPress-Import
```
