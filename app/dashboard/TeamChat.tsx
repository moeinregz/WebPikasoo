"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { getTeamMessagesAction, sendTeamMessageAction, deleteTeamMessageAction } from "./actions";

type Message = {
  id: number;
  user_id: number;
  created_at: string;
  message: string;
  user_name: string;
  user_role: "customer" | "developer" | "admin";
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
};

const roleLabel: Record<Message["user_role"], string> = {
  admin: "ادمین",
  developer: "برنامه‌نویس",
  customer: "",
};

function formatTime(iso: string) {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(d);
}

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-bold text-black transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
    >
      ارسال
    </button>
  );
}

function Attachment({
  url,
  type,
  name,
}: {
  url: string;
  type: string | null;
  name: string | null;
}) {
  if (type?.startsWith("audio/")) {
    return (
      <audio controls src={url} className="mt-2 h-9 w-[230px] max-w-full">
        مرورگرت پخش صدا رو پشتیبانی نمی‌کنه.
      </audio>
    );
  }
  if (type?.startsWith("image/")) {
    return (
      <Link href={url} target="_blank" rel="noopener noreferrer" className="mt-2 block">
        <Image
          src={url}
          alt={name ?? "تصویر"}
          width={400}
          height={220}
          unoptimized
          style={{ width: "auto", height: "auto", maxHeight: 220, maxWidth: "100%" }}
          className="rounded-[10px]"
        />
      </Link>
    );
  }
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={name ?? undefined}
      className="mt-2 flex items-center gap-2 rounded-[10px] border border-current/20 bg-black/5 px-3 py-2 text-[12.5px] font-semibold underline"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" />
      </svg>
      <span className="truncate">{name || "دانلود فایل"}</span>
    </Link>
  );
}

/** Shared team chat for the WebPIKASO staff (admin + developer roles) —
 *  one room, not DMs. Polls every 4s for new messages since this project
 *  has no websocket/server-push infra; simple and good enough for an
 *  internal team-sized chat. Supports attaching a file or recording a
 *  short voice note alongside (or instead of) a text message. */
export default function TeamChat({
  initialMessages,
  currentUserId,
  isAdmin = false,
}: {
  initialMessages: Message[];
  currentUserId: number;
  /** Admins can delete anyone's message; everyone else only their own. */
  isAdmin?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const latest = await getTeamMessagesAction();
      setMessages(latest);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    };
  }, [pendingPreviewUrl]);

  function pickFile(file: File | null) {
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(file);
    setPendingPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    pickFile(file);
  }

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `پیام-صوتی-${Date.now()}.webm`, { type: "audio/webm" });
        pickFile(file);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError("دسترسی به میکروفون امکان‌پذیر نبود.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function handleSubmit(formData: FormData) {
    const value = (formData.get("message") ?? "").toString().trim();
    if (!value && !pendingFile) return;

    if (pendingFile) {
      formData.set("attachment", pendingFile);
    }

    setError("");
    setText("");
    const filePicked = pendingFile;
    pickFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const result = await sendTeamMessageAction(formData);
    if (result?.ok) {
      const latest = await getTeamMessagesAction();
      setMessages(latest);
    } else if (result?.message) {
      setError(result.message);
      if (filePicked) pickFile(filePicked);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    // Optimistic removal — the poller would eventually converge anyway,
    // but this makes the click feel instant.
    const prev = messages;
    setMessages((cur) => cur.filter((m) => m.id !== id));
    const fd = new FormData();
    fd.set("messageId", String(id));
    const result = await deleteTeamMessageAction(fd);
    if (!result?.ok) {
      setMessages(prev);
      setError(result?.message || "پیام حذف نشد.");
    }
    setDeletingId(null);
  }

  return (
    <div className="flex h-[50vh] w-full max-h-[560px] min-h-[280px] flex-col overflow-hidden rounded-card border border-ink/[0.14] sm:h-[70vh] sm:min-h-[380px]">
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-surface/20 p-3 sm:p-5">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-dim">
            هنوز پیامی رد و بدل نشده — اولین نفر باش.
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.user_id === currentUserId;
            const canDelete = isAdmin || isMe;
            return (
              <div key={m.id} className={`group flex ${isMe ? "justify-start" : "justify-end"}`}>
                <div
                  className={`relative max-w-[88%] rounded-card px-4 py-2.5 sm:max-w-[75%] ${
                    isMe ? "bg-accent text-black" : "border border-ink/[0.14] bg-canvas"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 font-mono text-[11px] opacity-70">
                    <span className="font-bold">{m.user_name}</span>
                    {roleLabel[m.user_role] && <span>· {roleLabel[m.user_role]}</span>}
                    <span>· {formatTime(m.created_at)}</span>
                  </div>
                  {m.message && <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{m.message}</p>}
                  {m.attachment_url && (
                    <Attachment url={m.attachment_url} type={m.attachment_type} name={m.attachment_name} />
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      disabled={deletingId === m.id}
                      title={isAdmin && !isMe ? "حذف پیام (ادمین)" : "حذف پیام"}
                      aria-label="حذف پیام"
                      className={`absolute -top-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-40 ${
                        isMe ? "-left-2 border-ink/[0.16] bg-canvas text-dim" : "-right-2 border-ink/[0.16] bg-canvas text-dim"
                      } hover:border-red-500 hover:text-red-500`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
                        <path d="M6 6l12 12M6 18L18 6" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form action={handleSubmit} className="flex flex-col gap-2 border-t border-ink/[0.14] bg-canvas p-3 sm:p-4">
        {pendingFile && (
          <div className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-[12.5px] text-accent">
            <span className="truncate">{pendingFile.name}</span>
            <button
              type="button"
              onClick={() => {
                pickFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="mr-auto text-dim hover:text-red-500"
              aria-label="حذف پیوست"
            >
              ✕
            </button>
          </div>
        )}
        {error && <p className="text-[12.5px] text-red-500">{error}</p>}

        <div className="flex items-center gap-1.5 sm:gap-2">
          <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" id="chat-file-input" />
          <label
            htmlFor="chat-file-input"
            title="پیوست فایل"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink/[0.16] text-dim transition hover:border-accent hover:text-accent sm:h-10 sm:w-10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[16px] w-[16px] sm:h-[17px] sm:w-[17px]">
              <path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          </label>

          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            title={recording ? "پایان ضبط" : "پیام صوتی"}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition sm:h-10 sm:w-10 ${
              recording
                ? "animate-pulse border-red-500 bg-red-500/10 text-red-500"
                : "border-ink/[0.16] text-dim hover:border-accent hover:text-accent"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[16px] w-[16px] sm:h-[17px] sm:w-[17px]">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
            </svg>
          </button>

          <input
            name="message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={recording ? "در حال ضبط..." : "پیامت رو بنویس..."}
            autoComplete="off"
            disabled={recording}
            className="w-0 min-w-0 flex-1 rounded-full border border-ink/[0.16] bg-surface/40 px-3.5 py-2.5 text-[14px] text-ink outline-none transition focus:border-accent disabled:opacity-60 sm:px-4"
          />
          <SendButton />
        </div>
      </form>
    </div>
  );
}
