import type { ReactNode } from "react";

export default function Section({
  id,
  title,
  sub,
  alt,
  children,
}: {
  id: string;
  title: string;
  sub?: string;
  alt?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className={alt ? "alt" : undefined}>
      <div className="wrap">
        <h2>{title}</h2>
        <div className="line" />
        {sub && <p className="sub">{sub}</p>}
        {children}
      </div>
    </section>
  );
}
