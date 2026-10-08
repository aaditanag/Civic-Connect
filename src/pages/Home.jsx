import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

/* ── Animated counter hook ───────────────────────────────── */
function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(ease * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
}

/* ── Stat counter component ──────────────────────────────── */
function StatCounter({ value, label, suffix = "+" }) {
  const [count, ref] = useCounter(value);
  return (
    <div ref={ref} className="flex flex-col items-start">
      <span className="text-5xl md:text-6xl font-black text-white tabular-nums">
        {count.toLocaleString()}
        <span className="text-civic-gold">{suffix}</span>
      </span>
      <span className="text-white/60 text-sm mt-1 font-medium">{label}</span>
    </div>
  );
}

/* ── Feature card ────────────────────────────────────────── */
function FeatureCard({ icon, step, title, desc, delay }) {
  return (
    <div
      className="card card-hover border border-gray-100 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 rounded-2xl bg-civic-gold/10 border-2 border-civic-gold/30 flex items-center justify-center mb-5 group-hover:bg-civic-gold/20 transition-colors">
        <span className="text-2xl">{icon}</span>
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-civic-gold mb-2 block">
        Step {step}
      </span>
      <h3 className="text-lg font-bold text-civic-navy mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

/* ── Issue card ──────────────────────────────────────────── */
function IssueCard({ status, title, desc, time, distance }) {
  const statusMap = {
    "In Progress": "badge-progress",
    "Resolved":    "badge-resolved",
    "Pending":     "badge-pending",
    "Submitted":   "badge-pending",
  };
  return (
    <div className="card card-hover border border-gray-100 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className={statusMap[status] || "badge-pending"}>{status}</span>
        <span className="text-xs text-gray-400">{time}</span>
      </div>
      <h4 className="font-bold text-civic-navy">{title}</h4>
      <p className="text-gray-500 text-sm leading-relaxed flex-1">{desc}</p>
      <div className="flex items-center text-xs text-gray-400 gap-1">
        <span>📍</span>
        <span>{distance}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    issuesReported: 0,
    issuesResolved: 0,
    activeDepartments: 0
  });

  useEffect(() => {
    api.get('/issues/public-stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Failed to load public stats:', err));
  }, []);

  const getDashboardPath = () => {
    if (user?.role === "department_staff") return "/department";
    if (user?.role === "admin") return "/admin";
    return "/dashboard";
  };

  const handleGetStarted = () => {
    navigate(isAuthenticated ? getDashboardPath() : "/register");
  };

  return (
    <div className="min-h-screen bg-civic-cream font-outfit">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="bg-civic-navy relative overflow-hidden">
        {/* decorative arc */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-civic-cream rounded-t-[50%] translate-y-12 z-10" />

        {/* background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-civic-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-civic-gold/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: Text */}
            <div className="animate-fadeInUp">
              <p className="text-civic-gold font-semibold text-sm uppercase tracking-widest mb-4">
                Welcome to
              </p>
              <h1 className="text-6xl md:text-7xl font-black text-white leading-none mb-4">
                <span className="text-civic-gold">CIVIC</span>
                CONNECT
                <sup className="text-civic-gold text-2xl align-super ml-1">®</sup>
              </h1>
              <p className="text-white/60 text-lg md:text-xl italic font-medium mb-8 border-l-4 border-civic-gold pl-4">
                Spot. Report. Resolve. — For a better community.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="btn-primary text-base py-3 px-8 rounded-xl shadow-lg shadow-civic-gold/20 animate-pulse-gold"
                >
                  {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                </button>
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="btn-outline-white text-base py-3 px-8 rounded-xl"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-10 mt-12 pt-8 border-t border-white/10">
                <StatCounter value={stats.issuesReported || 1009} label="Issues Reported" />
                <div className="w-px h-16 bg-white/20 hidden sm:block" />
                <StatCounter value={stats.issuesResolved || 414} label="Issues Resolved" />
                <div className="w-px h-16 bg-white/20 hidden sm:block" />
                <StatCounter value={stats.activeDepartments || 52} label="Active Departments" />
              </div>
            </div>

            {/* Right: Illustration placeholder */}
            <div className="hidden lg:flex justify-center items-end animate-slideInRight">
              <div className="relative">
                {/* Decorative gold arc at bottom */}
                <div className="absolute -bottom-4 -right-4 w-64 h-24 border-b-4 border-r-4 border-civic-gold rounded-br-full opacity-40" />
                {/* Icon grid illustration */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: "🛣️", label: "Roads" },
                    { icon: "💡", label: "Lighting" },
                    { icon: "🗑️", label: "Sanitation" },
                    { icon: "💧", label: "Water" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center gap-2 border border-white/10 hover:bg-white/15 transition-colors"
                    >
                      <span className="text-4xl">{item.icon}</span>
                      <span className="text-white/70 text-xs font-semibold uppercase tracking-wide">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="gold-line mx-auto" />
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three simple steps to make your community better</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon="📸"
              step={1}
              title="Spot an Issue"
              desc="Find problems like potholes, garbage dumps, or broken infrastructure in your area."
              delay={0}
            />
            <FeatureCard
              icon="📝"
              step={2}
              title="Report It"
              desc="Take a photo, add details, pin the location and submit your report in seconds."
              delay={100}
            />
            <FeatureCard
              icon="✅"
              step={3}
              title="Track Progress"
              desc="Monitor your report's status and get notified when the issue gets resolved."
              delay={200}
            />
          </div>
        </div>
      </section>

      {/* ── RECENT ISSUES ─────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <div className="gold-line" />
              <h2 className="section-title">Recent Community Issues</h2>
              <p className="text-gray-500">See what others are reporting in your area</p>
            </div>
            <Link
              to="/dashboard"
              className="mt-4 sm:mt-0 text-civic-gold hover:text-civic-goldHover font-semibold text-sm flex items-center gap-1 transition-colors"
            >
              View all issues →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <IssueCard
              status="In Progress"
              title="Pothole on Main St"
              desc="Large pothole causing traffic issues near the market area. Needs urgent attention."
              time="2 days ago"
              distance="1.2 km away"
            />
            <IssueCard
              status="Resolved"
              title="Garbage Pile Up"
              desc="Trash accumulation in park area has been cleaned after community reporting."
              time="5 days ago"
              distance="0.8 km away"
            />
            <IssueCard
              status="Submitted"
              title="Broken Streetlight"
              desc="Streetlight not working on Oak Avenue, creating safety hazard at night."
              time="Today"
              distance="2.1 km away"
            />
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ─────────────────────────────────────── */}
      <section className="py-20 bg-civic-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-civic-navy via-civic-navyCard to-civic-navy opacity-70" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-civic-gold/30" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-civic-gold text-sm font-bold uppercase tracking-widest block mb-4">
            Join the movement
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of citizens who are actively improving their communities one report at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="btn-primary text-base py-3 px-10 rounded-xl shadow-lg shadow-civic-gold/20"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
            </button>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="btn-outline-white text-base py-3 px-10 rounded-xl"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
