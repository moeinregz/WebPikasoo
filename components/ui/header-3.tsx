"use client";

import React from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import {
  BarChart,
  BadgePercent,
  Building2,
  CodeIcon,
  GlobeIcon,
  Handshake,
  HelpCircle,
  LayersIcon,
  Leaf,
  type LucideIcon,
  Phone,
  ShoppingBag,
  Star,
  Tag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import ThemeToggle from "@/components/ThemeToggle";
import { logout } from "@/app/account/actions";

// Site header adapted from the "header-3" block: same structure and sizes
// (h-14 bar, h-9 menu triggers, h-10 buttons, two dropdowns with icon cards
// and a plain-link column, full-screen mobile menu), with this site's pages
// and Persian labels, RTL, theme tokens instead of shadcn's, and the logo
// instead of the block's wordmark. Turns translucent once the page scrolls.

type LinkItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

const serviceLinks: LinkItem[] = [
  { title: "طراحی سایت", href: "/website-design", description: "سایت حرفه‌ای، سریع و ریسپانسیو", icon: GlobeIcon },
  { title: "طراحی فروشگاه اینترنتی", href: "/store-design", description: "فروش آنلاین با درگاه و مدیریت موجودی", icon: ShoppingBag },
  { title: "طراحی سایت شرکتی", href: "/corporate-design", description: "معرفی حرفه‌ای شرکت و خدماتتون", icon: Building2 },
  { title: "طراحی سایت اختصاصی", href: "/custom-design", description: "کدنویسی دقیقاً مطابق نیاز شما", icon: CodeIcon },
  { title: "طراحی سایت وردپرس", href: "/wordpress-design", description: "سایت اقتصادی با مدیریت آسان", icon: LayersIcon },
  { title: "خدمات سئو", href: "/seo-services", description: "رتبه‌ی بهتر و بازدید بیشتر از گوگل", icon: BarChart },
];

const companyLinks: LinkItem[] = [
  { title: "درباره ما", href: "/about", description: "تیم و داستان وب پیکاسو", icon: Users },
  { title: "نمونه‌کارها", href: "/portfolio", description: "سایت‌هایی که برای مشتری‌ها ساختیم", icon: Star },
  { title: "شرکت طراحی سایت", href: "/design-company", description: "چطور با ما همکاری می‌کنید", icon: Handshake },
];

const companyLinks2: LinkItem[] = [
  { title: "قیمت طراحی سایت", href: "/website-price", icon: Tag },
  { title: "طراحی سایت ارزان", href: "/cheap-design", icon: BadgePercent },
  { title: "وبلاگ", href: "/blog", icon: Leaf },
  { title: "سوالات متداول", href: "/#faq", icon: HelpCircle },
  { title: "تماس با ما", href: "/contact", icon: Phone },
];

export function Header({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const accountHref = "/account";
  const accountLabel = isLoggedIn ? "حساب کاربری" : "ورود / ثبت‌نام";

  return (
    <header
      className={cn("sticky top-0 z-[100] w-full border-b border-transparent transition-colors", {
        "border-ink/10 bg-canvas/95 backdrop-blur-lg supports-[backdrop-filter]:bg-canvas/60": scrolled || open,
      })}
    >
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-5">
          <a href="/" className="flex items-center gap-2 rounded-md p-2 hover:bg-ink/[0.06]" aria-label="وب پیکاسو، صفحه‌ی اصلی">
            <span className="relative h-7 w-7 overflow-hidden rounded-md border border-ink/20">
              <Image src="/logo.webp" alt="" fill sizes="28px" className="object-cover" priority />
            </span>
            <span dir="ltr" className="font-mono text-[15px] font-black tracking-wide text-ink">
              WebPIKASO.
            </span>
          </a>
          <NavigationMenu dir="rtl" className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">خدمات</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-canvas p-1 pl-1.5">
                  <ul className="grid w-[32rem] grid-cols-2 gap-2 rounded-md border border-ink/10 bg-surface p-2 shadow">
                    {serviceLinks.map((item) => (
                      <li key={item.href}>
                        <ListItem {...item} />
                      </li>
                    ))}
                  </ul>
                  <div className="p-2">
                    <p className="text-sm text-dim">
                      دنبال سایت برای کسب‌وکارتی؟{" "}
                      <a href="/#lead-form" className="font-medium text-ink hover:underline">
                        مشاوره‌ی رایگان بگیر
                      </a>
                    </p>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">وب پیکاسو</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-canvas p-1 pb-1.5 pl-1.5">
                  <div className="grid w-[32rem] grid-cols-2 gap-2">
                    <ul className="space-y-2 rounded-md border border-ink/10 bg-surface p-2 shadow">
                      {companyLinks.map((item) => (
                        <li key={item.href}>
                          <ListItem {...item} />
                        </li>
                      ))}
                    </ul>
                    <ul className="space-y-2 p-3">
                      {companyLinks2.map((item) => (
                        <li key={item.href}>
                          <NavigationMenuLink href={item.href} className="flex flex-row items-center gap-x-2 rounded-md p-2 text-ink hover:bg-ink/[0.06]">
                            <item.icon className="size-4 text-ink" />
                            <span className="font-medium">{item.title}</span>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuLink className="px-4" asChild>
                <a href="/order" className="rounded-md p-2 text-sm font-medium text-ink hover:bg-ink/[0.06]">
                  تعرفه‌ها
                </a>
              </NavigationMenuLink>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {isLoggedIn && (
            <form action={logout}>
              <Button type="submit" variant="ghost" className="text-red-500 hover:bg-red-500/10 hover:text-red-500">
                خروج
              </Button>
            </form>
          )}
          <Button variant="outline" asChild>
            <a href={accountHref}>{accountLabel}</a>
          </Button>
          <Button asChild>
            <a href="/#lead-form">مشاوره رایگان</a>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="باز و بسته کردن منو"
          >
            <MenuToggleIcon open={open} className="size-5" duration={300} />
          </Button>
        </div>
      </nav>

      <MobileMenu open={open} onNavigate={() => setOpen(false)} className="flex flex-col justify-between gap-2 overflow-y-auto">
        <NavigationMenu dir="rtl" className="max-w-full">
          <div className="flex w-full flex-col gap-y-2">
            <span className="text-sm text-dim">خدمات</span>
            {serviceLinks.map((link) => (
              <ListItem key={link.href} {...link} />
            ))}
            <span className="text-sm text-dim">وب پیکاسو</span>
            {companyLinks.map((link) => (
              <ListItem key={link.href} {...link} />
            ))}
            {companyLinks2.map((link) => (
              <ListItem key={link.href} {...link} />
            ))}
          </div>
        </NavigationMenu>
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="w-full bg-transparent" asChild>
            <a href={accountHref}>{accountLabel}</a>
          </Button>
          <Button className="w-full" asChild>
            <a href="/#lead-form">مشاوره رایگان</a>
          </Button>
          {isLoggedIn && (
            <form action={logout}>
              <Button type="submit" variant="ghost" className="w-full text-red-500 hover:bg-red-500/10 hover:text-red-500">
                خروج از حساب
              </Button>
            </form>
          )}
        </div>
      </MobileMenu>
    </header>
  );
}

type MobileMenuProps = React.ComponentProps<"div"> & { open: boolean; onNavigate: () => void };

function MobileMenu({ open, onNavigate, children, className, ...props }: MobileMenuProps) {
  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div
      id="mobile-menu"
      className={cn(
        "bg-canvas/95 backdrop-blur-lg supports-[backdrop-filter]:bg-canvas/80",
        "fixed bottom-0 left-0 right-0 top-14 z-[99] flex flex-col overflow-hidden border-y border-ink/10 md:hidden"
      )}
      // close the menu after following a link (same-page anchors included)
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) onNavigate();
      }}
    >
      <div data-slot={open ? "open" : "closed"} className={cn("ease-out data-[slot=open]:animate-in data-[slot=open]:zoom-in-95", "size-full p-4", className)} {...props}>
        {children}
      </div>
    </div>,
    document.body
  );
}

function ListItem({ title, description, icon: Icon, className, href, ...props }: React.ComponentProps<typeof NavigationMenuLink> & LinkItem) {
  return (
    <NavigationMenuLink
      className={cn(
        "flex w-full flex-row gap-x-2 rounded-sm p-2 text-ink hover:bg-ink/[0.06] focus:bg-ink/[0.06] data-[active=true]:bg-ink/[0.04]",
        className
      )}
      {...props}
      asChild
    >
      <a href={href}>
        <div className="flex aspect-square size-12 items-center justify-center rounded-md border border-ink/10 bg-canvas/40 shadow-sm">
          <Icon className="size-5 text-ink" />
        </div>
        <div className="flex flex-col items-start justify-center">
          <span className="font-medium">{title}</span>
          {description && <span className="text-xs text-dim">{description}</span>}
        </div>
      </a>
    </NavigationMenuLink>
  );
}

function useScroll(threshold: number) {
  const [scrolled, setScrolled] = React.useState(false);

  const onScroll = React.useCallback(() => {
    setScrolled(window.scrollY > threshold);
  }, [threshold]);

  React.useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  React.useEffect(() => {
    onScroll();
  }, [onScroll]);

  return scrolled;
}
