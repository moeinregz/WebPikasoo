"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createTaskAction, toggleTaskStatusAction, deleteTaskAction, type TaskFormState } from "./actions";

type TaskWithAssignee = {
  id: number;
  title: string;
  description: string;
  status: "open" | "done";
  created_at: string;
  done_at: string | null;
  assignee_name: string;
};

type OwnTask = {
  id: number;
  title: string;
  description: string;
  status: "open" | "done";
  created_at: string;
};

const inputClass =
  "w-full rounded-[10px] border border-ink/[0.16] bg-surface/40 px-4 py-3 text-[14.5px] text-ink placeholder:text-dim/60 outline-none transition focus:border-accent focus:bg-surface/70";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 rounded-full bg-accent px-6 py-3 text-[14.5px] font-semibold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? "در حال ثبت..." : "محول کردن تسک"}
    </button>
  );
}

const initialState: TaskFormState = null;

function AddTaskForm({ developers }: { developers: { id: number; name: string }[] }) {
  const [state, formAction] = useFormState(createTaskAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the fields after successfully assigning a task, so handing out
  // several tasks in a row doesn't leave the previous one's text sitting
  // in the form.
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mb-6 rounded-card border border-ink/[0.14] bg-surface/20 p-6">
      <h2 className="mb-4 font-display text-lg font-normal">تسک جدید</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="title" required placeholder="عنوان تسک" className={inputClass} />
        <select name="assignedTo" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            محول به...
          </option>
          {developers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          rows={3}
          placeholder="توضیحات تسک (اختیاری)"
          className={`${inputClass} resize-none sm:col-span-2`}
        />
      </div>
      {state && <p className={`mt-3 text-sm ${state.ok ? "text-accent" : "text-dim"}`}>{state.message}</p>}
      <SubmitButton />
    </form>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(d);
}

/** Admin view: create tasks + see every task with who it's assigned to. */
export function AdminTasksPanel({
  tasks,
  developers,
}: {
  tasks: TaskWithAssignee[];
  developers: { id: number; name: string }[];
}) {
  return (
    <div>
      <AddTaskForm developers={developers} />

      {tasks.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink/[0.2] p-14 text-center text-dim">
          هنوز تسکی محول نشده.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tasks.map((t) => (
            <article
              key={t.id}
              className={`rounded-card border p-6 ${
                t.status === "done" ? "border-accent/25 bg-accent/[0.05]" : "border-ink/[0.14] bg-surface/20"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className={`font-display text-lg font-normal ${t.status === "done" ? "line-through opacity-60" : ""}`}>
                    {t.title}
                  </h2>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[12px] text-dim">
                    <span>محول به: {t.assignee_name}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDate(t.created_at)}</span>
                  </div>
                </div>
                <span
                  className={`whitespace-nowrap rounded-md border px-3 py-1 font-mono text-xs ${
                    t.status === "done" ? "border-accent/30 bg-accent/10 text-accent" : "border-ink/[0.2] text-dim"
                  }`}
                >
                  {t.status === "done" ? "انجام‌شده" : "باز"}
                </span>
              </div>
              {t.description && <p className="mb-3 whitespace-pre-wrap text-[14px] text-ink/90">{t.description}</p>}
              <form action={deleteTaskAction}>
                <input type="hidden" name="taskId" value={t.id} />
                <button
                  type="submit"
                  className="rounded-full border border-red-500/30 px-4 py-1.5 text-[12.5px] font-semibold text-red-500/90 transition hover:bg-red-500/10"
                >
                  حذف تسک
                </button>
              </form>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCheckbox({ id, status }: { id: number; status: "open" | "done" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={status === "done" ? "برگردوندن به حالت باز" : "علامت‌زدن به‌عنوان انجام‌شده"}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition disabled:opacity-60 ${
        status === "done" ? "border-accent bg-accent text-black" : "border-ink/[0.3] text-transparent hover:border-accent"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-4 w-4">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </button>
  );
}

/** Developer view: their own assigned tasks with a checkbox to mark done. */
export function MyTasksPanel({ tasks }: { tasks: OwnTask[] }) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-ink/[0.2] p-14 text-center text-dim">
        فعلاً تسکی برات ثبت نشده.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((t) => (
        <article
          key={t.id}
          className={`flex items-start gap-4 rounded-card border p-5 ${
            t.status === "done" ? "border-accent/25 bg-accent/[0.05]" : "border-ink/[0.14] bg-surface/20"
          }`}
        >
          <form action={toggleTaskStatusAction} className="pt-0.5">
            <input type="hidden" name="taskId" value={t.id} />
            <input type="hidden" name="status" value={t.status === "done" ? "open" : "done"} />
            <TaskCheckbox id={t.id} status={t.status} />
          </form>
          <div className="min-w-0 flex-1">
            <h3 className={`font-display text-base font-normal ${t.status === "done" ? "line-through opacity-60" : ""}`}>
              {t.title}
            </h3>
            {t.description && <p className="mt-1 whitespace-pre-wrap text-[13.5px] text-dim">{t.description}</p>}
            <p className="mt-1.5 font-mono text-[11.5px] text-dim/70">{formatDate(t.created_at)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
