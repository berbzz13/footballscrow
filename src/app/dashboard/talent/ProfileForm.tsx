"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { POSITIONS } from "@/lib/utils";
import { CheckCircle, Lock } from "lucide-react";

interface ProfileFormProps {
  user: any;
  role: string;
}

export default function ProfileForm({ user, role }: ProfileFormProps) {
  const router = useRouter();
  const profile = user?.talentProfile || user?.academyProfile;

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [position, setPosition] = useState(profile?.position || "");
  const [nationality, setNationality] = useState(profile?.nationality || "");
  
  // Extract and format the date of birth for the input field
  const [dateOfBirth, setDateOfBirth] = useState(
    profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : ""
  );
  const [nin, setNin] = useState(profile?.nin || "");
  
  const [height, setHeight] = useState(profile?.height || "");
  const [preferredFoot, setPreferredFoot] = useState(profile?.preferredFoot || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);

    if (role === "talent") {
      formData.append("position", position);
      formData.append("nationality", nationality);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("nin", nin);
      formData.append("height", height);
      formData.append("preferredFoot", preferredFoot);
    } else if (role === "academy") {
      formData.append("location", location);
    }

    await fetch("/api/profile", { method: "PATCH", body: formData });
    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input label="Name" id="name" value={name} onChange={(e) => setName(e.target.value)} />

      {role === "talent" && (
        <>
          <Select
            label="Position"
            id="position"
            options={POSITIONS.map((p) => ({ value: p, label: p }))}
            placeholder="Select position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
          <Input label="Nationality" id="nationality" placeholder="e.g. Nigerian" value={nationality} onChange={(e) => setNationality(e.target.value)} />
          
          <div className="grid grid-cols-2 gap-2">
            <Input label="Date of Birth" id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            <Input label="Height (cm)" id="height" placeholder="e.g. 180cm" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Input label="NIN (National Identity Number)" id="nin" placeholder="Enter your 11-digit NIN" value={nin} onChange={(e) => setNin(e.target.value)} />
            <p className="text-[10px] text-gray-500 flex items-center gap-1">
              <Lock size={10} /> Securely stored for identity verification to prevent age falsification.
            </p>
          </div>

          <Select
            label="Preferred Foot"
            id="preferredFoot"
            options={[{ value: "Right", label: "Right" }, { value: "Left", label: "Left" }, { value: "Both", label: "Both" }]}
            placeholder="Select foot"
            value={preferredFoot}
            onChange={(e) => setPreferredFoot(e.target.value)}
          />
        </>
      )}

      {role === "academy" && (
        <Input label="Location" id="location" placeholder="City, Country" value={location} onChange={(e) => setLocation(e.target.value)} />
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          rows={4}
          placeholder="Tell clubs and agents about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      {success && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle size={16} /> Profile saved!
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        Save Profile
      </Button>
    </form>
  );
}

