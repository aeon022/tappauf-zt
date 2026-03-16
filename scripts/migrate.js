// Dateipfad: scripts/migrate.js
import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

const XML_FILE = 'tappaufztgmbh.WordPress.2026-03-05.xml';
const rootDir = process.cwd();
const xmlPath = path.join(rootDir, XML_FILE);
const baseContentDir = path.join(rootDir, 'frontend/src/content');

const xmlData = fs.readFileSync(xmlPath, 'utf-8');
const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
const jObj = parser.parse(xmlData);
const items = jObj.rss.channel.item;

// Clean Start
['services', 'team', 'references', 'publications', 'jobs', 'partners'].forEach(dir => {
    const p = path.join(baseContentDir, dir);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true });
    fs.mkdirSync(p, { recursive: true });
});

console.log('🏗️  Starte strukturelle Migration...');

items.forEach(item => {
    const slug = String(item.post_name || '');
    if (slug !== 'home') return; // Wir analysieren primär die Startseite

    const content = String(item.postmeta?.find(m => m.meta_key === '_ct_builder_shortcodes')?.meta_value || '');
    
    // Wir suchen Headlines und den darauf folgenden Text
    const headlineRegex = /\[ct_headline.*?\](.*?)\[\/ct_headline\]/gi;
    let match;
    
    while ((match = headlineRegex.exec(content)) !== null) {
        const title = match[1].trim();
        const snippet = content.substring(match.index, match.index + 1200); // Kontext ziehen
        const cleanBody = snippet.replace(/\[\/?ct_.*?\]/g, '').replace(/<[^>]*>?/gm, '').trim();
        
        let targetDir = '';
        let type = '';

        // Intelligentes Mapping basierend auf Keywords
        const t = title.toLowerCase();
        if (t.includes('di ') || t.includes('ernst') || t.includes('clemens') || t.includes('monika') || t.includes('christoph')) {
            targetDir = 'team'; type = 'TEAM';
        } else if (t.includes('brücke') || t.includes('flughafen') || t.includes('museum') || t.includes('ertüchtigung')) {
            targetDir = 'references'; type = 'REF';
        } else if (t.includes('bau') || t.includes('statik') || t.includes('planung') || t.includes('gutachten')) {
            targetDir = 'services'; type = 'SERVICE';
        } else if (t.includes('offen') || t.includes('stelle') || t.includes('gesucht')) {
            targetDir = 'jobs'; type = 'JOB';
        } else if (t.includes('publikation') || t.includes('vortrag')) {
            targetDir = 'publications'; type = 'PUB';
        }

        if (targetDir && title.length > 3) {
            const fileName = title.toLowerCase().replace(/[^a-z0-0]/g, '-').substring(0, 30) + '.mdoc';
            const fileContent = `---
title: ${JSON.stringify(title)}
order: 0
---

${cleanBody.substring(0, 500)}...`; // Teaser
            
            fs.writeFileSync(path.join(baseContentDir, targetDir, fileName), fileContent);
            console.log(`  [${type}] -> ${title}`);
        }
    }
});

console.log('\n✅ Migration abgeschlossen. Daten sind in ihren jeweiligen Ordnern.');