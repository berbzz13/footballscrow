import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Video, MapPin, User as UserIcon, Calendar, Activity } from "lucide-react";

export default async function PublicTalentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch the talent, explicitly selecting only the safe data. 
  // Notice we are NOT fetching or passing the NIN to the frontend.
  const talent = await prisma.user.findUnique({
    where: { 
      id: id,
      role: "talent", // Ensure we are only looking at talents
    },
    include: {
      talentProfile: {
        select: {
          position: true,
          age: true,
          nationality: true,
          // We deliberately leave out 'nin' here so it never reaches the browser
        }
      },
      uploadedVideos: {
        orderBy: { createdAt: "desc" }
      }
    },
  });

  if (!talent) {
    notFound(); // Triggers a 404 if the user doesn't exist or isn't a talent
  }

  const profile = talent.talentProfile;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Back Button */}
      <div className="mb-8">
        <Link href="/dashboard/agent/browse" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-green-600 mb-4 transition">
          <ArrowLeft size={16} className="mr-1" /> Back to Browse
        </Link>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center border-4 border-white shadow-md shrink-0">
            <UserIcon className="text-green-600" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{talent.name}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 font-medium">
              <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-mono text-xs">
                ID: {talent.uniqueId}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Player Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Activity size={18} /></div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Position</p>
                  <p className="font-semibold text-gray-900 capitalize">{profile?.position || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Calendar size={18} /></div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Age</p>
                  <p className="font-semibold text-gray-900">{profile?.age ? `${profile.age} years old` : "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><MapPin size={18} /></div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Nationality</p>
                  <p className="font-semibold text-gray-900 capitalize">{profile?.nationality || "Not specified"}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons for the Agent */}
            <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition shadow-sm">
                Propose Deal
              </button>
              <button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2.5 rounded-xl transition">
                Add to Shortlist
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Highlight Videos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Video size={24} className="text-green-600" /> Highlight Reels ({talent.uploadedVideos.length})
            </h2>

            {talent.uploadedVideos.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Video size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No videos uploaded yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {talent.uploadedVideos.map((video: any) => (
                  <div key={video.id} className="group border border-gray-200 rounded-xl overflow-hidden hover:border-green-500 transition cursor-pointer bg-gray-50">
                    <div className="aspect-video bg-black relative">
                      {/* If you use actual video thumbnails later, put the <img> here */}
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Video size={32} className="text-white opacity-50 group-hover:opacity-100 transition" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 truncate">{video.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{video.description || "No description provided."}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
