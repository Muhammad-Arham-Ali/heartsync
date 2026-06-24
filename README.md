# 💌 HeartSync: A Cross-Device Couples Quiz Game

A real-time, responsive multiplayer web app designed for couples to test how well they know each other. Built with a mobile-first approach, this game allows partners to connect via a unique "Room Code" across different devices, taking turns creating and guessing custom 4-option trivia questions.

## ✨ Features

* **Real-Time Multiplayer:** Instant state synchronization across devices so both partners see the action unfold simultaneously without needing to refresh.
* **Room-Based Matchmaking:** Generate a unique, themed room code (e.g., `PINK-BEAR`) to securely pair two devices together.
* **Alternating Game Loop:** The game automatically manages state, seamlessly swapping the "Creator" and "Guesser" roles after every round.
* **Couple-Coded UI:** A fully responsive, pastel-themed interface featuring soft shadows, pill-shaped interactive elements, and bouncy animations for a "cute" aesthetic.
* **Persistent Scoreboard:** A beautifully integrated, always-visible tracker to keep a running tally of who really knows who best.

## 🛠️ Tech Stack

* **Frontend:** [Next.js](https://nextjs.org/) (React framework for robust routing and fast performance)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Rapid, utility-first styling for our custom pastel theme)
* **Backend / Database:** [Firebase Realtime Database](https://firebase.google.com/) (For instant, low-latency syncing of game states)
* **Hosting:** Vercel / Firebase Hosting

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

* Node.js (v18+ recommended for Ubuntu/Linux environments)
* npm or yarn
* A free [Firebase Console](https://console.firebase.google.com/) account

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/heartsync-quiz.git](https://github.com/yourusername/heartsync-quiz.git)
   cd heartsync-quiz
