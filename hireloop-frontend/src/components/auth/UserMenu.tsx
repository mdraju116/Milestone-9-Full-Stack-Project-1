
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
import { ChevronDown, LogOut, User, UserRound } from "lucide-react";

type UserMenuProps = {
  onAction?: () => void;
};

// Responsive account menu: exposes auth actions and links to reader-only pages.
const UserMenu = ({ onAction }: UserMenuProps) => {
  const { data: session, isPending } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sign out using Better Auth client
  // Clear the Better Auth session before notifying the parent navigation state.
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);

      const { error } = await signOut();

      if (error) {
        toast.error("Could not sign out. Please try again.");
        return;
      }

      setIsDropdownOpen(false);
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <Spinner className="text-[#068a3f]" />
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // Check if user is logged in
  const user = session?.user;

  return (
    <div className="relative" ref={dropdownRef}>
      {user ? (
        <>
          {/* User avatar, name and dropdown trigger */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="menu"
            aria-label="Open user menu"
            className="flex items-center gap-2 rounded-full p-1 transition-colors outline-none hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-[#068a3f]/40 "
          >
            {/* Show real image or default user icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#068a3f]/10 text-[#068a3f]">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User profile"}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>

            <span className="max-w-28 truncate text-sm font-semibold text-white ">
              {user.name?.trim().split(/\s+/)[0] || "User"}
            </span>

            <ChevronDown
              className={`h-4 w-4 text-white transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Dropdown card */}
          {isDropdownOpen && (
            <div
              role="menu"
              aria-label="User menu"
              className="absolute top-full right-0 z-50 mt-2 w-68 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
            >
              {/* Header: avatar, full name and email */}
              <div className="flex items-center gap-2.5 bg-linear-to-br from-[#068a3f]/10 to-[#0e9aa7]/10 px-3 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[#068a3f] ring-2 ring-[#068a3f]/30">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User profile"}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <User />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {user.name || "User"}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 p-2">
                {/* See profile */}
                <Link
                  href="/profile-info"
                  role="menuitem"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onAction?.();
                  }}
                  className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-[#068a3f] px-2.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#057536]"
                >
                  <UserRound className="h-3.5 w-3.5" />
                  See Profile
                </Link>

                {/* Sign out */}
                <Button
                  type="button"
                  role="menuitem"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onAction?.();
                    handleSignOut();
                  }}
                  disabled={isSigningOut}
                  className="w-full justify-center gap-2 text-xs"
                >
                  {isSigningOut ? (
                    <Spinner className="h-3.5 w-3.5" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5" />
                  )}
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* After Signed-out buttons */
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            onClick={onAction}
            className="rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors text-[#a99fff] hover:bg-[#6252f5]/10 hover:text-white"
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            onClick={onAction}
            className="ml-2 rounded-xl bg-[#6252f5] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(98,82,245,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#7163ff]"
          >
            Sign Up
          </Link>
          

        </div>
      )}
    </div>
  );
};

export default UserMenu;
