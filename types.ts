export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '3:4',
  STORY = '9:16',
}

export enum SceneCount {
  FOUR = 4,
  SEVEN = 7,
  TEN = 10,
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  style: string;
}

export interface AdFormData {
  productImage: File | null;
  productDescription: string;
  modelImage: File | null;
  referenceImage: File | null;
  voice: string;
  aspectRatio: AspectRatio;
  sceneCount: SceneCount;
  language: string;
  musicStyle: string;
}

export interface GeneratedScene {
  id: number;
  visualPrompt: string;
  videoPrompt: string;
  narration: string;
  imageUrl?: string; // Base64
  isLoadingImage: boolean;
  audioUrl?: string; // Base64
  isLoadingAudio: boolean;
}

export interface AdResult {
  title: string;
  hook: string;
  musicRecommendation: string;
  scenes: GeneratedScene[];
}
