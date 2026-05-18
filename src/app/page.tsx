import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import VideoCard from "@/components/VideoCard";
import { ArrowRight, Shield, Users, Video, Handshake, Star, CheckCircle } from "lucide-react";

export default async function HomePage() {
  const session = await getSession();

  const latestVideos = await prisma.video.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      talent: {
        select: { id: true, name: true, talentProfile: true, academyProfile: true },
      },
      _count: { select: { interests: true } },
    },
  });

  const [talentCount, clubAgentCount, videoCount, dealCount] = await Promise.all([
    prisma.user.count({ where: { role: "talent" } }),
    prisma.user.count({ where: { role: { in: ["club", "agent"] } } }),
    prisma.video.count(),
    prisma.deal.count({ where: { status: "completed" } }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-1.5 text-sm text-green-300 mb-6">
              <Shield size={14} />
              Secure Escrow Platform — No Direct Contact
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Where Football <span className="text-green-400">Talent</span> Meets{" "}
              <span className="text-green-400">Opportunity</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              Upload your highlight reels, get discovered by top clubs and agents worldwide.
              We act as your trusted escrow — no direct contact, just fair and transparent deals.
            </p>
            <div className="flex flex-wrap gap-4">
              {!session && (
                <>
                  <Link
                    href="/register?role=talent"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl transition-colors text-base"
                  >
                    I&apos;m a Talent <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/register?role=club"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3 rounded-xl transition-colors text-base"
                  >
                    I&apos;m a Club / Agent <ArrowRight size={18} />
                  </Link>
                </>
              )}
              <Link
                href="/talents"
                className="inline-flex items-center gap-2 border border-green-400 text-green-300 hover:bg-green-500/10 font-bold px-6 py-3 rounded-xl transition-colors text-base"
              >
                Browse Talents <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-green-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Registered Talents", value: talentCount.toLocaleString() },
              { label: "Clubs & Agents", value: clubAgentCount.toLocaleString() },
              { label: "Highlight Videos", value: videoCount.toLocaleString() },
              { label: "Deals Completed", value: dealCount.toLocaleString() },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold">{s.value}</div>
                <div className="text-green-100 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">How FootballScrow Works</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              A simple, secure three-step process that protects everyone involved.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold mb-6">
                <Users size={14} /> For Talents & Academies
              </div>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Register for Free", desc: "Create your profile as a talent or academy in minutes." },
                  { step: "02", title: "Upload Highlight Videos", desc: "Showcase your skills with match footage, training clips, or skill demos." },
                  { step: "03", title: "Get Discovered", desc: "Clubs and agents browse your profile. We handle all communication." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-gray-500 text-sm mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-6">
                <Shield size={14} /> For Clubs & Agents
              </div>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Register for Free", desc: "Create a verified club or agent profile at no cost." },
                  { step: "02", title: "Browse & Shortlist Talents", desc: "Filter by position, age, nationality and watch unlimited videos." },
                  { step: "03", title: "Request a Deal via Escrow", desc: "We act as the neutral party to negotiate and facilitate the deal safely." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-gray-500 text-sm mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Why Choose FootballScrow?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="text-green-600" size={28} />,
                title: "Fully Protected",
                desc: "No direct contact between any parties. All communication flows through our secure escrow system.",
              },
              {
                icon: <Video className="text-green-600" size={28} />,
                title: "Free Video Hosting",
                desc: "Upload unlimited highlight reels. No storage fees, no subscriptions, no hidden costs.",
              },
              {
                icon: <Handshake className="text-green-600" size={28} />,
                title: "Escrow Deal Handling",
                desc: "We negotiate on your behalf and ensure fair terms before any deal is finalised.",
              },
              {
                icon: <Star className="text-green-600" size={28} />,
                title: "Global Reach",
                desc: "Connect with clubs and agents from across the world in one centralised platform.",
              },
              {
                icon: <CheckCircle className="text-green-600" size={28} />,
                title: "Verified Profiles",
                desc: "All clubs and agents are verified before they can initiate deal requests.",
              },
              {
                icon: <Users className="text-green-600" size={28} />,
                title: "Academy Support",
                desc: "Academies can register and upload videos on behalf of their players.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Videos */}
      {latestVideos.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">Latest Talent Videos</h2>
                <p className="text-gray-500 mt-1">Discover rising stars from around the world</p>
              </div>
              <Link href="/talents" className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={{ ...video, createdAt: video.createdAt.toISOString() }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-green-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of talents and clubs on the platform trusted for secure, transparent football deals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-3 rounded-xl text-base transition-colors">
              Register for Free
            </Link>
            <Link href="/how-it-works" className="border border-white/30 hover:bg-white/10 text-white font-bold px-8 py-3 rounded-xl text-base transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
