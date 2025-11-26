
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
    
    CRITICAL RULE FOR COLOR MATCHING:
    You must break down each sentence into corresponding segments (meaning units) so that the English phrase matches the Chinese phrase.
    Example: 
    Input: "I like apples."
    Output segments: [
      { "en": "I", "cn": "我" },
      { "en": "like", "cn": "喜欢" },
      { "en": "apples", "cn": "苹果" }
    ]
    
    Rules:
    1. If the user provides a topic, generate useful conversational sentences about that topic.
    2. If the user provides raw text, split it into logical sentence pairs and segment them.
    3. Keep sentences concise enough to fit on a slide (max 10-15 words ideal).
    4. PRESERVE SPEAKER NAMES: If the input contains speaker names (e.g. "Alice:", "Bob:"), DO NOT REMOVE THEM. You MUST include the speaker name as the first segment.
       Example: { "en": "Alice:", "cn": "爱丽丝：" }
  `;

  const prompt = `
    Input Source:
    "${sourceText}"

    Generate a list of objects. Each object must have a "segments" array containing {en, cn} pairs.
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
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING },
                  cn: { type: Type.STRING },
                },
                required: ["en", "cn"],
              },
            },
          },
          required: ["segments"],
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
    2. Create TWO distinct example sentences.
    3. CRITICAL: For each sentence, break it down into word-for-word or phrase-for-phrase segments mapping English to Chinese. 
       This is for color-coded learning (e.g. "The cat" -> "这只猫", "is" -> "是", "cute" -> "可爱的").
    4. The example sentences MUST use very simple, high-frequency elementary vocabulary (CEFR A1/A2 level). 
  `;

  const prompt = `
    Input Words/Topic:
    "${sourceText}"

    Generate a list of objects. Each object represents one word and includes:
    - "word": The target word (Title Case)
    - "ex1_segments": Array of {en: string, cn: string} objects for the first sentence.
    - "ex2_segments": Array of {en: string, cn: string} objects for the second sentence.
    
    Make sure the 'en' and 'cn' segments correspond in meaning so they can be colored identically.
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
            ex1_segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING },
                  cn: { type: Type.STRING }
                },
                required: ["en", "cn"]
              }
            },
            ex2_segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING },
                  cn: { type: Type.STRING }
                },
                required: ["en", "cn"]
              }
            }
          },
          required: ["word", "ex1_segments", "ex2_segments"],
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
