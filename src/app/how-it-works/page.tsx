import Link from "next/link";
import { Shield, Upload, Search, Handshake, CheckCircle, ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">How FootballScrow Works</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          A transparent, secure platform where talent meets opportunity — with us as your trusted escrow.
        </p>
      </div>

      {/* Core Principle */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-8 mb-16 text-center">
        <Shield size={48} className="mx-auto mb-4 text-green-200" />
        <h2 className="text-2xl font-bold mb-3">The Escrow Principle</h2>
        <p className="text-green-100 text-lg leading-relaxed max-w-2xl mx-auto">
          FootballScrow acts as a neutral third party between talents and clubs/agents.
          <strong className="text-white"> No direct contact is ever permitted.</strong> All communication,
          negotiations, and deal facilitation happen through our secure platform.
        </p>
      </div>

      {/* For Talents */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold">T</div>
          <h2 className="text-2xl font-bold text-gray-900">For Talents & Academies</h2>
        </div>
        <div className="space-y-6">
          {[
            {
              icon: <CheckCircle size={24} className="text-green-600" />,
              title: "1. Register for Free",
              desc: "Create your account as a talent or academy. No fees, no subscriptions. Complete your profile with your position, nationality, age, and biography.",
            },
            {
              icon: <Upload size={24} className="text-green-600" />,
              title: "2. Upload Your Highlights",
              desc: "Upload video clips showcasing your skills — match footage, training sessions, skill demonstrations. Add a title, description, and tags to help scouts find you.",
            },
            {
              icon: <Search size={24} className="text-green-600" />,
              title: "3. Get Discovered",
              desc: "Clubs and agents from around the world browse talent videos. They can shortlist you and request a deal through our escrow system.",
            },
            {
              icon: <Handshake size={24} className="text-green-600" />,
              title: "4. FootballScrow Facilitates",
              desc: "When a club or agent is interested, FootballScrow mediates all negotiations. You'll receive updates and our team ensures fair terms on your behalf.",
            },
          ].map((step) => (
            <div key={step.title} className="flex gap-4 p-5 bg-white rounded-xl border border-gray-200">
              <div className="shrink-0 mt-0.5">{step.icon}</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* For Clubs */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">C</div>
          <h2 className="text-2xl font-bold text-gray-900">For Clubs & Agents</h2>
        </div>
        <div className="space-y-6">
          {[
            {
              icon: <CheckCircle size={24} className="text-blue-600" />,
              title: "1. Register for Free",
              desc: "Create a club or agent account. Your profile will be reviewed by our team for verification.",
            },
            {
              icon: <Search size={24} className="text-blue-600" />,
              title: "2. Browse & Filter Talents",
              desc: "Search through thousands of talent videos. Filter by position, nationality, age. Watch unlimited videos at no cost.",
            },
            {
              icon: <Handshake size={24} className="text-blue-600" />,
              title: "3. Shortlist & Request Deal",
              desc: "Shortlist players you're interested in. When ready, submit a deal request through FootballScrow with deal type, proposed terms, and additional notes.",
            },
            {
              icon: <Shield size={24} className="text-blue-600" />,
              title: "4. FootballScrow Mediates",
              desc: "Our team reviews the deal request and begins the facilitation process. All negotiations are handled through our platform. No direct contact with the talent.",
            },
          ].map((step) => (
            <div key={step.title} className="flex gap-4 p-5 bg-white rounded-xl border border-gray-200">
              <div className="shrink-0 mt-0.5">{step.icon}</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "Is it really free?", a: "Yes. Registration, video uploads, and browsing are completely free for all parties. FootballScrow earns a small commission only when a deal is successfully completed." },
            { q: "Why no direct contact?", a: "The escrow model protects all parties from scams, exploitation, and unfair practices. By acting as an intermediary, we ensure all deals are transparent and fair." },
            { q: "How long does a deal take?", a: "It varies. Once a deal request is submitted, our team aims to make initial contact within 48 hours. The full process can take days to weeks depending on complexity." },
            { q: "Can an academy upload on behalf of a player?", a: "Yes! Academies can register and upload videos representing their players. They should clearly indicate the player's details in the video title and profile." },
            { q: "What types of deals are supported?", a: "We support transfers, loans, and trials. Our escrow team handles the specifics of each deal type." },
          ].map((faq) => (
            <div key={faq.q} className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center bg-gray-900 text-white rounded-2xl p-10">
        <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
        <p className="text-gray-400 mb-6">Join FootballScrow today — completely free.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/register?role=talent" className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2">
            Register as Talent <ArrowRight size={16} />
          </Link>
          <Link href="/register?role=club" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2">
            Register as Club <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
