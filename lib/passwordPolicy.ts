// Password policy for new accounts — shared, framework-agnostic rules
// used both server-side (app/account/actions.ts, for the real
// authoritative check) and client-side (PasswordStrengthMeter, for live
// feedback while the person is typing).
//
// Deliberately has zero imports: it must be safe to bundle into the
// browser as-is (no Node built-ins like `crypto`), unlike lib/auth.ts.

export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRequirement = {
  key: string;
  /** Shown next to the checkmark in the signup form. */
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    key: "length",
    label: `حداقل ${PASSWORD_MIN_LENGTH} کاراکتر`,
    test: (p) => p.length >= PASSWORD_MIN_LENGTH,
  },
  {
    key: "lower",
    label: "یک حرف کوچک انگلیسی (a-z)",
    test: (p) => /[a-z]/.test(p),
  },
  {
    key: "upper",
    label: "یک حرف بزرگ انگلیسی (A-Z)",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    key: "digit",
    label: "یک عدد (0-9)",
    test: (p) => /[0-9]/.test(p),
  },
  {
    key: "special",
    label: "یک کاراکتر خاص (!@#$%^&*...)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

/** True only when every requirement above passes. This is the
 *  authoritative check — always re-run server-side, never trust the
 *  client-side meter alone. */
export function isStrongPassword(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every((r) => r.test(password));
}

/** Labels of the requirements a password is still missing — used to
 *  build a specific, helpful server-side error message instead of a
 *  generic "رمز عبور ضعیفه". */
export function missingPasswordRequirements(password: string): string[] {
  return PASSWORD_REQUIREMENTS.filter((r) => !r.test(password)).map((r) => r.label);
}
