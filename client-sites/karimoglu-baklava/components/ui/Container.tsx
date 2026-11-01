import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1280px] px-4 tablet:px-6 desktop:px-8 ${className}`}>
      {children}
    </div>
  );
}
