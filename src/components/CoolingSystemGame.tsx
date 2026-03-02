import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Info, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Thermometer, 
  Wrench,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Eye,
  Activity,
  Zap
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type GameMode = 'intro' | 'exploration' | 'visualization' | 'quiz' | 'analysis' | 'summary';

interface ComponentInfo {
  id: string;
  name: string;
  nameIndo: string;
  function: string;
  functionIndo: string;
  imagePrompt: string;
  imageUrl?: string;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  symptoms: string[];
  correctComponentId: string;
  explanation: string;
}

// --- Data ---

const COMPONENTS: ComponentInfo[] = [
  {
    id: 'radiator',
    name: 'Radiator',
    nameIndo: 'Radiator',
    function: 'Dissipates heat from the coolant to the outside air.',
    functionIndo: 'Membuang panas dari cairan pendingin ke udara luar.',
    imagePrompt: 'Isolated car radiator unit, aluminum cooling fins, black plastic end tanks, professional automotive part photography, white background, high detail, 4k'
  },
  {
    id: 'water-pump',
    name: 'Water Pump',
    nameIndo: 'Pompa Air (Water Pump)',
    function: 'Circulates the coolant throughout the engine and radiator.',
    functionIndo: 'Mensirkulasikan cairan pendingin ke seluruh mesin dan radiator.',
    imagePrompt: 'Isolated car water pump assembly, metallic cast iron housing, mechanical pulley, professional automotive part photography, white background, high detail, 4k'
  },
  {
    id: 'thermostat',
    name: 'Thermostat',
    nameIndo: 'Termostat',
    function: 'Regulates the flow of coolant based on engine temperature.',
    functionIndo: 'Mengatur aliran cairan pendingin berdasarkan suhu mesin.',
    imagePrompt: 'Isolated car thermostat valve, brass and stainless steel construction, visible spring mechanism, professional automotive part photography, white background, high detail, 4k'
  },
  {
    id: 'cooling-fan',
    name: 'Cooling Fan',
    nameIndo: 'Kipas Pendingin',
    function: 'Pulls air through the radiator to help cooling when the car is stationary.',
    functionIndo: 'Menarik udara melalui radiator untuk membantu pendinginan saat mobil berhenti.',
    imagePrompt: 'Isolated car electric cooling fan with black plastic shroud and multi-blade fan, professional automotive part photography, white background, high detail, 4k'
  },
  {
    id: 'reservoir',
    name: 'Coolant Reservoir',
    nameIndo: 'Tangki Cadangan (Reservoir)',
    function: 'Stores excess coolant as it expands and contracts with temperature changes.',
    functionIndo: 'Menyimpan kelebihan cairan pendingin saat memuai dan menyusut karena perubahan suhu.',
    imagePrompt: 'Isolated car coolant expansion tank, translucent white plastic reservoir, pressure cap, professional automotive part photography, white background, high detail, 4k'
  },
  {
    id: 'hoses',
    name: 'Radiator Hoses',
    nameIndo: 'Selang Radiator',
    function: 'Transports coolant between the engine and the radiator.',
    functionIndo: 'Mengalirkan cairan pendingin antara mesin dan radiator.',
    imagePrompt: 'Isolated car radiator rubber hoses, black thick rubber, metal hose clamps, professional automotive part photography, white background, high detail, 4k'
  },
  {
    id: 'coolant',
    name: 'Coolant',
    nameIndo: 'Cairan Pendingin (Coolant)',
    function: 'The fluid that absorbs heat from the engine and carries it to the radiator.',
    functionIndo: 'Cairan yang menyerap panas dari mesin dan membawanya ke radiator.',
    imagePrompt: 'Bright green fluorescent automotive coolant liquid, pouring into a clear container, realistic liquid transparency, high detail'
  },
  {
    id: 'engine-block',
    name: 'Engine Block',
    nameIndo: 'Silinder Blok',
    function: 'The main structure of the engine where heat is generated.',
    functionIndo: 'Struktur utama mesin tempat panas dihasilkan.',
    imagePrompt: 'Isolated car engine block, cast aluminum or iron, visible cylinder bores, professional automotive part photography, white background, high detail, 4k'
  }
];

const SCENARIOS: Scenario[] = [
  {
    id: 'overheat-thermostat',
    title: 'Mesin Overheat Mendadak',
    description: 'Mobil Anda tiba-tiba menunjukkan suhu sangat tinggi di dashboard, tetapi radiator terasa dingin.',
    symptoms: ['Jarum suhu di zona merah', 'Radiator dingin saat disentuh (hati-hati)', 'Mesin mati mendadak'],
    correctComponentId: 'thermostat',
    explanation: 'Termostat macet dalam kondisi tertutup, sehingga cairan pendingin panas tidak bisa mengalir ke radiator untuk didinginkan.'
  },
  {
    id: 'leak-hose',
    title: 'Genangan Air di Bawah Mobil',
    description: 'Anda melihat genangan air berwarna hijau/merah di bawah bagian depan mobil setelah parkir semalam.',
    symptoms: ['Cairan berwarna di lantai garasi', 'Level reservoir cepat habis', 'Bau manis dari ruang mesin'],
    correctComponentId: 'hoses',
    explanation: 'Selang radiator kemungkinan retak atau klemnya kendur, menyebabkan kebocoran cairan pendingin.'
  },
  {
    id: 'fan-fail',
    title: 'Panas Saat Macet',
    description: 'Suhu mesin normal saat mobil melaju kencang, tapi langsung naik drastis saat terjebak macet.',
    symptoms: ['Overheat hanya saat berhenti/pelan', 'Suhu turun saat mobil jalan kencang'],
    correctComponentId: 'cooling-fan',
    explanation: 'Kipas pendingin tidak berputar, sehingga tidak ada aliran udara melalui radiator saat mobil tidak bergerak.'
  }
];

// --- Components ---

const ImagePlaceholder = ({ text }: { text: string }) => (
  <div className="w-full h-48 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700 overflow-hidden relative group">
    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 opacity-50" />
    <div className="z-10 text-zinc-500 flex flex-col items-center gap-2">
      <Info size={32} />
      <span className="text-xs font-mono uppercase tracking-widest">{text}</span>
    </div>
  </div>
);

const SmartImage = ({ src, alt, className, fallbackText }: { src?: string, alt: string, className?: string, fallbackText: string }) => {
  if (src === '__TEXT_ONLY__' || !src) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-zinc-900/50 border border-zinc-800/50 text-zinc-500 font-black text-center p-4", className)}>
        <span className="uppercase tracking-widest text-[10px] sm:text-xs leading-tight">{fallbackText}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} referrerPolicy="no-referrer" />;
};

const CoolantFlowDiagram = ({ images, loading, isThermostatOpen }: { images: Record<string, string>, loading: boolean, isThermostatOpen: boolean }) => {
  if (loading) {
    return (
      <div className="w-full aspect-video bg-zinc-900/50 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-xs font-mono text-zinc-500 animate-pulse uppercase tracking-widest">Generating Animated Construction...</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-zinc-950 rounded-3xl border border-zinc-800 p-4 relative overflow-hidden group shadow-2xl">
      {/* Technical Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
      
      <div className="relative w-full h-full">
        {/* Animated Component Construction */}
        <div className="absolute inset-0">
          {/* RADIATOR */}
          <motion.div 
            className="absolute left-[5%] top-[15%] w-[18%] h-[70%] z-10"
            animate={{ 
              opacity: isThermostatOpen ? 1 : 0.4,
              filter: isThermostatOpen ? 'grayscale(0%)' : 'grayscale(80%)'
            }}
          >
            <div className="absolute -top-6 left-0 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Radiator Unit</div>
            <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-900 shadow-2xl relative">
              <SmartImage 
                src={images['radiator']} 
                alt="Radiator" 
                className="w-full h-full object-cover" 
                fallbackText="Radiator"
              />
              {/* Cooling Effect Overlay */}
              {isThermostatOpen && (
                <motion.div 
                  className="absolute inset-0 bg-blue-500/10"
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              )}
            </div>
          </motion.div>

          {/* COOLING FAN */}
          <div className="absolute left-[24%] top-[25%] w-[12%] h-[50%] z-10">
            <div className="w-full h-full rounded-full overflow-hidden border border-zinc-700 bg-zinc-900/50 shadow-xl relative">
              <SmartImage 
                src={images['cooling-fan']} 
                alt="Fan" 
                className="w-full h-full object-cover opacity-40" 
                fallbackText="Fan"
              />
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: isThermostatOpen ? 360 : 0 }}
                transition={{ duration: 0.4, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-2 bg-zinc-500/20 rounded-full" />
                <div className="w-2 h-full bg-zinc-500/20 rounded-full absolute" />
              </motion.div>
            </div>
          </div>

          {/* ENGINE BLOCK */}
          <motion.div 
            className="absolute right-[8%] top-[15%] w-[48%] h-[70%] z-10"
          >
            <div className="absolute -top-6 left-0 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Engine Construction</div>
            <div className="w-full h-full rounded-[40px] overflow-hidden border border-zinc-700 bg-zinc-900 shadow-2xl relative">
              <SmartImage 
                src={images['engine-block']} 
                alt="Engine" 
                className="w-full h-full object-cover opacity-80" 
                fallbackText="Engine Block"
              />
              {/* Heat Glow Animation */}
              <motion.div 
                className="absolute inset-0 bg-red-500/5"
                animate={{ opacity: isThermostatOpen ? [0.05, 0.15, 0.05] : [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* THERMOSTAT */}
          <div className="absolute right-[48%] top-[22%] w-[10%] h-[15%] z-20">
            <div className={`w-full h-full rounded-xl overflow-hidden border ${isThermostatOpen ? 'border-emerald-500' : 'border-red-500/50'} bg-zinc-900 shadow-lg transition-colors duration-500`}>
              <SmartImage 
                src={images['thermostat']} 
                alt="Thermostat" 
                className={`w-full h-full object-cover ${isThermostatOpen ? '' : 'grayscale opacity-50'}`} 
                fallbackText="Thermostat"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`text-[8px] font-black uppercase px-1 rounded ${isThermostatOpen ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                  {isThermostatOpen ? 'Open' : 'Closed'}
                </div>
              </div>
            </div>
          </div>

          {/* WATER PUMP */}
          <div className="absolute right-[48%] bottom-[22%] w-[12%] h-[18%] z-20">
            <div className="w-full h-full rounded-xl overflow-hidden border border-blue-500/40 bg-zinc-900 shadow-lg">
              <SmartImage 
                src={images['water-pump']} 
                alt="Water Pump" 
                className="w-full h-full object-cover" 
                fallbackText="Water Pump"
              />
            </div>
          </div>
        </div>

        {/* SVG Overlay for Animated Liquid Flow */}
        <svg viewBox="0 0 800 450" className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <defs>
            <linearGradient id="hotGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="coldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
            <filter id="liquid-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* INTERNAL ENGINE FLOW (WATER JACKETS) */}
          <motion.path 
            d="M550 300 Q600 250, 550 200 Q500 250, 550 300" 
            fill="none" 
            stroke="rgba(239, 68, 68, 0.3)" 
            strokeWidth="20" 
            strokeLinecap="round"
            animate={{ strokeDashoffset: [100, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          {/* BYPASS FLOW (When Thermostat is Closed) */}
          {!isThermostatOpen && (
            <motion.path 
              d="M450 220 Q400 250, 450 280" 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="6" 
              strokeDasharray="10, 20"
              filter="url(#liquid-glow)"
              animate={{ strokeDashoffset: [-60, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* UPPER HOSE (HOT) - Only flows when open */}
          <path d="M450 150 Q300 150, 180 150" fill="none" stroke="rgba(20,20,20,0.9)" strokeWidth="18" strokeLinecap="round" />
          {isThermostatOpen && (
            <motion.path 
              d="M450 150 Q300 150, 180 150" 
              fill="none" 
              stroke="url(#hotGrad)" 
              strokeWidth="6" 
              strokeDasharray="30, 60"
              filter="url(#liquid-glow)"
              animate={{ strokeDashoffset: [-90, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* LOWER HOSE (COLD) - Only flows when open */}
          <path d="M180 320 Q300 320, 450 320" fill="none" stroke="rgba(20,20,20,0.9)" strokeWidth="18" strokeLinecap="round" />
          {isThermostatOpen && (
            <motion.path 
              d="M180 320 Q300 320, 450 320" 
              fill="none" 
              stroke="url(#coldGrad)" 
              strokeWidth="6" 
              strokeDasharray="30, 60"
              filter="url(#liquid-glow)"
              animate={{ strokeDashoffset: [90, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* LIQUID PULSES */}
          {isThermostatOpen && (
            <>
              <motion.circle r="6" fill="#ef4444" filter="url(#liquid-glow)">
                <animateMotion path="M450 150 Q300 150, 180 150" dur="2s" repeatCount="indefinite" />
              </motion.circle>
              <motion.circle r="6" fill="#10b981" filter="url(#liquid-glow)">
                <animateMotion path="M180 320 Q300 320, 450 320" dur="2s" repeatCount="indefinite" />
              </motion.circle>
            </>
          )}
        </svg>
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center z-30">
        <div className="flex gap-4 bg-black/80 backdrop-blur-2xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_15px_#ef4444]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-100">Hot Flow</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_15px_#10b981]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-100">Cold Flow</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className={`${isThermostatOpen ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-amber-500/20 border-amber-500/30'} backdrop-blur-xl px-4 py-2 rounded-xl border flex items-center gap-3 transition-colors duration-500`}>
            <div className={`w-2 h-2 rounded-full ${isThermostatOpen ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            <span className={`text-[10px] font-mono font-bold ${isThermostatOpen ? 'text-emerald-400' : 'text-amber-400'} uppercase tracking-widest`}>
              {isThermostatOpen ? 'Sirkulasi Radiator Aktif' : 'Sirkulasi Bypass (Cold Start)'}
            </span>
          </div>
          <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Kalimmustofa Automotive Education</span>
        </div>
      </div>
    </div>
  );
};

export default function CoolingSystemGame() {
  const [mode, setMode] = useState<GameMode>('intro');
  const [selectedComponent, setSelectedComponent] = useState<ComponentInfo | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [score, setScore] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [images, setImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('cooling_system_images');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [heroImage, setHeroImage] = useState<string | null>(() => {
    return localStorage.getItem('cooling_system_hero');
  });
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadingHero, setLoadingHero] = useState(false);
  const [genStatus, setGenStatus] = useState<string>('');
  const [isThermostatOpen, setIsThermostatOpen] = useState(false);
  const [userData, setUserData] = useState({ name: '', class: '', school: '' });
  const [showResultForm, setShowResultForm] = useState(false);
  const [isResultConfirmed, setIsResultConfirmed] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<ComponentInfo[]>([]);

  const getAiClient = () => {
    return new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY || '' });
  };

  const generateSingleImage = async (compId: string) => {
    if (images[compId] || loadingImages) return;
    const comp = COMPONENTS.find(c => c.id === compId);
    if (!comp) return;

    setLoadingImages(true);
    setGenStatus(`Membangkitkan gambar ${comp.nameIndo}...`);
    try {
      const aiClient = getAiClient();
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: comp.imagePrompt }] },
          config: { 
            imageConfig: { aspectRatio: "1:1" }
          }
        });

        const candidates = response.candidates || [];
        if (candidates.length > 0) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData) {
              const data = `data:image/png;base64,${part.inlineData.data}`;
              setImages(prev => ({ ...prev, [compId]: data }));
              setGenStatus('');
              return;
            }
          }
        }
      } catch (aiError: any) {
        console.warn("AI Image generation failed, using fallback:", aiError);
        setImages(prev => ({ ...prev, [compId]: "__TEXT_ONLY__" }));
        setGenStatus('Gagal memuat gambar. Menampilkan teks.');
        setTimeout(() => setGenStatus(''), 3000);
      }
    } catch (error: any) {
      console.error("Failed to generate image:", error);
      setGenStatus('Gagal menghubungkan ke layanan gambar');
    } finally {
      setLoadingImages(false);
    }
  };

  const generateImages = async (force = false) => {
    if ((Object.keys(images).length >= COMPONENTS.length && !force) || loadingImages) return;
    setLoadingImages(true);
    setGenStatus('Menghubungkan ke layanan AI...');
    try {
      const aiClient = getAiClient();
      const componentsToGen = force ? COMPONENTS : COMPONENTS.filter(c => !images[c.id]);
      
      for (let i = 0; i < componentsToGen.length; i++) {
        const comp = componentsToGen[i];
        setGenStatus(`Memproses ${i + 1}/${componentsToGen.length}: ${comp.nameIndo}...`);
        
        try {
          const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: comp.imagePrompt }] },
            config: { 
              imageConfig: { aspectRatio: "1:1" }
            }
          });
          
          const candidates = response.candidates || [];
          if (candidates.length > 0) {
            for (const part of candidates[0].content.parts) {
              if (part.inlineData) {
                const data = `data:image/png;base64,${part.inlineData.data}`;
                setImages(prev => ({ ...prev, [comp.id]: data }));
              }
            }
          }
          await new Promise(r => setTimeout(r, 1000));
        } catch (e: any) {
          console.error(`Failed to get image for ${comp.id}:`, e);
          setImages(prev => ({ ...prev, [comp.id]: "__TEXT_ONLY__" }));
        }
      }
      setGenStatus('');
    } catch (error) {
      console.error("Failed to generate images:", error);
      setGenStatus('Gagal memproses gambar');
    } finally {
      setLoadingImages(false);
    }
  };

  const generateHeroImage = async () => {
    if (heroImage || loadingHero) return;
    setLoadingHero(true);
    try {
      const aiClient = getAiClient();
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: 'Realistic cinematic photo of a car engine bay focusing on the cooling system, radiator, and hoses' }] },
          config: { 
            imageConfig: { aspectRatio: "16:9" }
          }
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            setHeroImage(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      } catch (aiError) {
        console.warn("Hero generation failed, using fallback:", aiError);
        setHeroImage('__TEXT_ONLY__');
      }
    } catch (error) {
      console.error("Failed to generate hero image:", error);
    } finally {
      setLoadingHero(false);
    }
  };

  useEffect(() => {
    if (mode === 'intro' && !heroImage) {
      generateHeroImage();
    }
    // Bulk generation removed to save quota. 
    // Images will be generated on-demand or via manual trigger.
  }, [mode]);

  useEffect(() => {
    if (mode === 'quiz') {
      setShuffledOptions([...COMPONENTS].sort(() => Math.random() - 0.5));
    }
  }, [quizStep, mode]);

  // Save images to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(images).length > 0) {
      localStorage.setItem('cooling_system_images', JSON.stringify(images));
    }
  }, [images]);

  useEffect(() => {
    if (heroImage) {
      localStorage.setItem('cooling_system_hero', heroImage);
    }
  }, [heroImage]);

  useEffect(() => {
    if (selectedComponent && !images[selectedComponent.id] && mode === 'exploration') {
      generateSingleImage(selectedComponent.id);
    }
  }, [selectedComponent, mode]);

  const resetGame = () => {
    setMode('intro');
    setScore(0);
    setQuizStep(0);
    setAnalysisStep(0);
    setSelectedComponent(null);
    setIsThermostatOpen(false);
    setShowResultForm(false);
    setIsResultConfirmed(false);
    setUserData({ name: '', class: '', school: '' });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetGame}>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Thermometer size={18} className="text-black" />
            </div>
            <h1 className="font-bold tracking-tight text-lg">CoolingMaster <span className="text-emerald-500">v1.0</span></h1>
          </div>
          <div className="flex items-center gap-4">
            {Object.keys(images).length > 0 && (
              <button 
                onClick={() => {
                  if(confirm('Hapus semua gambar yang tersimpan?')) {
                    localStorage.removeItem('cooling_system_images');
                    localStorage.removeItem('cooling_system_hero');
                    window.location.reload();
                  }
                }}
                className="text-[8px] font-bold text-zinc-600 hover:text-red-400 uppercase tracking-widest transition-colors mr-4"
              >
                Reset Cache Gambar
              </button>
            )}
            {mode !== 'intro' && (
              <button 
                onClick={resetGame}
                className="text-xs uppercase tracking-widest font-semibold text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
              >
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* INTRO MODE */}
          {mode === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative flex flex-col items-center text-center max-w-4xl mx-auto min-h-[70vh] justify-center px-6 py-12 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl"
            >
              {/* Hero Background Image */}
              <div className="absolute inset-0 -z-10">
                {heroImage ? (
                  <>
                    <SmartImage 
                      src={heroImage} 
                      alt="Car Cooling System Background" 
                      className="w-full h-full object-cover opacity-40 scale-105" 
                      fallbackText="Sistem Pendingin Mobil"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
                  </>
                ) : (
                  <div className="w-full h-full bg-zinc-900 animate-pulse" />
                )}
              </div>

              <div className="relative z-10 max-w-2xl mx-auto">
                <div className="mb-8 p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 inline-block">
                  <Settings className="w-12 h-12 text-emerald-500 animate-spin-slow" />
                </div>
                <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tighter text-white drop-shadow-lg">
                  Pahami Sistem Pendingin <span className="text-emerald-500">Mobil Anda</span>
                </h2>
                <p className="text-zinc-300 text-lg md:text-xl mb-10 leading-relaxed drop-shadow-md font-medium">
                  Pelajari bagaimana mesin mobil tetap dingin, kenali komponen vitalnya, dan jadilah ahli dalam mendiagnosis kerusakan sistem pendingin.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
                  {[
                    { icon: Eye, label: 'Eksplorasi', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                    { icon: Play, label: 'Aliran', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
                    { icon: CheckCircle2, label: 'Identifikasi', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                    { icon: Wrench, label: 'Analisis', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
                  ].map((item, i) => (
                    <div key={i} className={cn("p-4 rounded-2xl border backdrop-blur-md flex flex-col items-center gap-3 transition-transform hover:scale-105", item.color)}>
                      <item.icon size={24} />
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-6">
                  <button 
                    onClick={() => setMode('exploration')}
                    className="group relative px-10 py-5 bg-emerald-500 text-black font-black rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.4)] uppercase tracking-widest text-sm"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      Mulai Belajar <Play size={20} fill="currentColor" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* EXPLORATION MODE */}
          {mode === 'exploration' && (
            <motion.div 
              key="exploration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex items-end justify-between border-b border-zinc-800 pb-6">
                <div>
                  <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2 block">Modul 01</span>
                  <h2 className="text-3xl font-bold tracking-tight">Eksplorasi Komponen</h2>
                  {genStatus && (
                    <p className="text-[10px] font-mono text-emerald-500/70 mt-1 animate-pulse uppercase tracking-widest">
                      {genStatus}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  {Object.keys(images).length < COMPONENTS.length && (
                    <button 
                      onClick={() => generateImages()}
                      disabled={loadingImages}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 font-bold rounded-full text-[10px] hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                      <Zap size={12} className="text-amber-400" /> Bangkitkan Semua (Boros Kuota)
                    </button>
                  )}
                  <button 
                    onClick={() => setMode('visualization')}
                    className="flex items-center gap-2 px-6 py-2 bg-zinc-100 text-black font-bold rounded-full text-sm hover:bg-white transition-colors"
                  >
                    Lihat Aliran Cairan <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Component List */}
                <div className="lg:col-span-4 space-y-3">
                  {COMPONENTS.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => setSelectedComponent(comp)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border transition-all duration-200 group flex items-center justify-between",
                        selectedComponent?.id === comp.id 
                          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                          : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                      )}
                    >
                      <span className="font-medium">{comp.nameIndo}</span>
                      <ChevronRight size={16} className={cn("transition-transform", selectedComponent?.id === comp.id && "translate-x-1")} />
                    </button>
                  ))}
                </div>

                {/* Component Detail */}
                <div className="lg:col-span-8">
                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 min-h-[400px] flex flex-col">
                    {selectedComponent ? (
                      <motion.div 
                        key={selectedComponent.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 relative">
                          {loadingImages ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                              <p className="text-xs font-mono text-zinc-500 animate-pulse uppercase tracking-widest">Generating Realistic Asset...</p>
                            </div>
                          ) : images[selectedComponent.id] ? (
                            <div className="relative w-full h-full">
                              <SmartImage 
                                src={images[selectedComponent.id]} 
                                alt={selectedComponent.name} 
                                className="w-full h-full object-cover"
                                fallbackText={selectedComponent.nameIndo}
                              />
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const id = selectedComponent.id;
                                  setImages(prev => {
                                    const next = { ...prev };
                                    delete next[id];
                                    return next;
                                  });
                                  generateSingleImage(id);
                                }}
                                disabled={loadingImages}
                                className="absolute bottom-4 right-4 p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-black/80 transition-all border border-white/10 disabled:opacity-50 group"
                                title="Perbarui Gambar"
                              >
                                <RotateCcw size={18} className={loadingImages ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                              </button>
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900">
                              {loadingImages ? (
                                <div className="flex flex-col items-center gap-4">
                                  <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                                  <div className="text-center">
                                    <p className="text-xs font-mono text-emerald-500 animate-pulse uppercase tracking-widest">Membangkitkan Gambar...</p>
                                    <p className="text-[10px] text-zinc-500 mt-1">Mohon tunggu sebentar</p>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <ImagePlaceholder text={selectedComponent.name} />
                                  <div className="flex flex-col items-center gap-2">
                                    <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Gagal memuat gambar</p>
                                    <button 
                                      onClick={() => generateSingleImage(selectedComponent.id)}
                                      className="px-6 py-2 bg-zinc-800 text-white rounded-full text-xs font-bold hover:bg-zinc-700 transition-all flex items-center gap-2"
                                    >
                                      <RotateCcw size={14} /> Coba Lagi
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{selectedComponent.nameIndo}</h3>
                          <p className="text-zinc-400 leading-relaxed text-lg italic">
                            "{selectedComponent.functionIndo}"
                          </p>
                        </div>
                        <div className="pt-6 border-t border-zinc-800">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Technical Detail</h4>
                          <p className="text-sm text-zinc-500">
                            {selectedComponent.function}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 space-y-4">
                        <div className="p-6 rounded-full bg-zinc-800/50">
                          <Eye size={48} />
                        </div>
                        <p className="font-medium">Pilih komponen di sebelah kiri untuk melihat detail</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VISUALIZATION MODE */}
          {mode === 'visualization' && (
            <motion.div 
              key="visualization"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex items-end justify-between border-b border-zinc-800 pb-6">
                <div>
                  <span className="text-purple-500 text-xs font-bold uppercase tracking-widest mb-2 block">Modul 02</span>
                  <h2 className="text-3xl font-bold tracking-tight">Visualisasi Aliran</h2>
                  {genStatus && (
                    <p className="text-[10px] font-mono text-purple-500/70 mt-1 animate-pulse uppercase tracking-widest">
                      {genStatus}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => setMode('quiz')}
                  className="flex items-center gap-2 px-6 py-2 bg-zinc-100 text-black font-bold rounded-full text-sm hover:bg-white transition-colors"
                >
                  Lanjut ke Kuis <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Kondisi Mesin</span>
                      <span className="text-sm font-bold text-white">{isThermostatOpen ? 'Suhu Kerja (Normal)' : 'Pemanasan (Cold Start)'}</span>
                    </div>
                    <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                      <button 
                        onClick={() => setIsThermostatOpen(false)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isThermostatOpen ? 'bg-red-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        Cold Start
                      </button>
                      <button 
                        onClick={() => setIsThermostatOpen(true)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isThermostatOpen ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        Operating
                      </button>
                    </div>
                  </div>
                  <CoolantFlowDiagram images={images} loading={loadingImages} isThermostatOpen={isThermostatOpen} />
                </div>
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Activity size={18} className="text-purple-400" />
                      {isThermostatOpen ? 'Sirkulasi Terbuka' : 'Sirkulasi Tertutup'}
                    </h3>
                    <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                      {!isThermostatOpen ? (
                        <>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 font-bold">!</div>
                            <p><span className="text-zinc-200 font-semibold">Thermostat Closed:</span> Cairan tidak mengalir ke radiator.</p>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center shrink-0 font-bold">→</div>
                            <p><span className="text-zinc-200 font-semibold">Bypass:</span> Cairan hanya berputar di dalam mesin agar cepat panas.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 font-bold">✓</div>
                            <p><span className="text-zinc-200 font-semibold">Thermostat Open:</span> Jalur menuju radiator terbuka penuh.</p>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center shrink-0 font-bold">→</div>
                            <p><span className="text-zinc-200 font-semibold">Cooling:</span> Panas dilepaskan di radiator dengan bantuan kipas.</p>
                          </div>
                        </>
                      )}
                      <div className="pt-4 border-t border-zinc-800">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Komponen Aktif:</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-zinc-800 rounded text-[9px] font-bold">Water Pump</span>
                          <span className="px-2 py-1 bg-zinc-800 rounded text-[9px] font-bold">Engine Block</span>
                          {isThermostatOpen && <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold">Radiator</span>}
                          {isThermostatOpen && <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold">Cooling Fan</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-xs text-emerald-500/70 italic leading-relaxed">
                      {isThermostatOpen 
                        ? "Suhu mesin stabil di kisaran 80-90°C. Sistem bekerja mendinginkan mesin."
                        : "Mesin sedang dalam tahap pemanasan untuk mencapai efisiensi maksimal."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* QUIZ MODE */}
          {mode === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <div className="text-center">
                <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2 block">Modul 03</span>
                <h2 className="text-3xl font-bold tracking-tight">Identifikasi Komponen</h2>
                <div className="mt-4 flex justify-center gap-2">
                  {COMPONENTS.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i < quizStep ? "bg-emerald-500 w-8" : i === quizStep ? "bg-emerald-500 w-12" : "bg-zinc-800 w-4"
                      )} 
                    />
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-8">
                <div className="text-center space-y-4">
                  <p className="text-zinc-400 uppercase tracking-widest text-xs font-bold">Manakah komponen yang berfungsi untuk:</p>
                  <h3 className="text-2xl font-bold text-white px-4">
                    {COMPONENTS[quizStep].functionIndo}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shuffledOptions.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => {
                        const correctId = COMPONENTS[quizStep].id;
                        const isCorrect = comp.id === correctId;
                        const correctName = COMPONENTS[quizStep].nameIndo;

                        if (isCorrect) {
                          setScore(s => s + 1);
                          alert(`Benar! ${COMPONENTS[quizStep].functionIndo}`);
                        } else {
                          alert(`Kurang tepat. Jawaban yang benar adalah: ${correctName}. \n\nFungsi: ${COMPONENTS[quizStep].functionIndo}`);
                        }

                        if (quizStep < COMPONENTS.length - 1) {
                          setQuizStep(s => s + 1);
                        } else {
                          setMode('analysis');
                        }
                      }}
                      className="p-4 rounded-xl border border-zinc-800 bg-zinc-800/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{comp.nameIndo}</span>
                        <div className="w-6 h-6 rounded-full border border-zinc-700 group-hover:border-emerald-500/50 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ANALYSIS MODE */}
          {mode === 'analysis' && (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex items-end justify-between border-b border-zinc-800 pb-6">
                <div>
                  <span className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-2 block">Modul 04</span>
                  <h2 className="text-3xl font-bold tracking-tight">Analisis Kerusakan</h2>
                </div>
                <div className="text-sm font-mono text-zinc-500">
                  Kasus {analysisStep + 1} dari {SCENARIOS.length}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Scenario Card */}
                <div className="space-y-6">
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-3 text-amber-500">
                      <AlertTriangle size={24} />
                      <h3 className="text-xl font-bold">{SCENARIOS[analysisStep].title}</h3>
                    </div>
                    <p className="text-zinc-300 text-lg leading-relaxed">
                      {SCENARIOS[analysisStep].description}
                    </p>
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Gejala Teramati:</h4>
                      <ul className="space-y-2">
                        {SCENARIOS[analysisStep].symptoms.map((s, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500/50 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Diagnostic Selection */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 flex flex-col">
                  <h4 className="text-center font-bold mb-8 text-zinc-400 uppercase tracking-widest text-xs">Komponen apa yang kemungkinan bermasalah?</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {COMPONENTS.map((comp) => (
                      <button
                        key={comp.id}
                        onClick={() => {
                          const correctId = SCENARIOS[analysisStep].correctComponentId;
                          const isCorrect = comp.id === correctId;
                          const correctComp = COMPONENTS.find(c => c.id === correctId);
                          const correctName = correctComp ? correctComp.nameIndo : "Komponen yang benar";

                          if (isCorrect) {
                            setScore(s => s + 2);
                            alert(`Benar! ${SCENARIOS[analysisStep].explanation}`);
                          } else {
                            alert(`Kurang tepat. Jawaban yang benar adalah: ${correctName}. \n\nPenjelasan: ${SCENARIOS[analysisStep].explanation}`);
                          }
                          
                          if (analysisStep < SCENARIOS.length - 1) {
                            setAnalysisStep(s => s + 1);
                          } else {
                            setShowResultForm(true);
                            setMode('summary');
                          }
                        }}
                        className="p-4 rounded-xl border border-zinc-800 bg-zinc-800/30 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all text-left flex items-center justify-between group"
                      >
                        <span className="font-semibold">{comp.nameIndo}</span>
                        <Wrench size={16} className="text-zinc-600 group-hover:text-amber-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUMMARY MODE */}
          {mode === 'summary' && (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center space-y-8"
            >
              {showResultForm && !isResultConfirmed ? (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-[40px] p-10 space-y-8 shadow-2xl">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Data Peserta</h2>
                    <p className="text-zinc-400">Silakan lengkapi data diri Anda untuk melihat hasil pelatihan.</p>
                  </div>
                  
                  <div className="space-y-4 text-left">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nama Lengkap</label>
                      <input 
                        type="text" 
                        value={userData.name}
                        onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Masukkan nama Anda..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Kelas</label>
                        <input 
                          type="text" 
                          value={userData.class}
                          onChange={(e) => setUserData(prev => ({ ...prev, class: e.target.value }))}
                          placeholder="Contoh: XI TKR 1"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Sekolah</label>
                        <input 
                          type="text" 
                          value={userData.school}
                          onChange={(e) => setUserData(prev => ({ ...prev, school: e.target.value }))}
                          placeholder="Nama Sekolah..."
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (userData.name && userData.class && userData.school) {
                        setIsResultConfirmed(true);
                      } else {
                        alert('Mohon lengkapi semua data.');
                      }
                    }}
                    className="w-full py-5 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                  >
                    Lihat Hasil Nilai
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 inline-block">
                    <CheckCircle2 size={64} className="text-emerald-500" />
                  </div>
                  
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-[40px] p-10 space-y-8 shadow-2xl">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-bold tracking-tight text-white">Hasil Pelatihan</h2>
                      <p className="text-zinc-400">Selamat! Anda telah menyelesaikan seluruh modul.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left border-y border-zinc-800 py-8">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nama Peserta</span>
                        <p className="text-lg font-bold text-white">{userData.name}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Kelas</span>
                        <p className="text-lg font-bold text-white">{userData.class}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sekolah</span>
                        <p className="text-lg font-bold text-white">{userData.school}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 py-4">
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Skor Akhir</span>
                        <p className="text-7xl font-black text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">{score}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Status Kelulusan</span>
                        <p className={cn(
                          "text-4xl font-black mt-4",
                          score >= 7 ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {score >= 7 ? "LULUS" : "TIDAK LULUS"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                      <button 
                        onClick={resetGame}
                        className="px-8 py-4 bg-zinc-100 text-black font-bold rounded-full hover:bg-white transition-all flex items-center justify-center gap-2"
                      >
                        Ulangi Pelatihan <RotateCcw size={18} />
                      </button>
                      <button 
                        className="px-8 py-4 bg-zinc-800 text-white font-bold rounded-full hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                      >
                        Unduh Sertifikat <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-xs font-medium uppercase tracking-widest">
          <p>© 2026 Kalimmustofa Automotive education</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
