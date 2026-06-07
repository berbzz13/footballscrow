"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Trophy, LogOut, LayoutDashboard, MessageSquare } from "lucide-react";

interface NavbarProps {
  user?: { name: string; role: string; email: string } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread messages count if the user is allowed to use direct messages
  useEffect(() => {
    if (user && user.role !== "agent" && user.role !== "club") {
      fetch("/api/messages/unread")
        .then((r) => r.json())
        .then((d) => {
          if (d.unreadCount !== undefined) {
            setUnreadCount(d.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const dashboardHref =
    user?.role === "admin"
      ? "/admin"
      : user?.role
      ? `/dashboard/${user.role}`
      : "/login";

  // Check if user is allowed to see messages
  const canMessage = user && user.role !== "agent" && user.role !== "club";

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-green-500 p-1.5 rounded-lg">
              <Trophy size={20} className="text-white" />
            </div>
            <span>
              Football<span className="text-green-400">Scrow</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/talents" className="text-gray-300 hover:text-white text-sm transition-colors">
              Browse Talents
            </Link>
            <Link href="/how-it-works" className="text-gray-300 hover:text-white text-sm transition-colors">
              How It Works
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                {canMessage && (
                  <Link
                    href="/dashboard/messages"
                    className="relative flex items-center text-gray-300 hover:text-white transition-colors"
                    title="Messages"
                  >
                    <MessageSquare size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )}
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm transition-colors"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1.5 ml-2">
                  <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-200">{user.name.split(" ")[0]}</span>
                  <span className="text-xs text-green-400 capitalize bg-green-900/40 px-1.5 py-0.5 rounded">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 text-sm transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Register Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 px-4 py-4 space-y-3">
          <Link href="/talents" className="block text-gray-300 hover:text-white text-sm py-2">
            Browse Talents
          </Link>
          <Link href="/how-it-works" className="block text-gray-300 hover:text-white text-sm py-2">
            How It Works
          </Link>
          {user ? (
            <>
              {canMessage && (
                <Link href="/dashboard/messages" className="flex items-center justify-between text-gray-300 hover:text-white text-sm py-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} /> Messages
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </Link>
              )}
              <Link href={dashboardHref} className="flex items-center gap-2 text-gray-300 hover:text-white text-sm py-2">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm py-2 w-full"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-gray-300 hover:text-white text-sm py-2">
                Login
              </Link>
              <Link
                href="/register"
                className="block bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 rounded-lg font-semibold text-center"
              >
                Register Free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
