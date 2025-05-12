import { RenderSystem } from './RenderSystem';
import { Character } from '../types/GameTypes';
import { SpriteSystem } from './SpriteSystem';
import { characters } from '../data/Characters';

export class CharacterSystem {
  private characters: Character[] = [];
  private player: Character | null = null;
  private playerTargetX: number = 0;
  private playerTargetY: number = 0;
  private playerMoving: boolean = false;
  private playerSpeed: number = 4;
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

  public render(renderSystem: RenderSystem, spriteSystem: SpriteSystem): void {
    // Render NPCs
    this.characters.forEach(character => {
      if (character.id !== 'player') {
        spriteSystem.renderSprite(renderSystem, character.id, character.spriteSheet);
        
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
      spriteSystem.renderSprite(renderSystem, this.player.id, this.player.spriteSheet);
    }
  }

  private getNPCColor(id: string): string {
    const colors: Record<string, string> = {
      'techGuru': '#FF69B4',
      'hardwareHank': '#FF4500',
      'softwareSam': '#32CD32',
      'arcadeAnnie': '#9370DB',
      'consoleCarl': '#20B2AA',
      'mobileMolly': '#FFD700',
      'internetIrene': '#FF1493',
      'captain': '#4169E1'
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
    const clickRadius = 40;
    
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

  public getPlayer(): Character | null {
    return this.player;
  }

  public getNPCs(): Character[] {
    return this.characters.filter(c => c.id !== 'player');
  }

  public isPlayerMoving(): boolean {
    return this.playerMoving;
  }

  public getPlayerDirection(): string {
    return this.playerDirection;
  }
}