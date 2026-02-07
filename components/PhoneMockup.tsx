import React from "react";

type PhoneMockupProps = {
  title?: string;
  children: React.ReactNode;
};

const PhoneMockup: React.FC<PhoneMockupProps> = ({ title = "MCB", children }) => {
  return (
    <div className="mx-auto w-full max-w-[360px]">
      <div className="rounded-[2.25rem] bg-slate-900 p-[10px] shadow-2xl border border-slate-800">
        <div className="rounded-[1.9rem] bg-white overflow-hidden">
          {/* Notch + status bar */}
          <div className="relative h-10 bg-slate-50 border-b border-slate-100">
            <div className="absolute left-1/2 -translate-x-1/2 top-2 h-6 w-36 rounded-full bg-slate-900" />
            <div className="absolute left-4 top-2 text-[11px] font-bold text-slate-700">
              {title}
            </div>
            <div className="absolute right-4 top-2 text-[11px] font-semibold text-slate-500">
              9:41
            </div>
          </div>

          {/* Screen */}
          <div className="max-h-[620px] overflow-y-auto overflow-x-hidden">
            <div className="w-full">{children}</div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-center text-xs text-slate-500">
        Phone UI mockup (preview)
        <div className="mt-1 text-[11px] text-slate-400">
          (Mockup only — original app will look different.)
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
