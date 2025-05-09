import { Character } from '../types/GameTypes';
import { npcDialogues } from './dialogues';

// Define game characters including player and NPCs
export const characters: Character[] = [
  // Player character
  {
    id: 'player',
    name: 'Player',
    x: 800, // Starting position
    y: 900,
    spriteSheet: 'player',
    dialogues: []
  },
  
  // Guide NPC
  {
    id: 'techGuru',
    name: 'TechGuru',
    x: 800, // Center position
    y: 800,
    spriteSheet: 'npc',
    dialogues: []
  },
  
  // Region NPCs
  {
    id: 'hardwareHank',
    name: 'Hardware Hank',
    x: 960, // Hardware Zone
    y: 800,
    spriteSheet: 'npc',
    dialogues: npcDialogues.hardwareZone
  },
  {
    id: 'softwareSam',
    name: 'Software Sam',
    x: 800, // Software Valley
    y: 640,
    spriteSheet: 'npc',
    dialogues: npcDialogues.softwareValley
  },
  {
    id: 'arcadeAnnie',
    name: 'Arcade Annie',
    x: 640, // Arcade Cove
    y: 800,
    spriteSheet: 'npc',
    dialogues: npcDialogues.arcadeCove
  },
  {
    id: 'consoleCarl',
    name: 'Console Carl',
    x: 896, // Console Island
    y: 896,
    spriteSheet: 'npc',
    dialogues: npcDialogues.consoleIsland
  },
  {
    id: 'mobileMolly',
    name: 'Mobile Molly',
    x: 704, // Mobile Bay
    y: 896,
    spriteSheet: 'npc',
    dialogues: npcDialogues.mobileBay
  },
  {
    id: 'internetIrene',
    name: 'Internet Irene',
    x: 800, // Internet Point
    y: 1020,
    spriteSheet: 'npc',
    dialogues: npcDialogues.internetPoint
  },
  
  // Boat captain (for intro)
  {
    id: 'captain',
    name: 'Captain',
    x: 800, // Shore position
    y: 950,
    spriteSheet: 'npc',
    dialogues: []
  }
];