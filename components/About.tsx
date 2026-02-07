import React, { useEffect, useRef, useState } from "react";
import "./About.css";

import chairmanImg from "./images/Chairman.jpg";
import directorImg from "./images/director.jpeg";
import whoWeAreImg from "./images/who-we-are.jpg";

import iconScience from "./images/infrastructure/icons/science.svg";
import iconSports from "./images/infrastructure/icons/sports.svg";
import iconArtCraft from "./images/infrastructure/icons/art-craft.svg";
import iconDance from "./images/infrastructure/icons/dance.svg";
import iconMusic from "./images/infrastructure/icons/music.svg";
import iconFieldTrips from "./images/infrastructure/icons/field-trips.svg";
import iconLibrary from "./images/infrastructure/icons/digital-boards-library.svg";
import iconComputer from "./images/infrastructure/icons/computer-lab.svg";

import photoScience from "./images/infrastructure/photos/science-lab.jpg";
import photoSports from "./images/infrastructure/photos/sports.jpg";
import photoArtCraft from "./images/infrastructure/photos/art-craft.jpg";
import photoDance from "./images/infrastructure/photos/dance.jpg";
import photoMusic from "./images/infrastructure/photos/music.jpg";
import photoFieldTrips from "./images/infrastructure/photos/field-trips.jpg";
import photoLibrary from "./images/infrastructure/photos/library.jpg";
import photoComputer from "./images/infrastructure/photos/computer-lab.jpg";

export default function About() {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Mobile/older browsers fallback: if IntersectionObserver is unavailable,
    // show content immediately (otherwise everything stays opacity:0).
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    // Safety: ensure content becomes visible even if the observer never fires
    // (some mobile browsers have quirks with intersection + fixed headers).
    const safety = window.setTimeout(() => setVisible(true), 900);

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
          window.clearTimeout(safety);
        }
      },
      { threshold: 0.12, rootMargin: "120px 0px 120px 0px" },
    );

    io.observe(el);
    return () => {
      window.clearTimeout(safety);
      io.disconnect();
    };
  }, []);

  return (
    <section id="about" className="aboutSection" ref={ref as any}>
      <div className="aboutContainer">
        <h2 className={`reveal ${visible ? "isVisible" : ""}`} style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
          About Future Spark International School
        </h2>

        {/* Who We Are */}
        <div className="cardsGrid" style={{ marginBottom: "1.25rem" }}>
          <div className={`card reveal delay1 ${visible ? "isVisible" : ""}`}>
            <h3 style={{ margin: 0, marginBottom: ".5rem", fontSize: "1.1rem" }}>Who We Are</h3>
            <div style={{ lineHeight: 1.7, opacity: 0.9 }}>
              We strongly believe that “Today’s Children are Tomorrow’s Citizens”. In our view, a child is truly
              empowered when they not only excels in academics and extracurriculars but also develops an aesthetic sense
              of appreciation to learn about the world from both books and the natural environment.
              <br />
              <br />
              Named after the great Maratha leader SHIVAJI who brightened the world up, we hope and believe that FUTURE
              SPARK INTERNATIONAL SCHOOL will brighten every child’s life and give them the energy to face this
              competitive world.

              <div
                style={{
                  marginTop: "1rem",
                  paddingLeft: "0.9rem",
                  borderLeft: "3px solid rgba(15, 23, 42, 0.18)",
                  fontStyle: "italic",
                  opacity: 0.95,
                }}
              >
                “Teach him, if you can, the wonder of a book…but also give him quiet time to ponder the eternal mystery
                of birds in the sky, bees in the sun, and flowers on a green hillside.”
                <div style={{ marginTop: ".35rem", fontStyle: "normal", fontWeight: 800, opacity: 0.85 }}>
                  — Abraham Lincoln
                </div>
              </div>
            </div>
          </div>

          <div
            className={`card reveal delay2 ${visible ? "isVisible" : ""}`}
            style={{ padding: 0, overflow: "hidden", minHeight: 360, display: "flex" }}
          >
            <img
              src={whoWeAreImg}
              alt="Who we are - Future Spark International School"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              loading="lazy"
            />
          </div>
        </div>

        <p
          className={`reveal ${visible ? "isVisible" : ""}`}
          style={{ lineHeight: 1.7, opacity: 0.9, marginBottom: "1rem" }}
        >
          <strong>Future Spark International School</strong> is located in the serene residential area of{" "}
          <strong>Kavuri Hills, Hyderabad</strong>. As a co-educational institution, the school focuses on academic
          excellence along with all-round development through sports and co-curricular activities.
        </p>

        <p
          className={`reveal ${visible ? "isVisible" : ""}`}
          style={{ lineHeight: 1.7, opacity: 0.9, marginBottom: "1rem" }}
        >
          We aim to nurture young minds with care and creativity in a vibrant, safe environment that sparks curiosity
          and builds a strong foundation for lifelong learning. We also emphasize discipline and skill-building so
          students grow into citizens our country can be proud of.
        </p>

        <div className="cardsGrid">
          <div className={`card reveal delay1 ${visible ? "isVisible" : ""}`}>
            <h3 style={{ margin: 0, marginBottom: ".5rem", fontSize: "1.1rem" }}>Salient Features</h3>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", lineHeight: 1.7, opacity: 0.9 }}>
              <li>Motivated teachers & personalized guidance</li>
              <li>Smart classrooms</li>
              <li>CC cameras for safety</li>
              <li>Medical assistance</li>
              <li>Transportation facility</li>
            </ul>
          </div>

          <div className={`card reveal delay2 ${visible ? "isVisible" : ""}`}>
            <h3 style={{ margin: 0, marginBottom: ".5rem", fontSize: "1.1rem" }}>Why Choose Us</h3>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", lineHeight: 1.7, opacity: 0.9 }}>
              <li>Experienced educators</li>
              <li>Play-based, engaging learning</li>
              <li>Safe & supportive campus</li>
              <li>Holistic development: cognitive, social, emotional & physical</li>
            </ul>
          </div>

          <div className={`card reveal delay3 ${visible ? "isVisible" : ""}`}>
            <h3 style={{ margin: 0, marginBottom: ".5rem", fontSize: "1.1rem" }}>Medium of Instruction</h3>
            <div style={{ lineHeight: 1.7, opacity: 0.9 }}>
              The medium of instruction is <strong>English</strong>. Classes are from <strong>I to VIII</strong> (IX & X)
              (XI & XII).
            </div>
          </div>
        </div>

        {/* Infrastructure & Amenities (Detailed) */}
        <h3
          className={`reveal ${visible ? "isVisible" : ""}`}
          style={{ marginTop: "2rem", marginBottom: "0.75rem", fontSize: "1.35rem" }}
        >
          Infrastructure & Amenities
        </h3>

        <div className="cardsGrid">
          <div className={`card reveal delay1 ${visible ? "isVisible" : ""}`}>
            <div
              style={{
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                marginBottom: ".8rem",
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" as any }}>
                <img
                  src={photoScience}
                  alt="Science Lab"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".45rem" }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(160, 121, 255, 0.12)",
                  border: "1px solid rgba(160, 121, 255, 0.25)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <img src={iconScience} alt="Science lab" style={{ width: 22, height: 22, opacity: 0.9 }} />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Science Lab</h4>
            </div>
            <div style={{ lineHeight: 1.7, opacity: 0.9 }}>
              Our science lab is a platform for students to infer and understand scientific concepts. Curiosity kindled
              generates interest and engages youngsters academically.
            </div>
          </div>

          <div className={`card reveal delay2 ${visible ? "isVisible" : ""}`}>
            <div
              style={{
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                marginBottom: ".8rem",
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" as any }}>
                <img
                  src={photoSports}
                  alt="Sports"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".45rem" }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(160, 121, 255, 0.12)",
                  border: "1px solid rgba(160, 121, 255, 0.25)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <img src={iconSports} alt="Sports" style={{ width: 22, height: 22, opacity: 0.9 }} />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Sports</h4>
            </div>
            <div style={{ lineHeight: 1.7, opacity: 0.9 }}>
              Inclusion of games in our curriculum is important for the physical and mental well-being of our students.
              We encourage teamwork, discipline, patience, leadership, self-esteem, and confidence with ample space for
              sports and games.
            </div>
          </div>

          <div className={`card reveal delay3 ${visible ? "isVisible" : ""}`}>
            <div
              style={{
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                marginBottom: ".8rem",
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" as any }}>
                <img
                  src={photoArtCraft}
                  alt="Art & Craft"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".45rem" }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(160, 121, 255, 0.12)",
                  border: "1px solid rgba(160, 121, 255, 0.25)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <img src={iconArtCraft} alt="Art and craft" style={{ width: 22, height: 22, opacity: 0.9 }} />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Art & Craft</h4>
            </div>
            <div style={{ lineHeight: 1.7, opacity: 0.9 }}>
              At FUTURE SPARK we teach step-by-step shading, perspective drawing, colouring, and crafts like satin ribbon
              flowers, sandpaper butterflies, and more.
            </div>
          </div>

          <div className={`card reveal delay1 ${visible ? "isVisible" : ""}`}>
            <div
              style={{
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                marginBottom: ".8rem",
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" as any }}>
                <img
                  src={photoDance}
                  alt="Dance"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".45rem" }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(160, 121, 255, 0.12)",
                  border: "1px solid rgba(160, 121, 255, 0.25)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <img src={iconDance} alt="Dance" style={{ width: 22, height: 22, opacity: 0.9 }} />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Dance</h4>
            </div>
            <div style={{ lineHeight: 1.7, opacity: 0.9 }}>
              Dance creates a healthy environment where students can express their feelings productively while learning
              to control emotions.
            </div>
          </div>

          <div className={`card reveal delay2 ${visible ? "isVisible" : ""}`}>
            <div
              style={{
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                marginBottom: ".8rem",
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" as any }}>
                <img
                  src={photoMusic}
                  alt="Music"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".45rem" }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(160, 121, 255, 0.12)",
                  border: "1px solid rgba(160, 121, 255, 0.25)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <img src={iconMusic} alt="Music" style={{ width: 22, height: 22, opacity: 0.9 }} />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Music</h4>
            </div>
            <div style={{ lineHeight: 1.7, opacity: 0.9 }}>
              Music keeps learners interested and engaged in school and enhances academic, social, and emotional growth.
            </div>
          </div>

          <div className={`card reveal delay3 ${visible ? "isVisible" : ""}`}>
            <div
              style={{
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                marginBottom: ".8rem",
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" as any }}>
                <img
                  src={photoFieldTrips}
                  alt="Excursion"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".45rem" }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(160, 121, 255,  0.12)",
                  border: "1px solid rgba(160, 121, 255, 0.25)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <img src={iconFieldTrips} alt="Excursion" style={{ width: 22, height: 22, opacity: 0.9 }} />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Excursion</h4>
            </div>
            <div style={{ lineHeight: 1.7, opacity: 0.9 }}>
              Excursions give students real-world exposure and hands-on learning while being introduced to new
              environments.
            </div>
          </div>

          <div className={`card reveal delay1 ${visible ? "isVisible" : ""}`}>
            <div
              style={{
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                marginBottom: ".8rem",
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" as any }}>
                <img
                  src={photoLibrary}
                  alt="Digital Boards & Library"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".45rem" }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(160, 121, 255, 0.12)",
                  border: "1px solid rgba(160, 121, 255, 0.25)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <img src={iconLibrary} alt="Digital boards and library" style={{ width: 22, height: 22, opacity: 0.9 }} />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Digital Boards & Library</h4>
            </div>
            <div style={{ lineHeight: 1.7, opacity: 0.9 }}>
              The school library is the hub of intellectual activities with rich reading and reference resources. Smart
              board technology enriches learning with interactive modules, presentations, and multimedia.
            </div>
          </div>

          <div className={`card reveal delay2 ${visible ? "isVisible" : ""}`}>
            <div
              style={{
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                marginBottom: ".8rem",
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" as any }}>
                <img
                  src={photoComputer}
                  alt="Computer Lab"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".45rem" }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(160, 121, 255, 0.12)",
                  border: "1px solid rgba(160, 121, 255, 0.25)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <img src={iconComputer} alt="Computer lab" style={{ width: 22, height: 22, opacity: 0.9 }} />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Computer Lab</h4>
            </div>
            <div style={{ lineHeight: 1.7, opacity: 0.9 }}>
              Computer classes are important for all-round education. Students are instructed in computer use right from
              Class 1, and educational software is presented in a game-like format for younger learners.
            </div>
          </div>
        </div>

        {/* Leadership */}
        <h3
          className={`reveal ${visible ? "isVisible" : ""}`}
          style={{ marginTop: "2rem", marginBottom: "0.75rem", fontSize: "1.35rem" }}
        >
          Leadership
        </h3>

        <div className="cardsGrid">
          <div className={`card reveal delay1 ${visible ? "isVisible" : ""}`}>
            <div
              style={{
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                marginBottom: ".85rem",
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 10" as any }}>
                <img
                  src={chairmanImg}
                  alt="Chairman - Musini Srinivas"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center top",
                  }}
                  loading="lazy"
                />
              </div>
            </div>

            <h4 style={{ margin: 0, marginBottom: ".25rem", fontSize: "0.92rem" }}>Chairman</h4>
            <div style={{ fontWeight: 800, marginBottom: ".15rem" }}>Musini Srinivas</div>
            <div style={{ fontSize: ".9rem", fontWeight: 800, marginBottom: ".6rem", opacity: 0.85 }}>B.Com, B.Ed</div>

            <div style={{ fontSize: ".9rem", fontWeight: 800, marginBottom: ".6rem", opacity: 0.85 }}>
              Chairman’s Message
            </div>
            <div style={{ lineHeight: 1.7, opacity: 0.9 }}>
              Our chairman has 25 years of experience in the education sector, with a successful journey leading the Sri
              Sai Chaitanya group of schools (SSC syllabus) serving 2000 students.
              <br />
              <br />
              He believes in respecting teachers and building strong values alongside academics, so every child grows
              with confidence, discipline, and character.
            </div>
          </div>

          <div className={`card reveal delay2 ${visible ? "isVisible" : ""}`}>
            <div
              style={{
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                marginBottom: ".85rem",
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 10" as any }}>
                <img
                  src={directorImg}
                  alt="Director"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center top",
                  }}
                  loading="lazy"
                />
              </div>
            </div>

            <h4 style={{ margin: 0, marginBottom: ".25rem", fontSize: "0.92rem" }}>Director</h4>
            <div style={{ fontWeight: 800, marginBottom: ".15rem" }}>Musini Sai Venkata Chaitanya</div>
            <div style={{ fontSize: ".9rem", fontWeight: 800, marginBottom: ".6rem", opacity: 0.85 }}>
              B.Ed, B.Tech (CSE), CPL (Commercial Pilot Licence)
            </div>

            <div style={{ fontSize: ".9rem", fontWeight: 800, marginBottom: ".6rem", opacity: 0.85 }}>
              Director’s Message
            </div>
            <div style={{ lineHeight: 1.7, opacity: 0.9 }}>
              We believe the next generation deserves a school that blends strong values with modern, student-friendly
              learning. At Future Spark, we focus on smooth, structured teaching methods, smart use of technology, and a
              supportive environment where every child learns with confidence and curiosity.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
