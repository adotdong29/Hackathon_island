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
    this.spriteSystem = new SpriteSystem();
    
    // Initialize pathfinding after map is loaded
    this.renderSystem.waitForLoad().then(() => {
      this.pathfindingSystem = new PathfindingSystem(this.mapSystem.getMap());
    });
  }

  public start(): void {
    if (this.running) return;
    
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
    
    // Start intro sequence if we're in intro phase
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
    this.spriteSystem.update(deltaTime);
    
    // Check for region changes based on player position
    this.checkRegionChange();
    
    // Update player position callback
    const playerPos = this.characterSystem.getPlayerPosition();
    if (playerPos) {
      this.updatePlayerPositionCallback(playerPos.x, playerPos.y);
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
    this.characterSystem.render(this.renderSystem);
    
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