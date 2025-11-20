
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationConfig, SlideContent, WordSlideContent, WordCardItem, WordCardGridSlide, AppMode, GeneratedContent } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_ID = 'gemini-2.5-flash';

export const generatePresentationContent = async (
  config: GenerationConfig
): Promise<GeneratedContent[]> => {
  
  if (config.mode === AppMode.WORD_EXAMPLES) {
    return generateWordContent(config.sourceText);
  } else if (config.mode === AppMode.WORD_CARDS) {
    return generateWordCardContent(config.sourceText);
  } else {
    return generateSentencePairs(config.sourceText);
  }
};

const generateSentencePairs = async (sourceText: string): Promise<SlideContent[]> => {
  const systemInstruction = `
    You are an expert content formatter for language learning slides.
    Your task is to take the user's input and output a list of English sentences paired with their Chinese translations.
    
    Rules:
    1. Each item must contain exactly one English sentence and its Chinese translation.
    2. If the user provides a topic (e.g., "At the airport"), generate useful conversational sentences about that topic.
    3. If the user provides raw text, split it into logical sentence pairs and translate if necessary.
    4. Keep sentences concise enough to fit on a slide (max 10-15 words ideal).
  `;

  const prompt = `
    Input Source:
    "${sourceText}"

    Generate a list of objects with "english" and "chinese" fields.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_ID,
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            english: { type: Type.STRING },
            chinese: { type: Type.STRING },
          },
          required: ["english", "chinese"],
        },
      },
    },
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("No content generated.");
  return JSON.parse(jsonText) as SlideContent[];
};

const generateWordContent = async (sourceText: string): Promise<WordSlideContent[]> => {
  const systemInstruction = `
    You are an English teacher creating vocabulary slides for BEGINNER/ELEMENTARY students.
    For each word provided by the user:
    1. Identify the word.
    2. Create TWO distinct example sentences (Example 1 and Example 2).
    3. Provide the Chinese translation for each example sentence.
    4. CRITICAL: The example sentences MUST use very simple, high-frequency elementary vocabulary (CEFR A1/A2 level). Avoid complex grammar or difficult synonyms. Keep sentences relatively short.
    5. Ensure the sentences clearly demonstrate the meaning of the target word in a simple context suitable for children or beginners.
  `;

  const prompt = `
    Input Words/Topic:
    "${sourceText}"

    Generate a list of objects. Each object represents one word and includes:
    - "word": The target word (Title Case)
    - "ex1_english": Example sentence 1 in English (Simple A1/A2 level)
    - "ex1_chinese": Translation of example 1
    - "ex2_english": Example sentence 2 in English (Simple A1/A2 level)
    - "ex2_chinese": Translation of example 2
  `;

  const response = await ai.models.generateContent({
    model: MODEL_ID,
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            ex1_english: { type: Type.STRING },
            ex1_chinese: { type: Type.STRING },
            ex2_english: { type: Type.STRING },
            ex2_chinese: { type: Type.STRING },
          },
          required: ["word", "ex1_english", "ex1_chinese", "ex2_english", "ex2_chinese"],
        },
      },
    },
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("No content generated.");
  return JSON.parse(jsonText) as WordSlideContent[];
};

const generateWordCardContent = async (sourceText: string): Promise<WordCardGridSlide[]> => {
  const systemInstruction = `
    You are an expert vocabulary card generator.
    Your task is to extract words from the input, or generate relevant words if a topic is provided.
    For each word, provide:
    1. The English word (Title Case).
    2. The IPA Phonetic transcription (e.g., /həˈləʊ/).
    3. The Chinese meaning (concise).
  `;

  const prompt = `
    Input Words/Topic:
    "${sourceText}"

    Generate a list of objects.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_ID,
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            english: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            chinese: { type: Type.STRING },
          },
          required: ["english", "phonetic", "chinese"],
        },
      },
    },
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("No content generated.");
  
  const items = JSON.parse(jsonText) as WordCardItem[];
  
  // Chunk items into groups of 4 for the grid slides
  const slides: WordCardGridSlide[] = [];
  for (let i = 0; i < items.length; i += 4) {
    slides.push({
      items: items.slice(i, i + 4)
    });
  }
  
  return slides;
};
