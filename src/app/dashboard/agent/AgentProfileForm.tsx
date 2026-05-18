"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { CheckCircle } from "lucide-react";

export default function AgentProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const profile = user?.agentProfile;

  const [name, setName] = useState(user?.name || "");
  const [agency, setAgency] = useState(profile?.agency || "");
  const [licenseNumber, setLicenseNumber] = useState(profile?.licenseNumber || "");
  const [country, setCountry] = useState(profile?.country || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("agency", agency);
    formData.append("licenseNumber", licenseNumber);
    formData.append("country", country);
    formData.append("bio", bio);
    await fetch("/api/profile", { method: "PATCH", body: formData });
    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input label="Full Name" id="name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Agency" id="agency" placeholder="Agency name" value={agency} onChange={(e) => setAgency(e.target.value)} />
      <Input label="License Number" id="licenseNumber" placeholder="FIFA license number" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
      <Input label="Country" id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>
      {success && <div className="flex items-center gap-2 text-green-600 text-sm"><CheckCircle size={16} /> Saved!</div>}
      <Button type="submit" loading={loading} className="w-full">Save Profile</Button>
    </form>
  );
}
