"use client";

import { PASSWORD_REQUIREMENTS } from "@/lib/passwordPolicy";

/** Lives under the signup form's password field. A segmented bar (one
 *  segment per rule) fills green left-to-right as more rules pass, plus a
 *  checklist underneath so the person can see exactly what's still
 *  missing — e.g. "still needs a special character". Purely visual; the
 *  real check is server-side in app/account/actions.ts (signup). */
export default function PasswordStrengthMeter({ password }: { password: string }) {
  const results = PASSWORD_REQUIREMENTS.map((r) => ({ ...r, passed: r.test(password) }));
  const passedCount = results.filter((r) => r.passed).length;

  // Before the person has typed anything, don't show a bar full of red —
  // just wait for the first keystroke.
  if (password.length === 0) return null;

  const barColor =
    passedCount === results.length
      ? "bg-emerald-500"
      : passedCount >= Math.ceil(results.length / 2)
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="mt-2.5">
      <div className="flex gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={results.length} aria-valuenow={passedCount}>
        {results.map((r) => (
          <span
            key={r.key}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              r.passed ? barColor : "bg-ink/10"
            }`}
          />
        ))}
      </div>

      <ul className="mt-2.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {results.map((r) => (
          <li
            key={r.key}
            className={`flex items-center gap-1.5 text-[12px] transition-colors ${
              r.passed ? "text-emerald-600" : "text-dim"
            }`}
          >
            <span
              className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                r.passed ? "border-emerald-500 bg-emerald-500 text-white" : "border-ink/20 text-transparent"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-2 w-2">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
