import { AspectRatio, SceneCount, VoiceOption } from './types';

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'Puck', name: 'Puck', gender: 'Male', style: 'Ceria & Enerjik' },
  { id: 'Kore', name: 'Kore', gender: 'Female', style: 'Tegas & Profesional' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', style: 'Cerah & Ramah' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', style: 'Bersemangat & Antusias' },
  { id: 'Achird', name: 'Achird', gender: 'Male', style: 'Hangat & Bersahabat' },
  { id: 'Charon', name: 'Charon', gender: 'Male', style: 'Informatif & Jelas' },
  { id: 'Sadachbia', name: 'Sadachbia', gender: 'Male', style: 'Hidup & Dinamis' },
  { id: 'Sulafat', name: 'Sulafat', gender: 'Female', style: 'Hangat & Menenangkan' },
  { id: 'Aoede', name: 'Aoede', gender: 'Female', style: 'Lancar & Santai' },
  { id: 'Gacrux', name: 'Gacrux', gender: 'Female', style: 'Dewasa & Bijak' },
];

export const ASPECT_RATIOS = [
  { value: AspectRatio.SQUARE, label: '1:1 Square (IG Feed)' },
  { value: AspectRatio.LANDSCAPE, label: '16:9 Landscape (YouTube)' },
  { value: AspectRatio.PORTRAIT, label: '3:4 Portrait (Pinterest)' },
  { value: AspectRatio.STORY, label: '9:16 Story (TikTok/Reels)' },
];

export const SCENE_COUNTS = [
  { value: SceneCount.FOUR, label: '4 Scenes (Short & Punchy)' },
  { value: SceneCount.SEVEN, label: '7 Scenes (Standard)' },
  { value: SceneCount.TEN, label: '10 Scenes (Detailed Story)' },
];

export const LANGUAGES = [
  { value: 'Bahasa Indonesia', label: '🇮🇩 Bahasa Indonesia' },
  { value: 'English', label: '🇺🇸 English' },
  { value: 'Javanese', label: 'Indonesian (Javanese Style)' },
  { value: 'Slang', label: 'Indonesian (Bahasa Gaul/Viral)' },
];

export const MUSIC_STYLES = [
  { value: 'Upbeat Pop', label: '🥁 Upbeat & Pop (Energetic)' },
  { value: 'Corporate', label: '💼 Corporate & Professional' },
  { value: 'Cinematic', label: '🎬 Cinematic & Epic' },
  { value: 'Lo-Fi', label: '☕ Lo-Fi & Chill' },
  { value: 'Acoustic', label: '🎸 Acoustic & Folk' },
  { value: 'Electronic', label: '⚡ Electronic & Modern' },
];
