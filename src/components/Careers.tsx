import React from "react";
import CareerForm from "./CareerForm";

const Careers: React.FC = () => {
  return (
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm font-bold mb-6">
          CAREERS
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-brand-dark">Join Future Spark</h1>
        <p className="mt-4 text-slate-600 text-lg max-w-3xl mx-auto">
          We are recruiting passionate teachers and staff who love working with children and believe in strong academics
          + joyful learning.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[2rem] border border-slate-100 bg-white shadow-lg p-8">
            <div className="font-bold text-slate-900 text-xl">Open Roles</div>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li>• Pre-Primary Teachers</li>
              <li>• Primary Teachers</li>
              <li>• TGT / PGT (All Subjects)</li>
              <li>• PET / Sports Coach</li>
              <li>• Art / Music / Dance</li>
              <li>• Special Educator</li>
              <li>• Admin / Office Staff</li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-white shadow-lg p-8">
            <div className="font-bold text-slate-900 text-xl">What We Look For</div>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li>• Strong subject knowledge + communication</li>
              <li>• Child-friendly, patient, and positive attitude</li>
              <li>• Classroom management skills</li>
              <li>• B.Ed / D.Ed preferred (as applicable)</li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-white shadow-lg p-8">
            <div className="font-bold text-slate-900 text-xl">Contact</div>
            <div className="mt-3 text-slate-600">
              Kavuri Hills, Hyderabad
              <br />
              Phone/WhatsApp: <strong>+91-8977653606</strong>
              <br />
              Email: <strong>futuresparkint@gmail.com</strong>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-[2rem] border border-slate-100 bg-white shadow-lg p-8">
            <div className="font-bold text-slate-900 text-xl">Apply Now</div>
            <div className="mt-2 text-slate-600">
              Fill the form below. You can also share your resume on WhatsApp.
            </div>
            <div className="mt-6">
              <CareerForm />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-sm text-slate-500">
        Equal opportunity employer
      </div>
    </div>
  );
};

export default Careers;
