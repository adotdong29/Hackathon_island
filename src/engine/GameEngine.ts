import { GameState } from '../types/GameTypes';
import { RenderSystem } from './RenderSystem';
import { InputSystem } from './InputSystem';
import { MapSystem } from './MapSystem';
import { CharacterSystem } from './CharacterSystem';
import { AnimationSystem } from './AnimationSystem';
import { SpriteSystem } from './SpriteSystem';
import { PathfindingSystem } from './PathfindingSystem';
import { npcDialogues } from '../data/dialogues';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private running: boolean = false;
  private lastTime: number = 0;
  private updatePlayerPositionCallback: (x: number, y: number) => void;
  private triggerDialogueCallback: (dialogues: any[]) => void;
  private changeRegionCallback: (regionName: string) => void;
  
  // Game systems
  private renderSystem: RenderSystem;
  private inputSystem: InputSystem;
  private mapSystem: MapSystem;
  private characterSystem: CharacterSystem;
  private animationSystem: AnimationSystem;
  private spriteSystem: SpriteSystem;
  private pathfindingSystem: PathfindingSystem | null = null;

  constructor(
    canvas: HTMLCanvasElement, 
    gameState: GameState,
    updatePlayerPosition: (x: number, y: number) => void,
    triggerDialogue: (dialogues: any[]) => void,
    changeRegion: (regionName: string) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameState = gameState;
    this.updatePlayerPositionCallback = updatePlayerPosition;
    this.triggerDialogueCallback = triggerDialogue;
    this.changeRegionCallback = changeRegion;
    
    // Initialize systems
    this.renderSystem = new RenderSystem(this.ctx);
    this.inputSystem = new InputSystem(this.canvas);
    this.mapSystem = new MapSystem();
    this.characterSystem = new CharacterSystem();
    this.animationSystem = new AnimationSystem();
    this.spriteSystem = new SpriteSystem(); // SpriteSystem is initialized

    // Load the main character sprite sheet
    this.renderSystem.loadImage('character-atlas', '/sprites/characters.png');
    // If you have house.png and bird.png and want to use them as sprites, load them here too:
    // this.renderSystem.loadImage('house-sprite', '/sprites/house.png');
    // this.renderSystem.loadImage('bird-sprite', '/sprites/bird.png');

    // Initialize pathfinding and potentially other logic after all assets are loaded
    this.renderSystem.waitForLoad().then(() => {
      console.log("All assets loaded, initializing pathfinding.");
      this.pathfindingSystem = new PathfindingSystem(this.mapSystem.getMap());
      // Consider moving intro animation start here if it depends on loaded assets
      // or ensure start() is called after this promise resolves.
    });
  }

  public start(): void {
    if (this.running) return;
    
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
    
    // Start intro sequence if we're in intro phase (ensure assets are ready or animation is non-visual)
    // This might be better placed after renderSystem.waitForLoad() resolves if intro has visuals.
    // For now, assuming AnimationSystem's intro is non-visual or its visuals are handled separately.
    if (this.gameState.gamePhase === 'INTRO') {
      this.startIntroAnimation();
    }
  }

  public stop(): void {
    this.running = false;
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  public handleClick(): void {
    const mousePos = this.inputSystem.getMousePosition();
    if (!mousePos) return;
    
    // Check for NPC interactions
    const clickedNPC = this.characterSystem.checkNPCClick(mousePos.x, mousePos.y);
    if (clickedNPC && clickedNPC.dialogues.length > 0) {
      // Trigger NPC dialogue
      this.triggerDialogueCallback(clickedNPC.dialogues);
      this.spriteSystem.setAnimation(clickedNPC.id, 'talk');
      return;
    }
    
    // Check for region/minigame interactions
    const clickedRegion = this.mapSystem.checkRegionClick(mousePos.x, mousePos.y);
    if (clickedRegion) {
      // Set current region
      this.changeRegionCallback(clickedRegion.name);
      
      // Check if we have dialogues for this region
      const regionDialogues = npcDialogues[clickedRegion.id];
      if (regionDialogues) {
        this.triggerDialogueCallback(regionDialogues);
      }
      
      return;
    }
    
    // Otherwise, move player
    this.movePlayerToPosition(mousePos.x, mousePos.y);
  }

  public movePlayerToPosition(x: number, y: number): void {
    if (!this.pathfindingSystem) return;
    
    const playerPos = this.characterSystem.getPlayerPosition();
    if (!playerPos) return;
    
    // Find path
    const path = this.pathfindingSystem.findPath(
      playerPos.x, 
      playerPos.y,
      x,
      y
    );
    
    // If path found, move along it
    if (path.length > 0) {
      this.characterSystem.movePlayerAlongPath(path);
    }
  }

  private gameLoop = (timestamp: number): void => {
    if (!this.running) return;
    
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Update all game systems
    this.inputSystem.update();
    this.mapSystem.update(deltaTime);
    this.characterSystem.update(deltaTime);
    this.animationSystem.update(deltaTime);

    // Sync CharacterSystem state to SpriteSystem
    const player = this.characterSystem.getPlayer();
    if (player) {
      this.spriteSystem.updateSpritePosition(player.id, player.x, player.y); // Use player.id
      const animationName = this.characterSystem.isPlayerMoving() ? 'walk' : 'idle';
      this.spriteSystem.setAnimation(player.id, animationName); // Use player.id
      
      const playerSpriteData = this.spriteSystem.getSpriteData(player.id); // Use player.id
      if (playerSpriteData) {
        const direction = this.characterSystem.getPlayerDirection() as 'up' | 'down' | 'left' | 'right';
        playerSpriteData.direction = direction;
        playerSpriteData.flipped = direction === 'left'; // Player sprite flips when moving left
      }
    }

    this.characterSystem.getNPCs().forEach(npc => {
      this.spriteSystem.updateSpritePosition(npc.id, npc.x, npc.y); // Use npc.id
      // Assuming NPCs are idle or have a default animation state managed by SpriteSystem
      // For simplicity, we'll ensure their default 'idle' animation is set if not talking
      const npcSpriteData = this.spriteSystem.getSpriteData(npc.id); // Use npc.id
      if (npcSpriteData && npcSpriteData.currentAnimation !== 'talk') { // Don't override talk animation
        this.spriteSystem.setAnimation(npc.id, 'idle'); // Use npc.id
        npcSpriteData.direction = 'down'; // Default NPC direction
        npcSpriteData.flipped = false; // NPCs generally don't flip unless designed to
      }
    });

    this.spriteSystem.update(deltaTime);
    this.checkRegionChange();
    
    // Update player position callback (use the already fetched player)
    if (player) { 
      this.mapSystem.setCameraTarget(player.x, player.y); // Make camera follow player
      this.updatePlayerPositionCallback(player.x, player.y);
    }
  }

  private checkRegionChange(): void {
    const playerPos = this.characterSystem.getPlayerPosition();
    if (!playerPos) return;
    
    const currentRegion = this.mapSystem.getRegionAtPosition(playerPos.x, playerPos.y);
    if (currentRegion && currentRegion.name !== this.gameState.currentRegion) {
      this.changeRegionCallback(currentRegion.name);
    }
  }

  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render the game
    this.renderSystem.begin();
    
    // Render in proper order (background → map → characters → UI)
    this.renderSystem.renderBackground();
    this.mapSystem.render(this.renderSystem);
    this.characterSystem.render(this.renderSystem, this.spriteSystem); // Pass spriteSystem
    
    this.renderSystem.end();
  }

  private startIntroAnimation(): void {
    // Setup intro boat animation
    this.animationSystem.playIntroAnimation(() => {
      // Callback when animation completes
      // This might trigger the first dialogue
    });
  }
}
