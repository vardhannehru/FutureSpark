
import { GoogleGenAI } from "@google/genai";

// Vite exposes env vars to the browser only if they start with VITE_
const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const SYSTEM_INSTRUCTION = `
You are "Sparky", the friendly AI assistant for Future Spark International School.
Your goal is to help prospective parents, students, and visitors learn about the school.

Key Facts for your knowledge:
- Name: Future Spark International School.
- Director: Musini Sai Venkata Chaitanya.
- Location: Located in a serene residential area at Kavuri Hills, Hyderabad, the modern metropolitan city.
- School Type: Co-educational institution.
- Focus: Pursuing academic brilliance and all-round excellence. Stands for Discipline, honing skills in academics, sports, and co-curricular activities.
- Mission/Aim: To build citizens that India will be Proud of.
- Infrastructure & Amenities: Science Lab, Dance, Sports, Music, Art & Craft, Field Trips, Library, Digital Boards, Computer Lab.
- Quote: "May this school serve as a beacon of hope, knowledge and positive transformation for generations to come."
- Curriculum: Focus on STEM, Digital Arts, and Ethics.
- Admissions: Open for 2024-25. Apply via the 'Enroll' button on the website.
- Contact: hello@futurespark.in.
- Social Media: We are active on Facebook and Instagram. Links can be found in the website footer.

Tone: Simple, friendly, and helpful.
Rules for answers:
- Keep it short (1–3 lines).
- Use plain language (no long paragraphs).
- Use bullets only if needed (max 3 bullets).
- Ask 1 follow-up question if you need more info.
If you don't know an answer, say: "Please contact us at hello@futurespark.in".
`;

export const getSparkyResponse = async (
  history: { role: "user" | "model"; text: string }[],
  message: string,
) => {
  // NOTE: This runs in the browser. Exposing an API key in the frontend is not secure.
  // For production, proxy this via a backend.
  if (!apiKey || apiKey === "PLACEHOLDER_API_KEY") {
    return "Spark Assistant is not configured yet. Add your Gemini key to .env.local as VITE_GEMINI_API_KEY=... and restart `npm run dev`.";
  }

  try {
    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const response = await chat.sendMessage({ message });
    return (
      response.text ||
      "I'm having a little trouble connecting to my neural network. Try again?"
    );
  } catch (error) {
    // Make user-facing errors short & helpful
    const raw = String((error as any)?.message || "");
    const code = (error as any)?.status || (error as any)?.code;

    // Gemini quota / rate-limit
    if (code === 429 || raw.includes("\"code\":429") || raw.includes("RESOURCE_EXHAUSTED")) {
      // Try to pull retryDelay like "41s" from the error text
      const retryMatch = raw.match(/"retryDelay":"(\d+)s"/);
      const seconds = retryMatch?.[1];
      return `Sparky is busy right now (quota limit). Please wait${seconds ? ` ${seconds}s` : " a bit"} and try again.`;
    }

    // Auth / billing / permissions issues
    if (code === 401 || code === 403 || raw.includes("PERMISSION_DENIED") || raw.includes("UNAUTHENTICATED")) {
      return "Spark Assistant can’t connect (API key / billing issue). Please check your Gemini API key and plan.";
    }

    console.error("Gemini API Error:", error);
    return "Sparky had a problem. Please try again.";
  }
};
