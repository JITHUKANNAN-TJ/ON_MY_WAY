import { Link } from "react-router-dom";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: "Live GPS Sharing",
    desc: "Share your real-time location with everyone in the room. No more 'Where are you?' texts.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "Temporary Rooms",
    desc: "Rooms auto-expire after 2 hours. Nothing is stored permanently. Your privacy matters.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    title: "Simple Sharing",
    desc: "Create a room, share the 8-character code. Friends join instantly. No accounts needed.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: "Viewer Mode",
    desc: "Join as a viewer to watch without sharing your location. Perfect for parents or coordinators.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Meeting Points",
    desc: "Set a meeting point and see everyone's ETA. Know who's closest and when they'll arrive.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Privacy First",
    desc: "No accounts, no permanent storage, no public rooms. Only the people you share the code with.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-36 pb-28 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-primary/30 animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-3 h-3 rounded-full bg-secondary/30 animate-float" style={{ animationDelay: "-2s" }} />
        <div className="absolute top-1/4 right-1/3 w-2 h-2 rounded-full bg-warning/30 animate-float" style={{ animationDelay: "-4s" }} />

        <div className="max-w-3xl mx-auto relative animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 ring-1 ring-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping-slow" />
            Real-time GPS Sharing
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Share your journey
            <br />
            <span className="text-gradient">in real time</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
            Create a room, share the link, and let everyone see your live location.
            <br className="hidden sm:block" />
            No accounts. No setup. Just share and go.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/create"
              className="btn-primary text-lg px-10 py-4 w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 group"
            >
              Create Room
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              to="/join"
              className="btn-secondary text-lg px-10 py-4 w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 group"
            >
              Join Room
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
        <div className="max-w-5xl mx-auto relative">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            How it works
          </h2>
          <p className="text-text-secondary text-center mb-16 max-w-lg mx-auto">
            Get everyone on the same map in four simple steps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Create Room", desc: "Name your room and optionally set a meeting point." },
              { step: "2", title: "Share Code", desc: "Share the 8-character code or link with your group." },
              { step: "3", title: "Friends Join", desc: "They enter the code, pick a name, and they're in." },
              { step: "4", title: "Live Map", desc: "Everyone appears on the map with ETAs to the meeting point." },
            ].map((item, i) => (
              <div
                key={item.step}
                className="relative group"
                style={{ animation: `slideUp 0.5s ease-out ${i * 0.1}s both` }}
              >
                <div className="card text-center space-y-3 h-full relative overflow-hidden">
                  <div className="bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-xl flex items-center justify-center mx-auto ring-1 ring-primary/20 group-hover:ring-primary/40 group-hover:shadow-glow transition-all duration-300">
                      {item.step}
                    </div>
                    <div className="hidden md:block absolute top-7 left-[calc(50%+2.5rem)] w-[calc(100%-3rem)] h-px bg-gradient-to-r from-primary/20 to-transparent" />
                  </div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Everything you need
          </h2>
          <p className="text-text-secondary text-center mb-16 max-w-lg mx-auto">
            Built for groups who want to stay connected on the move.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group relative"
                style={{ animation: `fadeIn 0.5s ease-out ${i * 0.05}s both` }}
              >
                <div className="card space-y-4 h-full relative overflow-hidden cursor-default">
                  <div className="bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/20 group-hover:ring-primary/40 group-hover:shadow-glow transition-all duration-300">
                      {f.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1.5">{f.title}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-surface to-secondary/5 p-1">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
            <div className="relative glass-strong rounded-[23px] p-10 sm:p-14 text-center space-y-6">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Ready to share your journey?
                </h2>
                <p className="text-text-secondary text-lg max-w-md mx-auto">
                  Create a room in seconds. No sign-up required.
                </p>
              </div>
              <Link
                to="/create"
                className="btn-primary text-lg px-12 py-4 inline-flex items-center gap-2 group"
              >
                Get Started
                <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
