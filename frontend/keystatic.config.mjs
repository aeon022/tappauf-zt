// Dateipfad: frontend/keystatic.config.ts
import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },
  collections: {
    references: collection({
      label: 'Referenzen (Projekte)',
      slugField: 'title',
      path: 'src/content/references/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Projekt Titel' } }),
        category: fields.select({
          label: 'Kategorie',
          options: [
            { label: 'Hochbau', value: 'hochbau' },
            { label: 'Tiefbau', value: 'tiefbau' },
            { label: 'Industriebau', value: 'industrie' },
            { label: 'Brückenbau', value: 'bruecken' },
            { label: 'Gutachten', value: 'gutachten' },
          ],
          defaultValue: 'industrie',
        }),
        year: fields.text({ label: 'Jahr (z.B. 2024)' }),
        client: fields.text({ label: 'Auftraggeber' }),
        heroImage: fields.image({
          label: 'Hauptbild',
          directory: 'src/assets/references',
          publicPath: '../../assets/references/',
        }),
        content: fields.markdoc({ label: 'Beschreibung' }),
      },
    }),
    services: collection({
      label: 'Leistungen',
      slugField: 'title',
      path: 'src/content/services/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Leistung Name' } }),
        order: fields.integer({ label: 'Sortierung', defaultValue: 0 }),
        content: fields.markdoc({ label: 'Detaillierte Beschreibung' }),
      },
    }),
    team: collection({
      label: 'Team',
      slugField: 'name',
      path: 'src/content/team/*',
      schema: {
        name: fields.slug({ name: { label: 'Vollständiger Name' } }),
        role: fields.text({ label: 'Position / Rolle' }),
        email: fields.text({ label: 'E-Mail Adresse' }),
        image: fields.image({
          label: 'Porträtfoto',
          directory: 'src/assets/team',
          publicPath: '../../assets/team/',
        }),
        order: fields.integer({ label: 'Sortierung', defaultValue: 0 }),
      },
    }),
    jobs: collection({
      label: 'Jobs',
      slugField: 'title',
      path: 'src/content/jobs/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Stellentitel' } }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Aktiv', value: 'aktiv' },
            { label: 'Archiviert', value: 'archiviert' },
          ],
          defaultValue: 'aktiv',
        }),
        content: fields.markdoc({ label: 'Job-Beschreibung' }),
      },
    }),
    publications: collection({
      label: 'Publikationen',
      slugField: 'title',
      path: 'src/content/publications/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Titel der Publikation' } }),
        year: fields.integer({ label: 'Jahr' }),
        content: fields.markdoc({ label: 'Kurzfassung / Info' }),
      },
    }),
  },
});