
import React from 'react';
import { SlideContent, WordSlideContent, WordCardGridSlide, WordCardItem, GeneratedContent, WordExampleSegment } from '../types';

interface SlideCardProps {
  slide: GeneratedContent;
  index: number;
}

// Sentence Mode Pool (19)
const SENTENCE_COLORS = [
  "#FF6247", "#FE8666", "#FD3E01", "#FE9A2E", "#FAC006",
  "#B0B673", "#749258", "#32CD32", "#00D643", "#2E8B57",
  "#00CED1", "#12B0B5", "#1E90FE", "#6A5ACD", "#A676FE",
  "#8A2BE2", "#CA27FF", "#FF1493", "#E85A66"
];

// Word Mode Pool (18)
const WORD_COLORS = [
  "#05AEC0", "#FB3701", "#FAC006", "#B1B76D", "#E95A66", "#FE8666",
  "#739852", "#00D643", "#CA27FF", "#FF9A2E", "#A676FF", "#BA4C48",
  "#FEE07D", "#0A64DC", "#78C8A0", "#C878E6", "#FA8C3C", "#50B6E6"
];

const getRandomColor = (pool: string[]) => {
  return pool[Math.floor(Math.random() * pool.length)];
};

const SentencePreview: React.FC<{ slide: SlideContent }> = ({ slide }) => {
  // Memoize colored segments to ensure EN and CN colors match and don't change on re-render
  const coloredSegments = React.useMemo(() => {
    return slide.segments.map(seg => ({
      ...seg,
      color: getRandomColor(SENTENCE_COLORS)
    }));
  }, [slide.segments]);
  
  return (
    <div className="flex flex-col h-full">
      {/* English Section */}
      <div className="flex-1 flex content-start flex-wrap gap-x-2 overflow-hidden">
          {coloredSegments.map((seg, i) => (
              <span 
                  key={i} 
                  style={{ color: seg.color, fontFamily: '"Arial Black", sans-serif' }}
                  className="text-2xl font-black leading-snug"
              >
                  {seg.en}
              </span>
          ))}
      </div>

      {/* Gap */}
      <div className="h-[4.5%] w-full min-h-4"></div>

      {/* Chinese Section */}
      <div className="flex-1 overflow-hidden flex flex-wrap content-start gap-x-0">
          {coloredSegments.map((seg, i) => (
              <span 
                  key={i} 
                  style={{ color: seg.color, fontFamily: '"Microsoft YaHei", sans-serif' }}
                  className="text-2xl font-bold leading-snug"
              >
                  {seg.cn}
              </span>
          ))}
      </div>
    </div>
  );
};

const WordPreview: React.FC<{ slide: WordSlideContent }> = ({ slide }) => {
  // Memoize title color
  const titleColor = React.useMemo(() => getRandomColor(WORD_COLORS), []);
  
  // Memoize colored segments to prevent flicker and ensure matching colors
  const ex1ColoredSegments = React.useMemo(() => {
    return slide.ex1_segments.map(seg => ({ ...seg, color: getRandomColor(WORD_COLORS) }));
  }, [slide.ex1_segments]);

  const ex2ColoredSegments = React.useMemo(() => {
    return slide.ex2_segments.map(seg => ({ ...seg, color: getRandomColor(WORD_COLORS) }));
  }, [slide.ex2_segments]);

  return (
    <div className="relative h-full w-full text-sm sm:text-base overflow-hidden select-none pointer-events-none">
      
      {/* Title */}
      <div className="absolute top-[7%] left-0 w-full">
        <h3 style={{ color: titleColor, fontFamily: '"Arial Black", sans-serif' }} className="text-3xl font-black truncate">
          {slide.word}
        </h3>
      </div>

      {/* Ex 1 English */}
      <div className="absolute top-[25%] left-0 w-full font-black leading-tight flex flex-wrap gap-x-1">
         {ex1ColoredSegments.map((seg, i) => (
            <span key={i} style={{ color: seg.color, fontFamily: '"Arial Black", sans-serif' }}>
              {seg.en}
            </span>
         ))}
      </div>

      {/* Ex 1 Chinese */}
      <div className="absolute top-[36%] left-0 w-full font-bold leading-tight flex flex-wrap gap-x-0">
         {ex1ColoredSegments.map((seg, i) => (
            <span key={i} style={{ color: seg.color, fontFamily: '"Microsoft YaHei", sans-serif' }}>
              {seg.cn}
            </span>
         ))}
      </div>

      {/* Ex 2 English */}
      <div className="absolute top-[63%] left-0 w-full font-black leading-tight flex flex-wrap gap-x-1">
        {ex2ColoredSegments.map((seg, i) => (
            <span key={i} style={{ color: seg.color, fontFamily: '"Arial Black", sans-serif' }}>
              {seg.en}
            </span>
         ))}
      </div>

      {/* Ex 2 Chinese */}
      <div className="absolute top-[74%] left-0 w-full font-bold leading-tight flex flex-wrap gap-x-0">
        {ex2ColoredSegments.map((seg, i) => (
            <span key={i} style={{ color: seg.color, fontFamily: '"Microsoft YaHei", sans-serif' }}>
              {seg.cn}
            </span>
         ))}
      </div>

    </div>
  );
};

const GridPreview: React.FC<{ slide: WordCardGridSlide }> = ({ slide }) => {
  
  const renderItem = (item: WordCardItem, index: number) => {
    return (
      <div key={index} className="flex h-full overflow-hidden p-1 gap-2 border-b border-slate-100 last:border-0">
          {/* Left Column: English + Phonetic (65%) */}
          <div className="w-[65%] flex flex-col justify-start pt-1 gap-0">
             {/* English (Fixed Black) */}
             <div className="flex-none">
               <span style={{ color: '#000000', fontFamily: '"Arial Black", sans-serif' }} className="text-4xl font-black leading-none break-words block">
                 {item.english}
               </span>
             </div>
             
             {/* Phonetic (Fixed Gray) */}
             <div className="flex-none">
               <span style={{ color: '#808080', fontFamily: 'Arial, sans-serif' }} className="text-2xl font-bold leading-none block">
                 {item.phonetic}
               </span>
             </div>
          </div>
          
          {/* Right Column: Chinese (35%) - Fixed Blue */}
          <div className="w-[35%] pt-1 flex justify-start">
             <span style={{ color: '#0070C0', fontFamily: '"Microsoft YaHei", sans-serif' }} className="text-4xl font-bold leading-none block break-words">
                {item.chinese}
             </span>
          </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 grid-rows-4 w-full h-full gap-0">
      {slide.items.map((item, idx) => (
        <div key={idx} className="w-full h-full overflow-hidden">
           {renderItem(item, idx)}
        </div>
      ))}
    </div>
  );
};

export const SlideCard: React.FC<SlideCardProps> = ({ slide, index }) => {
  let type = 'Sentence';
  if ('word' in slide) type = 'Word Examples';
  if ('items' in slide) type = 'Word Cards';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* Visual Preview - Aspect Ratio 32.15 / 33.87 */}
      <div className="relative bg-white border-b border-slate-100 p-4 mx-auto" style={{ aspectRatio: '32.15/33.87', width: '100%' }}>
        {'items' in slide ? (
           <GridPreview slide={slide as WordCardGridSlide} />
        ) : 'word' in slide ? (
          <WordPreview slide={slide as WordSlideContent} />
        ) : (
          <SentencePreview slide={slide as SlideContent} />
        )}
      </div>
      
      <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Page {index + 1} ({type})
        </p>
      </div>
    </div>
  );
};
