import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import logoImg from "./images/future-spark-logo.png";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = useMemo(
    () => [
      { name: "Home", href: "/" },
      { name: "About", href: "/about" },
      { name: "Academics", href: "/academics" },
      { name: "Gallery", href: "/gallery" },
      { name: "MCB", href: "/mcb" },
      { name: "Careers", href: "/careers" },
      { name: "Admissions", href: "/admissions" },
      { name: "Contact", href: "/contact" },
    ],
    [],
  );

  return (
    <header className="fixed top-0 w-full z-[120]">
      <div className={`px-4 md:px-6 ${scrolled ? "pt-2" : "pt-4"}`}>
        <div className="container mx-auto">
          <div className="rounded-[26px] bg-gradient-to-r from-brand-light/60 via-cyan-300/40 to-brand-light/60 p-[2px] shadow-2xl">
            <nav
              className={`
                relative flex items-center justify-between
                h-[72px] md:h-[84px]
                px-4 md:px-6
                rounded-[22px]
                backdrop-blur-xl
                overflow-visible
                transition-all duration-300
                ${scrolled ? "bg-white/70 shadow-[0_10px_40px_rgba(0,0,0,0.22)]" : "bg-white/45"}
              `}
            >
              {/* LEFT: LOGO + NAME */}
              <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="absolute -inset-4 rounded-full bg-brand-light/25 blur-2xl" />
                  <img
                    src={logoImg}
                    alt="Future Spark Logo"
                    className="
                      relative
                      h-[44px] sm:h-[60px] md:h-[68px]
                      w-auto
                      object-contain
                      drop-shadow-[0_0_18px_rgba(160,121,255,.55)]
                      transition-transform duration-300
                    "
                  />
                </div>

                <div className="min-w-0 flex flex-col justify-center leading-tight">
                  <div className="font-heading font-extrabold text-slate-900 text-[16px] sm:text-[22px] md:text-[26px] leading-none">
                    Future Spark
                  </div>
                  <div className="text-slate-600 text-[11px] sm:text-[15px] md:text-[17px] font-semibold leading-none whitespace-nowrap">
                    International School
                  </div>
                </div>
              </Link>

              {/* DESKTOP NAV */}
              <div className="hidden lg:flex items-center gap-3 xl:gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="
                      px-2 xl:px-3 py-2 rounded-xl
                      font-semibold text-[14px] xl:text-[15px]
                      text-slate-700
                      hover:text-brand-dark
                      hover:bg-brand-light/10
                      transition
                    "
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex items-center gap-3 xl:gap-4 shrink-0">
                {/* CBSE affiliation moved to Home page */}
                <Link
                  to="/contact"
                  className="
                    hidden xl:inline-flex
                    px-4 xl:px-5 py-2 xl:py-2.5 rounded-xl
                    font-bold text-white text-[14px] xl:text-[15px]
                    bg-brand-dark hover:bg-brand-light
                    shadow-xl
                    transition
                    active:scale-95
                  "
                >
                  Enroll Now
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((v) => !v)}
                  className="
                    lg:hidden
                    w-12 h-12 rounded-xl
                    bg-white/80 hover:bg-white
                    border border-slate-200
                    flex items-center justify-center
                    shadow-md
                  "
                >
                  {mobileMenuOpen ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-7 w-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-7 w-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16m-7 6h7"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </nav>
          </div>

          {/* MOBILE MENU */}
          <div
            className={`lg:hidden transition-all duration-300 origin-top ${
              mobileMenuOpen
                ? "mt-4 scale-y-100 opacity-100"
                : "scale-y-0 opacity-0 h-0 overflow-hidden"
            }`}
          >
            <div className="rounded-2xl bg-white/90 backdrop-blur-xl p-5 shadow-2xl border border-brand-light/20">
              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-5 py-4 rounded-xl font-bold text-[18px] text-slate-800 hover:bg-brand-light/10"
                  >
                    {item.name}
                  </Link>
                ))}

                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 text-center px-5 py-4 rounded-xl font-bold text-[18px] text-white bg-brand-dark hover:bg-brand-light transition"
                >
                  Enroll Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
