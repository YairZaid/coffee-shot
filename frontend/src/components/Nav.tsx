"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home", icon: "M4 11l8-7 8 7v9h-5v-6H9v6H4z" },
  {
    href: "/history",
    label: "History",
    icon: "M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01",
  },
  { href: "/insights", label: "Insights", icon: "M5 20V11M12 20V4M19 20v-6" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      <nav
        aria-label="Main"
        className="hidden w-[232px] shrink-0 flex-col gap-1 border-r border-border bg-surface py-[22px] px-3.5 md:flex"
      >
        <div className="flex items-center gap-2.5 px-2.5 pb-[22px]">
          <span className="text-sm font-semibold">Coffee Shot Intelligence</span>
        </div>
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-[46px] items-center gap-3 rounded-[10px] px-3 text-sm ${
                active ? "bg-soft font-semibold text-text" : "text-text-muted"
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={link.icon} />
              </svg>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 grid h-[72px] grid-cols-3 border-t border-border bg-surface px-2 pb-1.5 md:hidden"
      >
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-[3px] text-xs ${
                active ? "font-semibold text-text" : "text-text-muted"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${active ? "bg-primary" : "bg-transparent"}`}
              />
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={link.icon} />
              </svg>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
