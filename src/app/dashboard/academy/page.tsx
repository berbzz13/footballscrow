"use client";

import { useState, useEffect } from "react";
 HEAD
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Player = {
  id: string;
  uniqueId: string;
  name: string;
  position: string | null;
  age: number | null;
  videos: any[];
};

export default function AcademyDashboard() {
  const router = useRouter();

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
type Player = {
  id: string;
  uniqueId: string;
  name: string;
  position: string | null;
  age: number | null;
  videos: any[];
};

export default function AcademyDashboard() {
>>>>>>> 3e524e80d3fd72c0bd33c359df7df292b7119489
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    age: "",
    position: "",
    nationality: "",
  });

  // Fetch players on load
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await fetch("/api/academy/players");
      if (!res.ok) throw new Error("Failed to load roster");
      const data = await res.json();
      setPlayers(data.players || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setError("");

    try {
      const res = await fetch("/api/academy/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlayer),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add player");
      }

      // Reset form and refresh list
      setNewPlayer({ name: "", age: "", position: "", nationality: "" });
      fetchPlayers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading roster...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Academy Roster</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Add Player Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Add New Player</h2>
        <form onSubmit={handleAddPlayer} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Real Name *</label>
            <Input
              required
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Age</label>
            <Input
              type="number"
              value={newPlayer.age}
              onChange={(e) => setNewPlayer({ ...newPlayer, age: e.target.value })}
              placeholder="e.g. 18"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Position</label>
            <Input
              value={newPlayer.position}
              onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
              placeholder="e.g. Striker"
            />
          </div>
          <Button type="submit" loading={isAdding} className="w-full h-10">
            Add Player
          </Button>
        </form>
      </div>

      {/* Player List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            No players added yet. Add your first talent above.
          </div>
        ) : (
          players.map((player) => (
            <div key={player.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{player.name}</h3>
                  <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-mono rounded">
                    ID: {player.uniqueId}
                  </span>
                </div>
              </div>
 HEAD


              
 3e524e80d3fd72c0bd33c359df7df292b7119489
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium text-gray-900">Age:</span> {player.age || "N/A"}</p>
                <p><span className="font-medium text-gray-900">Position:</span> {player.position || "N/A"}</p>
                <p><span className="font-medium text-gray-900">Videos:</span> {player.videos?.length || 0} uploaded</p>
              </div>

              <div className="mt-6 pt-4 border-t">
 HEAD
                {/* BUTTON IS NOW CLICKABLE AND ROUTES TO PLAYER'S PAGE */}
                <Button 
                  onClick={() => router.push(`/dashboard/academy/player/${player.id}`)}
                  variant="outline" 
                  className="w-full text-sm"
                >

                <Button variant="outline" className="w-full text-sm">
 3e524e80d3fd72c0bd33c359df7df292b7119489
                  Manage Videos & Profile
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
