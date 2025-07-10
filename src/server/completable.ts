import type { ZodType } from "zod/v4";

// A unique identifier placed on the underlying Zod schema definition so we can
// later detect that a schema supports autocompletion.
export enum McpZodTypeKind {
  Completable = "McpCompletable",
}

export type CompleteCallback<T extends ZodType = ZodType> = (
  value: T["_input"],
  context?: {
    arguments?: Record<string, string>;
  },
) => T["_input"][] | Promise<T["_input"][]>;

/**
 * Extra metadata we attach to the underlying Zod schema definition when it is
 * wrapped with `completable()`. Nothing here is used by Zod itself – it is
 * solely consumed by our own runtime logic.
 */
export interface CompletableDef<T extends ZodType = ZodType> {
  typeName: McpZodTypeKind.Completable;
  complete: CompleteCallback<T>;
}

/**
 * Marker class so `instanceof Completable` continues to work without modifying
 * the prototype chain of the original Zod schema. We rely on a custom
 * `Symbol.hasInstance` implementation that checks for the presence of our
 * `McpCompletable` discriminator on the schema definition.
 */
export class Completable {
  static [Symbol.hasInstance](value: unknown): boolean {
    return (
      typeof value === "object" &&
      value !== null &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignoreAccess to _def is fine here – it's present on all schemas
      !!(value as any)._def &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignoreSame as above
      (value as any)._def.typeName === McpZodTypeKind.Completable
    );
  }
}

/**
 * Wraps a Zod schema with autocompletion capabilities. The returned object is
 * *exactly* the same schema instance that was provided – we simply augment its
 * internal definition with our completion metadata. This means all normal Zod
 * behaviour (parsing, cloning, transformations, etc.) continues to work.
 */
export function completable<T extends ZodType>(
  schema: T,
  complete: CompleteCallback<T>,
): T & { _def: T["_def"] & CompletableDef<T> } {
  const def: any = (schema as unknown as { _def: Record<string, unknown>; def?: Record<string, unknown> })._def;

  // Preserve existing definition fields while injecting our own.
  const newDef = {
    ...def,
    typeName: McpZodTypeKind.Completable,
    complete,
  } as T["_def"] & CompletableDef<T>;

  // Assign back to both `def` and the (deprecated) `_def` alias so that older
  // code which still relies on `_def` continues to work.
  (schema as any)._def = newDef;
  (schema as any).def = newDef;

  return schema as T & { _def: T["_def"] & CompletableDef<T> };
}
