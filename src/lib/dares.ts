/* ─── Dares for wrong answers ─── */

export const dares: string[] = [
  "Send your partner a voice note saying 3 things you love about them 💕",
  "Give your partner a hug right now 🤗",
  "Tell your partner your favorite memory together 📸",
  "Write a tiny love note and send it as a text 💌",
  "Say the sweetest thing you can think of, right now! 🥰",
  "Do your best impression of your partner 🎭",
  "Let your partner choose your profile picture for the day 📱",
  "Tell your partner the first thing you noticed about them ✨",
  "Share the last photo you took on your phone 📷",
  "Sing a line from your partner's favorite song 🎵",
  "Give your partner 3 compliments in a row 💖",
  "Tell your partner what you were thinking about today 💭",
  "Share your partner's best quality with them 🌟",
  "Promise to do one thing your partner loves this week 🤝",
  "Send your partner the cutest emoji combo you can make 💗🦋✨",
  "Describe your partner in 3 words 📝",
  "Tell your partner about a time they made you really proud 🏆",
  "Recreate your first ever text conversation 📱",
  "Make up a silly nickname for your partner right now 😄",
  "Share one thing you've never told your partner before 🤫",
  "Send your partner a selfie with a goofy face 🤪",
  "Tell your partner what makes them different from everyone else 💎",
  "Promise to plan the next date night 🌙",
  "Share your lock screen — does it have your partner? 🔒",
  "Text your partner 'I love you' in a language you both don't speak 🌍",
];

export function getRandomDare(): string {
  return dares[Math.floor(Math.random() * dares.length)];
}
