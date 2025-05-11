import { RenderSystem } from './RenderSystem';

interface SpriteAnimation {
  frames: number;
  frameWidth: number;
  frameHeight: number;
  frameSpeed: number;
  loop: boolean;
  currentFrame: number;
  elapsedTime: number;
}

interface SpriteData {
  animations: Record<string, SpriteAnimation>;
  currentAnimation: string;
  direction: 'up' | 'down' | 'left' | 'right';
  x: number;
  y: number;
  width: number;
  height: number;
  flipped: boolean;
}

export class SpriteSystem {
  private sprites: Map<string, SpriteData> = new Map();

  constructor() {
    this.setupDefaultAnimations();
  }

  private setupDefaultAnimations(): void {
    // Setup player animations
    this.registerSprite('player', {
      animations: {
        'idle': {
          frames: 4,
          frameWidth: 32,
          frameHeight: 32,
          frameSpeed: 0.1,
          loop: true,
          currentFrame: 0,
          elapsedTime: 0
        },
        'walk': {
          frames: 8,
          frameWidth: 32,
          frameHeight: 32,
          frameSpeed: 0.12,
          loop: true,
          currentFrame: 0,
          elapsedTime: 0
        }
      },
      currentAnimation: 'idle',
      direction: 'down',
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      flipped: false
    });

    // Setup NPC animations
    this.registerSprite('npc', {
      animations: {
        'idle': {
          frames: 4,
          frameWidth: 32,
          frameHeight: 32,
          frameSpeed: 0.08,
          loop: true,
          currentFrame: 0,
          elapsedTime: 0
        },
        'talk': {
          frames: 6,
          frameWidth: 32,
          frameHeight: 32,
          frameSpeed: 0.1,
          loop: true,
          currentFrame: 0,
          elapsedTime: 0
        }
      },
      currentAnimation: 'idle',
      direction: 'down',
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      flipped: false
    });
  }

  public registerSprite(id: string, data: SpriteData): void {
    this.sprites.set(id, data);
  }

  public updateSpritePosition(id: string, x: number, y: number): void {
    const sprite = this.sprites.get(id);
    if (sprite) {
      sprite.x = x;
      sprite.y = y;
    }
  }

  public updateSpriteDirection(id: string, dx: number, dy: number): void {
    const sprite = this.sprites.get(id);
    if (!sprite) return;

    // Determine direction based on movement
    if (Math.abs(dx) > Math.abs(dy)) {
      sprite.direction = dx > 0 ? 'right' : 'left';
      sprite.flipped = dx < 0;
    } else if (dy !== 0) {
      sprite.direction = dy > 0 ? 'down' : 'up';
      sprite.flipped = false;
    }

    // Set animation based on movement
    sprite.currentAnimation = (dx !== 0 || dy !== 0) ? 'walk' : 'idle';
  }

  public setAnimation(id: string, animation: string): void {
    const sprite = this.sprites.get(id);
    if (sprite && sprite.animations[animation]) {
      sprite.currentAnimation = animation;
    }
  }

  public update(deltaTime: number): void {
    this.sprites.forEach(sprite => {
      const animation = sprite.animations[sprite.currentAnimation];
      if (!animation) return;

      animation.elapsedTime += deltaTime / 1000;

      if (animation.elapsedTime >= animation.frameSpeed) {
        animation.currentFrame = (animation.currentFrame + 1) % animation.frames;
        animation.elapsedTime = 0;

        if (!animation.loop && animation.currentFrame === 0) {
          // If animation doesn't loop and reached the end, set to idle
          sprite.currentAnimation = 'idle';
        }
      }
    });
  }

  public renderSprite(renderSystem: RenderSystem, id: string, spriteKey: string): void {
    const sprite = this.sprites.get(id);
    if (!sprite) return;

    const animation = sprite.animations[sprite.currentAnimation];
    if (!animation) return;

    const frameX = animation.currentFrame * animation.frameWidth;
    let frameY = 0;

    // Different row for each direction
    switch (sprite.direction) {
      case 'down':
        frameY = 0;
        break;
      case 'left':
      case 'right':
        frameY = animation.frameHeight;
        break;
      case 'up':
        frameY = animation.frameHeight * 2;
        break;
    }

    renderSystem.drawSprite(
      spriteKey,
      sprite.x - sprite.width / 2,
      sprite.y - sprite.height / 2,
      sprite.width,
      sprite.height,
      frameX,
      frameY,
      animation.frameWidth,
      animation.frameHeight,
      sprite.flipped // Pass the flipped status
    );
  }

  public getSpriteData(id: string): SpriteData | undefined {
    return this.sprites.get(id);
  }
}
