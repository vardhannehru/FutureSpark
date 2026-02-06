// components/Hero.tsx
import React, { useEffect, useMemo, useState } from "react";
import heroBg from "./images/Herobackground.jpg";
import heroSports from "./images/hero/sports-day.JPG";
import heroBg3 from "./images/gallery/annual-day/IMG_6944.JPG";
// siteConfig-based hero customization removed

const ROTATE_MS = 5000;

const Hero: React.FC = () => {
  const slides = useMemo(
    () => [
      { src: heroBg, alt: "Future Spark School Entrance", className: "object-center" },
      { src: heroSports, alt: "Sports Day", className: "object-[center_30%]" },
      { src: heroBg3, alt: "Annual Day", className: "object-center" },
    ],
    [],
  );

  const [idx, setIdx] = useState(0);
  const activeAlt = slides[idx]?.alt || "";
  const isPhotoSlide = activeAlt === "Sports Day" || activeAlt === "Annual Day";

  useEffect(() => {
    const t = window.setInterval(() => {
      setIdx((p) => (p + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [slides.length]);

  return (
    // NO top padding here -> background touches top (no gap)
    <section id="home" className="relative min-h-[90vh] overflow-hidden">
      {/* Full background image (auto-rotating) */}
      <div className="absolute inset-0 z-0">
        {slides.map((s, i) => (
          <img
            key={s.alt}
            src={s.src}
            alt={s.alt}
            className={`heroImg absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              s.className || "object-center"
            } ${i === idx ? "opacity-100" : "opacity-0"}`}
            aria-hidden={i === idx ? undefined : true}
          />
        ))}

        {/* Overlays (reduced transparency) */}
        <div
          className={`absolute inset-0 bg-gradient-to-r lg:to-transparent ${
            isPhotoSlide ? "from-white/55 via-white/25 to-white/0" : "from-white/85 via-white/55 to-white/10"
          }`}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${
            isPhotoSlide ? "from-slate-50/55" : "from-slate-50/80"
          }`}
        />
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-brand-light opacity-30 blur-[120px] rounded-full animate-pulse z-0" />
      <div className="absolute bottom-[10%] left-[10%] w-64 h-64 bg-brand-dark opacity-10 blur-[80px] rounded-full z-0" />

      {/* Padding moved to CONTENT only -> navbar won't collide, background still full */}
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-3/5 space-y-8 text-center lg:text-left">
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <div className="inline-block px-4 py-1.5 bg-white/40 backdrop-blur-md border border-brand-light/30 rounded-full text-brand-dark text-xs md:text-sm font-bold tracking-widest uppercase shine-badge">
                Re-imagining the Future of Education
              </div>
              <div className="inline-block px-4 py-1.5 bg-brand-light/20 backdrop-blur-md border border-brand-light/30 rounded-full text-brand-dark text-xs md:text-sm font-extrabold tracking-widest uppercase shine-badge">
                <span className="fire-emoji" aria-hidden="true">🔥</span> 2026 Admissions are Open
              </div>
              <div className="inline-block px-4 py-1.5 bg-white/55 backdrop-blur-md border border-white/30 rounded-full text-brand-dark text-xs md:text-sm font-extrabold tracking-wide glossy-badge">
                CBSE Affiliation: 3630013
              </div>
              <div className="inline-block px-4 py-1.5 bg-rose-500/15 backdrop-blur-md border border-rose-400/30 rounded-full text-rose-900 text-xs md:text-sm font-extrabold tracking-wide glossy-badge">
                Limited seats only — already filling up
              </div>
            </div>

            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] text-slate-900 tracking-tighter">
              Where Every <br />
              <span className="text-gradient text-gradient-animate">Spark</span> Becomes <br />a Brilliant{" "}
              <span className="sun-gradient text-gradient-animate">Sun</span>.
            </h1>

            <p className="text-lg md:text-xl text-slate-700 max-w-xl mx-auto lg:mx-0 font-medium">
              At Future Spark Academy, we combine cutting-edge STEM curriculum with global ethics to nurture visionary
              leaders.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <a
                href="#academics"
                className="px-10 py-5 bg-brand-dark text-white rounded-[2rem] font-bold text-lg hover:bg-brand-light transition-all shadow-2xl shadow-brand-dark/20 hover:-translate-y-1 active:scale-95 inline-block"
              >
                Begin Your Journey
              </a>
            </div>
          </div>

          {/* Optional right side (if you want later) */}
          {/* <div className="lg:w-2/5 hidden lg:block" /> */}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none" />
    </section>
  );
};

export default Hero;
