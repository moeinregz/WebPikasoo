"use client";
import { useFormState, useFormStatus } from "react-dom";
import type { AState } from "./actions";

export function Submit({ children, className = "btn" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending}>
      {pending ? "در حال انجام…" : children}
    </button>
  );
}

export function ConfirmButton({ children, message = "مطمئنی؟", className = "btn danger sm" }: { children: React.ReactNode; message?: string; className?: string }) {
  return (
    <button
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

/** فرم با پیام موفق/خطا (برای اکشن‌هایی که AState برمی‌گردونن) */
export function StateForm({
  action,
  children,
  className = "stack",
  encType,
}: {
  action: (s: AState, fd: FormData) => Promise<AState>;
  children: React.ReactNode;
  className?: string;
  encType?: string;
}) {
  const [st, act] = useFormState<AState, FormData>(action, {});
  return (
    <form action={act} className={className} encType={encType}>
      {children}
      {st.error && <div className="alert bad">{st.error}</div>}
      {st.ok && <div className="alert ok">{st.ok}</div>}
    </form>
  );
}
