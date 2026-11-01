import { z } from "zod";

/** Select-friendly optional enum: empty string becomes undefined */
export function optionalEnum<T extends readonly [string, ...string[]]>(
  values: T,
) {
  return z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.enum(values).optional(),
  );
}

/** Select/number-input friendly optional int: "" becomes undefined */
export function optionalInt(min: number, max: number) {
  return z.preprocess(
    (v) => (v === "" || v === null ? undefined : Number(v)),
    z
      .number()
      .int()
      .min(min)
      .max(max)
      .optional(),
  );
}

export const emailSchema = z.string().trim().min(1, "Email is required").email("Enter a valid email");

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(50, "At most 50 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/\d/, "Include a number")
  .refine(
    (v) => !/(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(v),
    "Avoid sequences like \"123\" or \"abc\"",
  )
  .refine((v) => !/(.)\1\1/.test(v), "Avoid 3+ repeated characters");
