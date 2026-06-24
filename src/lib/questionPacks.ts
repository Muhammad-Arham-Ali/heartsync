/* ─── Question Packs for HeartSync ─── */

export interface QuestionPack {
  category: string;
  emoji: string;
  questions: string[];
}

export const generalPacks: QuestionPack[] = [
  {
    category: "Food & Cravings",
    emoji: "🍕",
    questions: [
      "What's my ultimate comfort food?",
      "What do I always order at a restaurant?",
      "What food can I absolutely NOT stand?",
      "What's my go-to midnight snack?",
      "What's my favorite cuisine?",
      "What drink do I always get at a café?",
      "What food reminds me of my childhood?",
      "What's the weirdest food combination I enjoy?",
      "What would I choose for my last meal?",
      "What's my favorite homemade dish?",
      "What's my guilty pleasure snack?",
      "What food do I always crave when I'm stressed?",
    ],
  },
  {
    category: "Memories Together",
    emoji: "📸",
    questions: [
      "Where did we go on our first date?",
      "What was the first movie we watched together?",
      "What's the funniest thing that happened to us?",
      "What song reminds me of us?",
      "Where was our most memorable trip?",
      "What's the first thing I said to you?",
      "What was our biggest adventure together?",
      "What's my favorite photo of us?",
      "What inside joke do we share?",
      "What gift from you do I treasure most?",
      "What's the sweetest thing I've done for you?",
      "When did you first know I was special?",
    ],
  },
  {
    category: "Favorites",
    emoji: "⭐",
    questions: [
      "What's my favorite color?",
      "What's my favorite movie of all time?",
      "What's my favorite season?",
      "What's my favorite time of day?",
      "What's my favorite holiday?",
      "Who's my favorite music artist?",
      "What's my favorite TV show right now?",
      "What's my favorite animal?",
      "What's my favorite way to relax?",
      "What's my favorite thing about you?",
      "What's my favorite place in the world?",
      "What's my favorite childhood memory?",
    ],
  },
  {
    category: "Embarrassing Moments",
    emoji: "🙈",
    questions: [
      "What's the most embarrassing thing I've done in public?",
      "What habit of mine do I try to hide?",
      "What was my most awkward moment with your family?",
      "What's the silliest fear I have?",
      "What's the most embarrassing song on my playlist?",
      "What do I do when I think nobody's watching?",
      "What was my worst fashion moment?",
      "What's the funniest autocorrect text I've sent you?",
      "What's the clumsiest thing I've done?",
      "What movie makes me cry every time?",
    ],
  },
  {
    category: "Dreams & Future",
    emoji: "🌟",
    questions: [
      "Where is my dream vacation destination?",
      "What's my dream job if money wasn't an issue?",
      "How many kids do I want?",
      "Where would I love to live someday?",
      "What's on my bucket list?",
      "What skill do I wish I could master overnight?",
      "What would I do with a million dollars?",
      "What's my biggest life goal?",
      "If I could have any superpower, what would it be?",
      "What kind of house do I dream of?",
    ],
  },
  {
    category: "Personality & Habits",
    emoji: "🧠",
    questions: [
      "Am I a morning person or night owl?",
      "What's the first thing I do when I wake up?",
      "How do I act when I'm angry?",
      "What's my nervous habit?",
      "Am I more introvert or extrovert?",
      "What do I do when I can't sleep?",
      "How do I handle stress?",
      "What makes me laugh the hardest?",
      "What's my love language?",
      "What's the one thing that always cheers me up?",
      "Do I prefer texting or calling?",
      "What's my biggest pet peeve?",
    ],
  },
];

export const spicyPacks: QuestionPack[] = [
  {
    category: "Deep Questions",
    emoji: "💎",
    questions: [
      "What's my biggest insecurity?",
      "What do I value most in our relationship?",
      "What's the one thing I'd change about myself?",
      "What was the hardest moment in my life?",
      "What do I admire most about you?",
      "What's my greatest fear about the future?",
      "When do I feel most loved by you?",
      "What's something I've never told anyone else?",
      "What makes me feel the most vulnerable?",
      "What's the bravest thing I've ever done?",
    ],
  },
  {
    category: "Intimate Knowledge",
    emoji: "🔥",
    questions: [
      "What's my idea of a perfect romantic evening?",
      "What compliment means the most to me?",
      "When do I feel most attractive?",
      "What's my favorite way to show affection?",
      "What's the most romantic thing I've ever planned?",
      "What's my favorite thing about your appearance?",
      "What outfit of mine do I feel best in?",
      "What's the sweetest message I've ever sent you?",
      "What song puts me in a romantic mood?",
      "What's my favorite way to be surprised?",
    ],
  },
  {
    category: "Relationship Goals",
    emoji: "💕",
    questions: [
      "What's my idea of a perfect weekend together?",
      "How do I picture our life in 5 years?",
      "What tradition do I want us to start?",
      "What's the one trip I want us to take together?",
      "How do I imagine our dream home?",
      "What's the most important promise I want from you?",
      "What's my favorite couple activity?",
      "What milestone am I most excited about?",
      "How would I describe our love story?",
      "What's the thing that first attracted me to you?",
    ],
  },
];

/* ─── Daily Challenge Pool ─── */
const dailyQuestions: string[] = [
  "What would your partner say is their biggest pet peeve?",
  "If your partner could live in any era, which would they choose?",
  "What's the one thing your partner can't start their day without?",
  "What would your partner grab first in a fire (after loved ones)?",
  "What's your partner's hidden talent?",
  "What show is your partner secretly obsessed with?",
  "If your partner was famous, what would they be known for?",
  "What would your partner's autobiography be titled?",
  "What's the one food your partner could eat forever?",
  "What's your partner's go-to karaoke song?",
  "If your partner was an animal, what would they be?",
  "What's the most used app on your partner's phone?",
  "What does your partner daydream about most?",
  "What childhood game was your partner's favorite?",
  "What makes your partner irrationally happy?",
  "What's your partner's zodiac sign?",
  "What would your partner's dream birthday look like?",
  "If your partner could teleport anywhere right now, where?",
  "What's the weirdest search in your partner's browser history?",
  "What outfit does your partner feel most confident in?",
  "What would your partner do on a surprise day off?",
  "What's your partner's idea of the perfect gift?",
  "What childhood dream does your partner still have?",
  "What's the last thing your partner does before sleeping?",
  "What makes your partner feel most loved?",
  "What word does your partner use way too often?",
  "What's your partner's biggest guilty pleasure?",
  "If your partner won the lottery, what's the first thing they'd buy?",
  "What scares your partner the most?",
  "What's your partner's comfort movie?",
  "If your partner could have dinner with anyone, who would it be?",
  "What's the most romantic thing your partner believes in?",
  "What does your partner think about right before falling asleep?",
  "What hobby has your partner always wanted to try?",
  "What's the funniest thing your partner has ever said?",
  "What's your partner's biggest accomplishment?",
  "What childhood food does your partner still love?",
  "How does your partner react to a jump scare?",
  "What's the one rule your partner lives by?",
  "What would your partner order at their last dinner?",
  "What's your partner's favorite thing about their own appearance?",
  "What's the most thoughtful thing your partner has done for someone?",
  "If your partner could master any instrument, which one?",
  "What does your partner sing in the shower?",
  "What fictional world would your partner want to live in?",
  "What's your partner's favorite type of weather?",
  "What makes your partner cry happy tears?",
  "What's the one thing your partner is irrationally proud of?",
  "What would your partner name a pet dragon?",
  "What's your partner's favorite way to say 'I love you'?",
];

export function getDailyQuestion(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dailyQuestions[dayOfYear % dailyQuestions.length];
}

export function getRandomQuestion(packs: QuestionPack[]): { question: string; category: string } {
  const pack = packs[Math.floor(Math.random() * packs.length)];
  const question = pack.questions[Math.floor(Math.random() * pack.questions.length)];
  return { question, category: `${pack.emoji} ${pack.category}` };
}
