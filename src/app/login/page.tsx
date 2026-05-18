"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        const role = data.user.role;
        const dest = role === "admin" ? "/admin" : `/dashboard/${role}`;
        router.push(dest);
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-600 rounded-2xl mb-4">
            <Trophy size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your FootballScrow account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-green-600 font-semibold hover:underline">
              Register for free
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Demo Admin Login:</strong>
          <br />
          Email: <code>admin@footballscrow.com</code>
          <br />
          Password: <code>admin123456</code>
        </div>
      </div>
    </div>
  );
}
