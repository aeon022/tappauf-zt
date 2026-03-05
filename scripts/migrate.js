// Dateipfad: migrate.mjs (im Root oder /scripts)
import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import path from 'path';

const xmlData = fs.readFileSync('../tappaufztgmbh.WordPress.2026-03-05.xml', 'utf-8');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
const jObj = parser.parse(xmlData);

const items = jObj.rss.channel.item;
const outputDir = './frontend/src/content/references';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Filter: Nur Post-Type "projekte" (laut XML 'projekte')
const projects = items.filter(item => item['wp:post_type'] === 'projekte' && item['wp:status'] === 'publish');

projects.forEach(project => {
  const title = project.title;
  const slug = project['wp:post_name'];
  const content = project['content:encoded'] || '';
  
  // Cleanup: Oxygen Shortcodes entfernen (Quick & Dirty)
  const cleanContent = content
    .replace(/\[\/?ct_.*?\]/g, '') // Entfernt [ct_section], [ct_inner_content] etc.
    .trim();

  const mdContent = `---
title: "${title}"
category: "industrie" # Standardwert, da XML-Kategorien oft komplex gemappt sind
year: 2024
client: "Wird nachgetragen"
---

${cleanContent}`;

  fs.writeFileSync(path.join(outputDir, `${slug}.mdoc`), mdContent);
  console.log(`✓ Migriert: ${title}`);
});

console.log(`\nFertig! ${projects.length} Projekte wurden nach ${outputDir} verschoben.`);