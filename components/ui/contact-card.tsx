import React from "react";
import { PlusIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Contact card container from the "contact-card" block (21st.dev): a
// bordered card with plus marks on its corners, the heading, description
// and contact details on one side and the form in a tinted column on the
// other. Theme tokens instead of shadcn's, RTL (the form column sits on
// the left, so its divider is a start border), blood-red icon chips.

type ContactInfoProps = React.ComponentProps<"div"> & {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
};

type ContactCardProps = React.ComponentProps<"div"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  contactInfo?: ContactInfoProps[];
  formSectionClassName?: string;
};

export function ContactCard({
  title,
  description,
  contactInfo,
  className,
  formSectionClassName,
  children,
  ...props
}: ContactCardProps) {
  return (
    <div
      className={cn(
        "relative grid h-full w-full border border-ink/15 bg-surface/60 shadow md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      {...props}
    >
      <PlusIcon className="absolute -left-3 -top-3 h-6 w-6 text-blood-hi" />
      <PlusIcon className="absolute -right-3 -top-3 h-6 w-6 text-blood-hi" />
      <PlusIcon className="absolute -bottom-3 -left-3 h-6 w-6 text-blood-hi" />
      <PlusIcon className="absolute -bottom-3 -right-3 h-6 w-6 text-blood-hi" />
      <div className="flex flex-col justify-between lg:col-span-2">
        <div className="relative flex h-full flex-col justify-center space-y-4 px-4 py-8 md:p-8">
          <h2 className="font-display text-3xl font-normal leading-[1.35] md:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="max-w-xl text-sm leading-7 text-dim md:text-base lg:text-lg">
            {description}
          </p>
          {contactInfo && contactInfo.length > 0 && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:gap-4 lg:grid-cols-3">
              {contactInfo?.map((info, index) => (
                <ContactInfo key={index} {...info} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        className={cn(
          "flex h-full w-full items-center border-t border-ink/15 bg-canvas/40 p-5 md:col-span-1 md:border-s md:border-t-0",
          formSectionClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

function ContactInfo({
  icon: Icon,
  label,
  value,
  href,
  className,
  ...props
}: ContactInfoProps) {
  const body = (
    <>
      <div className="flex-shrink-0 rounded-lg border border-blood-hi/25 bg-blood/[0.12] p-2.5 text-blood-hi sm:p-3">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[13.5px] font-medium text-ink sm:text-base">
          {label}
        </p>
        <p className="text-xs text-dim [overflow-wrap:anywhere]">{value}</p>
      </div>
    </>
  );
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2.5 py-2 sm:gap-3 sm:py-3",
        className,
      )}
      {...props}
    >
      {href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="flex min-w-0 items-center gap-3 transition hover:opacity-80"
        >
          {body}
        </a>
      ) : (
        body
      )}
    </div>
  );
}
