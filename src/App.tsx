import React, { useCallback, useEffect, useMemo, useRef, useState, Component } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  db, 
  auth, 
  loginWithGoogle, 
  logout, 
  handleFirestoreError, 
  OperationType,
  signInAnonymously
} from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  Phone,
  MapPin,
  User,
  Send,
  CheckCircle,
  XCircle,
  ChevronRight,
  Award,
  AlertCircle,
  LogOut,
  LogIn,
  PhoneCall,
  Mic,
  Volume2,
  Loader2,
  Activity,
  Car,
  Clock,
  Play,
  VolumeX,
  Volume1,
  Home,
  History,
  UserCircle,
  Settings,
  ChevronLeft,
  Lock,
  BarChart3
} from 'lucide-react';

import { Dashboard } from './components/Dashboard';

// ==========================================/
// APP CONFIG & CONSTANTS
// ==========================================/

const LOGO_URL = 'https://image2url.com/r2/default/images/1773942607988-c4f7e207-ba52-4fab-ab6f-d02aa79ff43b.png';

const COLORS = {
  darkBlue: '#0D375E',
  blue: '#228BE6',
  gray: '#A7A8AA'
};

const LOCATIONS = [
  'Albany NY - Loudon',
  'Albuquerque NM - Karsten',
  'Asheville NC',
  'Atlanta - Chamblee',
  'Atlanta VM - Midtown',
  'Atlanta GA - Fairburn',
  'Atlanta GA - Winder',
  'Augusta',
  'Austin - North Austin',
  'Austin VM',
  'Bakersfield',
  'Baltimore MD - Holabird',
  'Bessemer IC',
  'Birmingham VM',
  'Blue Mound Hub',
  'Fort Worth VM',
  'Boise ID',
  'Boston - Norfolk',
  'Boston - Colonial CDJR',
  'Boston MA - Western',
  'Bridgeport CT - Fairfield',
  'New York City NY - Bronx',
  'Buffalo NY - Akron Hub',
  'Cape Girardeau MO',
  'Casa Grande CDJR',
  'Charlotte VM',
  'Concord Hub',
  'Chattanooga TN - Relocation Way',
  'Chicago IL - University Park Hub',
  'Chicago - Penny VM',
  'Chicago VM',
  'Trenton Hub',
  'Cleveland VM',
  'Elyria Hub',
  'Colorado Springs CO - Charter',
  'Columbia SC - Augusta',
  'Columbus GA',
  'Heath Hub',
  'Dallas TX - Hutchins',
  'Dallas VM',
  'Dallas TX - Park Cities CDJR',
  'Washington DC VA - Dulles',
  'Denver',
  'Denver VM',
  'Des Moines IA',
  'Detroit VM',
  'El Paso TX - Northwestern',
  'Eugene OR Hub',
  'Flint MI',
  'Grand Rapids MI - Wyoming',
  'Burlington NC',
  'Greensboro VM',
  'Greenville SC - Plemmons',
  'Haines City Hub',
  'Hammond LA',
  'Hartford',
  'Houston TX - Sam Houston',
  'Houston - Spring VM',
  'Houston VM',
  'Indianapolis Hub',
  'Indianapolis IN - Plainfield',
  'Jacksonville FL - Kings Rd.',
  'Jacksonville VM',
  'Kansas City MO - Belton',
  'Kansas City VM',
  'Lexington KY',
  'Knoxville TN - Lenoir',
  'Lafayette LA - Old Spanish',
  'Las Vegas NV - Gowan',
  'Las Vegas VM',
  'Little Rock AR - McNeil',
  'Long Island NY - Patchogue',
  'Long Island NY VM',
  'Los Angeles - Chatsworth',
  'Los Angeles - Montebello',
  'Los Angeles - Westminster VM',
  'Los Angeles - Ontario VM',
  'Riverside CA - Fleetwood',
  'Louisville VM',
  'Memphis',
  'Memphis VM',
  'Miami FL - Terrace VM',
  'Miami VM',
  'Milwaukee WI - Delafield Hub',
  'Milwaukee - Oak Creek',
  'Minneapolis MN - Collins',
  'Mobile - Theodore',
  'Myrtle Beach SC - Conway',
  'Nashville TN - Burnett',
  'Nashville VM',
  'Newark - Manville',
  'Newark - Midland Park',
  'Beacon NY',
  'Oklahoma City OK Hub',
  'Oklahoma City VM',
  'Omaha NE',
  'Orlando FL - Sanford',
  'Orlando VM',
  'Peoria IL',
  'Delanco Hub',
  'Philadelphia VM',
  'Phoenix AZ - Beck',
  'Tempe VM',
  'Glendale VM',
  'Tolleson Hub',
  'Pittsburgh PA - Hunker',
  'Pittsburgh VM',
  'Portland OR',
  'Raleigh VM',
  'Reno NV - Echo',
  'Chesterfield Hub',
  'Richmond VM',
  'Rocklin Hub',
  'Sacramento CDJR',
  'Salt Lake City VM',
  'San Antonio Hub',
  'San Antonio VM',
  'San Diego',
  'San Diego CA - Cactus',
  'San Diego CDJR',
  'San Diego - Escondido',
  'San Francisco - Daly City VM',
  'San Jose CA - Monterey',
  'Sarasota FL Hub',
  'Savannah',
  'Scranton',
  'Seattle WA - Auburn',
  'Shreveport',
  'South Atlanta CDJR',
  'Springfield MO',
  'St. Louis - Hazelwood',
  'Syracuse NY',
  'Tampa - West',
  'Tampa VM',
  'Tooele IC',
  'Tracy CA',
  'Tulsa OK',
  'Virginia Beach - Norfolk',
  'Washington DC VM',
  'Wichita KS',
  'York PA'
];

const SCENARIOS = [
  {
    id: 'taylor',
    level: 1,
    name: 'Taylor',
    subTitle: 'The Scattered Enthusiast',
    difficulty: 'Easy/Friendly',
    voice: 'Kore',
    customerName: 'Taylor',
    vehicle: '2020 Tesla Model Y',
    address: '1234 Jay Bird St.',
    appointment: '10:00 AM',
    description:
      "Taylor. They live at 1234 Jay Bird St. They are excited about the delivery of their Tesla Model Y but very disorganized. They have misplaced their physical driver's license and only have a photo of it on their phone. Taylor is also not sure if their new insurance policy has started yet. The Advocate is calling to ensure you are cleared for delivery. During the call, Taylor will eventually find their driver's license and confirm they have proof of insurance. Taylor will be friendly, positive, and a bit scattered. CRITICAL: Taylor must listen to the user's responses and not prompt the response or lead the learner to the right answer. Let the learner figure out what information they need to ask for."
  },
  {
    id: 'morgan',
    level: 2,
    name: 'Morgan',
    subTitle: 'The Nervous Trader',
    difficulty: 'Medium/Anxious',
    voice: 'Puck',
    customerName: 'Morgan',
    vehicle: '2024 Toyota Supra',
    tradeVehicle: '2007 Toyota Rav4',
    address: '1234 Mockingbird Lane',
    appointment: '2:30 PM',
    collectingTitle: 'Yes (Toyota Rav4)',
    description:
      "You are Morgan. You are trading in a Toyota Rav4 for a Toyota Supra. You live on 1234 Mockingbird Lane. Since you did the online appraisal, you accidentally backed into a pole and left a small dent on the bumper, but you're hoping it won't change the sale price. You are nervous because you can't find the spare key."
  },
  {
    id: 'casey',
    level: 3,
    name: 'Casey',
    subTitle: 'The Impatient Professional',
    difficulty: 'Hard/Impatient',
    voice: 'Fenrir',
    customerName: 'Casey',
    vehicle: '2019 Mazda 3',
    address: '54 Quail Trail road',
    appointment: '12:00 PM',
    description:
      "You are Casey. You are extremely busy and currently on a very tight lunch break. You expect your Mazda 3 to be dropped off exactly at 12:00 PM at your apartment complex (54 Quail Trail road). You have a high-stakes meeting at 12:30 PM and zero patience for delays. When the Advocate calls to tell you the hauler can't fit and you need to meet elsewhere, start the conversation highly escalated, impatient, and frustrated. Use short, sharp sentences. Demand to know why this wasn't figured out sooner. CRITICAL: You only de-escalate if the Advocate is genuinely helpful, empathetic, and offers a solution that respects your time (like a very close location or a quick hand-off). If they are helpful, gradually become more professional and cooperative. If they are dismissive or vague, stay angry and difficult."
  },
  {
    id: 'cameron',
    level: 4,
    name: 'Cameron',
    subTitle: 'The Secretive Strategist',
    difficulty: 'Expert/Secretive',
    voice: 'Zephyr',
    customerName: 'Cameron',
    vehicle: '2017 Nissan Leaf',
    tradeVehicle: '2020 BMW i3',
    address: '1428 Elm St.',
    appointment: '4:30 PM',
    coBuyer: 'Required (Running Late)',
    collectingTitle: 'Yes (BMW i3)',
    description:
      "You are Cameron. You're in the middle of pulling off a huge surprise: a 2017 Nissan Leaf for your spouse's birthday. Your spouse is literally in the next room, so you must speak in a low, secretive whisper. You are anxious but excited. You need to coordinate two things: the co-buyer is running late (but must be there), and the delivery truck CANNOT pull up to the house—it has to park down the street or at a neighbor's. ACT out the secrecy; don't describe it. Use phrases like 'Hold on, let me move to another room' or 'I have to be quiet.' Never say 'I am being secretive because...'. Just be secretive. Insist on the alternate parking and handle the co-buyer delay with hushed urgency."
  }
];

const FEEDBACK_CRITERIA = [
  { id: 'intro', text: 'Introduced yourself by name and that you are with Carvana' },
  { id: 'address', text: 'Confirmed delivery address' },
  { id: 'vehicle', text: 'Confirmed year, make, & model' },
  { id: 'eta', text: 'Provided ETA' },
  { id: 'insurance', text: 'Requested Proof of Insurance (POI)' },
  { id: 'license', text: 'Requested Driver’s License' },
  { id: 'special_occasion', text: 'Asked if this purchase is for a special occasion or event' },
  { id: 'co_buyer', text: 'Addressed Co-Buyer presence requirement' },
  { id: 'title', text: 'Confirmed collection of trade-in title' }
];

// ==========================================/
// AUDIO UTILITIES
// ==========================================/

/**
 * Converts Float32Array to 16-bit PCM (Int16Array)
 */
function floatTo16BitPCM(input: Float32Array) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
}

/**
 * Converts 16-bit PCM (base64) to Float32Array for Web Audio API
 */
function pcmToFloat32(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }
  return float32;
}

// ==========================================/
// MAIN COMPONENT
// ==========================================/

function SimulatorApp() {
  const [empId, setEmpId] = useState('');
  const [location, setLocation] = useState('');
  const [screen, setScreen] = useState<'login' | 'menu' | 'chat' | 'results' | 'dashboard'>('login');
  const [tab, setTab] = useState('home');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const [activeScenario, setActiveScenario] = useState<any>(null);
  const [callStarted, setCallStarted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [completedCriteria, setCompletedCriteria] = useState<string[]>([]);
  const [isCheckingCriteria, setIsCheckingCriteria] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [textInput, setTextInput] = useState('');

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasPaidKey, setHasPaidKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        try {
          const selected = await (window as any).aistudio.hasSelectedApiKey();
          setHasPaidKey(selected);
        } catch (e) {
          console.error("Error checking API key status:", e);
        }
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      try {
        await (window as any).aistudio.openSelectKey();
        setHasPaidKey(true);
      } catch (e) {
        console.error("Error opening key selector:", e);
      }
    }
  };

  const currentCriteria = useMemo(() => {
    if (!activeScenario) return FEEDBACK_CRITERIA;
    if (activeScenario.id === 'cameron') return FEEDBACK_CRITERIA;
    if (activeScenario.id === 'morgan') {
      // Level 2 (Morgan) has a trade-in, so include title but not co_buyer
      return FEEDBACK_CRITERIA.filter(c => c.id !== 'co_buyer');
    }
    // For other levels, remove co_buyer and title
    return FEEDBACK_CRITERIA.filter(c => c.id !== 'co_buyer' && c.id !== 'title');
  }, [activeScenario]);

  // Live API Refs
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ai = useMemo(() => {
    let key = process.env.GEMINI_API_KEY || (process.env as any).API_KEY;
    
    // Check for common placeholders
    const placeholders = ["MY_GEMINI_API_KEY", "YOUR_API_KEY", "TODO_KEYHERE"];
    if (key && placeholders.includes(key)) {
      console.warn("Gemini API Key is a placeholder:", key);
      key = undefined;
    }

    console.log("Initializing Gemini AI. Key found:", key ? `${key.substring(0, 5)}...${key.substring(key.length - 4)}` : "NONE");
    if (!key) {
      console.error("GEMINI_API_KEY is missing from environment!");
      setApiError("Gemini API Key is missing. Please set GEMINI_API_KEY in the application settings.");
    }
    return new GoogleGenAI({ apiKey: key || 'MISSING_KEY' });
  }, []);

  const lastCheckedMessageCount = useRef(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Real-time criteria check
    const checkCriteria = async () => {
      if (messages.length < 2 || isCheckingCriteria || !callStarted) return;
      if (messages.length === lastCheckedMessageCount.current) return;
      
      setIsCheckingCriteria(true);
      lastCheckedMessageCount.current = messages.length;
      try {
        const transcript = messages
          .map((m) => `${m.role === 'user' ? 'Advocate' : 'Customer'}: ${m.text}`)
          .join('\n');

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Analyze this transcript and identify which criteria the Advocate has successfully met. 
          
          Guidelines:
          - A criterion is met only if the Advocate (user) explicitly performs the action described (e.g., asks the question or provides the information). 
          - Do not mark a criterion as met if only the Customer mentions it.
          - Be encouraging and lenient. If the Advocate made a reasonable attempt to cover the point, mark it as met.
          - For 'special_occasion': Mark as met if the Advocate asks about any special event, birthday, anniversary, surprise, or if the car is a gift.
          
          Criteria: ${JSON.stringify(currentCriteria)}
          Transcript: ${transcript}
          
          Return JSON array of met criteria IDs: ${JSON.stringify(currentCriteria.map(c => c.id))}`,
          config: { responseMimeType: "application/json" }
        });

        const metIds = JSON.parse(response.text || '[]');
        if (Array.isArray(metIds)) {
          setCompletedCriteria(prev => {
            const newIds = [...new Set([...prev, ...metIds])];
            return newIds;
          });
        }
      } catch (err) {
        console.error("Criteria check error:", err);
      } finally {
        setIsCheckingCriteria(false);
      }
    };

    // Debounce check - reduced from 3000ms to 1500ms for better responsiveness
    const timer = setTimeout(checkCriteria, 1500);
    return () => clearTimeout(timer);
  }, [messages, callStarted]);

  const maxLevelUnlocked = useMemo(() => {
    let max = 1;
    sessions.forEach(s => {
      if (s.rating === 100) {
        const scenario = SCENARIOS.find(sc => sc.id === s.scenarioId);
        if (scenario && scenario.level >= max) {
          max = scenario.level + 1;
        }
      }
    });
    return max;
  }, [sessions]);

  const stats = useMemo(() => {
    const completedScenarios = new Set(sessions.filter(s => s.rating === 100).map(s => s.scenarioId));
    const totalScenarios = SCENARIOS.length;
    const avgRating = sessions.length > 0 
      ? Math.round(sessions.reduce((acc, s) => acc + s.rating, 0) / sessions.length)
      : 0;
    
    return {
      completedCount: completedScenarios.size,
      totalCount: totalScenarios,
      percentComplete: Math.round((completedScenarios.size / totalScenarios) * 100),
      avgRating,
      totalSessions: sessions.length,
      isFullyComplete: completedScenarios.size === totalScenarios
    };
  }, [sessions]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Sessions from Firestore
  useEffect(() => {
    if (empId.trim() && (tab === 'history' || screen === 'menu')) {
      const q = query(
        collection(db, 'sessions'),
        where('empId', '==', empId.trim()),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSessions(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'sessions');
      });

      return () => unsubscribe();
    }
  }, [tab, empId, screen]);

  // Fetch ALL Sessions for Dashboard
  useEffect(() => {
    if (screen === 'dashboard' || (user && user.email === 'nick.peugh@carvana.com')) {
      const q = query(
        collection(db, 'sessions'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllSessions(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'sessions');
      });

      return () => unsubscribe();
    }
  }, [screen, user]);

  // Check URL for dashboard view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'dashboard') {
      setScreen('dashboard');
      if (!auth.currentUser) {
        signInAnonymously(auth).catch(err => {
          console.error("Anonymous sign-in failed:", err);
        });
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setScreen('login');
      setEmpId('');
      setLocation('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const stopAudio = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsListening(false);
    setIsSpeaking(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId.trim() || !location.trim()) {
      setErrorMsg('Employee ID and location are required.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Sign in anonymously in the background for Firebase rules
      await signInAnonymously(auth);
      setScreen('menu');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to initialize session.');
    } finally {
      setIsLoading(false);
    }
  };

  const startScenario = (scenario: any) => {
    setActiveScenario(scenario);
    setMessages([]);
    setFeedback(null);
    setCompletedCriteria([]);
    setScreen('chat');
    setCallStarted(false);
  };

  const playRingTone = async (ctx: AudioContext) => {
    const playOneRing = () => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.frequency.value = 440;
      osc2.frequency.value = 480;
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
      gain.gain.setValueAtTime(0.1, now + 1.9);
      gain.gain.linearRampToValueAtTime(0, now + 2.0);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.0);
      osc2.stop(now + 2.0);
    };

    playOneRing();
    await new Promise(resolve => setTimeout(resolve, 3000)); // 2s ring + 1s silence
    playOneRing();
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s ring
  };

  const initiateCall = async () => {
    if (!activeScenario) return;
    setErrorMsg('');
    setIsLoading(true);
    setIsRinging(true);

    try {
      // 1. Setup Audio Context at 16000 for input
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      nextPlayTimeRef.current = audioContext.currentTime;

      // Play ring tone twice before connecting
      await playRingTone(audioContext);
      setIsRinging(false);

      // 2. Connect to Live API
      console.log("Connecting to Live API with model: gemini-2.5-flash-native-audio-preview-12-2025");
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: activeScenario.voice || "Zephyr" } },
          },
          systemInstruction: `You are playing a roleplay scenario for a Carvana Advocate training. 
          Scenario: ${activeScenario.description}. 
          Your name is ${activeScenario.customerName}. 
          The phone has just finished ringing and you have picked up. 
          
          CRITICAL INSTRUCTION: When you receive the text input "CALL_STARTED", you MUST immediately respond with a verbal greeting like "Hello?" or "Hello, this is ${activeScenario.customerName}." 
          Do NOT wait for the advocate to speak first. 
          
          After your initial greeting, wait for the advocate to introduce themselves and state they are from Carvana. 
          Be realistic, stay in character, and react naturally to what the advocate says. 
          Do NOT describe your persona or state your instructions. Just ACT as the character described in the scenario.
          If the advocate is silent after your greeting, you can say "Hello? Is anyone there?" after a few seconds.`,
        },
        callbacks: {
          onopen: () => {
            console.log("Live API connection opened successfully");
            setIsLoading(false);
            setCallStarted(true);
            startMicStreaming();
            // Trigger the initial "Hello" using the promise to avoid closure issues
            sessionPromise.then(session => {
              // Increased delay to ensure the model is fully ready to process the trigger
              setTimeout(() => {
                console.log("Triggering initial greeting with CALL_STARTED");
                session.sendRealtimeInput({ text: "CALL_STARTED" });
              }, 1500);
            }).catch(err => {
              console.error("Error sending initial trigger:", err);
            });
          },
          onmessage: async (message: any) => {
            console.log("Live API message received:", message);
            
            if (message.error) {
              console.error("Live API Error Message:", message.error);
              setErrorMsg(`API Error: ${message.error.message || 'Unknown error'}`);
              return;
            }

            // Handle model turn parts (audio and text)
            const modelParts = message.serverContent?.modelTurn?.parts;
            if (modelParts) {
              console.log("Model turn parts:", modelParts);
              setIsSpeaking(true);
              for (const part of modelParts) {
                if (part.inlineData?.data) {
                  console.log("Playing audio chunk");
                  playAudioChunk(part.inlineData.data);
                }
                if (part.text) {
                  console.log("Model text:", part.text);
                  setMessages(prev => [...prev, { role: 'ai', text: part.text }]);
                }
              }
            }

            // Handle user turn parts (transcription)
            const userParts = message.serverContent?.userTurn?.parts;
            if (userParts) {
              for (const part of userParts) {
                if (part.text) {
                  setMessages(prev => [...prev, { role: 'user', text: part.text }]);
                }
              }
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              if (audioContextRef.current) {
                nextPlayTimeRef.current = audioContextRef.current.currentTime;
              }
              setIsSpeaking(false);
            }
          },
          onclose: (event: any) => {
            console.log("Live API connection closed", event);
            if (event && !event.wasClean) {
              setErrorMsg(`Connection lost unexpectedly (Code: ${event.code})`);
            }
            stopAudio();
          },
          onerror: (err: any) => {
            console.error("Live API error callback:", err);
            setErrorMsg(`Connection error: ${err.message || 'Check your internet and API key'}`);
            stopAudio();
          }
        }
      });

      const session = await sessionPromise;
      sessionRef.current = session;
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to start call. Check your microphone permissions.");
      setIsLoading(false);
    }
  };

  const startMicStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      if (!audioContextRef.current) return;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!sessionRef.current) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = floatTo16BitPCM(inputData);
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
        
        sessionRef.current.sendRealtimeInput({
          audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
        });
        setIsListening(true);
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      processorRef.current = processor;
    } catch (err) {
      console.error("Mic error:", err);
      setErrorMsg("Could not access microphone.");
    }
  };

  const playAudioChunk = async (base64: string) => {
    if (!audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const float32 = pcmToFloat32(base64);
    const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);

    const startTime = Math.max(audioContextRef.current.currentTime, nextPlayTimeRef.current);
    source.start(startTime);
    nextPlayTimeRef.current = startTime + buffer.duration;
    
    source.onended = () => {
      if (audioContextRef.current && audioContextRef.current.currentTime >= nextPlayTimeRef.current - 0.1) {
        setIsSpeaking(false);
      }
    };
  };

  const handleSendMessage = () => {
    if (!textInput.trim() || !sessionRef.current) return;
    
    const text = textInput.trim();
    setMessages(prev => [...prev, { role: 'user', text }]);
    sessionRef.current.sendRealtimeInput({ text });
    setTextInput('');
  };

  const endScenario = async () => {
    setIsFinishing(true);
    stopAudio();

    try {
      const transcript = messages
        .map((m) => `${m.role === 'user' ? 'Advocate' : 'Customer'}: ${m.text}`)
        .join('\n');

      console.log("Starting evaluation with transcript length:", transcript.length);
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Evaluate this Carvana Advocate training call. 
        Scenario: ${activeScenario.description}
        Transcript: ${transcript}
        
        Success Criteria Definitions:
        ${currentCriteria.map((c, i) => `${i + 1}. ${c.id}: ${c.text}`).join('\n        ')}

        Scoring Rubric:
        - A criterion is met only if the Advocate (user) explicitly performs the action described (e.g., asks the question or provides the information). 
        - Do not mark a criterion as met if only the Customer mentions it.
        - Be encouraging and lenient. If the Advocate made a reasonable attempt to cover the point (e.g. asked the question even if the customer didn't answer fully), score it as 1.
        - For 'special_occasion': Score as 1 if the Advocate asks about any special event, birthday, anniversary, surprise, or if the car is a gift.
        - Only score as 0 if the topic was completely ignored by the Advocate.

        Provide feedback in JSON format:
        {
          "scores": {
            ${currentCriteria.map(c => `"${c.id}": 0 or 1`).join(',\n            ')}
          },
          "summary": "A brief encouraging summary of performance, highlighting what they did well and what they missed based on the criteria."
        }`,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      console.log("Evaluation result:", result);
      const earned = Object.values(result.scores || {}).reduce((sum: number, n: any) => sum + (n ? 1 : 0), 0) as number;
      const rating = Math.round((earned / currentCriteria.length) * 100);

      const feedbackData = {
        scores: result.scores,
        rating,
        summary: result.summary
      };

      setFeedback(feedbackData);
      setScreen('results');

      // Save to Firestore
      try {
        await addDoc(collection(db, 'sessions'), {
          empId: empId.trim(),
          location,
          scenarioId: activeScenario.id,
          scenarioName: activeScenario.name,
          transcript,
          scores: result.scores,
          summary: result.summary,
          rating,
          createdAt: new Date().toISOString(),
          uid: user?.uid || 'anonymous'
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'sessions');
      }
    } catch (err: any) {
      console.error("Evaluation error:", err);
      // Fallback feedback if AI fails
      const fallbackFeedback = {
        scores: {},
        rating: 0,
        summary: "We encountered a technical issue generating your AI coaching report (likely an API rate limit). You can still review your transcript in the dashboard later."
      };
      setFeedback(fallbackFeedback);
      setScreen('results');
      setErrorMsg(`Report generation failed: ${err.message || 'Rate limit reached'}`);
    } finally {
      setIsFinishing(false);
    }
  };

  // ==========================================/
  // RENDER LOGIC
  // ==========================================/

  if (!isAuthReady || isFinishing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.darkBlue }}>
        <div className="text-white flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="font-bold tracking-widest uppercase text-xs">
            {isFinishing ? 'Generating Performance Report...' : 'Initializing Secure Session...'}
          </p>
        </div>
      </div>
    );
  }

  if (screen === 'dashboard') {
    return (
      <Dashboard 
        sessions={allSessions} 
        onBack={() => setScreen(user && !user.isAnonymous ? 'menu' : 'login')} 
        logoUrl={LOGO_URL}
      />
    );
  }

  if (screen === 'login') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-950">
        <div className="w-full max-w-sm space-y-12">
          <div className="flex flex-col items-center gap-6">
            <div className="w-[345px] h-[86px] flex items-center justify-center">
              <img 
                src={LOGO_URL} 
                alt="Carvana" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">Pre-Call Practice</h1>
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Training Simulator</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-4 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  required
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  placeholder="Employee ID"
                  className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-600 transition-all"
                />
              </div>
              <div className="relative group">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <select
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-10 py-4 bg-gray-900 border border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white appearance-none transition-all"
                >
                  <option value="" disabled className="text-gray-600">Select Location</option>
                  {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                </select>
                <ChevronRight className="absolute right-4 top-4 w-5 h-5 text-gray-600 pointer-events-none rotate-90" />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-blue-600 rounded-2xl font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="pt-8 border-t border-gray-900">
            <button 
              onClick={() => {
                setScreen('dashboard');
                if (!user) {
                  signInAnonymously(auth).catch(console.error);
                }
              }}
              className="w-full py-4 rounded-2xl border border-gray-800 text-gray-500 font-bold uppercase tracking-widest text-xs hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Manager Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'menu') {
    return (
      <div className="h-[100dvh] flex flex-col bg-gray-950">
        <header className="px-6 pt-12 pb-6 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs font-black uppercase tracking-widest">Welcome back</span>
            <h2 className="text-2xl font-black text-white tracking-tight">Advocate {empId}</h2>
          </div>
          <button 
            onClick={handleLogout}
            className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-800 text-gray-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pb-24 space-y-8 no-scrollbar">
          {tab === 'home' && (
            <>
              <div className="bg-gradient-to-br from-brand-blue to-brand-dark rounded-[32px] p-0 relative overflow-hidden shadow-2xl shadow-brand-blue/20 min-h-[350px]">
                <img 
                  src={LOGO_URL} 
                  alt="Carvana Hauler" 
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                  referrerPolicy="no-referrer"
                />
                <div className="relative z-10 p-8 space-y-4 bg-gradient-to-t from-brand-dark/80 to-transparent h-full flex flex-col justify-end">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white leading-tight">Ready to Train?</h3>
                    <p className="text-blue-100 text-sm font-medium leading-relaxed">
                      Welcome to your Pre-Activity Call practice app! This is your space to rehearse pre-calls in a simulated environment and ensure every real-world conversation is a smooth ride. To keep your skills sharp, this simulator is designed to challenge your knowledge, bumping up the difficulty every time you unlock a new scenario. Successfully cruise through all four scenarios to complete your training and you'll be ready to go!
                    </p>
                  </div>
                </div>
              </div>

              {/* Training Progress Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-blue-500">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Completion</span>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-white">{stats.completedCount}</span>
                    <span className="text-xs text-gray-500 mb-1">/ {stats.totalCount}</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-1000" 
                      style={{ width: `${stats.percentComplete}%` }}
                    />
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <Award className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Avg. Rating</span>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-white">{stats.avgRating}%</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Across {stats.totalSessions} sessions</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-black uppercase tracking-widest text-xs text-gray-500">Scenarios</h4>
                  <button className="text-blue-500 text-xs font-bold uppercase tracking-widest">View All</button>
                </div>
                <div className="space-y-4">
                  {SCENARIOS.map((s) => {
                    const isLocked = s.level > maxLevelUnlocked;
                    const isCompleted = sessions.some(sess => sess.scenarioId === s.id && sess.rating === 100);
                    return (
                      <button 
                        key={s.id} 
                        onClick={() => !isLocked && startScenario(s)}
                        disabled={isLocked}
                        className={`w-full bg-gray-900 border border-gray-800 rounded-[28px] p-5 flex items-center gap-5 transition-all active:scale-95 active:bg-gray-800 text-left ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                      >
                        <div className={`w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest border border-gray-700 text-center px-1 ${isLocked ? 'text-gray-600' : 'text-blue-500'}`}>
                          {isLocked ? <Lock className="w-6 h-6" /> : s.name}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-white">{s.subTitle}</h5>
                            <div className="flex items-center gap-2">
                              {isCompleted && <span className="text-[8px] font-black bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1"><CheckCircle className="w-2 h-2" />Completed</span>}
                              {isLocked && <span className="text-[8px] font-black bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Locked</span>}
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                s.difficulty === 'Easy/Friendly' ? 'bg-green-500/10 text-green-500' : 
                                s.difficulty === 'Medium/Anxious' ? 'bg-yellow-500/10 text-yellow-500' : 
                                'bg-red-500/10 text-red-500'
                              }`}>
                                {s.difficulty.split('/')[0]}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-gray-500 text-xs">
                            <div className="flex items-center gap-1"><Car className="w-3 h-3" /><span>{s.vehicle}</span></div>
                            <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>{s.appointment}</span></div>
                          </div>
                        </div>
                        {!isLocked && <ChevronRight className="w-5 h-5 text-gray-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {tab === 'history' && (
            <div className="space-y-6">
              <h4 className="font-black uppercase tracking-widest text-xs text-gray-500">Recent Sessions</h4>
              {sessions.length === 0 ? (
                <div className="text-center py-12 bg-gray-900/50 rounded-3xl border border-gray-800 border-dashed">
                  <History className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No sessions recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((s: any) => (
                    <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-600/20">
                            <Award className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <h5 className="font-bold text-white text-sm">{s.scenarioName || 'Training Session'}</h5>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
                              {new Date(s.createdAt).toLocaleDateString()} • {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-blue-500">{s.rating}%</span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                        <p className="text-[11px] text-gray-400 italic line-clamp-2">"{s.summary}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'settings' && (
            <div className="space-y-6">
              <h4 className="font-black uppercase tracking-widest text-xs text-gray-500">Account Settings</h4>
              <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden">
                <div className="p-5 flex items-center justify-between border-b border-gray-800">
                  <div className="flex items-center gap-4">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-bold text-white">Employee ID</span>
                  </div>
                  <span className="text-sm text-gray-500 font-mono">{empId}</span>
                </div>
                <div className="p-5 flex items-center justify-between border-b border-gray-800">
                  <div className="flex items-center gap-4">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-bold text-white">Location</span>
                  </div>
                  <span className="text-sm text-gray-500">{location}</span>
                </div>
                <button 
                  onClick={() => setScreen('dashboard')}
                  className="w-full p-5 flex items-center gap-4 text-blue-500 hover:bg-blue-500/5 transition-colors border-b border-gray-800"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm font-bold">Manager Dashboard</span>
                </button>
                <button 
                  onClick={() => setScreen('login')}
                  className="w-full p-5 flex items-center gap-4 text-red-500 hover:bg-red-500/5 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-bold">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-gray-950/80 backdrop-blur-xl border-t border-gray-900 px-8 py-4 flex items-center justify-between z-50">
          <button onClick={() => setTab('home')} className={`flex flex-col items-center gap-1 ${tab === 'home' ? 'text-blue-500' : 'text-gray-600'}`}>
            <Home className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          </button>
          <button onClick={() => setTab('history')} className={`flex flex-col items-center gap-1 ${tab === 'history' ? 'text-blue-500' : 'text-gray-600'}`}>
            <History className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">History</span>
          </button>
          <button onClick={() => setTab('settings')} className={`flex flex-col items-center gap-1 ${tab === 'settings' ? 'text-blue-500' : 'text-gray-600'}`}>
            <Settings className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">Settings</span>
          </button>
        </nav>
      </div>
    );
  }

  if (screen === 'chat') {
    return (
      <div className="h-[100dvh] flex flex-col bg-gray-950 text-white overflow-hidden">
        <header className={`px-6 flex items-center justify-between border-b border-gray-900 transition-all duration-500 ${callStarted ? 'pt-8 pb-4' : 'pt-12 pb-6'}`}>
          <button onClick={() => setScreen('menu')} className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center border border-gray-800">
            <ChevronLeft className="w-6 h-6 text-gray-400" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue mb-1">
              {isRinging ? 'Ringing...' : isLoading ? 'Connecting' : isSpeaking ? 'Customer Speaking' : isListening ? 'Listening' : 'On Call'}
            </span>
            <h3 className="font-black text-lg tracking-tight">{activeScenario?.name}</h3>
            {callStarted && !isSpeaking && (
              <button 
                onClick={() => {
                  console.log("Manual trigger clicked");
                  sessionRef.current?.sendRealtimeInput({ text: "CALL_STARTED" });
                }}
                className="mt-2 text-[10px] font-bold text-brand-blue/60 hover:text-brand-blue underline uppercase tracking-widest"
              >
                {messages.length === 0 ? "Trigger Greeting Manually" : "Nudge Customer"}
              </button>
            )}
          </div>
          <div className="w-10 h-10" /> {/* Spacer */}
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Customer Details */}
          <aside className="hidden lg:flex w-80 border-r border-gray-900 flex-col p-6 space-y-8 bg-gray-950/50 overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-gray">Customer Details</h4>
              <div className="space-y-2">
                <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                  <p className="text-[10px] text-brand-gray uppercase font-black mb-1">Name</p>
                  <p className="text-sm font-bold">{activeScenario?.customerName}</p>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                  <p className="text-[10px] text-brand-gray uppercase font-black mb-1">Delivery Vehicle</p>
                  <p className="text-sm font-bold">{activeScenario?.vehicle}</p>
                </div>
                {activeScenario?.tradeVehicle && (
                  <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                    <p className="text-[10px] text-brand-gray uppercase font-black mb-1">Trade Vehicle</p>
                    <p className="text-sm font-bold">{activeScenario?.tradeVehicle}</p>
                  </div>
                )}
                <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                  <p className="text-[10px] text-brand-gray uppercase font-black mb-1">Address</p>
                  <p className="text-sm font-bold">{activeScenario?.address}</p>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                  <p className="text-[10px] text-brand-gray uppercase font-black mb-1">Appointment</p>
                  <p className="text-sm font-bold">{activeScenario?.appointment}</p>
                </div>
                {activeScenario?.coBuyer && (
                  <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                    <p className="text-[10px] text-brand-gray uppercase font-black mb-1">Co-Buyer</p>
                    <p className="text-sm font-bold">{activeScenario?.coBuyer}</p>
                  </div>
                )}
                {activeScenario?.collectingTitle && (
                  <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                    <p className="text-[10px] text-brand-gray uppercase font-black mb-1">Collecting Title</p>
                    <p className="text-sm font-bold">{activeScenario?.collectingTitle}</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden">
            {/* Mobile/Tablet Reminders (Compact) */}
            <div className="lg:hidden absolute top-4 left-4 right-4 flex gap-2 overflow-x-auto no-scrollbar pb-2 z-20">
              <div className="bg-gray-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-800 shrink-0">
                <p className="text-[8px] text-brand-gray uppercase font-black">Customer</p>
                <p className="text-[10px] font-bold">{activeScenario?.customerName}</p>
              </div>
              <div className="bg-gray-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-800 shrink-0">
                <p className="text-[8px] text-brand-gray uppercase font-black">Delivery</p>
                <p className="text-[10px] font-bold">{activeScenario?.vehicle}</p>
              </div>
              {activeScenario?.tradeVehicle && (
                <div className="bg-gray-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-800 shrink-0">
                  <p className="text-[8px] text-brand-gray uppercase font-black">Trade</p>
                  <p className="text-[10px] font-bold">{activeScenario?.tradeVehicle}</p>
                </div>
              )}
              <div className="bg-gray-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-800 shrink-0">
                <p className="text-[8px] text-brand-gray uppercase font-black">Time</p>
                <p className="text-[10px] font-bold">{activeScenario?.appointment}</p>
              </div>
              {activeScenario?.coBuyer && (
                <div className="bg-gray-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-800 shrink-0">
                  <p className="text-[8px] text-brand-gray uppercase font-black">Co-Buyer</p>
                  <p className="text-[10px] font-bold">{activeScenario?.coBuyer}</p>
                </div>
              )}
              {activeScenario?.collectingTitle && (
                <div className="bg-gray-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-800 shrink-0">
                  <p className="text-[8px] text-brand-gray uppercase font-black">Title</p>
                  <p className="text-[10px] font-bold">{activeScenario?.collectingTitle}</p>
                </div>
              )}
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <div className={`w-64 h-64 rounded-full bg-brand-blue blur-[100px] transition-all duration-1000 ${isSpeaking ? 'scale-150 opacity-40' : 'scale-100 opacity-20'}`} />
            </div>

            <div className={`relative z-10 flex flex-col items-center transition-all duration-500 ${callStarted ? 'gap-6' : 'gap-12'}`}>
              {errorMsg && (
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-xs text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 z-50 backdrop-blur-md">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold uppercase tracking-tighter">Call Error</span>
                    <span>{errorMsg}</span>
                    <button 
                      onClick={() => setErrorMsg('')}
                      className="mt-2 text-red-300 underline font-bold uppercase tracking-widest text-[8px]"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
              <div className="relative">
                <div className={`absolute inset-0 rounded-[40px] bg-brand-blue/20 blur-2xl transition-all duration-500 ${isSpeaking ? 'scale-125 opacity-100' : 'scale-100 opacity-0'}`} />
                <div className={`w-40 h-40 rounded-[40px] bg-gray-900 border-2 flex items-center justify-center text-xl font-black uppercase tracking-widest text-brand-blue shadow-2xl relative z-10 transition-all duration-500 ${isSpeaking ? 'border-brand-blue scale-105' : 'border-gray-800'}`}>
                  {activeScenario?.name}
                </div>
              </div>

              <div className="text-center space-y-2">
                <h4 className="text-xl font-bold text-white">{activeScenario?.subTitle}</h4>
                <p className="text-gray-500 text-sm max-w-[240px] mx-auto leading-relaxed">
                  {callStarted ? "Stay in character and follow the advocate checklist." : "Tap below to start the simulation."}
                </p>
              </div>
            </div>
          </main>

          {/* Right Sidebar: Success Criteria */}
          {activeScenario?.id !== 'cameron' && (
            <aside className="hidden lg:flex w-80 border-l border-gray-900 flex-col p-6 space-y-8 bg-gray-950/50 overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-gray">Success Criteria</h4>
                  {isCheckingCriteria && <Loader2 className="w-3 h-3 animate-spin text-brand-blue" />}
                </div>
                <div className="space-y-2">
                  {currentCriteria.map(c => (
                    <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      completedCriteria.includes(c.id) 
                      ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                      : 'bg-gray-900/30 border-gray-800 text-gray-500'
                    }`}>
                      {completedCriteria.includes(c.id) ? <CheckCircle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                      <span className="text-[11px] font-bold">{c.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>

        <footer className={`px-8 transition-all duration-500 bg-gradient-to-t from-gray-950 to-transparent border-t border-gray-900/50 ${callStarted ? 'pb-8 pt-4 space-y-4' : 'pb-16 pt-8 space-y-8'}`}>
          {!callStarted ? (
            <button 
              onClick={initiateCall} 
              disabled={isLoading}
              className="w-full max-w-md mx-auto py-6 bg-brand-blue rounded-[32px] font-black uppercase tracking-widest text-xl shadow-2xl shadow-brand-blue/20 flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Phone className="w-6 h-6" />}
              <span>{isLoading ? 'Connecting...' : 'Start Call'}</span>
            </button>
          ) : (
            <div className="flex flex-col gap-8 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-6">
                <button className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center border border-gray-800 text-gray-400">
                  <Volume2 className="w-6 h-6" />
                </button>
                <button 
                  onClick={endScenario} 
                  disabled={isFinishing}
                  className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/40 active:scale-90 transition-all disabled:opacity-50"
                >
                  {isFinishing ? <Loader2 className="w-8 h-8 animate-spin" /> : <XCircle className="w-10 h-10" />}
                </button>
                <button className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center border border-gray-800 text-gray-400">
                  <Mic className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </footer>
      </div>
    );
  }

  if (screen === 'results') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col p-6">
        <header className="pt-12 pb-8 text-center">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
            <Award className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Call Report</h2>
          <p className="text-gray-500 text-sm font-medium mt-2">Simulation Complete</p>
        </header>

        <main className="flex-1 space-y-8 pb-12">
          <div className="flex flex-col items-center justify-center py-8 bg-gray-900 rounded-[40px] border border-gray-800 shadow-2xl">
            <span className="text-7xl font-black text-blue-500 tracking-tighter">{feedback?.rating}%</span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-600 mt-4">Overall Score</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {currentCriteria.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-gray-900/50 p-5 rounded-2xl border border-gray-800/50">
                <span className="text-sm font-bold text-gray-300">{c.text}</span>
                {feedback?.scores?.[c.id] ? (
                  <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-6 bg-blue-600/10 rounded-3xl border border-blue-600/20">
            <h4 className="font-black text-blue-500 text-[10px] uppercase tracking-widest mb-3">Coach's Summary</h4>
            <p className="text-blue-100 text-sm font-medium italic leading-relaxed">"{feedback?.summary}"</p>
          </div>
        </main>

        <button 
          onClick={() => setScreen('menu')} 
          className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-xl shadow-white/5"
        >
          Finish Session
        </button>
      </div>
    );
  }

  return null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState;
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.props = props;
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsedError = JSON.parse(this.state.error.message);
        if (parsedError.error) {
          errorMessage = `Firestore Error: ${parsedError.error} (${parsedError.operationType} at ${parsedError.path})`;
        }
      } catch (e) {
        errorMessage = this.state.error.message || String(this.state.error);
      }

      return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-2">Application Error</h2>
          <p className="text-gray-500 text-sm font-medium mb-8 max-w-xs mx-auto">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SimulatorApp />
    </ErrorBoundary>
  );
}
