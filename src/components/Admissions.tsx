import React from "react";
import { Link } from "react-router-dom";

const Admissions: React.FC = () => {
  return (
    <section className="container mx-auto px-6">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm font-bold mb-6">
          ADMISSIONS
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-brand-dark">
          Admissions Open Now
        </h1>
        <p className="mt-4 text-slate-600 text-lg max-w-3xl mx-auto">
          Application forms for all courses can be obtained from the front office. You can also download the Application/
          Enquiry form from our website.
        </p>

        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <Link
            to="/contact"
            className="px-6 py-3 rounded-xl bg-brand-dark text-white font-bold hover:bg-brand-light transition"
          >
            Enquiry / Apply
          </Link>
          <a
            href="#documents"
            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-800 font-bold hover:bg-slate-50 transition"
          >
            Admission Checklist
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-[2rem] border border-slate-100 bg-white shadow-lg p-8">
          <h2 className="text-xl font-heading font-extrabold text-slate-900">Enquiry & Application</h2>
          <ul className="mt-4 space-y-2 text-slate-700">
            <li>• Forms are available at the Front Office desk.</li>
            <li>• You can also download the Application/Enquiry form from the website.</li>
            <li>• The filled-in enquiry form must be signed and submitted by the parent/guardian.</li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white shadow-lg p-8">
          <h2 className="text-xl font-heading font-extrabold text-slate-900">Counselling</h2>
          <ul className="mt-4 space-y-2 text-slate-700">
            <li>• A briefing session is conducted by the Admissions Counsellor.</li>
            <li>• Helps parents of prospective students understand the process and requirements.</li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white shadow-lg p-8">
          <h2 className="text-xl font-heading font-extrabold text-slate-900">School Tour</h2>
          <ul className="mt-4 space-y-2 text-slate-700">
            <li>• Walking tours are conducted with prior appointment.</li>
            <li>• Helps parents and students get a feel of the campus.</li>
          </ul>
        </div>
      </div>

      <div id="documents" className="mt-10 rounded-[2rem] border border-slate-100 bg-white shadow-lg p-8">
        <h2 className="text-2xl font-heading font-extrabold text-slate-900">Admission Checklist</h2>
        <p className="mt-2 text-slate-600">
          For admission into Class I to Class X, the student should have passed the preceding class. The completed
          application must be enclosed with:
        </p>

        <div className="mt-5 grid md:grid-cols-2 gap-3 text-slate-700">
          <div>• Original Transfer Certificate</div>
          <div>• Photocopy of last year’s Report Card</div>
          <div>• Photocopy of Birth Certificate</div>
          <div>• Original Birth Certificate (for verification; returned later)</div>
          <div>• 2 passport size photographs of the child</div>
          <div>• 2 passport size photographs of parents</div>
        </div>

        <div className="mt-5 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-4">
          Note: Any false or incorrect information furnished may jeopardize selection and enrollment of the student.
        </div>
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <div className="rounded-[2rem] border border-slate-100 bg-white shadow-lg p-8">
          <h2 className="text-2xl font-heading font-extrabold text-slate-900">Age Criteria</h2>
          <ul className="mt-4 space-y-2 text-slate-700">
            <li>• Nursery: Child must be 3+ years</li>
            <li>• PP I / LKG: Child must be 4+ years</li>
            <li>• PP II / UKG: Child must be 5+ years</li>
            <li>• Grade 1: Child must be 6+ years</li>
          </ul>
          <div className="mt-4 text-sm text-slate-600">
            The above norms are followed by the school. If NEP norms require a different age criteria, the school will
            abide by it.
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white shadow-lg p-8">
          <h2 className="text-2xl font-heading font-extrabold text-slate-900">Process</h2>
          <ol className="mt-4 space-y-2 text-slate-700">
            <li>1) Make an online enquiry</li>
            <li>2) Meet the admission team</li>
            <li>3) Online application form & registration</li>
            <li>4) Student observation / scholastic analysis & parent interaction</li>
            <li>5) Admission status</li>
            <li>6) Acceptance</li>
          </ol>
        </div>
      </div>

      <div className="mt-10 rounded-[2rem] p-8 bg-gradient-to-r from-brand-dark to-brand-light text-white shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-heading font-extrabold">How to Apply?</h2>
        <p className="mt-3 text-white/90">
          Documents not submitted through the online method can be mailed to:
        </p>
        <div className="mt-3 font-semibold">
          Plot No.49, Beside Kavuri Hills, Kakateeya Hills, Jubilee Hills, Hyderabad - 500 033.
        </div>
        <div className="mt-6 flex gap-4 flex-wrap">
          <Link
            to="/contact"
            className="px-6 py-3 rounded-xl bg-white text-brand-dark font-bold hover:opacity-90 transition"
          >
            Apply / Enquiry
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Admissions;
