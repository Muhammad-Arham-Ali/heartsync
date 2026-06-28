# 💌 HeartSync: A Cross-Device Couples Quiz Game

A real-time, responsive multiplayer web app designed for couples to test how well they know each other. Built with a mobile-first approach, this game allows partners to connect via a unique "Room Code" across different devices, taking turns asking and guessing trivia questions.

## ✨ New Features (v2.0 Update!)

We've massively expanded the HeartSync experience to make it more addictive, dynamic, and viral!

* **🎮 Multiple Game Modes:**
  * **Classic (🧠):** Write your own custom questions.
  * **Quick Play (🎲):** Play instantly using over 50 pre-made questions from curated packs (Food & Cravings, Memories Together, etc.).
  * **Spicy Mode (🌶️):** Deep, intimate questions to spark meaningful conversation.
  * **Speed Round (⏱️):** A frantic mode with a strict 10-second timer!
* **⏱️ Question Timers:** An animated timer bar (20s normally, 10s in Speed Mode) ramps up the pressure. If time runs out, it's an automatic fail!
* **🔥 Streaks & Avatars:** Choose your own cute emoji avatar in the lobby. The scoreboard tracks your win streak, awarding a blazing flame badge (🔥) for 2+ consecutive correct answers.
* **🥰 Emoji Reactions:** Send floating emojis (😂, 🥺, 😤, 🥰, 🤯, 🔥) during the result screen that pop up on both players' devices in real-time.
* **💖 Win Celebration Screen:** Race to the target score (default: 5) to trigger a dramatic game-over screen featuring spinning trophies, massive confetti, and a personalized **Compatibility Score %**.
* **🌶️ Dares System:** Guess wrong? You might get a fun dare (like "Give your partner a hug" or "Send them a voice note with 3 things you love about them").
* **🎶 Custom Sound Engine:** Fully integrated Web Audio API sound effects for correct answers, errors, button clicks, ticking clocks, and fanfare—coupled with `navigator.vibrate` for haptic feedback on mobile!
* **📜 Match History:** Review every question asked, who guessed it, and the outcome at the end of the game to laugh over the results.
* **📲 Share Results:** Instantly generate a summary and share it to your favorite social apps via the Web Share API.
* **Real-Time Multiplayer:** Instant state synchronization using Firebase.
* **Room-Based Matchmaking:** Secure connection via cute 4-letter + number codes (e.g., `LOVE42`).

## 🛠️ Tech Stack

* **Frontend:** [Next.js 14](https://nextjs.org/) (React Framework)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) (For smooth, physics-based animations)
* **Backend / Database:** [Firebase Realtime Database](https://firebase.google.com/)
* **Audio:** Web Audio API (No external sound files used!)
* **Hosting:** Vercel

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

* Node.js (v18+ recommended)
* npm or yarn
* A free [Firebase Console](https://console.firebase.google.com/) account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/heartsync-quiz.git
   cd heartsync-quiz
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase:**
   Create a `.env.local` file in the root directory and add your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Play:**
   https://heartsync-vr5o.vercel.app/
   Open [http://localhost:3000](http://localhost:3000) in your browser. Open it in a second window or device to join as player 2!
