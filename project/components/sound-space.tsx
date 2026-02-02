'use client';

import { useState, useRef, useEffect } from 'react';
import { Droplets, Music } from 'lucide-react';
import YouTube from 'react-youtube';

interface Sound {
  id: string;
  name: string;
  youtubeId: string;
}

const CLEANSING_SOUNDS: Sound[] = [
  { id: 'daylight', name: 'Daylight', youtubeId: 'PI-G_ekGn1I' },
  { id: 'beyond-stillness', name: 'Beyond Stillness', youtubeId: '7_ACSngnHeo' },
  { id: 'low-orbit', name: 'Low Orbit', youtubeId: '5sUZvPJCjV8' },
  { id: 'beneath-quiet-stars', name: 'Beneath Quiet Stars', youtubeId: '--eebjGXq2c' },
];

const BATHING_SOUNDS: Sound[] = [
  { id: 'protection', name: 'Protection', youtubeId: 'y0un2D4soVc' },
  { id: 'behind-glass', name: 'Behind the Glass', youtubeId: '1zHY_8UGpx8' },
  { id: 'orbital-drift', name: 'Orbital Drift', youtubeId: 'clPa8mt-qg4' },
];

interface SoundSpaceProps {
  onBack?: () => void;
}

export function SoundSpace({ onBack }: SoundSpaceProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'cleansing' | 'bathing' | null>(null);
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [lastYtState, setLastYtState] = useState<number | null>(null);
  const [lastYtError, setLastYtError] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<string>('');
  const narrationRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const narration = new Audio('https://www.dropbox.com/scl/fi/jdtnpghpesoqj1y2enzah/narration.wav?rlkey=y5lltumywovgutn6fsjwmmqk4&st=nk5ifu84&dl=1');
    narration.volume = 0.6;
    narrationRef.current = narration;

    narration.onended = () => {
      setIsNarrating(false);
      if (narrationRef.current) {
        narrationRef.current.pause();
        narrationRef.current.currentTime = 0;
      }
      narrationRef.current = null;
    };

    return () => {
      if (narrationRef.current) {
        narrationRef.current.pause();
        narrationRef.current.currentTime = 0;
      }
      narrationRef.current = null;
      if (playerRef.current && playerRef.current.stopVideo) {
        try {
          playerRef.current.stopVideo();
        } catch (error) {
          console.error('Error stopping video on cleanup:', error);
        }
      }
    };
  }, []);

  const handleYouTubeReady = (event: any) => {
    console.log('YT READY', !!event.target);
    playerRef.current = event.target;
    setIsReady(true);
  };

  const handleYouTubeStateChange = (event: any) => {
    const stateNames: { [key: number]: string } = {
      '-1': 'UNSTARTED',
      '0': 'ENDED',
      '1': 'PLAYING',
      '2': 'PAUSED',
      '3': 'BUFFERING',
      '5': 'CUED',
    };
    const stateName = stateNames[event.data] || 'UNKNOWN';
    console.log('YouTube onStateChange:', event.data, stateName);
    setLastYtState(event.data);

    if (event.data === 1) {
      console.log('YouTube state: PLAYING');
      setIsPlaying(true);
    } else if (event.data === 2) {
      console.log('YouTube state: PAUSED');
      setIsPlaying(false);
    } else if (event.data === 0) {
      console.log('YouTube state: ENDED');
      setIsPlaying(false);
      setHasFinished(true);
    }
  };

  const handleYouTubeError = (event: any) => {
    const errorCodes: { [key: number]: string } = {
      2: 'Invalid parameter',
      5: 'HTML5 player error',
      100: 'Video not found',
      101: 'Video not embeddable',
      150: 'Video not embeddable',
    };
    const errorMsg = errorCodes[event.data] || `Unknown error: ${event.data}`;
    console.log('YT ERROR', event.data);
    console.error('YouTube onError:', event.data, errorMsg);
    setLastYtError(errorMsg);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!soundEnabled) return;
    const a = narrationRef.current;
    if (!a) return;

    setIsNarrating(true);
    a.pause();
    a.currentTime = 0;

    const t = window.setTimeout(() => {
      a.play().catch((error) => {
        console.error('Narration playback failed:', error);
        setIsNarrating(false);
      });
    }, 200);

    return () => window.clearTimeout(t);
  }, [soundEnabled]);

  const handleEnableSound = () => {
    setSoundEnabled(true);
  };

  const handleCategorySelect = (category: 'cleansing' | 'bathing') => {
    if (!soundEnabled) return;
    if (isNarrating) return;

    const a = narrationRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }

    setSelectedCategory(category);
  };

  const handleSoundSelect = (sound: Sound) => {
    console.log('=== Track clicked:', sound.name, '===');
    console.log('soundEnabled:', soundEnabled);
    console.log('isReady:', isReady);
    console.log('playerRef.current:', playerRef.current);

    if (!soundEnabled) return;
    if (!isReady || !playerRef.current) {
      console.error('Player not ready yet');
      setLastYtError('Player not ready yet');
      return;
    }

    console.log('Stopping narration...');
    const a = narrationRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }

    setSelectedSound(sound);
    setHasFinished(false);
    setLastYtError(null);
    setCurrentVideo(sound.name);

    console.log('Will load video in 300ms:', sound.youtubeId);

    setTimeout(() => {
      if (playerRef.current && playerRef.current.loadVideoById) {
        try {
          console.log('Loading video now:', sound.youtubeId);
          playerRef.current.loadVideoById(sound.youtubeId);
          playerRef.current.unMute();
          playerRef.current.setVolume(60);
          console.log('Video loaded, will play in 300ms');
        } catch (error) {
          console.error('Error loading video:', error);
          setLastYtError(String(error));
          setIsPlaying(false);
        }
      }
    }, 300);

    setTimeout(() => {
      if (playerRef.current && playerRef.current.playVideo) {
        try {
          console.log('Playing video now');
          playerRef.current.playVideo();
        } catch (error) {
          console.error('Error playing video:', error);
          setLastYtError(String(error));
          setIsPlaying(false);
        }
      }
    }, 600);
  };

  const handleContinue = () => {
    if (playerRef.current && playerRef.current.stopVideo) {
      try {
        playerRef.current.stopVideo();
      } catch (error) {
        console.error('Error stopping video:', error);
      }
    }
    setSelectedSound(null);
    setHasFinished(false);
    setSelectedCategory(null);
    setIsPlaying(false);
    setCurrentVideo('');
  };

  const handleExit = () => {
    if (narrationRef.current) {
      narrationRef.current.pause();
      narrationRef.current.currentTime = 0;
      narrationRef.current.src = '';
      narrationRef.current = null;
    }
    if (playerRef.current && playerRef.current.stopVideo) {
      try {
        playerRef.current.stopVideo();
      } catch (error) {
        console.error('Error stopping video:', error);
      }
    }
    if (onBack) {
      onBack();
    }
  };

  const handleBack = () => {
    if (narrationRef.current) {
      narrationRef.current.pause();
      narrationRef.current.currentTime = 0;
      narrationRef.current.src = '';
      narrationRef.current = null;
    }
    if (playerRef.current && playerRef.current.stopVideo) {
      try {
        playerRef.current.stopVideo();
      } catch (error) {
        console.error('Error stopping video:', error);
      }
    }
    if (onBack) {
      onBack();
    }
  };

  const currentSounds = selectedCategory === 'cleansing' ? CLEANSING_SOUNDS : BATHING_SOUNDS;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <YouTube
        videoId={CLEANSING_SOUNDS[0].youtubeId}
        opts={{
          playerVars: {
            autoplay: 0,
            controls: 0,
            rel: 0,
            modestbranding: 1,
          },
        }}
        onReady={handleYouTubeReady}
        onStateChange={handleYouTubeStateChange}
        onError={handleYouTubeError}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      <div className="absolute inset-0 z-0">
        <img
          src="https://www.dropbox.com/scl/fi/fsuvyko7g9iccc40yiq4q/ChatGPT-Image-Feb-1-2026-01_20_59-PM.png?rlkey=3ws8xd17l8st2ym3m88jvamhs&st=kw6n6bmn&dl=1"
          alt="Cosmic Chamber"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-8 py-16">
        {!soundEnabled && (
          <div className="text-center">
            <button
              onClick={handleEnableSound}
              className="px-10 py-5 rounded-xl border-2 border-white/40 bg-white/10 hover:bg-white/20 hover:border-white/60 text-white text-2xl font-light transition-all shadow-lg hover:shadow-2xl hover:shadow-white/20"
            >
              Enable Sound
            </button>
            <p className="mt-6 text-white/60 italic text-lg">Click to begin your sound journey</p>
          </div>
        )}

        {soundEnabled && !selectedCategory && !hasFinished && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <button
              onClick={() => handleCategorySelect('cleansing')}
              disabled={isNarrating}
              className={`group relative px-12 py-16 rounded-2xl border-2 transition-all ${
                isNarrating
                  ? 'border-cyan-500/20 bg-cyan-950/20 cursor-not-allowed opacity-40'
                  : 'border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-950/50 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/30'
              }`}
            >
              <div className="flex flex-col items-center gap-6">
                <Droplets className="w-16 h-16 text-cyan-400" />
                <h2 className="text-4xl font-light text-white tracking-wide">Cleansing</h2>
                <p className="text-cyan-300/70 text-sm italic">(release, clearing, lightness)</p>
              </div>
            </button>

            <button
              onClick={() => handleCategorySelect('bathing')}
              disabled={isNarrating}
              className={`group relative px-12 py-16 rounded-2xl border-2 transition-all ${
                isNarrating
                  ? 'border-amber-500/20 bg-amber-950/20 cursor-not-allowed opacity-40'
                  : 'border-amber-500/40 bg-amber-950/30 hover:bg-amber-950/50 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/30'
              }`}
            >
              <div className="flex flex-col items-center gap-6">
                <Music className="w-16 h-16 text-amber-400" />
                <h2 className="text-4xl font-light text-white tracking-wide">Bathing in Sound</h2>
                <p className="text-amber-300/70 text-sm italic">(immersion, holding, depth)</p>
              </div>
            </button>
          </div>
        )}

        {selectedCategory && !hasFinished && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                {selectedCategory === 'cleansing' ? (
                  <Droplets className="w-10 h-10 text-cyan-400" />
                ) : (
                  <Music className="w-10 h-10 text-amber-400" />
                )}
                <h2 className="text-4xl font-light text-white tracking-wide">
                  {selectedCategory === 'cleansing' ? 'Cleansing' : 'Bathing in Sound'}
                </h2>
              </div>
              <p className={`text-sm italic ${selectedCategory === 'cleansing' ? 'text-cyan-300/70' : 'text-amber-300/70'}`}>
                {selectedCategory === 'cleansing' ? '(release, clearing, lightness)' : '(immersion, holding, depth)'}
              </p>
            </div>

            <div className="space-y-4">
              {currentSounds.map((sound) => (
                <button
                  key={sound.id}
                  disabled={!soundEnabled || !isReady}
                  onClick={() => handleSoundSelect(sound)}
                  className={`w-full px-8 py-6 rounded-xl border-2 transition-all ${
                    !soundEnabled || !isReady
                      ? 'opacity-40 cursor-not-allowed border-white/20 bg-white/10'
                      : selectedCategory === 'cleansing'
                      ? isPlaying && selectedSound?.id === sound.id
                        ? 'border-cyan-400 bg-cyan-950/60 shadow-lg shadow-cyan-500/30'
                        : 'border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-950/50 hover:border-cyan-400'
                      : isPlaying && selectedSound?.id === sound.id
                      ? 'border-amber-400 bg-amber-950/60 shadow-lg shadow-amber-500/30'
                      : 'border-amber-500/40 bg-amber-950/30 hover:bg-amber-950/50 hover:border-amber-400'
                  }`}
                >
                  <span className={`text-2xl font-light ${selectedCategory === 'cleansing' ? 'text-cyan-100' : 'text-amber-100'}`}>
                    {sound.name}
                  </span>
                  {isPlaying && selectedSound?.id === sound.id && (
                    <p className={`mt-2 text-sm italic ${selectedCategory === 'cleansing' ? 'text-cyan-300/60' : 'text-amber-300/60'}`}>
                      Playing...
                    </p>
                  )}
                </button>
              ))}
            </div>

            {!isReady && (
              <div className="text-xs opacity-60 mt-4 text-center text-white/60">
                Preparing sound space…
              </div>
            )}
          </div>
        )}

        {hasFinished && (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <p className="text-3xl font-light text-white mb-12">The sound has completed</p>
            <div className="flex gap-6 justify-center">
              <button
                onClick={handleContinue}
                className="px-10 py-4 rounded-xl border-2 border-white/40 bg-white/10 hover:bg-white/20 hover:border-white/60 text-white text-xl font-light transition-all"
              >
                Continue
              </button>
              <button
                onClick={handleExit}
                className="px-10 py-4 rounded-xl border-2 border-white/40 bg-white/10 hover:bg-white/20 hover:border-white/60 text-white text-xl font-light transition-all"
              >
                Exit
              </button>
            </div>
          </div>
        )}

        {soundEnabled && (
          <div className="mt-16 text-center space-y-3">
            {isNarrating ? (
              <p className="text-white/60 italic text-lg">Listen...</p>
            ) : !hasFinished && (
              <>
                <p className="text-white/80 italic text-lg">Close your eyes...</p>
                <p className="text-white/70 italic text-lg">Breathe in...</p>
                <p className="text-white/70 italic text-lg">Breathe out...</p>
              </>
            )}
          </div>
        )}

        <button
          onClick={handleBack}
          className="absolute top-8 left-8 text-white/60 hover:text-white/90 text-sm transition-colors"
        >
          ← Back
        </button>

        <div className="absolute bottom-4 left-4 text-xs text-white/50 font-mono bg-black/30 px-3 py-2 rounded">
          <div>Player ready: {isReady ? '✅' : '❌'}</div>
          <div>playerRef: {playerRef.current ? '✅' : '❌'}</div>
          <div>lastState: {lastYtState !== null ? lastYtState : '-'} {lastYtState === 1 ? '(PLAYING)' : lastYtState === 2 ? '(PAUSED)' : lastYtState === 0 ? '(ENDED)' : ''}</div>
          <div>lastError: {lastYtError || '-'}</div>
          <div>currentVideo: {currentVideo || '-'}</div>
        </div>
      </div>
    </div>
  );
}
