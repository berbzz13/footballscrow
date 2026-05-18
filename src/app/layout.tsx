import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getSession } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FootballScrow – Where Talent Meets Opportunity",
  description:
    "The trusted escrow platform connecting football talents, academies, clubs and agents. Upload your highlight reel and get discovered.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navbar user={session ? { name: session.name, role: session.role, email: session.email } : null} />
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-900 text-gray-400 py-10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
                  <span className="text-green-400">⚽</span>
                  Football<span className="text-green-400">Scrow</span>
                </div>
                <p className="text-sm leading-relaxed">
                  The secure escrow platform bridging football talents and professional clubs.
                  We protect all parties and facilitate fair, transparent deals.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/talents" className="hover:text-white transition-colors">Browse Talents</a></li>
                  <li><a href="/how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="/register" className="hover:text-white transition-colors">Register Free</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs">
              © {new Date().getFullYear()} FootballScrow. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
