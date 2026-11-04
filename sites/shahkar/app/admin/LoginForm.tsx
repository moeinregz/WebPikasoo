"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="adm-login">
      <h1>ورود به پنل شاهکار</h1>
      <label>
        رمز عبور
        <input type="password" name="password" required autoFocus autoComplete="current-password" />
      </label>
      {state?.error && <p className="adm-error">{state.error}</p>}
      <button className="btn btn-gold" disabled={pending}>
        {pending ? "در حال ورود…" : "ورود"}
      </button>
    </form>
  );
}
