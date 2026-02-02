'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface OceanRoomProps {
  onExit: (completed?: boolean) => void;
}

const WRITING_PROMPTS = [
  "What am I grateful for in this moment?",
  "What truth do I need to acknowledge today?",
  "What am I ready to release?",
  "What fills my heart with peace?",
  "What would I tell my younger self?",
  "What dream am I nurturing?",
  "What lesson has the ocean taught me?",
  "What do I need to forgive myself for?"
];

export function OceanRoom({ onExit }: OceanRoomProps) {
  const [step, setStep] = useState<'overview' | 'lectern'>('overview');
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [writtenText, setWrittenText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    audioRef.current.play().catch(() => {});

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selectedPrompt && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selectedPrompt]);

  const handleApproachLectern = () => {
    setStep('lectern');
  };

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
    setWrittenText('');
  };

  const handleLayItDown = () => {
    setSelectedPrompt(null);
    setWrittenText('');
    toast({
      title: "Released",
      description: "Your words have been laid down to the ocean.",
    });
  };

  const handleSaveAndExit = async () => {
    if (!selectedPrompt) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save entries.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('ocean_entries')
        .insert({
          user_id: user.id,
          prompt: selectedPrompt,
          content: writtenText,
        });

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Your reflection has been preserved.",
      });

      onExit(true);
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error",
        description: "Failed to save your entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReturnToHall = () => {
    setStep('overview');
    setSelectedPrompt(null);
    setWrittenText('');
    onExit(false);
  };

  if (step === 'overview') {
    return (
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/chatgpt_image_feb_1,_2026,_02_21_46_pm.png)' }}
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative h-full flex flex-col items-center justify-center space-y-8 px-4">
          <h1 className="text-5xl md:text-6xl font-lora font-light text-white text-center drop-shadow-lg">
            Ocean Room
          </h1>
          <p className="text-xl md:text-2xl font-light text-gray-200 text-center max-w-2xl drop-shadow-lg">
            Reflect. Write. Release.
          </p>
          <button
            onClick={handleApproachLectern}
            className="px-12 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40 rounded-lg text-white font-medium text-lg tracking-wide transition-all shadow-lg hover:shadow-xl"
          >
            Approach the Lectern
          </button>
          <button
            onClick={handleReturnToHall}
            className="px-8 py-2 text-white/80 hover:text-white transition-colors"
          >
            Return to Inner Hall
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/chatgpt_image_feb_1,_2026,_02_21_46_pm.png)' }}
      />

      <div className="relative h-full flex items-center justify-center">
        {!selectedPrompt ? (
          <div className="relative">
            <div className="bg-amber-50/95 backdrop-blur-sm rounded-lg shadow-2xl p-8 max-w-2xl border-4 border-amber-900/50">
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-serif text-amber-900 mb-2">Choose Your Reflection</h2>
                <p className="text-amber-800/80 italic">Select a prompt to begin writing</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {WRITING_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptSelect(prompt)}
                    className="text-left p-4 bg-white/60 hover:bg-white/90 rounded-md border-2 border-amber-700/30 hover:border-amber-700/60 transition-all duration-200 font-serif text-amber-900 hover:shadow-md"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Button
                  onClick={handleReturnToHall}
                  variant="outline"
                  className="bg-amber-100/80 hover:bg-amber-200/80 text-amber-900 border-amber-700/50"
                >
                  Return to Inner Hall
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="bg-amber-50/95 backdrop-blur-sm rounded-lg shadow-2xl p-8 max-w-3xl w-[90vw] border-4 border-amber-900/50">
              <div className="mb-4">
                <h3 className="text-2xl font-serif text-amber-900 italic mb-4 text-center">
                  {selectedPrompt}
                </h3>
              </div>

              <div className="bg-white/60 rounded-md p-6 mb-6 border-2 border-amber-700/30 min-h-[300px]">
                <textarea
                  ref={textareaRef}
                  value={writtenText}
                  onChange={(e) => setWrittenText(e.target.value)}
                  className="w-full h-full min-h-[280px] bg-transparent border-none outline-none resize-none font-serif text-lg text-amber-900 leading-relaxed"
                  placeholder="Let your thoughts flow onto the page..."
                  style={{ caretColor: '#78350f' }}
                />
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleLayItDown}
                  variant="outline"
                  className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600 px-8 py-6 text-lg font-serif"
                >
                  Lay It Down
                </Button>
                <Button
                  onClick={handleSaveAndExit}
                  disabled={isSaving || !writtenText.trim()}
                  className="bg-amber-700 hover:bg-amber-600 text-white px-8 py-6 text-lg font-serif"
                >
                  {isSaving ? 'Saving...' : 'Save and Exit'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
