'use client';

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const navlinks = [
    { label: "Browse Jobs", link: "/jobs" },
    { label: "Company", link: "/company" },
    { label: "Pricing", link: "/pricing" },
    { label: "Sign In", link: "/sign-in" },
    { label: "Get Started", link: "/sign-up" },
] as const;

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (link: string) =>
        link === "/" ? pathname === "/" : pathname === link || pathname.startsWith(`${link}/`);


    return (
        <header className="relative z-10 bg-[#18191b] ">
            <nav
                aria-label="Main navigation"
                className="flex min-h-18 mt-3 mx-auto  w-[calc(100%-2rem)] max-w-293 items-center justify-between rounded-2xl border border-white/10 bg-[#202022]/95 px-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-5 lg:px-6"
            >
                <Link href="/" aria-label="Hireloop home" className="shrink-0">
                    <span className="text-[35px] font-extrabold leading-none tracking-[-2.5px] text-transparent bg-linear-to-r from-[#1596ff] via-[#0878e7] to-[#1873d9] bg-clip-text">
                        hire<span className="relative inline-block text-[#f47721]">l<span className="text-[#0878e7]">o</span>op</span>
                    </span>
                </Link>

                <div className="hidden items-center gap-1 md:flex">

                    {/* before the | */}
                    {navlinks.slice(0, 3).map((navlink) => (
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

                    {/* after the | */}
                    {navlinks.slice(3).map((navlink) => (
                        <Link
                            key={navlink.link}
                            href={navlink.link}
                            aria-current={isActive(navlink.link) ? "page" : undefined}
                            className={navlink.link === "/sign-up"
                                ? "ml-2 rounded-xl bg-[#6252f5] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(98,82,245,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#7163ff]"
                                : `rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors ${isActive(navlink.link)
                                    ? "text-[#a99fff]"
                                    : "text-[#a99fff] hover:bg-[#6252f5]/10 hover:text-white"
                                }`}
                        >
                            {navlink.label}
                        </Link>
                    ))}
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
                <div className="absolute right-0 left-0 top-21 rounded-2xl border border-white/10 bg-[#202022] p-3 shadow-2xl md:hidden">
                    <div className="flex flex-col gap-1">
                        {navlinks.map((navlink) => (
                            <Link
                                key={navlink.link}
                                href={navlink.link}
                                aria-current={isActive(navlink.link) ? "page" : undefined}
                                onClick={() => setIsMenuOpen(false)}
                                className={navlink.link === "/sign-up"
                                    ? "mt-2 rounded-xl bg-[#6252f5] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_8px_20px_rgba(98,82,245,0.25)]"
                                    : `rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive(navlink.link)
                                        ? "bg-white/10 text-white"
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                {navlink.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
