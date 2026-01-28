import React, { useState, useEffect } from 'react';
import { AdFormData, AspectRatio, SceneCount, AdResult, GeneratedScene } from './types';
import { AdForm } from './components/AdForm';
import { ResultDisplay } from './components/ResultDisplay';
import { generateAdScript, generateSceneImage, generateFullNarration } from './services/geminiService';

const App: React.FC = () => {
  const [formData, setFormData] = useState<AdFormData>({
    productImage: null,
    productDescription: '',
    modelImage: null,
    referenceImage: null,
    voice: 'Puck',
    aspectRatio: AspectRatio.SQUARE,
    sceneCount: SceneCount.FOUR,
    language: 'Bahasa Indonesia',
    musicStyle: 'Upbeat Pop',
  });

  const [result, setResult] = useState<AdResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  useEffect(() => {
    const checkApiStatus = async () => {
        if ((window as any).aistudio) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            setApiKeyConfigured(hasKey);
        } else {
            // Assume configured if not in AI Studio environment (handled by geminiService fallback)
            setApiKeyConfigured(true);
        }
    };
    checkApiStatus();
  }, []);

  const handleConfigureApiKey = async () => {
    if ((window as any).aistudio) {
        try {
            await (window as any).aistudio.openSelectKey();
            setApiKeyConfigured(true);
        } catch (e) {
            console.error("API Key selection failed", e);
            if (e instanceof Error && e.message.includes("Requested entity was not found")) {
                setApiKeyConfigured(false);
            }
        }
    } else {
        alert("PENGATURAN API KEY:\n\nSilakan buka file 'services/geminiService.ts' dan paste API Key Anda ke dalam variabel 'MANUAL_API_KEY' di baris ke-8.");
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData(prev => ({ ...prev }));
  };

  const handleSubmit = async () => {
    if (!formData.productImage) return;
    
    // Force prompt if key is definitely missing in supported env
    if ((window as any).aistudio && !apiKeyConfigured) {
        await handleConfigureApiKey();
        // Check again after modal potentially closes
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            return; // Stop if still no key
        }
        setApiKeyConfigured(true);
    }

    setIsGenerating(true);
    setLoadingMessage('INITIALIZING NEURAL NETWORKS...');

    try {
      // 1. Generate Script
      const script = await generateAdScript(
        formData.productDescription,
        formData.sceneCount,
        formData.voice, 
        formData.language,
        formData.musicStyle,
        formData.productImage,
        formData.modelImage || undefined,
        formData.referenceImage || undefined
      );

      // Initialize result structure
      const initialScenes: GeneratedScene[] = script.scenes.map((s, i) => ({
        id: i,
        visualPrompt: s.visualPrompt,
        videoPrompt: s.videoPrompt,
        narration: s.narration,
        isLoadingImage: true,
        isLoadingAudio: true,
      }));

      const newResult: AdResult = {
        title: script.title,
        hook: script.hook,
        musicRecommendation: script.musicRecommendation,
        scenes: initialScenes,
      };

      setResult(newResult);
      setLoadingMessage('GENERATING VISUAL ASSETS & SYNTHESIZING VOICE...');

      // 2. Parallel Generation for Image AND Audio for EACH scene
      const assetPromises = initialScenes.map(async (scene) => {
        
        // A. Generate Image
        generateSceneImage(scene.visualPrompt, formData.aspectRatio, formData.productImage!)
          .then(imgBase64 => {
             setResult(prev => {
                if (!prev) return null;
                const updatedScenes = [...prev.scenes];
                updatedScenes[scene.id] = { ...updatedScenes[scene.id], imageUrl: imgBase64, isLoadingImage: false };
                return { ...prev, scenes: updatedScenes };
             });
          })
          .catch(error => {
             console.error(`Failed Image Scene ${scene.id}`, error);
             setResult(prev => {
                if (!prev) return null;
                const updatedScenes = [...prev.scenes];
                updatedScenes[scene.id] = { ...updatedScenes[scene.id], isLoadingImage: false };
                return { ...prev, scenes: updatedScenes };
             });
          });

        // B. Generate Audio
        generateFullNarration(scene.narration, formData.voice)
          .then(audioBase64 => {
             setResult(prev => {
                if (!prev) return null;
                const updatedScenes = [...prev.scenes];
                updatedScenes[scene.id] = { ...updatedScenes[scene.id], audioUrl: audioBase64, isLoadingAudio: false };
                return { ...prev, scenes: updatedScenes };
             });
          })
          .catch(error => {
             console.error(`Failed Audio Scene ${scene.id}`, error);
             setResult(prev => {
                if (!prev) return null;
                const updatedScenes = [...prev.scenes];
                updatedScenes[scene.id] = { ...updatedScenes[scene.id], isLoadingAudio: false };
                return { ...prev, scenes: updatedScenes };
             });
          });
      });
      
    } catch (error) {
      console.error("Main Generation Error:", error);
      alert(error instanceof Error ? error.message : "Gagal memproses permintaan. Periksa API Key.");
      setResult(null);
    } finally {
      setIsGenerating(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    AS
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
             </div>
             
             <div>
               <h1 className="text-xl font-bold tracking-tight text-white leading-none font-['Space_Grotesk']">
                   AI STEKOM <span className="text-cyan-400">UNIVERSITY</span>
               </h1>
               <p className="text-[10px] text-slate-400 font-semibold tracking-[0.2em] uppercase mt-1">
                   Powered By Ayub
               </p>
             </div>
           </div>
           
           <div className="hidden md:flex items-center gap-4">
             {/* API Key Configuration Button */}
             <button 
                onClick={handleConfigureApiKey}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold
                    ${apiKeyConfigured && (window as any).aistudio 
                        ? 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-cyan-400' 
                        : 'bg-yellow-500/10 border-yellow-500 text-yellow-400 animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                    }
                `}
                title="Configure Google Gemini API"
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 11 11 9l-2 2H8.5l-2 2H5.5L11 17.5V19l2 2 3.5-3.5A6 6 0 0121 9z"></path></svg>
                {apiKeyConfigured && (window as any).aistudio ? 'API CONNECTED' : 'SET API KEY'}
             </button>

             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs text-slate-300 font-mono">SYSTEM ONLINE</span>
             </div>
             <span className="bg-white/10 text-white px-4 py-1.5 rounded-lg text-xs font-bold border border-white/10 tracking-wider">
               VIRAL ADS v2.0
             </span>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        
        {!result ? (
          <>
            <div className="text-center mb-16 max-w-3xl mx-auto space-y-6">
              <div className="inline-block">
                 <span className="px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-bold tracking-widest uppercase mb-4">
                    Next Gen Marketing
                 </span>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight font-['Space_Grotesk']">
                Create Viral Ads <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x">
                    In Seconds
                </span>
              </h2>
              
              <p className="text-lg text-slate-400 leading-relaxed font-light">
                Leverage our <span className="text-white font-semibold">Gemini-powered neural engine</span> to generate storyboards, scripts, and sonic identities instantly. 
                Upload your product and let the AI direct your next viral campaign.
              </p>
            </div>
            
            <AdForm 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={handleSubmit} 
              isGenerating={isGenerating} 
            />

            {/* Loading Overlay */}
            {isGenerating && (
              <div className="fixed inset-0 bg-slate-950/80 z-[100] flex items-center justify-center backdrop-blur-md">
                <div className="bg-slate-900 p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full mx-4 border border-slate-700 relative overflow-hidden">
                  
                  {/* Decorative Scan Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-600 animate-scan"></div>

                  <div className="relative w-24 h-24 mb-8">
                     <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                     <div className="absolute inset-4 border-4 border-purple-500 border-b-transparent rounded-full animate-spin-reverse opacity-70"></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 font-['Space_Grotesk'] tracking-wide">PROCESSING</h3>
                  <p className="text-center text-cyan-400 text-xs font-mono tracking-widest uppercase animate-pulse">
                    {loadingMessage}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <ResultDisplay result={result} onReset={handleReset} />
        )}

      </main>

      <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm mt-20 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-500 text-sm font-light">
                &copy; {new Date().getFullYear()} <span className="text-slate-300 font-semibold">AI STEKOM UNIVERSITY</span>. 
                Engineered by Ayub.
            </p>
            <div className="flex justify-center gap-4 mt-4 opacity-50">
                <span className="h-1 w-1 bg-cyan-500 rounded-full"></span>
                <span className="h-1 w-1 bg-purple-500 rounded-full"></span>
                <span className="h-1 w-1 bg-blue-500 rounded-full"></span>
            </div>
            <p className="mt-4 text-[10px] text-slate-600 uppercase tracking-widest">
                Powered by Google Gemini 2.0 Flash & 3.0 Pro
            </p>
             <p className="mt-2 text-[10px] text-slate-700">
               <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="hover:text-cyan-400 transition-colors">Billing Information</a>
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;