"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import UserActions from "./UserActions";
import IdBadge from "./IdBadge";
import SearchInput from "./SearchInput";
import { toPersianDigits } from "@/lib/auth";
import { formatDate } from "./format";
import type { PublicUser } from "@/lib/db";

export default function UsersPanel({ customers, isAdmin }: { customers: PublicUser[]; isAdmin: boolean }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return customers;
    const qLower = q.toLowerCase();
    return customers.filter(
      (u) => u.name.toLowerCase().includes(qLower) || u.phone.includes(q) || toPersianDigits(u.phone).includes(q)
    );
  }, [customers, query]);

  if (customers.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-ink/[0.2] p-8 sm:p-14 text-center text-dim">
        به‌محض این‌که کسی تو /account ثبت‌نام کنه، همین‌جا با شماره‌ش نشون داده می‌شه.
      </div>
    );
  }

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="جستجو بر اساس نام یا شماره موبایل..." />

      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-6 sm:p-10 text-center text-dim">
          نتیجه‌ای برای این جستجو پیدا نشد.
        </div>
      ) : (
        <>
          {/* Card list — phones/tablets. A side-scrolling table is
              unusable with one thumb, so below the desktop breakpoint
              each user gets its own stacked card instead. */}
          <div className="flex flex-col gap-3 lg:hidden">
            {filtered.map((u) => (
              <div key={u.id} className="rounded-card border border-ink/[0.14] bg-surface/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[14.5px]">{u.name}</span>
                      <IdBadge id={u.id} />
                    </div>
                    <Link
                      href={`tel:${u.phone}`}
                      dir="ltr"
                      className="mt-1.5 inline-block font-mono text-[13px] text-dim hover:text-accent"
                    >
                      {toPersianDigits(u.phone)}
                    </Link>
                  </div>
                  <span className="whitespace-nowrap font-mono text-[11px] text-dim/70">
                    {formatDate(u.created_at)}
                  </span>
                </div>
                {isAdmin && (
                  <div className="mt-3 border-t border-ink/10 pt-3">
                    <UserActions id={u.id} name={u.name} phone={u.phone} role={u.role} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Table — desktop only. */}
          <div className="hidden overflow-x-auto rounded-card border border-ink/[0.14] lg:block">
            <table className="w-full min-w-[620px] border-collapse text-right text-[14px]">
              <thead>
                <tr className="bg-navy text-alabaster">
                  <th className="px-5 py-3.5 font-semibold">شناسه</th>
                  <th className="px-5 py-3.5 font-semibold">نام</th>
                  <th className="px-5 py-3.5 font-semibold">شماره موبایل</th>
                  <th className="px-5 py-3.5 font-semibold">تاریخ ثبت‌نام</th>
                  {isAdmin && <th className="px-5 py-3.5 font-semibold"></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} className={i % 2 === 0 ? "bg-surface/20" : "bg-canvas"}>
                    <td className="px-5 py-3.5">
                      <IdBadge id={u.id} />
                    </td>
                    <td className="px-5 py-3.5 font-semibold">{u.name}</td>
                    <td className="px-5 py-3.5 font-mono" dir="ltr">
                      <Link href={`tel:${u.phone}`} className="hover:text-accent">
                        {toPersianDigits(u.phone)}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-dim">{formatDate(u.created_at)}</td>
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        <UserActions id={u.id} name={u.name} phone={u.phone} role={u.role} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
