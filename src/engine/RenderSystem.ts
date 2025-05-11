export class RenderSystem {
  private ctx: CanvasRenderingContext2D;
  private sprites: Map<string, HTMLImageElement> = new Map();
  private loadedPromises: Promise<void>[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.setupCanvas();
  }

  private setupCanvas(): void {
    // Enable image smoothing for better rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  public loadImage(key: string, src: string): void {
    const img = new Image();
    const promise = new Promise<void>((resolve, reject) => {
        img.onload = () => {
            this.sprites.set(key, img);
            resolve();
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${src} for key: ${key}`);
            reject(new Error(`Failed to load image: ${src}`));
        };
    });
    img.src = src;
    this.loadedPromises.push(promise);
  }

  public async waitForLoad(): Promise<void> {
    return Promise.all(this.loadedPromises).then(() => {});
  }

  public begin(): void {
    this.ctx.save();
  }

  public end(): void {
    this.ctx.restore();
  }

  public renderBackground(): void {
    this.ctx.fillStyle = '#004080';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  public drawCharacter(x: number, y: number, direction: string, isMoving: boolean): void {
    const size = 32;
    
    // Draw character body
    this.ctx.fillStyle = '#FFD700'; // Golden color for character
    this.ctx.beginPath();
    this.ctx.arc(x, y - size/2, size/3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw character body
    this.ctx.fillStyle = '#4169E1'; // Royal blue for body
    this.ctx.fillRect(x - size/4, y - size/2 + size/3, size/2, size/2);
    
    // Draw legs with animation
    if (isMoving) {
      const time = Date.now() / 200;
      const legOffset = Math.sin(time) * 5;
      
      // Left leg
      this.ctx.fillStyle = '#4169E1';
      this.ctx.fillRect(x - size/4, y, size/4, size/3 + legOffset);
      
      // Right leg
      this.ctx.fillRect(x, y, size/4, size/3 - legOffset);
    } else {
      // Standing still
      this.ctx.fillStyle = '#4169E1';
      this.ctx.fillRect(x - size/4, y, size/4, size/3);
      this.ctx.fillRect(x, y, size/4, size/3);
    }
    
    // Draw direction indicator (eyes)
    this.ctx.fillStyle = '#000000';
    switch(direction) {
      case 'up':
        this.ctx.fillRect(x - size/6, y - size/2 - size/6, size/8, size/8);
        this.ctx.fillRect(x + size/6, y - size/2 - size/6, size/8, size/8);
        break;
      case 'down':
        this.ctx.fillRect(x - size/6, y - size/2 + size/6, size/8, size/8);
        this.ctx.fillRect(x + size/6, y - size/2 + size/6, size/8, size/8);
        break;
      case 'left':
        this.ctx.fillRect(x - size/3, y - size/2, size/8, size/8);
        break;
      case 'right':
        this.ctx.fillRect(x + size/4, y - size/2, size/8, size/8);
        break;
    }
  }

  public drawNPC(x: number, y: number, color: string): void {
    const size = 32;
    
    // Draw NPC body
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y - size/2, size/3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw NPC body
    this.ctx.fillRect(x - size/4, y - size/2 + size/3, size/2, size/2);
    
    // Draw legs
    this.ctx.fillRect(x - size/4, y, size/4, size/3);
    this.ctx.fillRect(x, y, size/4, size/3);
    
    // Draw eyes
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(x - size/6, y - size/2, size/8, size/8);
    this.ctx.fillRect(x + size/6, y - size/2, size/8, size/8);
  }

  public drawText(
    text: string, 
    x: number, 
    y: number, 
    color = 'white', 
    size = 16, 
    align: CanvasTextAlign = 'left'
  ): void {
    this.ctx.font = `${size}px 'Press Start 2P', monospace`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  public drawRect(
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    color: string
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  public drawCircle(
    x: number, 
    y: number, 
    radius: number, 
    color: string
  ): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  public drawSprite(
    spriteKey: string,
    dx: number, // destination x
    dy: number, // destination y
    dWidth: number, // destination width
    dHeight: number, // destination height
    sx: number, // source x
    sy: number, // source y
    sWidth: number, // source width
    sHeight: number, // source height
    flipped: boolean = false
  ): void {
    const image = this.sprites.get(spriteKey);
    if (image) {
      this.ctx.save();
      if (flipped) {
        this.ctx.translate(dx + dWidth, dy); // Move to the right edge of the destination
        this.ctx.scale(-1, 1); // Flip horizontally
        this.ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);
      } else {
        this.ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      }
      this.ctx.restore();
    } else {
      // Fallback: Draw a magenta box if sprite image is not found
      this.ctx.fillStyle = 'magenta';
      this.ctx.fillRect(dx, dy, dWidth, dHeight);
      this.ctx.fillStyle = 'black';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(spriteKey.substring(0,1), dx + dWidth/2, dy + dHeight/2);
    }
  }
}