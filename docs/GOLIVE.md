# Livegang tappauf-zt.at

Alles Nötige liegt lokal in `pakete/` (nicht im Git): `lander-0.6.1.zip`, `tappauf-lander-inhalte.zip` (Texte, Bilder, PDF, Gruppen, Hinweis-Felder), `tappauf-website.zip` (fertige Seite, auf `https://www.tappauf-zt.at/lander` eingestellt), `ZUGANG.txt` (Lander-Login).

## 0 · Voraussetzungen am Webhost
PHP 8.1 oder neuer mit `pdo_sqlite`, `zip`, `sodium` und **`gd`** (ohne `gd` liefert Lander Bilder nur in Originalgröße, die Seite wird dann langsam). Apache mit `mod_rewrite` und `AllowOverride All`. Upload-Grenze ab 20 MB für das Inhalts-Paket (sonst Weg über FTP, siehe Schritt 3).

## 1 · Lander auf `/lander/`
1. `lander-0.6.1.zip` entpacken, den Inhalt in den Ordner `lander/` der Domain hochladen (neben der Website, nicht darin verschachteln).
2. `https://www.tappauf-zt.at/lander/install.php` öffnen, Benutzer und Passwort wählen. Der Installer schreibt die Konfiguration und löscht sich danach.
3. Anmelden unter `https://www.tappauf-zt.at/lander/login.html`.

## 2 · Inhalte einspielen
*Einstellungen → Pod → Backup & Wiederherstellen* → `tappauf-lander-inhalte.zip` wählen. Das spielt Texte, Bilder (41), das PDF, die Gruppen im Dock sowie die Felder «Hinweis» und «Urlaub» ein. Danach ist man abgemeldet: anmelden mit `tappauf` und dem Passwort aus `ZUGANG.txt`, **Passwort sofort ändern**, `ZUGANG.txt` löschen.
Zu groß für den Upload? Datei entpacken: `data/content.pod` nach `lander/data/`, den Ordner `public/media/` nach `lander/public/media/` (per FTP), dann in Lander einmal *Einstellungen → Pod* öffnen.

## 3 · Website hochladen
Inhalt von `tappauf-website.zip` in die Wurzel der Domain (den Ordner `lander/` dabei **nicht** löschen oder überschreiben). Die `.htaccess` ist enthalten: Fehlerseite, Weiterleitungen der alten WordPress-Adressen (`/referenzen/`, `/about-us/`, `/privacy-policy/`, …), Cache-Regeln.

## 4 · Prüfen
- Startseite, Referenzen (Filter), Team, Jobs, Kontakt; `/lander/` erreichbar, `/lander/data/` und `/lander/src/` **nicht** (403/404).
- Bilder laden (Netzwerk-Tab: `…/lander/api/public/media/…?w=…` mit `image/webp`).
- Hinweis testen: in Lander «Hinweis» → «Anzeigen» + Pop-up, veröffentlichen, Seite neu laden. Danach wieder ausschalten.
- Domain **ohne** `www`: Landet sie auf `www`? Sonst in `lander.config.php` bei `public_origins` `https://tappauf-zt.at` ergänzen oder in der `.htaccess` auf `www` weiterleiten.

## 5 · Danach pflegen
- Hinweise ändern sich sofort. Alle anderen Inhalte (Texte, Referenzen, Jobs, Team …) werden beim Bauen eingelesen: Seite neu bauen und hochladen:
  `cd frontend && cp .env.example .env && npm ci && node scripts/build-live.mjs` (Lander muss online sein), dann `dist/` hochladen.
- Lander aktualisiert sich per Klick (*Einstellungen → Pod*, ganz unten, nur wenn eine neuere Version da ist).
- Sicherung: *Einstellungen → Pod → Backup* (mit Medien) regelmäßig herunterladen.

## Offen vor dem Livegang (nicht von mir erfindbar)
- **Impressum:** enthält Name, Adresse, E-Mail, Telefon, Firmenbuchnummer (FN 600142 m) und UID (ATU 79188549). Diese zwei Nummern stehen fest in der Seitenvorlage (`frontend/src/pages/impressum/index.astro`), nicht in Lander. Von Tappauf bestätigen lassen; falls gewünscht, außerdem Unternehmensgegenstand, Kammer/Berufsrecht und Aufsichtsbehörde ergänzen (Rechtsberatung klären, ich erfinde hier nichts).
- **Kontaktdaten** von Tappauf bestätigen lassen (E-Mail, Telefonnummern im Team).
- **Logo** als Vektor (SVG), derzeit 369 px breit.
- **Fotos** in hoher Auflösung (Hero ab 1920 px, Projekte ab 1600 px, Team einheitlich); viele Referenzen haben kein Foto.
- Google Maps wird erst nach Zustimmung geladen (Datenschutz-Text prüfen, ob er das abdeckt).
