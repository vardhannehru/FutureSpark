import React from "react";
import logoImg from "./images/future-spark-logo.png";

const LoadingScreen: React.FC<{ message?: string }> = ({ message = "Welcome to Future Spark" }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Soft animated glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-brand-light/25 blur-[90px] rounded-full animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-300/25 blur-[90px] rounded-full animate-pulse" />

      <div className="text-center px-6">
        <div className="mx-auto w-[150px] h-[150px] rounded-[2.2rem] bg-white/70 backdrop-blur-xl border border-brand-light/20 shadow-2xl flex items-center justify-center">
          <img src={logoImg} alt="Future Spark Logo" className="w-[108px] h-[108px] object-contain splash-spin" />
        </div>

        <div className="mt-6 font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          {message}
        </div>
        <div className="mt-2 text-slate-600 font-semibold">International School</div>

        {/* Little animated loading dots */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-dark/70 animate-bounce [animation-delay:-0.2s]" />
          <span className="w-2 h-2 rounded-full bg-brand-dark/70 animate-bounce [animation-delay:-0.1s]" />
          <span className="w-2 h-2 rounded-full bg-brand-dark/70 animate-bounce" />
        </div>

        <div className="mt-4 text-xs text-slate-500">Preparing your experience…</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
