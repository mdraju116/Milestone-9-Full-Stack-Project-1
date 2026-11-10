'use client';

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import UserMenu from "../auth/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";
import Image from "next/image";

const navlinks = [
    { label: "Browse Jobs", link: "/jobs" },
    { label: "Company", link: "/company" },
    { label: "Pricing", link: "/pricing" },
] as const;

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (link: string) =>
        link === "/" ? pathname === "/" : pathname === link || pathname.startsWith(`${link}/`);


    return (
        <header className="relative  z-10 bg-[#18191b] ">
            <nav
                aria-label="Main navigation"
                className="mx-auto mt-3 flex min-h-18  max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-[#202022]/95  shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl px-4 sm:px-5 lg:px-8"
            >
                <Link href="/" aria-label="Hireloop home" className="shrink-0">
                    <Image
                        src="/assets/images/logo.png"
                        alt="HireLoop"
                        width={150}
                        height={40}
                        priority
                    />
                </Link>

                <div className="hidden items-center gap-1 md:flex">
                    {navlinks.map((navlink) => (
                        <Link
                            key={navlink.link}
                            href={navlink.link}
                            aria-current={isActive(navlink.link) ? "page" : undefined}
                            className={`rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${isActive(navlink.link)
                                ? "bg-white/10 text-white"
                                : "text-white/65 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            {navlink.label}
                        </Link>
                    ))}

                    <span aria-hidden="true" className="mx-3 h-6 w-px bg-white/15" />

                    <div className="flex shrink-0 items-center gap-3">
                        <UserMenu />
                        <ThemeToggle />
                    </div>
                </div>


                {/* humbarger */}
                <button
                    type="button"
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((open) => !open)}
                    className="rounded-xl border border-white/10 p-2.5 text-white transition-colors hover:bg-white/10 md:hidden"
                >
                    {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </nav>

            {/* mobile menus with active link */}
            {isMenuOpen && (
                <div className="absolute inset-x-4 top-full mt-2 rounded-2xl border border-white/10 bg-[#202022] p-3 shadow-2xl md:hidden">
                    <div className="flex flex-col gap-1">
                        {navlinks.map((navlink) => (
                            <Link
                                key={navlink.link}
                                href={navlink.link}
                                aria-current={isActive(navlink.link) ? "page" : undefined}
                                onClick={() => setIsMenuOpen(false)}
                                className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive(navlink.link)
                                        ? "bg-white/10 text-white"
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                {navlink.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 px-4 pt-3">
                        <UserMenu onAction={() => setIsMenuOpen(false)} />
                        <ThemeToggle onAction={() => setIsMenuOpen(false)} />
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
