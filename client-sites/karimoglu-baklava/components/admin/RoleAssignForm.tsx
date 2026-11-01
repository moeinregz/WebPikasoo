"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { branches } from "@/lib/mock-data";
import { ROLE_LABELS, type Role } from "@/lib/auth/rolesData";

export function RoleAssignForm({
  userId,
  currentRole,
  currentBranchId,
}: {
  userId: string;
  currentRole: Exclude<Role, "system"> | null;
  currentBranchId: string | null;
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role | "none">(currentRole ?? "none");
  const [branchId, setBranchId] = useState(currentBranchId ?? branches[0]?.id ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!window.confirm("سطح دسترسی این کاربر تغییر کند؟")) return;
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
        body: JSON.stringify({ role: role === "none" ? null : role, branchId: role === "branch_manager" ? branchId : null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "خطا در ذخیره‌سازی.");
        return;
      }
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("ارتباط با سرور برقرار نشد.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <select value={role} onChange={(e) => setRole(e.target.value as Role | "none")} className="rounded-md border border-border-strong px-2 py-1 text-caption">
        <option value="none">بدون نقش (مشتری عادی)</option>
        {(Object.keys(ROLE_LABELS) as Exclude<Role, "system">[]).map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      {role === "branch_manager" && (
        <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="rounded-md border border-border-strong px-2 py-1 text-caption">
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      )}
      <button type="submit" disabled={status === "saving"} className="rounded-md bg-brand-black px-3 py-1 text-caption text-white disabled:opacity-50">
        {status === "saving" ? "..." : "اعمال"}
      </button>
      {message && <span className="text-caption text-state-error">{message}</span>}
    </form>
  );
}
