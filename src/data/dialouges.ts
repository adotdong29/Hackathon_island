import { Dialogue } from '../types/GameTypes';

// Intro sequence dialogues
export const introDialogues: Dialogue[] = [
  {
    text: "Welcome to '80s Tech Island! The year is 1985, and you've just arrived at this mysterious island filled with the wonders of technology.",
    speaker: "Captain"
  },
  {
    text: "I'll be leaving you here at the shore. Follow the path to meet your guide who will show you around the island.",
    speaker: "Captain"
  },
  {
    text: "Hello there! I'm TechGuru, your guide to this amazing island of technological wonders!",
    speaker: "TechGuru"
  },
  {
    text: "The island is divided into six regions, each representing a different aspect of '80s technology. Your mission is to complete all the mini-games and become a tech master!",
    speaker: "TechGuru"
  },
  {
    text: "Use the arrow keys or click on the map to navigate. Click on NPCs to talk to them and learn more about each region.",
    speaker: "TechGuru"
  },
  {
    text: "Your journey begins now! Explore the island and embrace the radical world of '80s technology!",
    speaker: "TechGuru"
  }
];

// NPC dialogues for each region
export const npcDialogues: Record<string, Dialogue[]> = {
  hardwareZone: [
    {
      text: "Welcome to the Hardware Zone! Back in the '80s, personal computers were just becoming mainstream. Remember the Commodore 64, Apple II, and IBM PC?",
      speaker: "Hardware Hank"
    },
    {
      text: "Your challenge here is to match computer parts with their correct functions. Ready to test your hardware knowledge?",
      speaker: "Hardware Hank"
    }
  ],
  softwareValley: [
    {
      text: "Welcome to Software Valley! The '80s saw the rise of iconic software like VisiCalc, WordPerfect, and early versions of MS-DOS.",
      speaker: "Software Sam"
    },
    {
      text: "Your challenge is to answer questions about '80s software. Think you're up for it?",
      speaker: "Software Sam"
    }
  ],
  arcadeCove: [
    {
      text: "Welcome to Arcade Cove! The '80s was the golden age of arcade games with classics like Pac-Man, Space Invaders, and Donkey Kong.",
      speaker: "Arcade Annie"
    },
    {
      text: "Your challenge is a rhythm-based game inspired by '80s arcade classics. Let's see those reflexes!",
      speaker: "Arcade Annie"
    }
  ],
  consoleIsland: [
    {
      text: "Welcome to Console Island! The '80s saw the Nintendo Entertainment System, Atari 2600, and Sega Master System dominate living rooms.",
      speaker: "Console Carl"
    },
    {
      text: "Your challenge is to identify console games from their screenshots. Think you know your gaming history?",
      speaker: "Console Carl"
    }
  ],
  mobileBay: [
    {
      text: "Welcome to Mobile Bay! The '80s had 'mobile' phones too - though they were the size of bricks! Remember the Motorola DynaTAC?",
      speaker: "Mobile Molly"
    },
    {
      text: "Your challenge is to guess the weight of various '80s mobile phones. They were pretty hefty back then!",
      speaker: "Mobile Molly"
    }
  ],
  internetPoint: [
    {
      text: "Welcome to Internet Point! The '80s saw the early foundations of what would become the internet with ARPANET and early networking protocols.",
      speaker: "Internet Irene"
    },
    {
      text: "Your challenge is a quiz about early internet and networking concepts. Ready to test your knowledge?",
      speaker: "Internet Irene"
    }
  ]
};

// Completion dialogues
export const completionDialogues: Dialogue[] = [
  {
    text: "Congratulations! You've completed all the mini-games and mastered '80s technology!",
    speaker: "TechGuru"
  },
  {
    text: "The knowledge and skills from this era laid the foundation for all the technology we have today.",
    speaker: "TechGuru"
  },
  {
    text: "From personal computers to early mobile phones, from classic video games to the beginnings of the internet - you've experienced it all!",
    speaker: "TechGuru"
  },
  {
    text: "Feel free to explore the island again and replay any mini-games you enjoyed. The '80s tech spirit will always be here!",
    speaker: "TechGuru"
  }
];