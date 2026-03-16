import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const isOffline = () => !navigator.onLine;

export const geminiService = {
  async generateSummary(content: string) {
    if (isOffline()) {
      return `[OFFLINE MODE] Summary of: ${content.substring(0, 50)}... (Local processing enabled. Full AI summary will sync when online.)`;
    }
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the following educational content for a commuter to listen to. Keep it concise and engaging: \n\n${content}`,
    });
    return response.text;
  },

  async generateQuiz(subject: string, topic: string) {
    if (isOffline()) {
      return [
        {
          question: `[OFFLINE] What is a key concept in ${topic}?`,
          options: ["Concept A", "Concept B", "Concept C", "Concept D"],
          correctAnswer: 0,
          explanation: "Local offline quiz generated."
        }
      ];
    }
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 multiple choice questions for the subject "${subject}" and topic "${topic}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              correctAnswer: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Failed to parse quiz JSON", e);
      return [];
    }
  },

  async lookupTerm(term: string) {
    if (isOffline()) {
      return { 
        definition: `[OFFLINE] Definition for ${term} (Cached/Local)`, 
        example: `Example of ${term} in a sentence.` 
      };
    }
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a concise definition and a simple example for the educational term: "${term}". Format as JSON with "definition" and "example" fields.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            definition: { type: Type.STRING },
            example: { type: Type.STRING }
          },
          required: ["definition", "example"]
        }
      }
    });
    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Failed to parse lookup JSON", e);
      return { definition: "No definition found.", example: "N/A" };
    }
  },

  async processMaterial(name: string) {
    if (isOffline()) {
      return { 
        summary: `[OFFLINE] Local analysis of ${name}.`, 
        objectives: ["Objective 1", "Objective 2"] 
      };
    }
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the learning material titled "${name}" and generate a brief summary and 3 key learning objectives. Format as JSON with "summary" and "objectives" (array of strings).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            objectives: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "objectives"]
        }
      }
    });
    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Failed to parse material JSON", e);
      return { summary: "Processing failed.", objectives: [] };
    }
  },

  async generateAudioLesson(text: string) {
    if (isOffline()) {
      // Fallback to browser TTS if offline
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
      return null; // Signal that we handled it locally
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this lesson summary clearly for a student: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  },

  async chatWithTutor(message: string, context: string) {
    if (isOffline()) {
      return `[OFFLINE] I'm currently in local mode. I can help with basic questions about your ${context.includes('Tasks') ? 'tasks' : 'materials'}. (Full AI reasoning will resume when online.)`;
    }
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction: `You are a helpful, encouraging AI Study Tutor for a commuter app called Velo Study. 
        Keep your answers concise and easy to read while on the go.
        
        User Context:
        ${context}
        
        Use this context to provide personalized advice or answer questions about their specific materials and tasks.`
      }
    });
    return response.text;
  }
};
