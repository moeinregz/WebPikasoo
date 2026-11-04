import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container empty">
      <div className="i">☕</div>
      <h1 className="display" style={{ fontSize: "2rem", color: "var(--head)" }}>این صفحه پیدا نشد</h1>
      <Link href="/" className="btn" style={{ marginTop: 14 }}>برگشت به خانه</Link>
    </div>
  );
}
