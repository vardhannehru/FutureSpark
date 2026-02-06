import React from "react";
import PhoneMockup from "./PhoneMockup";
import logoImg from "./images/futurespark-logo.png";

const StatPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
    <div className="text-xs font-bold text-slate-500">{label}</div>
    <div className="mt-1 text-lg font-extrabold text-slate-900">{value}</div>
  </div>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <div className="text-sm font-semibold text-slate-700">{label}</div>
    <div className="text-sm text-slate-600 text-right max-w-[60%]">{value}</div>
  </div>
);

const Card: React.FC<{ title: string; children: React.ReactNode; right?: React.ReactNode }> = ({
  title,
  children,
  right,
}) => (
  <div className="rounded-3xl bg-white border border-slate-100 shadow-lg p-5">
    <div className="flex items-center justify-between gap-4">
      <div className="font-heading font-extrabold text-slate-900">{title}</div>
      {right}
    </div>
    <div className="mt-3">{children}</div>
  </div>
);

export const MCBScreen: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-brand-light">MY CLASS BOARD</div>
          <div className="text-xl font-extrabold text-slate-900">Parent Dashboard</div>
          <div className="text-xs text-slate-500 mt-1">Today • Updates about your child</div>
        </div>
        <img
          src={logoImg}
          alt="Future Spark"
          className="w-20 h-20 rounded-2xl object-cover"
          loading="lazy"
        />
      </div>

      {/* Student card */}
      <div className="mt-4 rounded-3xl bg-gradient-to-r from-brand-dark to-brand-light text-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold opacity-90">Student</div>
            <div className="text-xl font-extrabold">Student Name</div>
            <div className="text-sm opacity-90">Class: Grade 3 • Section A</div>
          </div>
          <div className="rounded-2xl bg-white/15 border border-white/20 px-3 py-2 text-xs font-bold">
            Roll: 12
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/15 border border-white/20 p-3">
            <div className="text-[10px] font-bold opacity-90">Attendance</div>
            <div className="mt-1 text-sm font-extrabold">96%</div>
          </div>
          <div className="rounded-2xl bg-white/15 border border-white/20 p-3">
            <div className="text-[10px] font-bold opacity-90">Homework</div>
            <div className="mt-1 text-sm font-extrabold">2 Pending</div>
          </div>
          <div className="rounded-2xl bg-white/15 border border-white/20 p-3">
            <div className="text-[10px] font-bold opacity-90">Diary</div>
            <div className="mt-1 text-sm font-extrabold">1 New</div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatPill label="Today" value="2 Updates" />
        <StatPill label="Next Event" value="Fri" />
        <StatPill label="Notice" value="PTM" />
      </div>

      {/* Homework */}
      <div className="mt-4">
        <Card
          title="Homework"
          right={<span className="text-xs font-bold text-brand-light">View all</span>}
        >
          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-xs font-bold text-slate-500">Math</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">Complete exercises 3A & 3B</div>
              <div className="mt-1 text-xs text-slate-500">Due: Tomorrow</div>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-xs font-bold text-slate-500">English</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">Read chapter 4 and write 5 new words</div>
              <div className="mt-1 text-xs text-slate-500">Due: Friday</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Diary / Teacher note */}
      <div className="mt-4">
        <Card title="Diary (Teacher Note)">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="text-sm text-slate-700 leading-relaxed">
              Today we practiced reading aloud and worked on teamwork activities. Please ensure your child brings the art
              kit tomorrow.
            </div>
            <div className="mt-3 text-xs text-slate-500">— Class Teacher</div>
          </div>
        </Card>
      </div>

      {/* Attendance */}
      <div className="mt-4">
        <Card title="Attendance">
          <Row label="This month" value="22/23 days" />
          <div className="h-px bg-slate-100" />
          <Row label="Late arrivals" value="1" />
          <div className="h-px bg-slate-100" />
          <Row label="Leaves" value="0" />
        </Card>
      </div>

      {/* Notices */}
      <div className="mt-4">
        <Card title="School Notice">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
            <div className="text-sm font-semibold text-slate-900">PTM scheduled this weekend</div>
            <div className="mt-1 text-sm text-slate-700">Please confirm your preferred time slot via the school office.</div>
          </div>
        </Card>
      </div>

      <div className="mt-5 text-center text-xs text-slate-400">Demo UI (static). Connect to backend later.</div>
    </div>
  );
};

const MCB: React.FC = () => {
  return (
    <section className="container mx-auto px-6">
      <div className="text-center mb-10">
        <span className="inline-block px-4 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm font-bold mb-6 tracking-widest">
          MCB
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-brand-dark">
          My Class Board (MCB)
        </h1>
        <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">
          A parent dashboard to track your child's class updates, diary, homework and notices.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div className="rounded-[2rem] border border-slate-200 bg-white/60 backdrop-blur-xl shadow-xl p-8">
          <h2 className="text-2xl font-heading font-extrabold text-slate-900">What parents can see</h2>
          <ul className="mt-5 space-y-3 text-slate-700">
            <li>• Daily diary note from class teacher</li>
            <li>• Homework list with due dates</li>
            <li>• Attendance summary</li>
            <li>• School notices & upcoming events</li>
            <li>• (Later) report cards, transport updates</li>
          </ul>
          <div className="mt-6 text-sm text-slate-500">
            This is a phone-first UI mockup. Next step is connecting real student data with login.
          </div>
        </div>

        <PhoneMockup title="MCB">
          <MCBScreen />
        </PhoneMockup>
      </div>
    </section>
  );
};

export default MCB;
