# Tappauf ZT: Website

Astro (statisch) mit **Lander** als Redaktion, wie psychiaterin-graz.at. Beides läuft auf einem normalen PHP-Webhost:

- **Website** = Ordner `frontend/dist/` (reine HTML/CSS/JS-Dateien), Wurzel der Domain
- **Redaktion** = Lander im Unterordner `/lander` derselben Domain: `https://www.tappauf-zt.at/lander/` (der Installer erkennt den Unterordner)

Ein **Hinweis** (z. B. Büro geschlossen) erscheint als Leiste mit Pop-up und greift sofort ohne Neubau: in Lander «Hinweis» oder «Urlaub / Schließzeit» öffnen, Titel/Text/Zeitraum eintragen, «Anzeigen» einschalten, veröffentlichen. Einrichten: `LANDER_USER=… LANDER_PASS=… node scripts/lander-hinweise.mjs <Lander-Adresse>` (im Inhalts-Paket schon enthalten).

Texte, Bilder, Team, Referenzen, Leistungen, Jobs, Partner und Publikationen (mit PDF) pflegt man in Lander. Die Seite liest beim Bauen die öffentliche Lese-API (`/api/public/…`). Nach Änderungen die Seite neu bauen und hochladen.

**Livegang:** Schritt für Schritt in [`docs/GOLIVE.md`](docs/GOLIVE.md).

## Bauen und hochladen

```bash
cd frontend
cp .env.example .env          # PUBLIC_LANDER_URL auf die Lander-Adresse setzen
npm ci
node scripts/build-live.mjs      # → frontend/dist/ (Lander muss erreichbar sein)
```

`dist/` komplett auf den Webhost laden (Wurzel der Domain). Lander muss beim Bauen erreichbar sein. Entwicklung: `npm run dev`.
Node ≥ 22.23.4.

## Lander einrichten (einmalig)

1. Lander-Release (`pakete/lander-0.6.0.zip`) entpacken und den Inhalt nach `/lander/` auf dem Webhost laden, dann `https://www.tappauf-zt.at/lander/public/install.php` öffnen (legt Konfiguration und ersten Admin an). Beim Hochladen der Website (`dist/`) den Ordner `lander/` nicht löschen.
2. Inhalte: Lokal mit `frontend/scripts/migrate-to-lander.mjs` aus den früheren Keystatic-Dateien (Git-Verlauf vor „Keystatic entfernt") übertragen und per *Einstellungen → Pod → Backup & Wiederherstellen* (ZIP mit Medien) auf dem Server einspielen.
3. Ab Lander 0.3.1 aktualisiert sich Lander per Klick (Einstellungen → Pod, ganz unten; der Knopf erscheint nur, wenn es eine neuere Version gibt).

## Sammlungen in Lander

`settings` (Kontakt, Firma), `home` (Startseite), `references`, `services`, `team`, `jobs`, `partners`, `publications`, `hinweis`, `urlaub`. Reihenfolge über das Feld «Sortierung».

## Verzeichnis

```
frontend/src/lib/content.ts      liest Lander (getCollection/getEntry), Markdown
frontend/src/components/ui/Img.astro   Bild aus Lander in passenden Größen
frontend/scripts/migrate-to-lander.mjs  einmalige Übernahme der alten Inhalte
frontend/scripts/lander-hinweise.mjs    richtet «Hinweis» und «Urlaub» in Lander ein
frontend/public/hinweis.js              holt den Hinweis zur Laufzeit
scripts/                         Altlast: WordPress-Import
```
