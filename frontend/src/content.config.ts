// Dateipfad: frontend/src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Wiederverwendbare Schemas
const baseSchema = z.object({
  title: z.string(),
  order: z.number().optional().default(0),
});

const references = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/references' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['hochbau', 'tiefbau', 'industrie', 'bruecken', 'gutachten']).default('industrie'),
    year: z.union([z.number(), z.string()]).optional(),
    client: z.string().optional(),
    heroImage: z.string().optional(),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/team' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    email: z.string().email().optional(),
    image: z.string().optional(),
    order: z.number().default(0),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/services' }),
  schema: baseSchema,
});

const jobs = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/jobs' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['aktiv', 'archiviert']).default('aktiv'),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    year: z.number().optional(),
  }),
});

export const collections = { references, team, services, jobs, publications };