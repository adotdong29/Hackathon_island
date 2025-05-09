import { RenderSystem } from './RenderSystem';
import { Character } from '../types/GameTypes';
import { characters } from '../data/characters';

export class CharacterSystem {
  private characters: Character[] = [];
  private player: Character | null = null;
  private playerTargetX: number = 0;
  private playerTargetY: number = 0;
  private playerMoving: boolean = false;
  private playerSpeed: number = 4; // Increased speed
  private playerDirection: string = 'down';
  private currentPath: { x: number, y: number }[] = [];
  private currentPathIndex: number = 0;

  constructor() {
    this.characters = characters;
    this.player = this.characters.find(c => c.id === 'player') || null;
    
    if (this.player) {
      this.playerTargetX = this.player.x;
      this.playerTargetY = this.player.y;
    }
  }

  public update(deltaTime: number): void {
    this.updatePlayerMovement();
  }

  public render(renderSystem: RenderSystem): void {
    // Render NPCs
    this.characters.forEach(character => {
      if (character.id !== 'player') {
        renderSystem.drawNPC(
          character.x,
          character.y,
          this.getNPCColor(character.id)
        );
        
        // Draw character name above
        renderSystem.drawText(
          character.name,
          character.x,
          character.y - 40,
          '#FFFFFF',
          10,
          'center'
        );
      }
    });
    
    // Render player
    if (this.player) {
      renderSystem.drawCharacter(
        this.player.x,
        this.player.y,
        this.playerDirection,
        this.playerMoving
      );
    }
  }

  private getNPCColor(id: string): string {
    const colors: Record<string, string> = {
      'techGuru': '#FF69B4', // Hot Pink
      'hardwareHank': '#FF4500', // Orange Red
      'softwareSam': '#32CD32', // Lime Green
      'arcadeAnnie': '#9370DB', // Medium Purple
      'consoleCarl': '#20B2AA', // Light Sea Green
      'mobileMolly': '#FFD700', // Gold
      'internetIrene': '#FF1493', // Deep Pink
      'captain': '#4169E1' // Royal Blue
    };
    return colors[id] || '#808080';
  }

  private updatePlayerMovement(): void {
    if (!this.player) return;
    
    if (this.currentPath.length > 0 && this.currentPathIndex < this.currentPath.length) {
      const targetPoint = this.currentPath[this.currentPathIndex];
      this.playerTargetX = targetPoint.x;
      this.playerTargetY = targetPoint.y;
      this.playerMoving = true;
      
      const dx = this.playerTargetX - this.player.x;
      const dy = this.playerTargetY - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.playerSpeed) {
        this.player.x = this.playerTargetX;
        this.player.y = this.playerTargetY;
        this.currentPathIndex++;
        
        if (this.currentPathIndex >= this.currentPath.length) {
          this.playerMoving = false;
        }
      } else {
        const vx = (dx / distance) * this.playerSpeed;
        const vy = (dy / distance) * this.playerSpeed;
        
        this.player.x += vx;
        this.player.y += vy;
        
        // Update player direction
        this.updatePlayerDirection(vx, vy);
      }
    } else if (this.playerMoving) {
      const dx = this.playerTargetX - this.player.x;
      const dy = this.playerTargetY - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.playerSpeed) {
        this.player.x = this.playerTargetX;
        this.player.y = this.playerTargetY;
        this.playerMoving = false;
        return;
      }
      
      const vx = (dx / distance) * this.playerSpeed;
      const vy = (dy / distance) * this.playerSpeed;
      
      this.player.x += vx;
      this.player.y += vy;
      
      // Update player direction
      this.updatePlayerDirection(vx, vy);
    }
  }

  private updatePlayerDirection(vx: number, vy: number): void {
    if (Math.abs(vx) > Math.abs(vy)) {
      this.playerDirection = vx > 0 ? 'right' : 'left';
    } else {
      this.playerDirection = vy > 0 ? 'down' : 'up';
    }
  }

  public movePlayerToPosition(x: number, y: number): void {
    if (!this.player) return;
    this.playerTargetX = x;
    this.playerTargetY = y;
    this.playerMoving = true;
  }

  public movePlayerAlongPath(path: { x: number, y: number }[]): void {
    if (path.length === 0) return;
    this.currentPath = path;
    this.currentPathIndex = 0;
    this.playerMoving = true;
  }

  public checkNPCClick(x: number, y: number): Character | null {
    const clickRadius = 40; // Increased click radius
    
    for (const character of this.characters) {
      if (character.id === 'player') continue;
      
      const dx = x - character.x;
      const dy = y - character.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= clickRadius) {
        return character;
      }
    }
    
    return null;
  }

  public getPlayerPosition(): { x: number, y: number } | null {
    if (!this.player) return null;
    return { x: this.player.x, y: this.player.y };
  }
}