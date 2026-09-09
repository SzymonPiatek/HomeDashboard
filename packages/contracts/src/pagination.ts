import { z } from "zod";

/** Konwencja stronicowania dla całego API — .claude/rules/api.md. */
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// Limit powyżej MAX_PAGE_SIZE jest odrzucany (VALIDATION_FAILED), nigdy spełniany.
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  cursor: z.string().min(1).optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export function paginatedResponseSchema<ItemSchema extends z.ZodTypeAny>(itemSchema: ItemSchema) {
  return z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
  });
}

export type Paginated<Item> = { items: Item[]; nextCursor: string | null };
