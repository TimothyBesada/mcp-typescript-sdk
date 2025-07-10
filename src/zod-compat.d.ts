import type { ZodType } from "zod/v4";

declare module "zod/v4" {
  /**
   * Zod v3 exposed a handy alias `ZodTypeAny` that mapped to `ZodType<any, any, any>`.
   * It was removed in v4, but a lot of our code still depends on it. We recreate
   * the alias here via module augmentation so upgrading does not require any
   * widespread refactoring.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ZodTypeAny = ZodType<any, any, any>;

  /**
   * `ZodTypeDef` represented the internal schema definition type in v3. In v4
   * the public type was removed, but we only ever use it for typing generics –
   * the exact shape is irrelevant for those use-cases. We therefore expose it
   * as the `_def` property of a generic `ZodType`.
   */
  export type ZodTypeDef = ZodTypeAny extends { _def: infer D } ? D : never;

  /**
   * v3 exposed `AnyZodObject` as an alias for a Zod object with an arbitrary
   * shape. We recreate it here so existing imports keep working.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type AnyZodObject = ZodObject<Record<string, any>, any>;
} 