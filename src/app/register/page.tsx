"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trophy, Users, Building2, UserCheck, GraduationCap } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const ROLES = [
  {
    id: "talent",
    label: "Football Talent",
    desc: "I'm a player looking to get discovered",
    icon: <Trophy size={24} className="text-green-600" />,
    color: "border-green-200 bg-green-50 hover:border-green-400",
    selectedColor: "border-green-500 bg-green-50 ring-2 ring-green-400",
  },
  {
    id: "academy",
    label: "Football Academy",
    desc: "I represent an academy and want to showcase our players",
    icon: <GraduationCap size={24} className="text-purple-600" />,
    color: "border-purple-200 bg-purple-50 hover:border-purple-400",
    selectedColor: "border-purple-500 bg-purple-50 ring-2 ring-purple-400",
  },
  {
    id: "club",
    label: "Football Club",
    desc: "I'm a club looking to recruit talent",
    icon: <Building2 size={24} className="text-blue-600" />,
    color: "border-blue-200 bg-blue-50 hover:border-blue-400",
    selectedColor: "border-blue-500 bg-blue-50 ring-2 ring-blue-400",
  },
  {
    id: "agent",
    label: "Football Agent",
    desc: "I'm a licensed agent scouting talent",
    icon: <UserCheck size={24} className="text-orange-600" />,
    color: "border-orange-200 bg-orange-50 hover:border-orange-400",
    selectedColor: "border-orange-500 bg-orange-50 ring-2 ring-orange-400",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "";

  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) { setError("Please select your role"); return; }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        router.push(`/dashboard/${role}`);
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-6">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Create Your Free Account</h1>
          <p className="text-gray-500 mt-2">No credit card required. Start in minutes.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Role Selection */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              I am joining as...
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    role === r.id ? r.selectedColor : r.color
                  }`}
                >
                  <div className="mb-2">{r.icon}</div>
                  <div className="font-semibold text-gray-900 text-sm">{r.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name / Organisation Name"
              id="name"
              type="text"
              placeholder="e.g. John Doe or FC United"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
            </Button>

            <p className="text-xs text-center text-gray-500">
              By registering, you agree to our{" "}
              <a href="#" className="text-green-600 hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-green-600 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
