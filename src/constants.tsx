import { Program, Achievement } from "./types";

/* LOCAL IMAGE IMPORTS (NO PUBLIC FOLDER) */
import cbseImg from "./components/images/CBSE.jpg";
import digitalBoardsImg from "./components/images/digitalboards.jpg";
import sportsImg from "./components/images/sports.jpg";

/* =========================
   ACADEMIC PROGRAMS (CBSE SCHOOL)
   ========================= */

export const PROGRAMS: Program[] = [
  {
    id: "cbse",
    title: "CBSE Curriculum",
    description:
      "CBSE-aligned academic program focusing on conceptual clarity, continuous evaluation, strong fundamentals, and holistic student development.",
    icon: "📚",
    image: cbseImg,
    color: "blue",
  },
  {
    id: "digital-boards",
    title: "Digital Smart Classrooms",
    description:
      "Interactive digital boards that enhance learning through visuals, animations, and smart content for better understanding.",
    icon: "🖥️",
    image: digitalBoardsImg,
    color: "amber",
  },
  {
    id: "sports",
    title: "Sports & Physical Education",
    description:
      "Comprehensive sports facilities and structured physical education programs that build fitness, discipline, and teamwork.",
    icon: "⚽",
    image: sportsImg,
    color: "indigo",
  },
];

/* =========================
   SCHOOL GROWTH & ACHIEVEMENTS
   (School Started in 2024)
   ========================= */

export const COUNTRY_CODES: { code: string; flag: string; label: string }[] = [
  { code: "+91", flag: "🇮🇳", label: "India" },
  { code: "+1", flag: "🇺🇸", label: "United States" },
  { code: "+44", flag: "🇬🇧", label: "United Kingdom" },
  { code: "+971", flag: "🇦🇪", label: "UAE" },
  { code: "+966", flag: "🇸🇦", label: "Saudi Arabia" },
  { code: "+974", flag: "🇶🇦", label: "Qatar" },
  { code: "+965", flag: "🇰🇼", label: "Kuwait" },
  { code: "+968", flag: "🇴🇲", label: "Oman" },
  { code: "+973", flag: "🇧🇭", label: "Bahrain" },
  { code: "+61", flag: "🇦🇺", label: "Australia" },
  { code: "+65", flag: "🇸🇬", label: "Singapore" },
  { code: "+60", flag: "🇲🇾", label: "Malaysia" },
  { code: "+94", flag: "🇱🇰", label: "Sri Lanka" },
  { code: "+880", flag: "🇧🇩", label: "Bangladesh" },
  { code: "+977", flag: "🇳🇵", label: "Nepal" },
  { code: "+975", flag: "🇧🇹", label: "Bhutan" },
  { code: "+92", flag: "🇵🇰", label: "Pakistan" },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    year: "2024",
    students: 250,
    medals: 45,
    projects: 140,
  },
  {
    year: "2025",
    students: 300,
    medals: 68,
    projects: 220,
  },
];
