"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { db } from "../lib/firebase";
import { ref, set, update, onValue, off, get } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Sparkles,
  Trophy,
  Send,
  ArrowRight,
  Copy,
  Check,
  Clock,
  Flame,
  History as HistoryIcon,
  Volume2,
  VolumeX,
  Share2,
  Shuffle,
  Star,
  Target,
  Zap
} from "lucide-react";
import {
  generalPacks,
  spicyPacks,
  getRandomQuestion,
  getDailyQuestion,
} from "../lib/questionPacks";
import { getRandomDare } from "../lib/dares";
import {
  playCorrectSound,
  playWrongSound,
  playClickSound,
  playTickSound,
  playCelebrationSound,
  playTimerWarningSound,
  playReactionSound,
  vibrate,
} from "../lib/sounds";

/* ─── Types ─── */
type GameMode = "CLASSIC" | "QUICK" | "SPICY" | "SPEED" | "DAILY";
type GameState = "LOBBY" | "CREATING" | "GUESSING" | "RESULT" | "GAMEOVER";
type PlayerRole = "player1" | "player2" | null;

interface PlayerInfo {
  name: string;
  avatar: string;
  score: number;
  streak: number;
}

interface Question {
  text: string;
  options: string[];
  correctIndex: number;
}

interface GuessResult {
  index: number;
  isCorrect: boolean;
  dare?: string;
}

interface HistoryItem {
  question: string;
  guesser: string;
  isCorrect: boolean;
}

interface RoomData {
  players: { player1: PlayerInfo; player2: PlayerInfo };
  currentTurn: "player1" | "player2";
  gameState: GameState;
  gameMode: GameMode;
  targetScore: number;
  round: number;
  currentQuestion?: Question;
  lastGuess?: GuessResult;
  resultShownAt?: number;
  questionStartTime?: number;
  history?: HistoryItem[];
  reactions?: { [id: string]: { emoji: string; sender: PlayerRole } };
}

/* ─── Constants ─── */
const AVATARS = ["🥰", "😎", "🤓", "🤠", "👻", "👽", "🐼", "🦊", "🐯", "🐶", "🐱", "🐰"];
const REACTIONS = ["😂", "🥺", "😤", "🥰", "🤯", "🔥"];
const WORDS = ["LOVE", "BEAR", "KISS", "HUGS", "BABE", "MOON", "STAR", "PINK", "ROSE", "DOVE", "CUTE", "COZY"];

function generateRoomCode(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)] + String(Math.floor(Math.random() * 90 + 10));
}

/* ─── Shared UI Components ─── */
function FloatingHearts() {
  const [hearts, setHearts] = useState<{ id: number; left: string; delay: string; duration: string; emoji: string; size: string }[]>([]);
  useEffect(() => {
    setHearts(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        duration: `${8 + Math.random() * 10}s`,
        emoji: ["💕", "💗", "💖", "🩷", "🤍"][Math.floor(Math.random() * 5)],
        size: `${1 + Math.random() * 1.2}rem`,
      }))
    );
  }, []);
  if (hearts.length === 0) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((h) => (
        <span key={h.id} className="floating-heart" style={{ left: h.left, animationDelay: h.delay, animationDuration: h.duration, fontSize: h.size }}>
          {h.emoji}
        </span>
      ))}
    </div>
  );
}

function ConfettiBurst({ mega = false }: { mega?: boolean }) {
  const [pieces, setPieces] = useState<{ id: number; left: string; bg: string; delay: string; duration: string }[]>([]);
  useEffect(() => {
    setPieces(
      Array.from({ length: mega ? 100 : 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        bg: ["#ff4d8f", "#ffc2d9", "#f43f5e", "#4ade80", "#fbbf24", "#a78bfa"][Math.floor(Math.random() * 6)],
        delay: `${Math.random() * (mega ? 2 : 0.5)}s`,
        duration: `${1.5 + Math.random() * 1.5}s`,
      }))
    );
  }, [mega]);
  if (pieces.length === 0) return null;
  return (
    <>
      {pieces.map((p) => (
        <div key={p.id} className={mega ? "mega-confetti" : "confetti-piece"} style={{ left: p.left, backgroundColor: p.bg, animationDelay: p.delay, animationDuration: p.duration }} />
      ))}
    </>
  );
}

function Scoreboard({ p1, p2 }: { p1: PlayerInfo; p2: PlayerInfo }) {
  return (
    <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md mx-auto mb-6">
      <div className="glass-card card-shadow rounded-3xl p-4 flex items-center justify-between gap-2 overflow-hidden relative">
        {/* Player 1 */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="relative">
            <span className="text-3xl shrink-0">{p1.avatar}</span>
            {p1.streak >= 2 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 text-sm streak-badge">🔥</motion.span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wider truncate">{p1.name}</p>
            <p className="text-2xl font-black text-rose-500">{p1.score}</p>
          </div>
        </div>

        {/* Center */}
        <div className="flex flex-col items-center shrink-0">
          <Trophy className="w-6 h-6 text-pink-300" />
        </div>

        {/* Player 2 */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <div className="text-right min-w-0">
            <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wider truncate">{p2.name}</p>
            <p className="text-2xl font-black text-rose-500">{p2.score}</p>
          </div>
          <div className="relative">
            <span className="text-3xl shrink-0">{p2.avatar}</span>
            {p2.streak >= 2 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -left-2 text-sm streak-badge">🔥</motion.span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function Home() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const playClick = () => { if (soundEnabled) playClickSound(); };

  // Local state
  const [roomId, setRoomId] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [myRole, setMyRole] = useState<PlayerRole>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerAvatar, setPlayerAvatar] = useState(AVATARS[0]);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [copied, setCopied] = useState(false);

  // Setup options (Creator only)
  const [selectedMode, setSelectedMode] = useState<GameMode>("CLASSIC");
  const [targetScore, setTargetScore] = useState(5);

  // Question creation
  const [qText, setQText] = useState("");
  const [opts, setOpts] = useState(["", "", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);

  // Guessing
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [resultCountdown, setResultCountdown] = useState(0);
  const [guessTimeLeft, setGuessTimeLeft] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const guessTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ─── Sound Wrapper ─── */
  const withSound = useCallback(<T extends (...args: any[]) => any>(fn: T) => {
    return (...args: Parameters<T>): ReturnType<T> => {
      playClick();
      return fn(...args);
    };
  }, [soundEnabled]);

  /* ─── Firebase listener ─── */
  useEffect(() => {
    if (!roomId) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsub = onValue(roomRef, (snap) => {
      if (snap.exists()) setRoomData(snap.val() as RoomData);
    });
    return () => off(roomRef, "value", unsub);
  }, [roomId]);

  /* ─── Reset local guessing state on every new round ─── */
  useEffect(() => {
    if (roomData?.gameState === "CREATING" || roomData?.gameState === "GUESSING") {
      setSelectedGuess(null);
      setShowConfetti(false);
    }
  }, [roomData?.gameState]);

  /* ─── Timers logic ─── */
  useEffect(() => {
    // Result review timer
    if (roomData?.gameState === "RESULT" && roomData.resultShownAt) {
      const elapsed = Math.floor((Date.now() - roomData.resultShownAt) / 1000);
      const remaining = Math.max(0, 5 - elapsed); // Reduced to 5 sec for faster pace
      setResultCountdown(remaining);
      if (remaining > 0) {
        countdownRef.current = setInterval(() => {
          setResultCountdown((prev) => {
            if (prev <= 1) {
              if (countdownRef.current) clearInterval(countdownRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
    }

    // Guessing timer (Speed round = 10s, others = 20s)
    if (roomData?.gameState === "GUESSING" && roomData.questionStartTime) {
      const timeLimit = roomData.gameMode === "SPEED" ? 10 : 20;
      const elapsed = Math.floor((Date.now() - roomData.questionStartTime) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      setGuessTimeLeft(remaining);

      if (remaining > 0 && selectedGuess === null) {
        guessTimerRef.current = setInterval(() => {
          setGuessTimeLeft((prev) => {
            if (prev === null) return null;
            if (prev === 4 && soundEnabled) playTimerWarningSound();
            if (prev <= 1) {
              if (guessTimerRef.current) clearInterval(guessTimerRef.current);
              if (soundEnabled) vibrate(200);
              return 0;
            }
            if (soundEnabled && prev <= 5) playTickSound();
            return prev - 1;
          });
        }, 1000);
      } else {
         setGuessTimeLeft(null);
      }

      return () => { if (guessTimerRef.current) clearInterval(guessTimerRef.current); };
    }
  }, [roomData?.gameState, roomData?.resultShownAt, roomData?.questionStartTime, roomData?.gameMode, selectedGuess, soundEnabled]);

  // Auto-fail when time runs out
  useEffect(() => {
    if (guessTimeLeft === 0 && selectedGuess === null && roomData?.gameState === "GUESSING") {
      // The current player is the guesser, but anyone can trigger the auto-fail.
      // To avoid race conditions, only the guesser submits the auto-fail.
      const guesserRole = roomData.currentTurn === "player1" ? "player2" : "player1";
      if (myRole === guesserRole) {
        submitGuess(-1); // -1 means timeout
      }
    }
  }, [guessTimeLeft, selectedGuess, roomData?.gameState, myRole, roomData?.currentTurn]);


  /* ─── Actions ─── */
  const createGame = async () => {
    if (!playerName.trim()) return;
    const code = generateRoomCode();
    const initial: RoomData = {
      players: {
        player1: { name: playerName.trim(), avatar: playerAvatar, score: 0, streak: 0 },
        player2: { name: "", avatar: "", score: 0, streak: 0 },
      },
      currentTurn: "player1",
      gameState: "LOBBY",
      gameMode: selectedMode,
      targetScore: targetScore,
      round: 1,
    };
    await set(ref(db, `rooms/${code}`), initial);
    setRoomId(code);
    setMyRole("player1");
  };

  const joinGame = async () => {
    if (!playerName.trim() || !joinCode.trim()) return;
    const code = joinCode.trim().toUpperCase();
    try {
      const snap = await get(ref(db, `rooms/${code}`));
      if (!snap.exists()) {
        alert("Room not found! Check the code and try again 💔");
        return;
      }
      const existingData = snap.val() as RoomData;
      await update(ref(db, `rooms/${code}`), {
        "players/player2": { name: playerName.trim(), avatar: playerAvatar, score: 0, streak: 0 },
        gameState: existingData.gameMode === "DAILY" ? "GUESSING" : "CREATING", // Daily goes straight to guessing
      });
      setRoomId(code);
      setMyRole("player2");

      if (existingData.gameMode === "DAILY") {
        // Auto-set the first daily question
        const dq = getDailyQuestion();
        await update(ref(db, `rooms/${code}`), {
           currentQuestion: { text: dq, options: ["Me", "Partner"], correctIndex: 0 }, // Simplified for daily
           questionStartTime: Date.now()
        });
      }

    } catch (err) {
      console.error("Join failed:", err);
      alert("Failed to join room.");
    }
  };

  const useRandomQuestion = () => {
    const packs = roomData?.gameMode === "SPICY" ? spicyPacks : generalPacks;
    const { question } = getRandomQuestion(packs);
    setQText(question);
    // Auto-fill options if empty
    if (opts.every(o => !o)) {
      setOpts(["", "", "", ""]);
    }
  };

  const submitQuestion = async () => {
    if (!qText.trim() || opts.some((o) => !o.trim())) return;
    await update(ref(db, `rooms/${roomId}`), {
      currentQuestion: { text: qText.trim(), options: opts.map((o) => o.trim()), correctIndex: correctIdx },
      gameState: "GUESSING",
      questionStartTime: Date.now()
    });
    setQText("");
    setOpts(["", "", "", ""]);
    setCorrectIdx(0);
  };

  const submitGuess = async (index: number) => {
    if (!roomData?.currentQuestion || selectedGuess !== null) return;
    setSelectedGuess(index);

    const isCorrect = index === roomData.currentQuestion.correctIndex;
    if (isCorrect) {
      setShowConfetti(true);
      if (soundEnabled) { vibrate([100, 50, 100]); playCorrectSound(); }
    } else {
      if (soundEnabled) { vibrate(300); playWrongSound(); }
    }

    const guesserRole = roomData.currentTurn === "player1" ? "player2" : "player1";
    const creatorRole = roomData.currentTurn;
    const currentScore = roomData.players[guesserRole].score;
    const currentStreak = roomData.players[guesserRole].streak;

    const newScore = currentScore + (isCorrect ? 1 : 0);
    const newStreak = isCorrect ? currentStreak + 1 : 0;

    let newState: GameState = "RESULT";
    if (newScore >= roomData.targetScore) {
       newState = "GAMEOVER";
       if (soundEnabled) playCelebrationSound();
    }

    // Add dare if wrong
    const dare = (!isCorrect && (roomData.gameMode === "CLASSIC" || roomData.gameMode === "SPICY")) ? getRandomDare() : null;

    // Record history
    const historyItem: HistoryItem = {
      question: roomData.currentQuestion.text,
      guesser: roomData.players[guesserRole].name,
      isCorrect,
    };
    const newHistory = [...(roomData.history || []), historyItem];

    await update(ref(db, `rooms/${roomId}`), {
      lastGuess: { index, isCorrect, dare },
      gameState: newState,
      resultShownAt: Date.now(),
      [`players/${guesserRole}/score`]: newScore,
      [`players/${guesserRole}/streak`]: newStreak,
      history: newHistory,
      reactions: null // Clear previous reactions
    });
  };

  const sendReaction = async (emoji: string) => {
    if (!myRole) return;
    if (soundEnabled) playReactionSound();
    await update(ref(db, `rooms/${roomId}/reactions/${Date.now()}`), {
      emoji,
      sender: myRole
    });
  };

  const nextRound = async () => {
    if (!roomData) return;
    if (roomData.resultShownAt) {
      const elapsed = Math.floor((Date.now() - roomData.resultShownAt) / 1000);
      if (elapsed < 5) return;
    }
    const nextTurn = roomData.currentTurn === "player1" ? "player2" : "player1";
    await update(ref(db, `rooms/${roomId}`), {
      currentTurn: nextTurn,
      gameState: "CREATING",
      currentQuestion: null,
      lastGuess: null,
      resultShownAt: null,
      questionStartTime: null,
      round: roomData.round + 1,
      reactions: null
    });
    setSelectedGuess(null);
    setShowConfetti(false);
    setResultCountdown(0);
  };

  const restartGame = async () => {
    if (!roomData) return;
    await update(ref(db, `rooms/${roomId}`), {
      gameState: "CREATING",
      currentTurn: "player1",
      round: 1,
      history: null,
      currentQuestion: null,
      lastGuess: null,
      "players/player1/score": 0,
      "players/player1/streak": 0,
      "players/player2/score": 0,
      "players/player2/streak": 0,
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareResult = async () => {
    const text = `💕 HeartSync Match! 💕\n${roomData?.players.player1.name}: ${roomData?.players.player1.score}\n${roomData?.players.player2.name}: ${roomData?.players.player2.score}\nTotal Rounds: ${roomData?.round}\nPlay at: https://heartsync-game.vercel.app`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HeartSync Results',
          text: text,
        });
      } catch (e) {
        navigator.clipboard.writeText(text);
        alert("Results copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Results copied to clipboard!");
    }
  };

  /* ─── Derived helpers ─── */
  const isCreator = roomData?.currentTurn === myRole;
  const partnerRole = myRole === "player1" ? "player2" : "player1";
  const myPlayer = myRole ? roomData?.players[myRole] : null;
  const partnerPlayer = roomData?.players[partnerRole];

  const partnerName = partnerPlayer?.name || "Partner";
  const myName = myPlayer?.name || "You";

  const totalQuestions = (roomData?.history?.length || 0);
  const totalCorrect = roomData?.history?.filter(h => h.isCorrect).length || 0;
  const compatibility = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const bounceBtn = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring" as const, stiffness: 400, damping: 15 },
  };

  const fadeSlide = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 },
  };

  /* ═════════════════════════════
     RENDER
     ═════════════════════════════ */
  return (
    <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 pb-20 z-10 min-h-screen">
      <FloatingHearts />
      {showConfetti && <ConfettiBurst />}
      {roomData?.gameState === "GAMEOVER" && <ConfettiBurst mega />}

      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="sound-toggle"
      >
        {soundEnabled ? <Volume2 size={20} className="text-pink-500" /> : <VolumeX size={20} className="text-pink-300" />}
      </button>

      {/* Render Emoji Reactions */}
      {roomData?.reactions && Object.entries(roomData.reactions).map(([id, reaction]) => (
        <div
          key={id}
          className="fixed z-50 text-6xl reaction-popup"
          style={{
             bottom: reaction.sender === myRole ? '20%' : 'auto',
             top: reaction.sender !== myRole ? '20%' : 'auto',
             left: `${20 + Math.random() * 60}%`
          }}
        >
          {reaction.emoji}
        </div>
      ))}

      <AnimatePresence mode="wait">
        {/* ══════════ LOBBY / SETUP ══════════ */}
        {!roomId && (
          <motion.div key="lobby" {...fadeSlide} className="w-full max-w-sm mx-auto flex flex-col items-center gap-6">
            <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} className="flex flex-col items-center gap-1">
              <Heart className="w-14 h-14 text-rose-500 fill-rose-500 drop-shadow-lg" />
              <h1 className="text-4xl font-black text-rose-500 tracking-tight">HeartSync</h1>
              <p className="text-sm text-pink-400 font-semibold">How well do you know each other? 💕</p>
            </motion.div>

            {/* Avatar Picker */}
            <div className="w-full bg-white/60 backdrop-blur rounded-3xl p-4 card-shadow">
              <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-3 text-center">Pick your vibe</p>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={withSound(() => setPlayerAvatar(emoji))}
                    className={`text-2xl avatar-option rounded-xl aspect-square flex items-center justify-center ${playerAvatar === emoji ? 'selected bg-pink-100' : 'hover:bg-white/50'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full">
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your cute name 🥰"
                maxLength={16}
                className="w-full rounded-full px-6 py-3.5 text-center font-bold text-rose-500 placeholder:text-pink-300 bg-white/80 backdrop-blur border-2 border-pink-200 focus:border-rose-400 focus:outline-none card-shadow transition-all"
              />
            </div>

            {/* Game Modes */}
            <div className="w-full grid grid-cols-2 gap-3">
               <button
                 onClick={withSound(() => setSelectedMode("CLASSIC"))}
                 className={`mode-card p-3 rounded-2xl border-2 text-left bg-white/80 backdrop-blur ${selectedMode === "CLASSIC" ? 'selected' : 'border-pink-200'}`}
               >
                 <span className="block text-xl mb-1">🧠</span>
                 <span className="block font-bold text-rose-500 text-sm">Classic</span>
                 <span className="block text-[10px] text-pink-400 font-semibold">Write your own</span>
               </button>
               <button
                 onClick={withSound(() => setSelectedMode("QUICK"))}
                 className={`mode-card p-3 rounded-2xl border-2 text-left bg-white/80 backdrop-blur ${selectedMode === "QUICK" ? 'selected' : 'border-pink-200'}`}
               >
                 <span className="block text-xl mb-1">🎲</span>
                 <span className="block font-bold text-rose-500 text-sm">Quick Play</span>
                 <span className="block text-[10px] text-pink-400 font-semibold">Pre-made packs</span>
               </button>
               <button
                 onClick={withSound(() => setSelectedMode("SPICY"))}
                 className={`mode-card p-3 rounded-2xl border-2 text-left bg-white/80 backdrop-blur ${selectedMode === "SPICY" ? 'selected' : 'border-pink-200'}`}
               >
                 <span className="block text-xl mb-1">🌶️</span>
                 <span className="block font-bold text-rose-500 text-sm">Spicy</span>
                 <span className="block text-[10px] text-pink-400 font-semibold">Deep & intimate</span>
               </button>
               <button
                 onClick={withSound(() => setSelectedMode("SPEED"))}
                 className={`mode-card p-3 rounded-2xl border-2 text-left bg-white/80 backdrop-blur ${selectedMode === "SPEED" ? 'selected' : 'border-pink-200'}`}
               >
                 <span className="block text-xl mb-1">⏱️</span>
                 <span className="block font-bold text-rose-500 text-sm">Speed</span>
                 <span className="block text-[10px] text-pink-400 font-semibold">10s timer!</span>
               </button>
            </div>

            <motion.button
              {...bounceBtn}
              onClick={withSound(createGame)}
              disabled={!playerName.trim()}
              className="w-full rounded-full py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-extrabold text-lg shadow-lg shadow-pink-300/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Create Game
            </motion.button>

            <div className="flex items-center w-full gap-3">
              <div className="flex-1 h-px bg-pink-200" />
              <span className="text-xs font-bold text-pink-300 uppercase tracking-widest">or join</span>
              <div className="flex-1 h-px bg-pink-200" />
            </div>

            <div className="w-full flex gap-2">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Room code"
                maxLength={8}
                className="flex-1 rounded-full px-5 py-3.5 text-center font-bold text-rose-500 placeholder:text-pink-300 bg-white/80 backdrop-blur border-2 border-pink-200 focus:border-rose-400 focus:outline-none transition-all tracking-widest uppercase"
              />
              <motion.button
                {...bounceBtn}
                onClick={withSound(joinGame)}
                disabled={!playerName.trim() || !joinCode.trim()}
                className="rounded-full px-6 py-3.5 bg-white/80 backdrop-blur border-2 border-pink-300 text-rose-500 font-extrabold disabled:opacity-40 disabled:cursor-not-allowed card-shadow transition-all"
              >
                Join 💌
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ══════════ WAITING FOR PLAYER 2 ══════════ */}
        {roomId && roomData?.gameState === "LOBBY" && (
          <motion.div key="waiting-p2" {...fadeSlide} className="w-full max-w-sm mx-auto flex flex-col items-center gap-6">
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl">💌</motion.div>
            <h2 className="text-2xl font-black text-rose-500 text-center">Waiting for your partner...</h2>
            
            <div className="flex gap-4 items-center">
              <div className="text-center">
                <span className="text-4xl block mb-1">{myPlayer?.avatar}</span>
                <span className="text-xs font-bold text-pink-400">{myPlayer?.name}</span>
              </div>
              <span className="text-2xl animate-pulse">💕</span>
              <div className="text-center opacity-50">
                <span className="text-4xl block mb-1 bg-pink-100 rounded-full w-12 h-12 flex items-center justify-center border-2 border-dashed border-pink-300">?</span>
                <span className="text-xs font-bold text-pink-400">Waiting</span>
              </div>
            </div>

            <motion.div className="glass-card card-shadow rounded-3xl px-8 py-5 flex items-center gap-3 pulse-glow" whileHover={{ scale: 1.03 }}>
              <span className="text-3xl font-black tracking-[0.25em] text-rose-500">{roomId}</span>
              <motion.button {...bounceBtn} onClick={withSound(copyCode)} className="p-2 rounded-full hover:bg-pink-100 transition-colors">
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-pink-400" />}
              </motion.button>
            </motion.div>
            <p className="text-xs text-pink-300 font-semibold animate-pulse">Listening for connection... 📡</p>
          </motion.div>
        )}

        {/* ══════════ HEADER FOR ACTIVE GAME ══════════ */}
        {roomId && roomData && roomData.gameState !== "LOBBY" && roomData.gameState !== "GAMEOVER" && (
           <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
             <div className="round-badge px-4 py-1.5 rounded-full text-[10px] font-black text-pink-500 uppercase tracking-widest shadow-sm flex items-center gap-2">
               <span>Round {roomData.round}</span>
               <span className="w-1 h-1 rounded-full bg-pink-300" />
               <span className="flex items-center gap-1"><Target size={12}/> First to {roomData.targetScore}</span>
             </div>
           </motion.div>
        )}

        {/* ══════════ CREATING PHASE ══════════ */}
        {roomId && roomData?.gameState === "CREATING" && (
          <motion.div key="creating" {...fadeSlide} className="w-full max-w-md mx-auto flex flex-col items-center gap-4 mt-8">
            <Scoreboard p1={roomData.players.player1} p2={roomData.players.player2} />

            {isCreator ? (
              <div className="w-full glass-card card-shadow rounded-3xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✍️</span>
                    <h2 className="text-xl font-black text-rose-500">Create a question!</h2>
                  </div>
                  {(roomData.gameMode === "QUICK" || roomData.gameMode === "SPICY") && (
                     <motion.button {...bounceBtn} onClick={withSound(useRandomQuestion)} className="bg-pink-100 text-pink-500 p-2 rounded-full hover:bg-pink-200">
                       <Shuffle size={18} />
                     </motion.button>
                  )}
                </div>

                <input
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="e.g. What's my comfort food?"
                  className="w-full rounded-2xl px-5 py-3 font-semibold text-rose-500 placeholder:text-pink-300 bg-pink-50/60 border-2 border-pink-200 focus:border-rose-400 focus:outline-none transition-all"
                />

                <div className="grid grid-cols-1 gap-2">
                  {opts.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={withSound(() => setCorrectIdx(i))}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all shrink-0 ${
                          correctIdx === i ? "bg-green-500 border-green-500 text-white" : "bg-white border-pink-200 text-pink-400 hover:border-green-400"
                        }`}
                      >
                        {correctIdx === i ? "✓" : String.fromCharCode(65 + i)}
                      </button>
                      <input
                        value={o}
                        onChange={(e) => { const next = [...opts]; next[i] = e.target.value; setOpts(next); }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1 rounded-full px-4 py-2.5 font-semibold text-rose-500 placeholder:text-pink-300 bg-pink-50/60 border-2 border-pink-200 focus:border-rose-400 focus:outline-none transition-all text-sm"
                      />
                    </div>
                  ))}
                </div>

                <motion.button
                  {...bounceBtn}
                  onClick={withSound(submitQuestion)}
                  disabled={!qText.trim() || opts.some((o) => !o.trim())}
                  className="w-full rounded-full py-3.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-extrabold shadow-lg shadow-pink-300/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send Question
                </motion.button>
              </div>
            ) : (
              <div className="w-full glass-card card-shadow rounded-3xl p-8 flex flex-col items-center gap-4 pulse-glow">
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} className="text-5xl">💭</motion.div>
                <h2 className="text-xl font-black text-rose-500 text-center">Waiting for {partnerName}...</h2>
                <p className="text-sm text-pink-400 font-semibold text-center">They&apos;re thinking of a tricky question for you!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════ GUESSING PHASE ══════════ */}
        {roomId && roomData?.gameState === "GUESSING" && roomData.currentQuestion && (
          <motion.div key="guessing" {...fadeSlide} className="w-full max-w-md mx-auto flex flex-col items-center gap-4 mt-8">
            <Scoreboard p1={roomData.players.player1} p2={roomData.players.player2} />

            {/* Timer Bar */}
            {guessTimeLeft !== null && (
               <div className="w-full bg-pink-100 rounded-full h-1.5 overflow-hidden mb-2">
                 <div
                   className={`h-full ${guessTimeLeft <= 5 ? 'timer-bar-urgent' : 'timer-bar'}`}
                   style={{ animationDuration: `${roomData.gameMode === "SPEED" ? 10 : 20}s` }}
                 />
               </div>
            )}

            {!isCreator ? (
              <div className="w-full glass-card card-shadow rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden">
                {guessTimeLeft !== null && guessTimeLeft <= 5 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} className="absolute inset-0 bg-red-500 pointer-events-none" />
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🤔</span>
                    <h2 className="text-lg font-black text-rose-500">{partnerName} asks...</h2>
                  </div>
                  {guessTimeLeft !== null && (
                    <span className={`font-black flex items-center gap-1 ${guessTimeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-pink-400'}`}>
                      <Clock size={16} /> {guessTimeLeft}s
                    </span>
                  )}
                </div>
                <p className="text-xl font-extrabold text-center text-foreground leading-snug py-2 break-words">{roomData.currentQuestion.text}</p>
                <div className="grid grid-cols-1 gap-3">
                  {roomData.currentQuestion.options.map((opt, i) => (
                    <motion.button
                      key={i}
                      {...bounceBtn}
                      onClick={withSound(() => submitGuess(i))}
                      disabled={selectedGuess !== null}
                      className="w-full rounded-2xl py-3.5 px-5 font-bold text-rose-500 bg-white/70 border-2 border-pink-200 hover:border-rose-400 hover:bg-pink-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-left flex items-center gap-3"
                    >
                      <span className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-xs font-black text-pink-500 shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="break-words min-w-0">{opt}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full glass-card card-shadow rounded-3xl p-8 flex flex-col items-center gap-4 pulse-glow">
                <div className="flex justify-between w-full mb-2">
                   <div />
                   {guessTimeLeft !== null && (
                    <span className={`font-black flex items-center gap-1 ${guessTimeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-pink-400'}`}>
                      <Clock size={16} /> {guessTimeLeft}s
                    </span>
                  )}
                </div>
                <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} className="text-5xl">👀</motion.div>
                <h2 className="text-xl font-black text-rose-500 text-center">Let&apos;s see if {partnerName} knows you...</h2>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════ RESULT PHASE ══════════ */}
        {roomId && roomData?.gameState === "RESULT" && roomData.currentQuestion && roomData.lastGuess && (
          <motion.div key="result" {...fadeSlide} className="w-full max-w-md mx-auto flex flex-col items-center gap-4 mt-8 relative">
            <Scoreboard p1={roomData.players.player1} p2={roomData.players.player2} />

            <div className={`w-full glass-card card-shadow rounded-3xl p-6 flex flex-col items-center gap-4 ${!roomData.lastGuess.isCorrect ? "animate-shake" : ""}`}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="text-6xl">
                {roomData.lastGuess.isCorrect ? "🎉" : roomData.lastGuess.index === -1 ? "⏰" : "💔"}
              </motion.div>

              <h2 className={`text-2xl font-black text-center ${roomData.lastGuess.isCorrect ? "text-green-500" : "text-red-500"}`}>
                {roomData.lastGuess.isCorrect ? "They know you! 💕" : roomData.lastGuess.index === -1 ? "Out of time! ⏳" : "Not quite... 😅"}
              </h2>

              <p className="text-sm font-bold text-center text-pink-400 break-words w-full">
                &quot;{roomData.currentQuestion.text}&quot;
              </p>

              <div className="w-full grid grid-cols-1 gap-2 mt-1">
                {roomData.currentQuestion.options.map((opt, i) => {
                  const isCorrect = i === roomData.currentQuestion!.correctIndex;
                  const wasGuessed = i === roomData.lastGuess!.index;
                  let style = "bg-white/50 border-pink-100 text-pink-400";
                  if (isCorrect) style = "bg-green-50 border-green-400 text-green-600 font-extrabold";
                  if (wasGuessed && !isCorrect) style = "bg-red-50 border-red-400 text-red-500 font-extrabold";
                  return (
                    <div key={i} className={`rounded-2xl py-2.5 px-5 border-2 text-sm flex items-center gap-2 ${style}`}>
                      <span className="font-black shrink-0">{String.fromCharCode(65 + i)}.</span>
                      <span className="break-words min-w-0 flex-1">{opt}</span>
                      {isCorrect && <span className="ml-auto shrink-0">✅</span>}
                      {wasGuessed && !isCorrect && <span className="ml-auto shrink-0">❌</span>}
                    </div>
                  );
                })}
              </div>

              {/* Dare Card */}
              {roomData.lastGuess.dare && (
                <div className="w-full mt-3 p-4 rounded-2xl dare-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-black text-orange-500 uppercase tracking-widest text-xs">Dare Time!</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{roomData.lastGuess.dare}</p>
                </div>
              )}

              {/* Emoji Reactions Bar */}
              <div className="flex gap-2 justify-center mt-2 bg-white/50 p-2 rounded-full w-full">
                {REACTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    className="text-xl hover:scale-125 transition-transform active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <motion.button
                {...bounceBtn}
                onClick={withSound(nextRound)}
                disabled={resultCountdown > 0}
                className={`w-full rounded-full py-3.5 mt-2 text-white font-extrabold shadow-lg flex items-center justify-center gap-2 transition-all ${
                  resultCountdown > 0 ? "bg-gradient-to-r from-pink-300 to-pink-400 cursor-not-allowed opacity-70" : "bg-gradient-to-r from-rose-400 to-pink-500 shadow-pink-300/40"
                }`}
              >
                {resultCountdown > 0 ? (
                  <>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/30 text-xs font-black">{resultCountdown}</span>
                    Reviewing... 💭
                  </>
                ) : (
                  <>Next Round <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ══════════ GAME OVER PHASE ══════════ */}
        {roomId && roomData?.gameState === "GAMEOVER" && (
           <motion.div key="gameover" {...fadeSlide} className="w-full max-w-md mx-auto flex flex-col items-center gap-6 mt-8 z-10">
              <div className="glass-card card-shadow rounded-3xl p-8 flex flex-col items-center gap-6 w-full text-center">
                 <div className="trophy-spin text-7xl">🏆</div>
                 <h2 className="text-4xl font-black text-rose-500 celebration-text">Game Over!</h2>

                 {/* Winner announcement */}
                 <div className="bg-gradient-to-r from-rose-100 to-pink-100 w-full rounded-2xl p-4 border-2 border-pink-200">
                    <p className="text-sm font-bold text-pink-500 uppercase tracking-widest mb-2">Final Score</p>
                    <div className="flex justify-between items-end px-4">
                       <div className="text-center">
                          <span className="text-3xl block">{roomData.players.player1.avatar}</span>
                          <span className="font-black text-2xl text-rose-600">{roomData.players.player1.score}</span>
                       </div>
                       <span className="text-xl font-black text-pink-300 mb-2">VS</span>
                       <div className="text-center">
                          <span className="text-3xl block">{roomData.players.player2.avatar}</span>
                          <span className="font-black text-2xl text-rose-600">{roomData.players.player2.score}</span>
                       </div>
                    </div>
                 </div>

                 {/* Compatibility Score */}
                 <div className="flex items-center gap-4 w-full justify-center">
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#ffe0ec" strokeWidth="10" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#f43f5e" strokeWidth="10" strokeDasharray="283" strokeDashoffset={283 - (283 * compatibility) / 100} className="compat-ring" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-black text-rose-500 text-xl">{compatibility}%</span>
                      </div>
                    </div>
                    <div className="text-left">
                       <p className="font-black text-lg text-foreground">Compatibility</p>
                       <p className="text-xs font-bold text-pink-400">Based on {totalQuestions} questions</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 w-full gap-3 mt-4">
                    <motion.button {...bounceBtn} onClick={withSound(restartGame)} className="rounded-xl py-3 bg-rose-500 text-white font-extrabold shadow-lg">Play Again</motion.button>
                    <motion.button {...bounceBtn} onClick={withSound(() => setShowHistory(true))} className="rounded-xl py-3 bg-white border-2 border-pink-200 text-pink-500 font-extrabold flex items-center justify-center gap-2"><HistoryIcon size={16}/> History</motion.button>
                 </div>
                 <motion.button {...bounceBtn} onClick={withSound(shareResult)} className="w-full rounded-xl py-3 bg-blue-500 text-white font-extrabold shadow-lg flex items-center justify-center gap-2"><Share2 size={16}/> Share Results</motion.button>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ HISTORY MODAL ══════════ */}
      {showHistory && roomData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
             <div className="p-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white flex justify-between items-center">
                <h3 className="font-black text-xl flex items-center gap-2"><HistoryIcon /> Match History</h3>
                <button onClick={() => setShowHistory(false)} className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold">✕</button>
             </div>
             <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
                {roomData.history?.map((item, idx) => (
                  <div key={idx} className="history-item p-3 rounded-2xl border-2 border-pink-100 flex items-start gap-3">
                     <span className="text-2xl mt-1">{item.isCorrect ? '✅' : '❌'}</span>
                     <div>
                        <p className="font-bold text-sm text-foreground mb-1">"{item.question}"</p>
                        <p className="text-xs font-semibold text-pink-400">{item.guesser} guessed {item.isCorrect ? 'correctly' : 'wrong'}</p>
                     </div>
                  </div>
                ))}
             </div>
          </motion.div>
        </div>
      )}

    </main>
  );
}
