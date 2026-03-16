// Dateipfad: scripts/fetch-assets.js
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const XML_FILE = 'tappaufztgmbh.WordPress.2026-03-05.xml';
const xmlPath = path.join(rootDir, XML_FILE);
const assetDir = path.join(rootDir, 'frontend/src/assets/references');

if (!fs.existsSync(assetDir)) fs.mkdirSync(assetDir, { recursive: true });

const xmlData = fs.readFileSync(xmlPath, 'utf-8');
const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
const jObj = parser.parse(xmlData);
const items = jObj?.rss?.channel?.item || [];

console.log('🖼️  Starte Asset-Download...');

async function downloadImage(url, filename) {
    const dest = path.join(assetDir, filename);
    if (fs.existsSync(dest)) return; // Skip if exists

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(dest, Buffer.from(buffer));
        console.log(`  + Downloaded: ${filename}`);
    } catch (err) {
        console.error(`  - Error downloading ${url}: ${err.message}`);
    }
}

// Map, um herauszufinden welches Bild zu welchem Projekt gehört (via post_id)
const attachments = items.filter(item => item.post_type === 'attachment');

for (const img of attachments) {
    const url = img.attachment_url || img.guid;
    if (!url) continue;

    // Wir nehmen den Original-Dateinamen
    const filename = path.basename(url);
    
    // Download starten
    await downloadImage(url, filename);
}

console.log('\n✅ Alle verfügbaren Assets wurden heruntergeladen.');