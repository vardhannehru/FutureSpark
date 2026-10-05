import React from "react";

import imgKinder from "./images/futurespark-kindergarten.jpg";
import imgPrimary from "./images/futurespark-primary-middle-school.jpg";

const Academics: React.FC = () => {
  return (
    <section className="container mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm font-bold mb-6">
          ACADEMICS
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-brand-dark">
          Academics
        </h1>
        <p className="mt-4 text-slate-600 text-lg max-w-4xl mx-auto">
          May this school serve as a beacon of hope, knowledge and positive transformation for generations to come.
        </p>
      </div>

      {/* Play School */}
      <div className="grid lg:grid-cols-2 gap-10 items-start mb-14">
        <div className="rounded-[2rem] border border-slate-100 bg-white shadow-xl p-8">
          <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900">Play School</h2>
          <p className="mt-4 text-slate-700 leading-relaxed">
            A home away from home with a hygienic environment for the young ones, FUTURE SPARK play school is a wonderful
            world of fun and learning. We plan and create activities that help growing children develop learning
            abilities. We also provide an enlightening and safe environment.
          </p>
          <p className="mt-4 text-slate-700 leading-relaxed">
            We give children new stimulating experiences through good storybooks, ample play materials, music, puppetry,
            outings, and a host of events conducted throughout the year.
          </p>
          <p className="mt-4 text-slate-700 leading-relaxed">
            We motivate the children to learn with joy and to become confident, independent, friendly, and well manner.
            At Future Spark International School we believe in nurturing young minds with care and creativity.
          </p>
          <p className="mt-4 text-slate-700 leading-relaxed">
            Our vibrant and safe environment is designed to spark curiosity, encourage play, and lay the foundation for
            a lifelong love of learning.
          </p>
        </div>

        <div className="rounded-[2rem] overflow-hidden border border-slate-100 bg-white shadow-xl">
          <div className="relative w-full bg-black" style={{ paddingTop: "62%" }}>
            <img
              src={imgKinder}
              alt="Future Spark Kindergarten"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Kindergarten */}
      <div className="grid lg:grid-cols-2 gap-10 items-start mb-14">
        <div className="rounded-[2rem] overflow-hidden border border-slate-100 bg-white shadow-xl order-2 lg:order-1">
          <div className="relative w-full bg-black" style={{ paddingTop: "62%" }}>
            <img
              src={imgKinder}
              alt="Kindergarten"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white shadow-xl p-8 order-1 lg:order-2">
          <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900">Kindergarten</h2>
          <p className="mt-4 text-slate-700 leading-relaxed">
            Experience the tranquil world of the tiny tots at FUTURE SPARK International School, where expression meets
            silent thoughts. Motivation and self-discovery of each child are ushered into a world of creativity.
          </p>
          <p className="mt-4 text-slate-700 leading-relaxed">
            Application of international teaching methods at this level of education witnesses an outpour of
            mind-dazzling potential.
          </p>
          <p className="mt-4 text-slate-700 leading-relaxed">
            The IEYC (International Early Years Curriculum) is a research-based curriculum that links early years to
            formal education. It offers a framework for effective learning while harnessing a child’s curiosity in an
            enabled environment.
          </p>
        </div>
      </div>

      {/* Primary & Middle School */}
      <div className="grid lg:grid-cols-2 gap-10 items-start mb-14">
        <div className="rounded-[2rem] border border-slate-100 bg-white shadow-xl p-8">
          <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900">Primary & Middle School</h2>
          <p className="mt-4 text-slate-700 leading-relaxed">
            FUTURE SPARK recognizes the fact that knowledge knows no bounds and gives each student rigorous exposure to
            group activities, seminars, visual learning and project works.
          </p>
          <p className="mt-4 text-slate-700 leading-relaxed">
            The teaching process helps each student to garner and harness the different potential.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-5">
            <div className="font-heading font-extrabold text-slate-900">Club Activities</div>
            <div className="mt-3 grid sm:grid-cols-2 gap-2 text-slate-700 font-semibold">
              <div>• Eco club</div>
              <div>• Sanskriti club</div>
              <div>• SPICE-CLUB</div>
              <div>• Rainbow club</div>
              <div>• Young fiddlers club</div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] overflow-hidden border border-slate-100 bg-white shadow-xl">
          <div className="relative w-full bg-black" style={{ paddingTop: "62%" }}>
            <img
              src={imgPrimary}
              alt="Future Spark Primary and Middle School"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Academics;
