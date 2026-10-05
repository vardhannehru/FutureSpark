import React from "react";
import { PROGRAMS } from "../constants";

const Programs: React.FC = () => {
  return (
    <section id="academics" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Built for the <br />
              <span className="text-brand-light underline decoration-brand-dark/20">
                Future Workforce
              </span>
            </h2>
            <p className="text-slate-600 text-lg">
              We don't just teach subjects; we develop mindsets. Our programs
              are designed with industry leaders to ensure relevance in the age
              of AI.
            </p>
          </div>

          {/* Explore Full Curriculum button removed */}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PROGRAMS.map((p) => (
            <div
              key={p.id}
              className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:border-brand-light/20 transition-all hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                  {p.icon}
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold mb-3 group-hover:text-brand-light transition-colors">
                  {p.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {p.description}
                </p>
                {/* Learn More removed */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;
