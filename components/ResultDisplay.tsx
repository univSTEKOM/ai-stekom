import React, { useState, useRef, useEffect } from 'react';
import { AdResult, GeneratedScene } from '../types';

interface ResultDisplayProps {
  result: AdResult;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Audio State
  const [playingSceneId, setPlayingSceneId] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingAllRef = useRef(false);

  // Stop any currently playing audio
  const stopAllAudio = () => {
    isPlayingAllRef.current = false;
    setIsPlayingAll(false);
    setPlayingSceneId(null);
    
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
  };

  const playSceneAudio = (index: number) => {
    if (playingSceneId === index) {
      stopAllAudio();
      return;
    }

    stopAllAudio();
    const scene = result.scenes[index];
    if (!scene.audioUrl) return;

    // Use audio/wav because the service now returns a WAV file with headers
    const audio = new Audio(`data:audio/wav;base64,${scene.audioUrl}`);
    activeAudioRef.current = audio;
    setPlayingSceneId(index);
    
    audio.play();
    audio.onended = () => {
      setPlayingSceneId(null);
      activeAudioRef.current = null;
    };
  };

  const playAllNarrations = () => {
    if (isPlayingAll) {
      stopAllAudio();
      return;
    }

    stopAllAudio();
    isPlayingAllRef.current = true;
    setIsPlayingAll(true);

    const playSequence = (index: number) => {
      if (!isPlayingAllRef.current) return;
      
      if (index >= result.scenes.length) {
        stopAllAudio(); // Finished
        return;
      }

      const scene = result.scenes[index];
      if (!scene.audioUrl) {
        playSequence(index + 1);
        return;
      }

      const audio = new Audio(`data:audio/wav;base64,${scene.audioUrl}`);
      activeAudioRef.current = audio;
      setPlayingSceneId(index);
      
      audio.play().catch(e => {
        console.error("Audio play failed", e);
        playSequence(index + 1);
      });

      audio.onended = () => {
        playSequence(index + 1);
      };
    };

    playSequence(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAllAudio();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Video Prompt copied to clipboard!");
  };

  const handleDownload = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allAudioReady = result.scenes.every(s => !s.isLoadingAudio);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      
      {/* Header Result */}
      <div className="glass-panel rounded-3xl p-1 bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
         <div className="bg-slate-950/60 rounded-[20px] p-8 md:p-10 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">Campaign Ready</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">Viral Optimized</span>
                </div>
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{result.title}</h2>
                <p className="text-xl text-cyan-400 font-light">{result.hook}</p>
                
                <div className="mt-4 inline-flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700">
                    <span className="text-xl animate-pulse">🎵</span>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sonic Identity (Recommended)</p>
                        <p className="text-sm text-cyan-200 font-medium">{result.musicRecommendation}</p>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
                <button 
                onClick={playAllNarrations}
                disabled={!allAudioReady}
                className={`
                    flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold shadow-lg transition-all border border-white/10
                    ${!allAudioReady 
                        ? 'bg-slate-800 text-slate-500 cursor-wait' 
                        : isPlayingAll 
                            ? 'bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20' 
                            : 'bg-cyan-600/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-600/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                    }
                `}
                >
                {isPlayingAll ? (
                    <>
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span>STOP PLAYBACK</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        <span>PLAY ALL SCENES</span>
                    </>
                )}
                </button>
                <button onClick={onReset} className="px-5 py-3 text-sm font-semibold text-slate-400 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-xl transition border border-slate-800 hover:border-slate-600">
                    START NEW CAMPAIGN
                </button>
            </div>
            </div>
        </div>
      </div>

      {/* Grid of Scenes */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {result.scenes.map((scene, index) => (
          <div key={scene.id} className={`
                group relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden transition-all duration-300 
                ${playingSceneId === index ? 'ring-2 ring-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.15)] scale-[1.02] z-10' : 'hover:border-slate-600 hover:shadow-xl'}
          `}>
            
            {/* Playing Indicator Line */}
            {playingSceneId === index && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse z-20"></div>}

            {/* Image Area */}
            <div 
              className="relative aspect-square bg-slate-950 cursor-zoom-in overflow-hidden"
              onClick={() => scene.imageUrl && setSelectedImage(scene.imageUrl)}
            >
              {scene.isLoadingImage ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 cursor-default">
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="mt-4 text-xs text-cyan-400 font-bold tracking-widest animate-pulse">RENDERING SCENE {index + 1}</span>
                  </div>
                </div>
              ) : scene.imageUrl ? (
                <>
                  <img 
                    src={`data:image/png;base64,${scene.imageUrl}`} 
                    alt={`Scene ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Glass Overlay on Hover */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] flex flex-col items-center justify-center gap-4">
                     <div className="text-white text-sm font-bold tracking-widest border border-white/30 px-4 py-2 rounded-full backdrop-blur-md bg-white/10">
                        VIEW FULLSCREEN
                     </div>
                  </div>

                  <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(scene.imageUrl!, `scene-${index+1}.png`);
                      }}
                      className="absolute bottom-4 right-4 bg-slate-900/80 p-3 rounded-xl text-white hover:bg-cyan-600 hover:text-white transition-all border border-slate-700 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                      title="Download Image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-red-500 bg-red-900/20">Generation Failed</div>
              )}
              
              {/* Scene Badge */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-bold border border-white/10 tracking-widest z-10">
                SCENE {String(index + 1).padStart(2, '0')}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 flex-1 flex flex-col bg-slate-900">
              
              {/* Narration Script */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                   <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Voiceover</h4>
                   
                   {/* Scene Audio Player */}
                   {scene.isLoadingAudio ? (
                     <span className="text-[10px] text-cyan-500 animate-pulse">SYNTHESIZING...</span>
                   ) : scene.audioUrl ? (
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         playSceneAudio(index);
                       }}
                       className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition border ${
                         playingSceneId === index 
                         ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' 
                         : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                       }`}
                     >
                       {playingSceneId === index ? (
                           <>
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span> PLAYING
                           </>
                       ) : '▶ PLAY'}
                     </button>
                   ) : (
                     <span className="text-[10px] text-red-500">FAILED</span>
                   )}
                </div>
                
                <p className={`text-sm leading-relaxed font-light transition-colors ${playingSceneId === index ? 'text-cyan-100' : 'text-slate-300'}`}>
                    "{scene.narration}"
                </p>
              </div>

              {/* Video Prompt Section */}
              <div className="mt-auto bg-slate-950/50 p-4 rounded-xl border border-slate-800 group-hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-center mb-2">
                   <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Video Prompt</h4>
                   <button 
                    onClick={() => copyToClipboard(scene.videoPrompt)}
                    className="text-[10px] text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                   >
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                     COPY
                   </button>
                </div>
                <p className="text-[11px] text-slate-500 font-mono line-clamp-3 leading-relaxed">
                  {scene.videoPrompt}
                </p>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Full Page Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center">
             <img 
              src={`data:image/png;base64,${selectedImage}`} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-slate-800" 
              alt="Full Preview"
             />
             
             <div className="mt-6 flex items-center gap-4">
                <button 
                    className="px-6 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700 transition"
                    onClick={() => setSelectedImage(null)}
                >
                    Close Preview
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};