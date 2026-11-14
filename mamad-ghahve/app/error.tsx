"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center", fontFamily: "Vazirmatn, Tahoma, sans-serif" }}>
      <div>
        <div style={{ fontSize: "3rem" }}>☕</div>
        <h1 style={{ fontSize: "1.5rem", margin: "8px 0" }}>یه مشکلی پیش اومد</h1>
        <p style={{ opacity: 0.8 }}>لطفاً چند لحظه بعد دوباره امتحان کن.</p>
        {error.digest && <p style={{ opacity: 0.6, fontSize: ".8rem", direction: "ltr" }}>code: {error.digest}</p>}
        <button onClick={reset} style={{ marginTop: 14, padding: "10px 22px", borderRadius: 99, border: 0, background: "#d6a650", color: "#23140a", fontWeight: 700, cursor: "pointer" }}>
          تلاش دوباره
        </button>
      </div>
    </div>
  );
}
