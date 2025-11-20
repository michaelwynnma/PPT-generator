
import React, { useState } from 'react';
import { GenerationConfig, AppMode } from '../types';
import { Sparkles, MessageSquare, BookOpen, Grid } from 'lucide-react';

interface InputFormProps {
  onSubmit: (config: GenerationConfig) => void;
  isGenerating: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isGenerating }) => {
  const [sourceText, setSourceText] = useState('');
  const [mode, setMode] = useState<AppMode>(AppMode.SENTENCE_PAIRS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim()) return;
    onSubmit({ sourceText, mode });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200">
        <button
          type="button"
          onClick={() => setMode(AppMode.SENTENCE_PAIRS)}
          className={`flex-1 py-4 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors ${
            mode === AppMode.SENTENCE_PAIRS
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <MessageSquare size={18} />
          <span className="hidden sm:inline">Sentences</span>
          <span className="sm:hidden">Sent.</span>
        </button>
        <button
          type="button"
          onClick={() => setMode(AppMode.WORD_EXAMPLES)}
          className={`flex-1 py-4 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors ${
            mode === AppMode.WORD_EXAMPLES
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <BookOpen size={18} />
          <span className="hidden sm:inline">Examples</span>
          <span className="sm:hidden">Ex.</span>
        </button>
        <button
          type="button"
          onClick={() => setMode(AppMode.WORD_CARDS)}
          className={`flex-1 py-4 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors ${
            mode === AppMode.WORD_CARDS
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Grid size={18} />
          <span className="hidden sm:inline">Word Cards</span>
          <span className="sm:hidden">Cards</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8">
        <div className="mb-8">
          <label htmlFor="sourceText" className="block text-lg font-bold text-slate-800 mb-3">
            {mode === AppMode.SENTENCE_PAIRS && 'Sentence/Topic Input'}
            {mode === AppMode.WORD_EXAMPLES && 'Word List Input'}
            {mode === AppMode.WORD_CARDS && 'Vocabulary List'}
          </label>
          <p className="text-sm text-slate-500 mb-4">
            {mode === AppMode.SENTENCE_PAIRS && 'Enter a topic or raw text. The AI will format it into English/Chinese sentence pairs.'}
            {mode === AppMode.WORD_EXAMPLES && 'Enter words. The AI will generate 2 simple example sentences for each word.'}
            {mode === AppMode.WORD_CARDS && 'Enter words. The AI will generate phonetics and definitions in a 4-grid layout.'}
          </p>
          <textarea
            id="sourceText"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder={
              mode === AppMode.SENTENCE_PAIRS 
                ? "Example:\nHello, how are you?\nI am going to the park."
                : "Example:\nApple\nBanana\nComputer"
            }
            className="w-full h-48 p-4 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none text-slate-700 placeholder:text-slate-400 text-lg"
            disabled={isGenerating}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating || !sourceText.trim()}
          className={`w-full py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] ${
            isGenerating || !sourceText.trim()
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
          }`}
        >
          {isGenerating ? (
            <>
              <Sparkles className="animate-spin" size={24} />
              Processing...
            </>
          ) : (
            <>
              <Sparkles size={24} />
              Generate
            </>
          )}
        </button>
      </form>
    </div>
  );
};
