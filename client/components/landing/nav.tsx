"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const links = [
  { label: "Browse", href: "#" },
  { label: "Categories", href: "#" },
  { label: "Instructors", href: "#" },
  { label: "About", href: "#" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b shadow-xs"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <span className="text-lg font-semibold tracking-tight">Relay</span>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="hidden sm:inline-flex h-8 items-center rounded-lg px-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-8 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors duration-200"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
