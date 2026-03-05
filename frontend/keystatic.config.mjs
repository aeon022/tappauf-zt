// Dateipfad: frontend/keystatic.config.ts
import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    references: collection({
      label: 'Referenzen',
      slugField: 'title',
      path: 'src/content/references/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Titel' } }),
        category: fields.select({
          label: 'Kategorie',
          options: [
            { label: 'Architektonische Bauwerke', value: 'architektur' },
            { label: 'Brücken', value: 'bruecken' },
            { label: 'Industriebauten', value: 'industrie' },
          ],
          defaultValue: 'industrie',
        }),
        year: fields.integer({ label: 'Jahr', validation: { min: 1990, max: 2030 } }),
        client: fields.text({ label: 'Auftraggeber' }),
        heroImage: fields.image({
          label: 'Hauptbild',
          directory: 'src/assets/references',
          publicPath: '../../assets/references/',
        }),
        content: fields.markdoc({ 
          label: 'Projektbeschreibung',
          description: 'Hier landen die bereinigten Texte aus der XML'
        }),
      },
    }),
    team: collection({
      label: 'Team',
      slugField: 'name',
      path: 'src/content/team/*',
      schema: {
        name: fields.slug({ name: { label: 'Vollständiger Name' } }),
        role: fields.text({ label: 'Position / Titel' }),
        email: fields.text({ label: 'E-Mail' }),
        image: fields.image({
          label: 'Porträtfoto',
          directory: 'src/assets/team',
          publicPath: '../../assets/team/',
        }),
      },
    }),
    partners: collection({
      label: 'Partner & Software',
      slugField: 'name',
      path: 'src/content/partners/*',
      schema: {
        name: fields.slug({ name: { label: 'Firmenname' } }),
        logo: fields.image({
          label: 'Logo (SVG bevorzugt)',
          directory: 'src/assets/logos',
          publicPath: '../../assets/logos/',
        }),
        type: fields.select({
          label: 'Typ',
          options: [
            { label: 'Kunde', value: 'kunde' },
            { label: 'Partner', value: 'partner' },
            { label: 'Software', value: 'software' },
          ],
          defaultValue: 'partner',
        }),
      },
    }),
  },
});