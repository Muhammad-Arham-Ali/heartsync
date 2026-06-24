
### PRD: Cloud-Based Couples Quiz App

**1. Product Overview**

-   **Name:** (TBD) Couples Quiz
    
-   **Objective:** A real-time, cross-device multiplayer web app where couples alternate creating and guessing 4-option trivia questions about each other.
    
-   **Platform:** Web-based (Strictly mobile-first, responsive).
    
-   **Network:** Cloud-based, real-time sync across separate devices.
    

**2. Technical Architecture**

-   **Frontend framework:** Next.js
    
-   **Backend/Real-time database:** Firebase (Realtime Database or Firestore)
    
-   **Styling framework:** Tailwind CSS
    
-   **Hosting:** Vercel or Firebase Hosting
    

**3. User Flow & Mechanics**

-   **Lobby/Matching:** * Player 1 initiates a session and generates a unique, themed Room Code (e.g., `CUTE-BEAR`).
    
    -   Player 2 enters the Room Code to join the session.
        
-   **Phase 1: Question Creation:**
    
    -   Active Player (Creator) inputs 1 question, 4 options, and selects the correct answer.
        
    -   Passive Player (Guesser) views a themed waiting screen.
        
-   **Phase 2: Guessing:**
    
    -   Data syncs via Firebase.
        
    -   Guesser views the question and 4 options.
        
    -   Creator views a suspenseful waiting screen.
        
-   **Phase 3: Resolution:**
    
    -   Guesser selects an option.
        
    -   Both devices instantly display the result (Correct/Incorrect).
        
    -   Shared scoreboard updates.
        
    -   Roles swap automatically for the next round.
        

**4. UI/UX & Design Requirements**

-   **Aesthetic:** "Couple-coded" and cute.
    
-   **Color Palette:** Pastel pinks, soft reds, warm whites.
    
-   **Typography:** Rounded, friendly sans-serif fonts.
    
-   **UI Components:** Pill-shaped buttons, soft drop shadows, bouncy hover/click animations.
    
-   **Visual Indicators:** Heart motifs, emojis, and clear visual differentiation between "Active/Creating" and "Waiting" states.
    

**5. Data Schema (High-Level)**

-   **Rooms Collection:**
    
    -   `roomId`: String (e.g., "CUTE-BEAR")
        
    -   `players`: Array [Player1_ID, Player2_ID]
        
    -   `scores`: Object { Player1: Int, Player2: Int }
        
    -   `currentTurn`: String (Player_ID)
        
    -   `gameState`: String ("LOBBY", "CREATING", "GUESSING", "RESULT")
        
    -   `currentQuestion`: Object { text, options Array[4], correctIndex }

