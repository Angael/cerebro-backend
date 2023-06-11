// zod validation
import z from 'zod';

// Technically max length is like 191 or something, but I don't want to deal with that right now
export const tagsZod = z.array(z.string().min(1).max(30));
