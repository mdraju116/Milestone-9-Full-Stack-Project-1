'use client';

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="relative z-10 mx-auto mt-5 w-[calc(100%-2rem)] max-w-[1172px]">
            <nav
                aria-label="Main navigation"
                className="flex min-h-[66px] items-center justify-between rounded-2xl border border-white/[0.02] bg-[#202022] px-5 shadow-[0_14px_35px_rgba(0,0,0,0.18)] sm:px-6 lg:px-[22px]"
            >
                <Link href="/" aria-label="Hireloop home" className="shrink-0">
                    <span className="text-[35px] font-extrabold leading-none tracking-[-2.5px] text-transparent bg-linear-to-r from-[#1596ff] via-[#0878e7] to-[#1873d9] bg-clip-text">
                        hire<span className="relative inline-block text-[#f47721]">l<span className="text-[#ff8a18]">o</span>op</span>
                    </span>
                </Link>

                <div className="hidden items-center gap-9 md:flex">
                    <Link href="#jobs" className="text-sm text-[#f3f3f3] transition-colors hover:text-[#8b7bff]">
                        Browse Jobs
                    </Link>
                    <Link href="#company" className="text-sm text-[#f3f3f3] transition-colors hover:text-[#8b7bff]">
                        Company
                    </Link>
                    <Link href="#pricing" className="text-sm text-[#f3f3f3] transition-colors hover:text-[#8b7bff]">
                        Pricing
                    </Link>
                    <span aria-hidden="true" className="h-6 w-px bg-white/20" />
                    <Link href="#sign-in" className="text-base text-[#7564ff] transition-colors hover:text-[#a197ff]">
                        Sign In
                    </Link>
                    <Link
                        href="#get-started"
                        className="rounded-xl bg-[#6252f5] px-5 py-3 text-base font-medium text-white shadow-[0_5px_15px_rgba(98,82,245,0.25)] transition-colors hover:bg-[#7163ff]"
                    >
                        Get Started
                    </Link>
                </div>

                <button
                    type="button"
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((open) => !open)}
                    className="rounded-lg p-2 text-white transition-colors hover:bg-white/10 md:hidden"
                >
                    {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </nav>

            {isMenuOpen && (
                <div className="absolute right-0 left-0 top-[74px] rounded-2xl border border-white/10 bg-[#202022] p-4 shadow-2xl md:hidden">
                    <div className="flex flex-col gap-1">
                        {[
                            ["Browse Jobs", "#jobs"],
                            ["Company", "#company"],
                            ["Pricing", "#pricing"],
                            ["Sign In", "#sign-in"],
                        ].map(([label, href]) => (
                            <Link
                                key={label}
                                href={href}
                                onClick={() => setIsMenuOpen(false)}
                                className="rounded-lg px-3 py-3 text-sm text-white transition-colors hover:bg-white/10"
                            >
                                {label}
                            </Link>
                        ))}
                        <Link href="#get-started" onClick={() => setIsMenuOpen(false)} className="mt-2 rounded-xl bg-[#6252f5] px-4 py-3 text-center text-sm font-medium text-white">
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
