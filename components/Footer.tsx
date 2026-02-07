import React from "react";
import { Link } from "react-router-dom";

const ADMIN_TOKEN_STORAGE_KEY = "future_spark_admin_token_v1";

function hasAdminToken() {
  try {
    return !!(localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "").trim();
  } catch {
    return false;
  }
}
import logoImg from "./images/future-spark-logo.png";

const Footer: React.FC = () => {
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    setIsAdmin(hasAdminToken());

    const onStorage = () => setIsAdmin(hasAdminToken());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const socialBtnClass = (name: string) => {
    switch (name) {
      case "Facebook":
        return "bg-blue-600 hover:bg-blue-700 border-blue-500/30";
      case "Instagram":
        return "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:brightness-110 border-white/10";
      case "YouTube":
        return "bg-red-600 hover:bg-red-700 border-red-500/30";
      case "LinkedIn":
        return "bg-sky-600 hover:bg-sky-700 border-sky-500/30";
      default:
        return "bg-white/5 hover:bg-brand-light hover:text-brand-dark hover:border-brand-light";
    }
  };

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://www.facebook.com/futurespark.int/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24H12.82v-9.294H9.692V11.08h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.626h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/future_sparkint/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Z" />
          <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
          <path d="M17.5 6.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@FutureSparkInternationalSchool",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M23.5 6.2s-.2-1.7-.8-2.5c-.8-1-1.7-1-2.1-1.1C17.6 2.2 12 2.2 12 2.2h0s-5.6 0-8.6.4c-.4 0-1.3.1-2.1 1.1C.7 4.5.5 6.2.5 6.2S.1 8.2.1 10.3v1.9c0 2.1.4 4.1.4 4.1s.2 1.7.8 2.5c.8 1 1.9 1 2.4 1.1 1.7.2 7.3.4 8.3.4 0 0 5.6 0 8.6-.4.4 0 1.3-.1 2.1-1.1.6-.8.8-2.5.8-2.5s.4-2 .4-4.1v-1.9c0-2.1-.4-4.1-.4-4.1ZM9.6 14.9V7.7l6.4 3.6-6.4 3.6Z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-brand-dark text-slate-400 py-20 border-t border-brand-dark">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="mb-0 flex justify-center md:justify-start">
              <img
                src={logoImg}
                alt="Future Spark International School"
                className="block h-16 w-16 md:h-24 md:w-24 object-contain"
                loading="lazy"
              />
            </div>

            <p className="mt-0 mb-3 leading-relaxed text-slate-300">
              Igniting the next generation of visionary leaders through innovation, empathy, and academic excellence.
            </p>

            <div className="mt-4 text-sm text-slate-300 space-y-2">
              <div>
                <span className="font-bold text-white/90">Phone:</span>{" "}
                <a href="tel:+918977653606" className="hover:text-brand-light transition-colors">
                  +91 89776 53606
                </a>
                <span className="text-slate-400"> / </span>
                <a href="tel:+918977651606" className="hover:text-brand-light transition-colors">
                  +91 89776 51606
                </a>
              </div>
              <div>
                <span className="font-bold text-white/90">Email:</span>{" "}
                <a href="mailto:futuresparkint@gmail.com" className="hover:text-brand-light transition-colors">
                  futuresparkint@gmail.com
                </a>
              </div>
            </div>

            <div className="mb-6 text-sm text-slate-300 space-y-1">
              <div>
                <span className="font-bold text-white/90">CBSE Affiliation No:</span> 3630013
              </div>
              <div>
                <span className="font-bold text-white/90">Campus:</span> Fully air-conditioned (AC)
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all text-white ${socialBtnClass(
                    link.name,
                  )}`}
                >
                  {link.icon}
                </a>
              ))}
            </div>

            <Link
              to="/contact"
              className="inline-flex px-5 py-3 rounded-xl font-bold text-brand-dark bg-brand-light hover:brightness-110 transition"
            >
              Apply Now
            </Link>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/about" className="hover:text-brand-light transition-colors">About</Link>
              </li>
              <li>
                <Link to="/academics" className="hover:text-brand-light transition-colors">Academics</Link>
              </li>
              <li>
                <Link to="/admissions" className="hover:text-brand-light transition-colors">Admission</Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-brand-light transition-colors">Careers</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-light transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Links</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/gallery" className="hover:text-brand-light transition-colors">Gallery</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/contact" className="hover:text-brand-light transition-colors">Contact</Link>
              </li>
            </ul>

            {/* Admin (small + unobtrusive) */}
            <div className="mt-8">
              <h4 className="text-white font-bold mb-4">Admin</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to={isAdmin ? "/events-admin/add" : "/events-admin?next=add-event-page"}
                    className="hover:text-brand-light transition-colors"
                  >
                    Events Admin
                  </Link>
                </li>
                <li>
                  <Link to="/gallery-admin" className="hover:text-brand-light transition-colors">Gallery Admin</Link>
                </li>

                {!isAdmin ? <li className="text-slate-400 text-xs">(Will ask for password)</li> : null}
              </ul>
            </div>
          </div>
        </div>

        {/* Video (autoplay muted) */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-black shadow-2xl">
            <div className="px-5 py-4 bg-black/60 flex items-center justify-between gap-4">
              <div className="text-white font-extrabold">Campus Video</div>
              <a
                href="https://www.youtube.com/watch?v=mKqljEyTEu4"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-brand-light hover:underline"
              >
                Watch on YouTube
              </a>
            </div>

            <div className="relative w-full bg-black" style={{ paddingTop: "56.25%" }}>
              <iframe
                src="https://www.youtube.com/embed/mKqljEyTEu4?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1"
                title="Future Spark International School Video"
                className="absolute inset-0 w-full h-full"
                referrerPolicy="origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-12 mt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-base">
          <div className="text-center md:text-left">
            <p>(c) 2026 Future Spark Academy. All rights reserved.</p>
            <p className="mt-2 text-xs text-slate-400">
              Website developed by <span className="font-semibold text-slate-200">Penkey Vardhan Sai Raghavendra Nehru</span> <span className="text-slate-400">(9949177805)</span>
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Terms link removed */}

            {/* Small brand mark at end of page */}
            <div className="flex items-center gap-3">
              <img
                src={logoImg}
                alt="Future Spark Logo"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
                loading="lazy"
              />
              <div className="leading-tight">
                <div className="text-white font-extrabold text-[18px] sm:text-[20px]">Future Spark</div>
                <div className="text-slate-300 text-[12px] sm:text-[13px] font-semibold">International School</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
