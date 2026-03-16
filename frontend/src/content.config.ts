// Dateipfad: frontend/src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const orderedSchema = z.object({
  title: z.string(),
  order: z.number().default(0),
});

const references = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/references/entries' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    details: z.string(),
    category: z.enum(['hochbau', 'tiefbau', 'industrie', 'bruecken', 'sonderprojekte']).default('industrie'),
    year: z.union([z.number(), z.string()]).optional(),
    client: z.string().optional(),
    heroImage: image().optional(),
    order: z.number().default(0),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/team/entries' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    role: z.string(),
    qualification: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    image: image().optional(),
    order: z.number().default(0),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/services/entries' }),
  schema: ({ image }) => orderedSchema.extend({
    summary: z.string(),
    image: image().optional(),
    items: z.array(z.string()).default([]),
  }),
});

const home = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/home' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    heroEyebrow: z.string(),
    heroHeadline: z.string(),
    heroText: z.string(),
    heroImage: image().optional(),
    heroImageAlt: z.string().optional(),
    heroPrimaryLabel: z.string(),
    heroPrimaryHref: z.string(),
    heroSecondaryLabel: z.string(),
    heroSecondaryHref: z.string(),
    aboutTitle: z.string(),
    aboutText: z.string(),
    profileTitle: z.string(),
    profileHeadline: z.string(),
    approachTitle: z.string(),
    approachText: z.string(),
    insuranceTitle: z.string(),
    insuranceText: z.string(),
    partnersTitle: z.string(),
    partnersText: z.string(),
    publicationsTitle: z.string(),
    publicationsText: z.string(),
    referencesTitle: z.string(),
    referencesText: z.string(),
  }),
});

const settings = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/settings' }),
  schema: ({ image }) => z.object({
    siteTitle: z.string(),
    siteSubtitle: z.string(),
    logo: image().optional(),
    logoAlt: z.string().optional(),
    siteDescription: z.string(),
    metaDescription: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    googleMapsEmbed: z.string(),
    googleMapsLink: z.string(),
    companyDetails: z.string().optional(),
    facebook: z.string().optional(),
    x: z.string().optional(),
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    linkedin: z.string().optional(),
    youtube: z.string().optional(),
  }),
});

const jobs = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/jobs' }),
  schema: z.object({
    title: z.string(),
    order: z.number().default(0),
    status: z.enum(['aktiv', 'archiviert']).default('aktiv'),
    summary: z.string().optional(),
    location: z.string().optional(),
    workload: z.string().optional(),
    employmentType: z.string().optional(),
    applyEmail: z.string().email().optional(),
  }),
});

const partners = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/partners/entries' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    logo: image(),
    website: z.string().optional(),
    order: z.number().default(0),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/publications/entries' }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    citation: z.string(),
    pdfFile: z.string().optional(),
    pdfUrl: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = { references, team, services, jobs, partners, publications, home, settings };
