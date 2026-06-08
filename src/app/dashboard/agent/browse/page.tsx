import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, User, PlayCircle, MapPin } from "lucide-react";

export default async function BrowseTalentsPage() {
  // Fetch all users who have the role "talent"
  // We also include their profile and their videos so we can show stats
  const talents = await prisma.user.findMany({
    where: {
      role: "talent"
    },
    include: {
      talentProfile: true,
      uploadedVideos: true,
    },
    orderBy: {
      createdAt: "desc" // Show newest talents first
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Browse Talents</h1>
        <p className="text-gray-500 mt-2">Discover independent players looking for their next big opportunity.</p>
      </div>

      {/* Optional: Add a search bar here later! */}
      <div className="mb-8 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Search by name or position..."
            disabled // Disabled for now until you want to build the search API!
          />
        </div>
      </div>

      {/* Talent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {talents.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No talents found</h3>
            <p className="mt-1 text-gray-500">No one has registered as a talent yet!</p>
          </div>
        ) : (
          talents.map((talent) => (
            <div key={talent.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{talent.name}</h3>
                    <p className="text-sm font-mono text-green-600 font-semibold mt-1">ID: {talent.uniqueId}</p>
                  </div>
                  {/* Placeholder Profile Picture */}
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                    <User className="text-gray-400" size={24} />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-bold w-20">Position:</span>
                    <span className="capitalize">{talent.talentProfile?.position || "Not specified"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-bold w-20">Age:</span>
                    <span>{talent.talentProfile?.age || "Not specified"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-bold w-20">Country:</span>
                    <span className="capitalize flex items-center gap-1">
                      <MapPin size={14} />
                      {talent.talentProfile?.nationality || "Not specified"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <PlayCircle size={16} className="text-blue-500" />
                  <span className="font-medium text-gray-700">{talent.uploadedVideos?.length || 0}</span> Highlight Videos
                </div>
              </div>

              <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                <Link
                  href={`/talent/${talent.id}`}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition"
                >
                  View Full Profile
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
