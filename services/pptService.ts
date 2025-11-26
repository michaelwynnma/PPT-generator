
import PptxGenJS from "pptxgenjs";
import { SlideContent, WordSlideContent, WordCardGridSlide, GeneratedFile, AppMode, WordExampleSegment } from "../types";

// --- SHARED CONSTANTS ---
const PAGE_WIDTH_CM = 32.15;
const PAGE_HEIGHT_CM = 33.87;
const MARGIN_CM = 1.0;
const LAYOUT_NAME = "CUSTOM_VERTICAL";

// Helper to convert CM to Inches
const cmToIn = (cm: number) => cm / 2.54;

// --- MODE 1 & 3 POOL (19 Colors) ---
const SENTENCE_COLOR_POOL = [
  "FF6247", "FE8666", "FD3E01", "FE9A2E", "FAC006",
  "B0B673", "749258", "32CD32", "00D643", "2E8B57",
  "00CED1", "12B0B5", "1E90FE", "6A5ACD", "A676FE",
  "8A2BE2", "CA27FF", "FF1493", "E85A66"
];

// --- MODE 2 POOL (18 Colors) ---
const WORD_COLOR_POOL = [
  "05AEC0", "FB3701", "FAC006", "B1B76D", "E95A66", "FE8666",
  "739852", "00D643", "CA27FF", "FF9A2E", "A676FF", "BA4C48",
  "FEE07D", "0A64DC", "78C8A0", "C878E6", "FA8C3C", "50B6E6"
];

const getRandomColor = (pool: string[]) => {
  return pool[Math.floor(Math.random() * pool.length)];
};

// --- INITIALIZE PRESENTATION ---
const initPres = (title: string) => {
  const pres = new PptxGenJS();
  pres.defineLayout({ name: LAYOUT_NAME, width: cmToIn(PAGE_WIDTH_CM), height: cmToIn(PAGE_HEIGHT_CM) });
  pres.layout = LAYOUT_NAME;
  pres.title = title;
  return pres;
};

// --- ADD SLIDES HELPERS ---

// 1. Sentence Pairs
const addSentenceSlidesToPres = (pres: PptxGenJS, slides: SlideContent[]) => {
  const GAP_CM = 1.5;
  const totalVerticalMargin = (MARGIN_CM * 2) + GAP_CM;
  const availableHeightCm = PAGE_HEIGHT_CM - totalVerticalMargin;
  const boxHeightCm = availableHeightCm / 2;
  const marginIn = cmToIn(MARGIN_CM);
  const safeWidth = cmToIn(PAGE_WIDTH_CM - (MARGIN_CM * 2));
  
  const englishY = marginIn;
  const englishH = cmToIn(boxHeightCm);
  const chineseY = cmToIn(MARGIN_CM + boxHeightCm + GAP_CM);
  const chineseH = cmToIn(boxHeightCm);

  slides.forEach((slideData) => {
    const slide = pres.addSlide();
    slide.background = { color: "FFFFFF" };

    // Prepare colored segments
    const coloredSegments = slideData.segments.map(seg => ({
      en: seg.en + " ", // Add space to English words
      cn: seg.cn,
      color: getRandomColor(SENTENCE_COLOR_POOL)
    }));

    // Construct English Text Objects
    const englishTextObjects = coloredSegments.map(seg => ({
      text: seg.en,
      options: {
        fontSize: 80,
        fontFace: "Arial Black",
        bold: true,
        color: seg.color,
        breakLine: false,
      }
    }));

    // Construct Chinese Text Objects
    const chineseTextObjects = coloredSegments.map(seg => ({
      text: seg.cn,
      options: {
        fontSize: 80,
        fontFace: "Microsoft YaHei",
        bold: true,
        color: seg.color,
        breakLine: false,
      }
    }));

    // Add English Block
    slide.addText(englishTextObjects, {
      x: marginIn, y: englishY, w: safeWidth, h: englishH,
      align: "left", valign: "top", autoFit: false, wrap: true, margin: 0,
    });

    // Add Chinese Block
    slide.addText(chineseTextObjects, {
      x: marginIn, y: chineseY, w: safeWidth, h: chineseH,
      align: "left", valign: "top", autoFit: false, wrap: true, margin: 0,
    });
  });
};

// 2. Word Examples
const addWordSlidesToPres = (pres: PptxGenJS, slides: WordSlideContent[]) => {
  const marginIn = cmToIn(MARGIN_CM);
  const safeWidth = cmToIn(PAGE_WIDTH_CM - (MARGIN_CM * 2));

  const titleY = cmToIn(2.5);
  const ex1EngY = cmToIn(2.5 + 6.0); 
  const ex1ChiY = cmToIn(8.5 + 3.8); 
  const ex2EngY = cmToIn(12.3 + 9.0); 
  const ex2ChiY = cmToIn(21.3 + 3.8); 
  const textBoxHeight = cmToIn(4.0);

  slides.forEach((slideData) => {
    const slide = pres.addSlide();
    slide.background = { color: "FFFFFF" };

    // Title
    slide.addText(slideData.word, {
      x: marginIn, y: titleY, w: safeWidth, h: cmToIn(3),
      fontSize: 80, fontFace: "Arial Black", bold: true,
      color: getRandomColor(WORD_COLOR_POOL),
      align: "left", valign: "top", autoFit: false, wrap: true, margin: 0,
    });

    // Helper to process segments into PptxGenJS Text Items
    const createSegmentTextObjects = (segments: WordExampleSegment[], fontFace: string, isEnglish: boolean) => {
      // 1. Assign a random color to each segment (same color for en and cn)
      const coloredSegments = segments.map(seg => ({
        ...seg,
        color: getRandomColor(WORD_COLOR_POOL)
      }));

      // 2. Create text objects
      return coloredSegments.map(seg => ({
        text: (isEnglish ? seg.en : seg.cn) + (isEnglish ? " " : ""), // Add space for English
        options: {
          fontSize: 80, 
          fontFace: fontFace, 
          bold: true,
          color: seg.color, 
          breakLine: false
        }
      }));
    };

    // Pre-calculate colored segments to ensure EN and CN match
    // Note: We need to do this per example sentence to ensure mapping is correct
    const processExample = (segments: WordExampleSegment[], engY: number, chiY: number) => {
        const coloredData = segments.map(seg => ({
            en: seg.en + " ",
            cn: seg.cn,
            color: getRandomColor(WORD_COLOR_POOL)
        }));

        const englishTextObjs = coloredData.map(d => ({
            text: d.en,
            options: { fontSize: 80, fontFace: "Arial Black", bold: true, color: d.color, breakLine: false }
        }));

        const chineseTextObjs = coloredData.map(d => ({
            text: d.cn,
            options: { fontSize: 80, fontFace: "Microsoft YaHei", bold: true, color: d.color, breakLine: false }
        }));

        slide.addText(englishTextObjs, {
            x: marginIn, y: engY, w: safeWidth, h: textBoxHeight,
            align: "left", valign: "top", autoFit: false, wrap: true, margin: 0,
        });

        slide.addText(chineseTextObjs, {
            x: marginIn, y: chiY, w: safeWidth, h: textBoxHeight,
            align: "left", valign: "top", autoFit: false, wrap: true, margin: 0,
        });
    };

    // Example 1
    processExample(slideData.ex1_segments, ex1EngY, ex1ChiY);

    // Example 2
    processExample(slideData.ex2_segments, ex2EngY, ex2ChiY);
  });
};

// 3. Word Cards
const addWordCardSlidesToPres = (pres: PptxGenJS, slides: WordCardGridSlide[]) => {
  const marginIn = cmToIn(MARGIN_CM);
  const pageWidthIn = cmToIn(PAGE_WIDTH_CM);
  const pageHeightIn = cmToIn(PAGE_HEIGHT_CM);

  // Layout: 4 Rows Vertically (Top to Bottom)
  const availableHeightIn = pageHeightIn - (marginIn * 2);
  const rowHeightIn = availableHeightIn / 4;
  
  // Horizontal Layout within row:
  // Left Side: English + Phonetic
  // Right Side: Chinese
  const contentWidthIn = pageWidthIn - (marginIn * 2);
  const splitRatio = 0.65; // 65% Left, 35% Right
  const leftWidthIn = contentWidthIn * splitRatio;
  const rightWidthIn = contentWidthIn * (1 - splitRatio);
  const colGapIn = cmToIn(0.5); 

  // Vertical Spacing Logic
  // 80pt font is roughly 2.8cm tall.
  // User requested "Tight" spacing. 
  // English starts at top. Phonetic starts roughly 2.8cm down.
  const englishLineHeightCm = 2.8; 
  const phoneticOffsetY = cmToIn(englishLineHeightCm); 

  slides.forEach((slideData) => {
    const slide = pres.addSlide();
    slide.background = { color: "FFFFFF" };

    slideData.items.forEach((item, idx) => {
      if (idx > 3) return; // Max 4 items

      // Calculate Y position for this row
      const rowY = marginIn + (idx * rowHeightIn);
      const leftX = marginIn;
      const rightX = marginIn + leftWidthIn + (colGapIn / 2);
      
      // --- Left Column ---
      // English (Top Left of Row)
      slide.addText(item.english, {
        x: leftX, y: rowY, w: leftWidthIn - (colGapIn / 2), h: phoneticOffsetY,
        fontSize: 80, fontFace: "Arial Black", bold: true,
        color: "000000", // Fixed Black
        align: "left", valign: "top", autoFit: false, wrap: true, margin: 0
      });

      // Phonetic (Below English - Tight)
      slide.addText(item.phonetic, {
        x: leftX, y: rowY + phoneticOffsetY, w: leftWidthIn - (colGapIn / 2), h: rowHeightIn - phoneticOffsetY,
        fontSize: 65, fontFace: "Arial", bold: true,
        color: "808080", // Fixed Gray RGB 128,128,128
        align: "left", valign: "top", autoFit: false, wrap: true, margin: 0
      });

      // --- Right Column ---
      // Chinese (Aligned Top Right of Row)
      slide.addText(item.chinese, {
        x: rightX, y: rowY, w: rightWidthIn - (colGapIn / 2), h: rowHeightIn,
        fontSize: 80, fontFace: "Microsoft YaHei", bold: true,
        color: "0070C0", // Fixed Blue RGB 0,112,192
        align: "left", valign: "top", autoFit: false, wrap: true, margin: 0
      });
    });
  });
};


// --- EXPORTED GENERATORS ---

export const createSentencePptFile = async (slides: SlideContent[], fileName: string): Promise<void> => {
  const pres = initPres(fileName);
  addSentenceSlidesToPres(pres, slides);
  await pres.writeFile({ fileName: `${fileName}.pptx` });
};

export const createWordPptFile = async (slides: WordSlideContent[], fileName: string): Promise<void> => {
  const pres = initPres(fileName);
  addWordSlidesToPres(pres, slides);
  await pres.writeFile({ fileName: `${fileName}.pptx` });
};

export const createWordCardPptFile = async (slides: WordCardGridSlide[], fileName: string): Promise<void> => {
  const pres = initPres(fileName);
  addWordCardSlidesToPres(pres, slides);
  await pres.writeFile({ fileName: `${fileName}.pptx` });
};

// --- MERGE GENERATOR ---

export const createMergedPptFile = async (files: GeneratedFile[], fileName: string): Promise<void> => {
  const pres = initPres(fileName);

  files.forEach(file => {
    switch (file.mode) {
      case AppMode.SENTENCE_PAIRS:
        addSentenceSlidesToPres(pres, file.slides as SlideContent[]);
        break;
      case AppMode.WORD_EXAMPLES:
        addWordSlidesToPres(pres, file.slides as WordSlideContent[]);
        break;
      case AppMode.WORD_CARDS:
        addWordCardSlidesToPres(pres, file.slides as WordCardGridSlide[]);
        break;
    }
  });

  await pres.writeFile({ fileName: `${fileName}.pptx` });
};
