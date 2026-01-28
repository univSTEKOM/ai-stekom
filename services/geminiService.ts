import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AspectRatio, SceneCount, GeneratedScene } from "../types";

// ---------------------------------------------------------
// KONFIGURASI API KEY (MANUAL)
// Paste API Key Google AI Studio Anda di bawah ini:
// Contoh: const MANUAL_API_KEY = "AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxx";
const MANUAL_API_KEY = "AIzaSyARHMkJ_wdnO9S7X-s5Vho61gX8HIupuz8"; 
// ---------------------------------------------------------

// Helper to convert File to Base64
export const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getClient = () => {
    // Prioritas: 1. Environment Variable, 2. Manual Configuration
    const apiKey = process.env.API_KEY || MANUAL_API_KEY;
    
    if (!apiKey) {
        throw new Error("API Key belum disetting. Silakan buka file 'services/geminiService.ts' dan isi variabel 'MANUAL_API_KEY' di baris ke-8.");
    }
    return new GoogleGenAI({ apiKey });
}

interface ScriptResponse {
  title: string;
  hook: string;
  musicRecommendation: string;
  scenes: {
    visualPrompt: string;
    videoPrompt: string;
    narration: string;
  }[];
}

export const generateAdScript = async (
  productDesc: string,
  sceneCount: SceneCount,
  voiceStyle: string,
  language: string,
  musicStyle: string,
  productImage: File,
  modelImage?: File,
  refImage?: File
): Promise<ScriptResponse> => {
  const ai = getClient();
  
  const parts: any[] = [];
  
  // Add Product Image (Required)
  const productPart = await fileToPart(productImage);
  parts.push(productPart);

  // Add Model Image (Optional)
  if (modelImage) {
    const modelPart = await fileToPart(modelImage);
    parts.push(modelPart);
    parts.push({ text: "Use the person in this second image as the model/character in the scenes." });
  }

  // Add Reference Image (Optional)
  if (refImage) {
    const refPart = await fileToPart(refImage);
    parts.push(refPart);
    parts.push({ text: "Use the artistic style and mood of this third image as a reference for the visual style." });
  }

  const prompt = `
    You are a world-class Viral Ad Director. 
    Create a ${sceneCount}-scene advertisement storyboard for the product shown in the first image.
    
    Product Description: "${productDesc}"
    Target Narration Tone: ${voiceStyle}
    Language for Script: ${language}
    Music Vibe: ${musicStyle}

    For each scene, provide:
    1. visualPrompt: A highly detailed, descriptive prompt for an AI Image generator (Gemini Image/Imagen) to generate the frame. Include lighting, camera angle, and subject details. 
    IMPORTANT: The visual prompt must explicitly describe the product exactly as it appears in the image to ensure consistency.
    2. videoPrompt: A prompt specifically for an AI Video generator (like Runway/Veo) describing the motion and action (e.g., "Slow motion pan," "Zoom in").
    3. narration: The voiceover script for this specific scene (Written in ${language}).

    Also provide:
    - 'title': A catchy title for the campaign.
    - 'hook': A one-sentence hook.
    - 'musicRecommendation': A specific recommendation for a No-Copyright/Royalty-Free background music track or search term that fits the '${musicStyle}' vibe (e.g., "Upbeat Ukulele by Kevin MacLeod" or "Corporate Motivational No Copyright").

    Return strictly JSON.
  `;

  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Upgraded to Pro for complex tasks/JSON
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          hook: { type: Type.STRING },
          musicRecommendation: { type: Type.STRING },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                visualPrompt: { type: Type.STRING },
                videoPrompt: { type: Type.STRING },
                narration: { type: Type.STRING },
              },
              required: ["visualPrompt", "videoPrompt", "narration"]
            }
          }
        },
        required: ["title", "hook", "musicRecommendation", "scenes"]
      }
    }
  });

  if (!response.text) throw new Error("No script generated");
  
  return JSON.parse(response.text) as ScriptResponse;
};

export const generateSceneImage = async (prompt: string, aspectRatio: AspectRatio, productImage?: File): Promise<string> => {
  const ai = getClient();
  
  const parts: any[] = [];
  
  // To ensure product consistency, we pass the product image to the generation model
  if (productImage) {
    const imagePart = await fileToPart(productImage);
    parts.push(imagePart);
    
    // Strengthen the prompt to respect the image
    parts.push({ 
      text: `Generate a high-quality advertisement scene based on the product in the provided image. 
      
      Scene Description: ${prompt}
      
      CRITICAL INSTRUCTION: Maintain the exact shape, color, and branding of the product shown in the input image. Do not hallucinate different packaging or alter the product's physical form. Place the product naturally into the described scene.` 
    });
  } else {
    parts.push({ text: prompt });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image', 
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any, // Cast because SDK types might trail API
      }
    }
  });

  const imgPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!imgPart || !imgPart.inlineData) {
    throw new Error("No image generated");
  }
  
  return imgPart.inlineData.data;
};

export const generateFullNarration = async (text: string, voiceName: string): Promise<string> => {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    },
  });

  const audioPart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!audioPart || !audioPart.data) {
    throw new Error("No audio generated");
  }

  // Convert Raw PCM to WAV
  const pcmBytes = base64ToUint8Array(audioPart.data);
  const wavBytes = addWavHeader(pcmBytes, 24000, 1, 16);
  
  return uint8ArrayToBase64(wavBytes);
};

// --- AUDIO UTILITIES ---

const base64ToUint8Array = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const uint8ArrayToBase64 = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const addWavHeader = (pcmData: Uint8Array, sampleRate: number, numChannels: number = 1, bitDepth: number = 16) => {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  const dataSize = pcmData.length;
  
  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + dataSize, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  // bits per sample
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataSize, true);
  
  // Combine header and data
  const wavFile = new Uint8Array(44 + dataSize);
  wavFile.set(new Uint8Array(header), 0);
  wavFile.set(pcmData, 44);
  
  return wavFile;
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};