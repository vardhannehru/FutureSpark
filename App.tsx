// App.tsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SocialSideLinks from "./components/SocialSideLinks";
import Home from "./components/Home";
import About from "./components/About";
import Programs from "./components/Programs";
import AcademicsPage from "./components/Academics";
import Gallery from "./components/Gallery";
import GalleryAdmin from "./components/GalleryAdmin";
import MCB from "./components/MCB";
import Careers from "./components/Careers";
import Admissions from "./components/Admissions";
// AdminPanel removed
import EventsAdmin from "./components/EventsAdmin";
import EventsAdd from "./components/EventsAdd";

import Stats from "./components/Stats";
import EnquiryForm from "./components/EnquiryForm";
import MapBlock from "./components/MapBlock";

const PageWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  // Navbar is fixed. Most pages need top padding so content doesn't sit under it.
  // Home page starts with the Hero which already has its own top padding for text,
  // and we want the hero background image to touch the very top (no gap).
  const pad = pathname === "/" ? "pt-0" : "pt-[155px] md:pt-[175px]";

  return (
    <div className="min-h-screen selection:bg-brand-light/20 selection:text-brand-dark scroll-smooth bg-transparent text-slate-900">
      <Navbar />
      <SocialSideLinks />
      {/* Offset for fixed navbar (logo is tall) */}
      <div className={pad}>{children}</div>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* HOME PAGE */}
      <Route
        path="/"
        element={
          <PageWrap>
            <Home />
          </PageWrap>
        }
      />

      {/* ABOUT PAGE */}
      <Route
        path="/about"
        element={
          <PageWrap>
            <About />
          </PageWrap>
        }
      />

      {/* ACADEMICS PAGE */}
      <Route
        path="/academics"
        element={
          <PageWrap>
            <AcademicsPage />
          </PageWrap>
        }
      />

      {/* GALLERY PAGE */}
      <Route
        path="/gallery"
        element={
          <PageWrap>
            <Gallery />
          </PageWrap>
        }
      />

      {/* GALLERY ADMIN */}
      <Route
        path="/gallery-admin"
        element={
          <PageWrap>
            <GalleryAdmin />
          </PageWrap>
        }
      />

      {/* MCB PAGE */}
      <Route
        path="/mcb"
        element={
          <PageWrap>
            <MCB />
          </PageWrap>
        }
      />

      {/* CAREERS PAGE */}
      <Route
        path="/careers"
        element={
          <PageWrap>
            <Careers />
          </PageWrap>
        }
      />

      {/* ADMISSIONS PAGE */}
      <Route
        path="/admissions"
        element={
          <PageWrap>
            <Admissions />
          </PageWrap>
        }
      />

      {/* Admin panel removed */}

      {/* EVENTS ADMIN LOGIN */}
      <Route
        path="/events-admin"
        element={
          <PageWrap>
            <EventsAdmin />
          </PageWrap>
        }
      />

      {/* EVENTS ADMIN: ADD EVENT PAGE */}
      <Route
        path="/events-admin/add"
        element={
          <PageWrap>
            <EventsAdd />
          </PageWrap>
        }
      />

      {/* CONTACT PAGE */}
      <Route
        path="/contact"
        element={
          <PageWrap>
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm font-bold mb-6">
                  CONTACT
                </span>
                <h1 className="text-3xl md:text-5xl font-heading font-bold text-brand-dark">
                  Contact Us
                </h1>
                <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">
                  Add your address, phone numbers, and enquiry form here.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="rounded-[2rem] border border-slate-100 bg-white shadow-lg p-8">
                  <div className="font-bold text-slate-900 text-xl">School Office</div>
                  <div className="mt-4 text-slate-600">
                    Kavuri Hills, Hyderabad
                    <br />
                    Phone: +91-8977653606
                    <br />
                    Email: hello@futurespark.in
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-100 bg-white shadow-lg p-8">
                  <div className="font-bold text-slate-900 text-xl">Send Enquiry</div>
                  <div className="mt-4 text-slate-600">Fill the form below and we will get back to you.</div>

                  <div className="mt-6">
                    <EnquiryForm />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <MapBlock title="School Location" heightClassName="h-[320px]" />
              </div>
            </div>
          </PageWrap>
        }
      />

      {/* OPTIONAL: 404 */}
      <Route
        path="*"
        element={
          <PageWrap>
            <div className="container mx-auto px-6 text-center">
              <h1 className="text-4xl font-bold text-slate-900">404</h1>
              <p className="mt-3 text-slate-600">Page not found.</p>
            </div>
          </PageWrap>
        }
      />
    </Routes>
  );
};

export default App;
