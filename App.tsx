
import React, { useState, useCallback } from 'react';
import { Presentation, Download, RefreshCw, AlertCircle, FileText, CheckSquare, Square, Layers, Trash2 } from 'lucide-react';
import { GenerationConfig, GeneratedContent, GenerationStatus, AppMode, SlideContent, WordSlideContent, WordCardGridSlide, GeneratedFile } from './types';
import { generatePresentationContent } from './services/geminiService';
import { createSentencePptFile, createWordPptFile, createWordCardPptFile, createMergedPptFile } from './services/pptService';
import { InputForm } from './components/InputForm';
import { SlideCard } from './components/SlideCard';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [slides, setSlides] = useState<GeneratedContent[]>([]);
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.SENTENCE_PAIRS);
  const [error, setError] = useState<string | null>(null);
  
  // History & Merge State
  const [history, setHistory] = useState<GeneratedFile[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  
  // Download Progress State
  const [isDownloading, setIsDownloading] = useState(false);

  const handleGenerate = useCallback(async (config: GenerationConfig) => {
    setStatus(GenerationStatus.GENERATING);
    setError(null);
    setSlides([]);
    setCurrentMode(config.mode);

    try {
      const generatedSlides = await generatePresentationContent(config);
      setSlides(generatedSlides);
      setStatus(GenerationStatus.SUCCESS);

      // Add to history
      const timestamp = Date.now();
      const newFile: GeneratedFile = {
        id: timestamp.toString(),
        name: `PPT_${config.mode === AppMode.WORD_CARDS ? 'WordCards' : config.mode === AppMode.WORD_EXAMPLES ? 'Examples' : 'Conversation'}_${new Date(timestamp).toLocaleTimeString()}`,
        mode: config.mode,
        timestamp,
        slides: generatedSlides
      };
      setHistory(prev => [newFile, ...prev]);

    } catch (err) {
      console.error(err);
      setError("Failed to generate content. Please try again.");
      setStatus(GenerationStatus.ERROR);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (slides.length === 0) return;
    
    setIsDownloading(true);
    
    try {
      // Artificial delay to ensure UI updates and user sees the progress bar
      await new Promise(resolve => setTimeout(resolve, 100));

      if (currentMode === AppMode.WORD_EXAMPLES) {
        const fileName = "PPT_例句_单词组名";
        await createWordPptFile(slides as WordSlideContent[], fileName);
      } else if (currentMode === AppMode.WORD_CARDS) {
        const fileName = "PPT_单词学习卡_单词组名";
        await createWordCardPptFile(slides as WordCardGridSlide[], fileName);
      } else {
        const fileName = "PPT_生成_对话内容";
        await createSentencePptFile(slides as SlideContent[], fileName);
      }
    } catch (err) {
      console.error("Download error", err);
      alert("Failed to create PowerPoint file.");
    } finally {
      setIsDownloading(false);
    }
  }, [slides, currentMode]);

  const handleReset = () => {
    setStatus(GenerationStatus.IDLE);
    setSlides([]);
    setError(null);
  };

  // --- History & Merge Logic ---

  const toggleFileSelection = (id: string) => {
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllFiles = () => {
    if (selectedFileIds.size === history.length) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(history.map(f => f.id)));
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setSelectedFileIds(new Set());
  };

  const handleMergeDownload = async () => {
    const filesToMerge = history.filter(f => selectedFileIds.has(f.id)).reverse(); // Reverse to maintain chronological order if needed
    if (filesToMerge.length === 0) return;

    setIsDownloading(true);

    try {
      // Artificial delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const fileName = `Merged_PPT_${filesToMerge.length}_Files`;
      await createMergedPptFile(filesToMerge, fileName);
    } catch (err) {
      console.error("Merge error", err);
      alert("Failed to merge files.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Presentation size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">WordArt PPT Generator</h1>
          </div>
          
          {status === GenerationStatus.SUCCESS && (
            <div className="flex gap-2">
               <button
                onClick={handleReset}
                disabled={isDownloading}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={16} />
                <span className="hidden sm:inline">New</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md shadow-green-100 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
              >
                <Download size={16} />
                Download .pptx
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero / Intro Text (Only show if Idle) */}
        {status === GenerationStatus.IDLE && (
            <div className="text-center mb-10 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                    Multifunctional Slide Generator
                </h2>
                <p className="text-lg text-slate-600">
                    Create vocabulary or conversation slides with strict formatting, random colors, and perfect typography.
                </p>
            </div>
        )}

        {/* Error State */}
        {status === GenerationStatus.ERROR && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
                <h3 className="font-semibold text-red-800">Generation Failed</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <button onClick={handleReset} className="text-sm font-medium text-red-700 underline mt-2">Try Again</button>
            </div>
          </div>
        )}

        {/* Form Section (Hidden if Success) */}
        {status !== GenerationStatus.SUCCESS && (
          <div className="max-w-3xl mx-auto transition-all duration-500 ease-in-out">
            <InputForm onSubmit={handleGenerate} isGenerating={status === GenerationStatus.GENERATING} />
          </div>
        )}

        {/* Results Section */}
        {status === GenerationStatus.SUCCESS && (
          <div className="animate-fade-in-up mb-16">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Generated Slides ({slides.length})</h2>
                <span className="text-sm text-slate-500">Ready to download</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slides.map((slide, index) => (
                <SlideCard key={index} slide={slide} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* History & Merge Section */}
        {history.length > 0 && (
          <div className="mt-12 border-t border-slate-200 pt-8">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                 <FileText className="text-indigo-600" />
                 Generation History
               </h2>
               
               <div className="flex gap-3 items-center">
                 <button 
                   onClick={handleClearHistory}
                   className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                   title="Clear History List"
                 >
                   <Trash2 size={18} />
                   <span className="hidden sm:inline">Clear List</span>
                 </button>
                 
                 <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block"></div>

                 <button 
                   onClick={toggleAllFiles}
                   className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                 >
                   {selectedFileIds.size === history.length ? 'Deselect All' : 'Select All'}
                 </button>
                 <button
                   onClick={handleMergeDownload}
                   disabled={selectedFileIds.size === 0 || isDownloading}
                   className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-md transition-all flex items-center gap-2 ${
                     selectedFileIds.size === 0 || isDownloading
                       ? 'bg-slate-300 cursor-not-allowed' 
                       : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                   }`}
                 >
                   <Layers size={16} />
                   Merge & Download ({selectedFileIds.size})
                 </button>
               </div>
             </div>

             <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
               <table className="w-full text-left text-sm text-slate-600">
                 <thead className="bg-slate-50 border-b border-slate-200">
                   <tr>
                     <th className="px-6 py-4 w-12">
                       <div className="flex items-center justify-center">
                        <div className="w-4 h-4" /> {/* Spacer */}
                       </div>
                     </th>
                     <th className="px-6 py-4 font-bold text-slate-800">Filename</th>
                     <th className="px-6 py-4 font-bold text-slate-800">Mode</th>
                     <th className="px-6 py-4 font-bold text-slate-800">Slides</th>
                     <th className="px-6 py-4 font-bold text-slate-800 text-right">Time</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {history.map((file) => {
                     const isSelected = selectedFileIds.has(file.id);
                     return (
                       <tr 
                         key={file.id} 
                         onClick={() => toggleFileSelection(file.id)}
                         className={`cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                       >
                         <td className="px-6 py-4 text-center">
                           <button 
                             className={`text-indigo-600 transition-transform ${isSelected ? 'scale-110' : 'text-slate-300 hover:text-indigo-400'}`}
                           >
                             {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                           </button>
                         </td>
                         <td className="px-6 py-4 font-medium text-slate-900">
                            {file.name}
                         </td>
                         <td className="px-6 py-4">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                             file.mode === AppMode.SENTENCE_PAIRS ? 'bg-blue-100 text-blue-800' :
                             file.mode === AppMode.WORD_EXAMPLES ? 'bg-purple-100 text-purple-800' :
                             'bg-green-100 text-green-800'
                           }`}>
                             {file.mode.replace('_', ' ')}
                           </span>
                         </td>
                         <td className="px-6 py-4">
                           {file.slides.length} pages
                         </td>
                         <td className="px-6 py-4 text-right font-mono text-slate-500">
                           {new Date(file.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          </div>
        )}

      </main>

      {/* Download Progress Modal */}
      {isDownloading && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          {/* Inline Styles for simple animation without config */}
          <style>{`
            @keyframes slide-progress {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(300%); }
            }
          `}</style>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-in fade-in zoom-in duration-200">
            <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <Download className="text-indigo-600 animate-bounce" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Preparing Download</h3>
            <p className="text-slate-500 mb-8">Generating your PowerPoint file...</p>
            
            {/* Progress Bar Container */}
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden relative">
              {/* Moving Gradient Bar */}
               <div 
                 className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full w-1/3"
                 style={{ animation: 'slide-progress 1.5s infinite linear' }}
               ></div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Please do not close this window</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
