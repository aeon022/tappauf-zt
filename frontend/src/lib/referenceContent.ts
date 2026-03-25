export const hasReferenceContent = (body?: string | null) =>
  typeof body === 'string' && body.trim().length > 0;
