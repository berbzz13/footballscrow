"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Unified State for all registration fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "talent", // default
    phoneNumber: "",
    dateOfBirth: "",
    nin: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <Input label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <Input label="Password" type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          <Input label="Phone Number" type="tel" required value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />

          <div className="space-y-2">
            <label className="text-sm font-medium">Account Role</label>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              options={[
                { value: "talent", label: "Talent" },
                { value: "academy", label: "Academy" },
                { value: "club", label: "Club" },
                { value: "agent", label: "Agent" },
              ]}
            />
          </div>

          {/* Conditional Fields for Talent */}
          {formData.role === "talent" && (
            <>
              <Input label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
              <Input label="NIN (National Identity Number)" value={formData.nin} onChange={(e) => setFormData({...formData, nin: e.target.value})} />
            </>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Register
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-green-600 font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}
