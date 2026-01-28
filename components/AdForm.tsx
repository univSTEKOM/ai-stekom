import React from 'react';
import { AdFormData, AspectRatio, SceneCount } from '../types';
import { VOICE_OPTIONS, ASPECT_RATIOS, SCENE_COUNTS, LANGUAGES, MUSIC_STYLES } from '../constants';

interface AdFormProps {
  formData: AdFormData;
  setFormData: React.Dispatch<React.SetStateAction<AdFormData>>;
  onSubmit: () => void;
  isGenerating: boolean;
}

export const AdForm: React.FC<AdFormProps> = ({ formData, setFormData, onSubmit, isGenerating }) => {
  
  const handleFileChange = (field: keyof AdFormData, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const handleTextChange = (field: keyof AdFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // UI Components for the new theme
  const SectionHeader = ({ number, title }: { number: string, title: string }) => (
    <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
      <span className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-lg w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
        {number}
      </span>
      <span className="tracking-wide">{title}</span>
    </h2>
  );

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-bold text-cyan-300 uppercase tracking-widest mb-2">
      {children}
    </label>
  );

  const InputWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-1">{children}</div>
  );

  const StyledSelect = ({ value, onChange, options }: { value: any, onChange: (e: any) => void, options: {value: any, label?: string, name?: string, id?: any}[] }) => (
    <div className="relative group">
        <select 
            value={value} 
            onChange={onChange}
            className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all appearance-none hover:border-slate-500"
        >
            {options.map((opt: any) => (
                <option key={opt.value || opt.id} value={opt.value || opt.id} className="bg-slate-900 text-slate-300">
                    {opt.label || opt.name}
                </option>
            ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-cyan-400 transition-colors">
            ▼
        </div>
    </div>
  );

  return (
    <div className="glass-panel p-1 rounded-3xl max-w-5xl mx-auto shadow-2xl animate-fade-in-up">
      <div className="bg-slate-950/40 rounded-[22px] p-6 md:p-10 space-y-10">
      
        {/* Section 1: Product Info */}
        <div className="space-y-6">
          <SectionHeader number="01" title="Core Data" />
          
          <div className="grid md:grid-cols-2 gap-8">
            <InputWrapper>
              <Label>Main Asset (Product)</Label>
              <div className={`relative border-2 border-dashed rounded-xl p-8 transition-all text-center cursor-pointer group overflow-hidden
                  ${formData.productImage ? 'border-cyan-500/50 bg-cyan-900/10' : 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-900/60'}`}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange('productImage', e)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {/* Decoration */}
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                </div>

                <div className="pointer-events-none relative z-0">
                  {formData.productImage ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-2xl">✓</div>
                        <span className="text-cyan-300 font-medium truncate max-w-[200px]">{formData.productImage.name}</span>
                        <span className="text-xs text-slate-500">Click to change</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:scale-110 transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <span className="text-slate-400 group-hover:text-cyan-300 transition-colors text-sm">Upload Product Image</span>
                    </div>
                  )}
                </div>
              </div>
            </InputWrapper>

            <InputWrapper>
              <Label>Product Description</Label>
              <textarea
                value={formData.productDescription}
                onChange={(e) => handleTextChange('productDescription', e.target.value)}
                placeholder="Describe key features, benefits, and target audience..."
                className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none h-[140px] resize-none placeholder:text-slate-600 transition-all"
              />
            </InputWrapper>
          </div>
        </div>

        {/* Section 2: Visual References */}
        <div className="space-y-6">
          <SectionHeader number="02" title="Visual Style & References" />
          <div className="grid md:grid-cols-2 gap-8">
            <InputWrapper>
              <Label>Model Reference (Optional)</Label>
              <div className="relative flex items-center gap-0">
                 <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange('modelImage', e)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="bg-slate-800 border border-slate-700 rounded-l-xl px-4 py-3 text-sm text-slate-400 whitespace-nowrap">Choose File</div>
                <div className="bg-slate-900/50 border-y border-r border-slate-700 rounded-r-xl px-4 py-3 text-sm text-slate-500 w-full truncate">
                    {formData.modelImage ? <span className="text-cyan-400">{formData.modelImage.name}</span> : 'No file chosen'}
                </div>
              </div>
            </InputWrapper>

            <InputWrapper>
              <Label>Theme/Vibe Reference (Optional)</Label>
              <div className="relative flex items-center gap-0">
                 <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange('referenceImage', e)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                 <div className="bg-slate-800 border border-slate-700 rounded-l-xl px-4 py-3 text-sm text-slate-400 whitespace-nowrap">Choose File</div>
                <div className="bg-slate-900/50 border-y border-r border-slate-700 rounded-r-xl px-4 py-3 text-sm text-slate-500 w-full truncate">
                    {formData.referenceImage ? <span className="text-cyan-400">{formData.referenceImage.name}</span> : 'No file chosen'}
                </div>
              </div>
            </InputWrapper>
          </div>
        </div>

        {/* Section 3: Configuration */}
        <div className="space-y-6">
           <SectionHeader number="03" title="AI Configuration" />
          
          {/* Language & Music */}
          <div className="grid md:grid-cols-2 gap-8 mb-4">
            <InputWrapper>
              <Label>Language</Label>
              <StyledSelect 
                value={formData.language} 
                onChange={(e) => handleTextChange('language', e.target.value)}
                options={LANGUAGES}
              />
            </InputWrapper>
            
             <InputWrapper>
              <Label>Sound Vibe</Label>
               <StyledSelect 
                value={formData.musicStyle} 
                onChange={(e) => handleTextChange('musicStyle', e.target.value)}
                options={MUSIC_STYLES}
              />
            </InputWrapper>
          </div>

          {/* Technical Config */}
          <div className="grid md:grid-cols-3 gap-6">
             <InputWrapper>
              <Label>AI Voice Narrator</Label>
              <div className="relative group">
                <select 
                  value={formData.voice} 
                  onChange={(e) => handleTextChange('voice', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all appearance-none"
                >
                  {VOICE_OPTIONS.map(v => (
                    <option key={v.id} value={v.id} className="bg-slate-900">
                        {v.name} • {v.gender} • {v.style}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
              </div>
            </InputWrapper>

            <InputWrapper>
              <Label>Aspect Ratio</Label>
               <StyledSelect 
                value={formData.aspectRatio} 
                onChange={(e) => handleTextChange('aspectRatio', e.target.value)}
                options={ASPECT_RATIOS}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Duration (Scenes)</Label>
               <StyledSelect 
                value={formData.sceneCount} 
                onChange={(e) => handleTextChange('sceneCount', Number(e.target.value))}
                options={SCENE_COUNTS}
              />
            </InputWrapper>
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={onSubmit}
            disabled={!formData.productImage || !formData.productDescription || isGenerating}
            className={`
                group relative w-full py-5 rounded-xl text-white font-bold text-lg tracking-wider overflow-hidden
                transition-all duration-300 transform active:scale-[0.99]
                ${(!formData.productImage || !formData.productDescription) 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] border border-white/10'}
            `}
          >
            {/* Button Shine Effect */}
             {!isGenerating && formData.productImage && (
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
             )}

            <div className="relative flex items-center justify-center gap-3">
                 {isGenerating ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>PROCESSING INTELLIGENCE...</span>
                    </>
                 ) : (
                    <>
                         <svg className="w-5 h-5 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        <span>INITIALIZE GENERATION</span>
                    </>
                 )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
