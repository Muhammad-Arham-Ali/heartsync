"use client";

import React, { useState, useEffect, useCallback } from "react";
import { db } from "../lib/firebase";
import { ref, set, update, onValue, off, get } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Trophy, Send, ArrowRight, Copy, Check } from "lucide-react";

/* ─── Types ─── */
type GameState = "LOBBY" | "CREATING" | "GUESSING" | "RESULT";
type PlayerRole = "player1" | "player2" | null;

interface RoomData {
  players: { player1: string; player2: string };
  scores: { player1: number; player2: number };
  currentTurn: "player1" | "player2";
  gameState: GameState;
  currentQuestion?: { text: string; options: string[]; correctIndex: number };
  lastGuess?: { index: number; isCorrect: boolean };
}

/* ─── Cute room-code words ─── */
const WORDS = [
  "LOVE","BEAR","KISS","HUGS","BABE","MOON","STAR","PINK",
  "ROSE","DOVE","CUTE","COZY","WARM","GLOW","LILY","GEMS",
];

function generateRoomCode(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)] +
    String(Math.floor(Math.random() * 90 + 10));
}

/* ─── Floating Hearts Background (client-only to avoid hydration mismatch) ─── */
function FloatingHearts() {
  const [hearts, setHearts] = useState<
    { id: number; left: string; delay: string; duration: string; emoji: string; size: string }[]
  >([]);

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
        <span
          key={h.id}
          className="floating-heart"
          style={{
            left: h.left,
            animationDelay: h.delay,
            animationDuration: h.duration,
            fontSize: h.size,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}

/* ─── Confetti Burst (client-only) ─── */
function ConfettiBurst() {
  const [pieces, setPieces] = useState<
    { id: number; left: string; bg: string; delay: string; duration: string }[]
  >([]);

  useEffect(() => {
    setPieces(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        bg: ["#ff4d8f", "#ffc2d9", "#f43f5e", "#4ade80", "#fbbf24", "#a78bfa"][
          Math.floor(Math.random() * 6)
        ],
        delay: `${Math.random() * 0.5}s`,
        duration: `${1.5 + Math.random() * 1.5}s`,
      }))
    );
  }, []);

  if (pieces.length === 0) return null;

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.bg,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </>
  );
}

/* ─── Scoreboard ─── */
function Scoreboard({ scores, names }: {
  scores: { player1: number; player2: number };
  names: { player1: string; player2: string };
}) {
  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-md mx-auto mb-6"
    >
      <div className="glass-card card-shadow rounded-3xl p-4 flex items-center justify-between gap-2 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-2xl shrink-0">💗</span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-pink-400 uppercase tracking-wider truncate">
              {names.player1}
            </p>
            <p className="text-2xl font-black text-rose-500">{scores.player1}</p>
          </div>
        </div>
        <div className="flex flex-col items-center shrink-0">
          <Trophy className="w-5 h-5 text-pink-300" />
          <span className="text-[10px] font-bold text-pink-300 uppercase tracking-widest">
            Score
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <div className="text-right min-w-0">
            <p className="text-xs font-bold text-pink-400 uppercase tracking-wider truncate">
              {names.player2}
            </p>
            <p className="text-2xl font-black text-rose-500">{scores.player2}</p>
          </div>
          <span className="text-2xl shrink-0">💖</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════ */
export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [myRole, setMyRole] = useState<PlayerRole>(null);
  const [playerName, setPlayerName] = useState("");
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [copied, setCopied] = useState(false);

  // Question creation form
  const [qText, setQText] = useState("");
  const [opts, setOpts] = useState(["", "", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);

  // Guessing state
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  /* ─── Firebase listener ─── */
  useEffect(() => {
    if (!roomId) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsub = onValue(roomRef, (snap) => {
      if (snap.exists()) setRoomData(snap.val() as RoomData);
    });
    return () => off(roomRef, "value", unsub);
  }, [roomId]);

  /* ─── Create Game ─── */
  const createGame = useCallback(async () => {
    if (!playerName.trim()) return;
    const code = generateRoomCode();
    const initial: RoomData = {
      players: { player1: playerName.trim(), player2: "" },
      scores: { player1: 0, player2: 0 },
      currentTurn: "player1",
      gameState: "LOBBY",
    };
    await set(ref(db, `rooms/${code}`), initial);
    setRoomId(code);
    setMyRole("player1");
  }, [playerName]);

  /* ─── Join Game ─── */
  const joinGame = useCallback(async () => {
    if (!playerName.trim() || !joinCode.trim()) return;
    const code = joinCode.trim().toUpperCase();
    try {
      const snap = await get(ref(db, `rooms/${code}`));
      if (!snap.exists()) {
        alert("Room not found! Check the code and try again 💔");
        return;
      }
      await update(ref(db, `rooms/${code}`), {
        "players/player2": playerName.trim(),
        gameState: "CREATING",
      });
      setRoomId(code);
      setMyRole("player2");
    } catch (err) {
      console.error("Join failed:", err);
      alert("Failed to join room. Check your connection and try again.");
    }
  }, [playerName, joinCode]);

  /* ─── Submit Question ─── */
  const submitQuestion = useCallback(async () => {
    if (!qText.trim() || opts.some((o) => !o.trim())) return;
    await update(ref(db, `rooms/${roomId}`), {
      currentQuestion: { text: qText.trim(), options: opts.map((o) => o.trim()), correctIndex: correctIdx },
      gameState: "GUESSING",
    });
    setQText("");
    setOpts(["", "", "", ""]);
    setCorrectIdx(0);
  }, [roomId, qText, opts, correctIdx]);

  /* ─── Submit Guess ─── */
  const submitGuess = useCallback(
    async (index: number) => {
      if (!roomData?.currentQuestion || selectedGuess !== null) return;
      setSelectedGuess(index);
      const isCorrect = index === roomData.currentQuestion.correctIndex;
      if (isCorrect) setShowConfetti(true);

      const guesserRole = roomData.currentTurn === "player1" ? "player2" : "player1";
      const newScore = (roomData.scores[guesserRole] || 0) + (isCorrect ? 1 : 0);

      await update(ref(db, `rooms/${roomId}`), {
        lastGuess: { index, isCorrect },
        gameState: "RESULT",
        [`scores/${guesserRole}`]: newScore,
      });
    },
    [roomData, roomId, selectedGuess]
  );

  /* ─── Next Round ─── */
  const nextRound = useCallback(async () => {
    if (!roomData) return;
    const nextTurn = roomData.currentTurn === "player1" ? "player2" : "player1";
    await update(ref(db, `rooms/${roomId}`), {
      currentTurn: nextTurn,
      gameState: "CREATING",
      currentQuestion: null,
      lastGuess: null,
    });
    setSelectedGuess(null);
    setShowConfetti(false);
  }, [roomData, roomId]);

  /* ─── Copy room code ─── */
  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ─── Derived helpers ─── */
  const isCreator = roomData?.currentTurn === myRole;
  const partnerName =
    myRole === "player1"
      ? roomData?.players.player2 || "Partner"
      : roomData?.players.player1 || "Partner";
  const myName =
    myRole === "player1"
      ? roomData?.players.player1 || "You"
      : roomData?.players.player2 || "You";

  /* ═════════════════════════════
     RENDER
     ═════════════════════════════ */
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

  return (
    <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-8 z-10 min-h-screen">
      <FloatingHearts />
      {showConfetti && <ConfettiBurst />}

      <AnimatePresence mode="wait">
        {/* ══════════ LOBBY ══════════ */}
        {!roomId && (
          <motion.div key="lobby" {...fadeSlide} className="w-full max-w-sm mx-auto flex flex-col items-center gap-6">
            {/* Logo */}
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="flex flex-col items-center gap-1"
            >
              <Heart className="w-14 h-14 text-rose-500 fill-rose-500 drop-shadow-lg" />
              <h1 className="text-4xl font-black text-rose-500 tracking-tight">HeartSync</h1>
              <p className="text-sm text-pink-400 font-semibold">How well do you know each other? 💕</p>
            </motion.div>

            {/* Name input */}
            <div className="w-full">
              <input
                id="player-name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your cute name 🥰"
                maxLength={16}
                className="w-full rounded-full px-6 py-3.5 text-center font-bold text-rose-500 placeholder:text-pink-300 bg-white/80 backdrop-blur border-2 border-pink-200 focus:border-rose-400 focus:outline-none card-shadow transition-all"
              />
            </div>

            {/* Create */}
            <motion.button
              {...bounceBtn}
              suppressHydrationWarning
              id="create-game-btn"
              onClick={createGame}
              disabled={!playerName.trim()}
              className="w-full rounded-full py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-extrabold text-lg shadow-lg shadow-pink-300/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Create Game
            </motion.button>

            {/* Divider */}
            <div className="flex items-center w-full gap-3">
              <div className="flex-1 h-px bg-pink-200" />
              <span className="text-xs font-bold text-pink-300 uppercase tracking-widest">or join</span>
              <div className="flex-1 h-px bg-pink-200" />
            </div>

            {/* Join */}
            <div className="w-full flex gap-2">
              <input
                id="join-code-input"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Room code"
                maxLength={8}
                className="flex-1 rounded-full px-5 py-3.5 text-center font-bold text-rose-500 placeholder:text-pink-300 bg-white/80 backdrop-blur border-2 border-pink-200 focus:border-rose-400 focus:outline-none transition-all tracking-widest uppercase"
              />
              <motion.button
                {...bounceBtn}
                suppressHydrationWarning
                id="join-game-btn"
                onClick={joinGame}
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
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl"
            >
              💌
            </motion.div>
            <h2 className="text-2xl font-black text-rose-500 text-center">
              Waiting for your partner...
            </h2>
            <p className="text-sm text-pink-400 font-semibold text-center">
              Share this room code with your special someone!
            </p>

            <motion.div
              className="glass-card card-shadow rounded-3xl px-8 py-5 flex items-center gap-3 pulse-glow"
              whileHover={{ scale: 1.03 }}
            >
              <span className="text-3xl font-black tracking-[0.25em] text-rose-500">{roomId}</span>
              <motion.button {...bounceBtn} onClick={copyCode} className="p-2 rounded-full hover:bg-pink-100 transition-colors">
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-pink-400" />}
              </motion.button>
            </motion.div>

            <p className="text-xs text-pink-300 font-semibold animate-pulse">
              Listening for connection... 📡
            </p>
          </motion.div>
        )}

        {/* ══════════ CREATING PHASE ══════════ */}
        {roomId && roomData?.gameState === "CREATING" && (
          <motion.div key="creating" {...fadeSlide} className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
            <Scoreboard scores={roomData.scores} names={roomData.players} />

            {isCreator ? (
              /* Creator form */
              <div className="w-full glass-card card-shadow rounded-3xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">✍️</span>
                  <h2 className="text-xl font-black text-rose-500">Create a question!</h2>
                </div>
                <p className="text-xs text-pink-400 font-semibold -mt-2">
                  Think of something only your partner would know 💭
                </p>

                <input
                  id="question-input"
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
                        onClick={() => setCorrectIdx(i)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all shrink-0 ${
                          correctIdx === i
                            ? "bg-green-500 border-green-500 text-white"
                            : "bg-white border-pink-200 text-pink-400 hover:border-green-400"
                        }`}
                      >
                        {correctIdx === i ? "✓" : String.fromCharCode(65 + i)}
                      </button>
                      <input
                        value={o}
                        onChange={(e) => {
                          const next = [...opts];
                          next[i] = e.target.value;
                          setOpts(next);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1 rounded-full px-4 py-2.5 font-semibold text-rose-500 placeholder:text-pink-300 bg-pink-50/60 border-2 border-pink-200 focus:border-rose-400 focus:outline-none transition-all text-sm"
                      />
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-pink-300 font-semibold text-center">
                  Tap a letter to mark the correct answer ✅
                </p>

                <motion.button
                  {...bounceBtn}
                  id="submit-question-btn"
                  onClick={submitQuestion}
                  disabled={!qText.trim() || opts.some((o) => !o.trim())}
                  className="w-full rounded-full py-3.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-extrabold shadow-lg shadow-pink-300/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send Question
                </motion.button>
              </div>
            ) : (
              /* Waiting screen */
              <div className="w-full glass-card card-shadow rounded-3xl p-8 flex flex-col items-center gap-4 pulse-glow">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="text-5xl"
                >
                  💭
                </motion.div>
                <h2 className="text-xl font-black text-rose-500 text-center">
                  Waiting for {partnerName}...
                </h2>
                <p className="text-sm text-pink-400 font-semibold text-center">
                  They&apos;re thinking of a tricky question for you!
                </p>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="flex gap-1.5 mt-2"
                >
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-pink-300" />
                  ))}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════ GUESSING PHASE ══════════ */}
        {roomId && roomData?.gameState === "GUESSING" && roomData.currentQuestion && (
          <motion.div key="guessing" {...fadeSlide} className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
            <Scoreboard scores={roomData.scores} names={roomData.players} />

            {!isCreator ? (
              /* Guesser view */
              <div className="w-full glass-card card-shadow rounded-3xl p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤔</span>
                  <h2 className="text-lg font-black text-rose-500">
                    {partnerName} asks...
                  </h2>
                </div>
                <p className="text-xl font-extrabold text-center text-foreground leading-snug py-2 break-words w-full overflow-hidden">
                  {roomData.currentQuestion.text}
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {roomData.currentQuestion.options.map((opt, i) => (
                    <motion.button
                      key={i}
                      {...bounceBtn}
                      onClick={() => submitGuess(i)}
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
              /* Creator waiting */
              <div className="w-full glass-card card-shadow rounded-3xl p-8 flex flex-col items-center gap-4 pulse-glow">
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="text-5xl"
                >
                  👀
                </motion.div>
                <h2 className="text-xl font-black text-rose-500 text-center">
                  Let&apos;s see if {partnerName} knows you...
                </h2>
                <p className="text-sm text-pink-400 font-semibold text-center">
                  They&apos;re looking at your question right now!
                </p>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="flex gap-1.5 mt-2"
                >
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-pink-300" />
                  ))}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════ RESULT PHASE ══════════ */}
        {roomId && roomData?.gameState === "RESULT" && roomData.currentQuestion && roomData.lastGuess && (
          <motion.div key="result" {...fadeSlide} className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
            <Scoreboard scores={roomData.scores} names={roomData.players} />

            <div
              className={`w-full glass-card card-shadow rounded-3xl p-6 flex flex-col items-center gap-4 ${
                !roomData.lastGuess.isCorrect ? "animate-shake" : ""
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="text-6xl"
              >
                {roomData.lastGuess.isCorrect ? "🎉" : "💔"}
              </motion.div>

              <h2
                className={`text-2xl font-black text-center ${
                  roomData.lastGuess.isCorrect ? "text-green-500" : "text-red-500"
                }`}
              >
                {roomData.lastGuess.isCorrect ? "They know you! 💕" : "Not quite... 😅"}
              </h2>

              <p className="text-sm font-bold text-center text-pink-400 break-words w-full overflow-hidden">
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

              <motion.button
                {...bounceBtn}
                id="next-round-btn"
                onClick={nextRound}
                className="w-full rounded-full py-3.5 mt-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-extrabold shadow-lg shadow-pink-300/40 flex items-center justify-center gap-2"
              >
                Next Round <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
