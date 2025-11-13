class EffectsManager {
    constructor() {
        this.activeEffects = {
            walk: null,
            run: null,
            jump: null
        };
        
        this.configs = {
            walk: { frames: 6, frameDelay: 200, offsetX: -45, offsetY: 0, size: 64 },
            run: { frames: 2, frameDelay: 150, offsetX: -45, offsetY: 0, size: 64 },
            jump: { frames: 5, frameDelay: 100, offsetX: 0, offsetY: 0, size: 64 }
        };
    }
    
    activateEffect(type, playerX, playerY, playerFacingRight, playerWidth) {
        const config = this.configs[type];
        
        let x, y;
        
        if (type === 'jump') {
            x = playerX;
            y = playerY;
        } else {
            const offsetX = playerFacingRight ? config.offsetX : -config.offsetX - config.size + playerWidth;
            x = playerX + offsetX;
            y = playerY + config.offsetY;
        }
        
        this.activeEffects[type] = {
            type: type,
            x: x,
            y: y,
            currentFrame: 0,
            frameTime: 0,
            facingRight: playerFacingRight,
            config: config
        };
    }
    
    updateEffects(deltaTime, player) {
        for (const [type, effect] of Object.entries(this.activeEffects)) {
            if (effect) {
                if (effect.type === 'walk' || effect.type === 'run') {
                    const config = effect.config;
                    const offsetX = effect.facingRight ? config.offsetX : -config.offsetX - config.size + player.width;
                    effect.x = player.x + offsetX;
                    effect.y = player.y + config.offsetY;
                    effect.facingRight = player.facingRight;
                }
                
                effect.frameTime += deltaTime;
                if (effect.frameTime >= effect.config.frameDelay) {
                    effect.frameTime = 0;
                    effect.currentFrame++;
                    
                    if (effect.currentFrame >= effect.config.frames) {
                        if (effect.type === 'walk' || effect.type === 'run') {
                            effect.currentFrame = 0;
                        } else {
                            this.activeEffects[type] = null;
                        }
                    }
                }
            }
        }
        
        if (player.onGround && player.velX !== 0) {
            const effectType = player.isRunning ? 'run' : 'walk';
            
            if (effectType === 'run') {
                this.activeEffects.walk = null;
            } else {
                this.activeEffects.run = null;
            }
            
            if (!this.activeEffects[effectType]) {
                this.activateEffect(
                    effectType,
                    player.x,
                    player.y,
                    player.facingRight,
                    player.width
                );
            }
        } else {
            if (!player.onGround) {
                this.activeEffects.walk = null;
                if (player.velY > 0) {
                    this.activeEffects.run = null;
                }
            } else if (player.velX === 0) {
                this.activeEffects.walk = null;
                this.activeEffects.run = null;
            }
        }
    }
    
    drawEffects(ctx, images, camera) {
        ctx.globalAlpha = 0.75;
        
        for (const effect of Object.values(this.activeEffects)) {
            if (effect) {
                const screenX = effect.x - camera.x;
                const screenY = effect.y - camera.y;
                
                if (screenX + effect.config.size > 0 && screenX < camera.width && 
                    screenY + effect.config.size > 0 && screenY < camera.height) {
                    
                    let effectSprite;
                    const frameIndex = effect.currentFrame + 1;
                    
                    if (effect.type === 'walk') {
                        effectSprite = images[`moveef${frameIndex}`];
                    } else if (effect.type === 'run') {
                        effectSprite = images[`runef${frameIndex}`];
                    } else if (effect.type === 'jump') {
                        effectSprite = images[`jumpef${frameIndex}`];
                    }
                    
                    if (effectSprite) {
                        const size = effect.config.size;
                        
                        if (!effect.facingRight) {
                            ctx.save();
                            ctx.scale(-1, 1);
                            ctx.drawImage(effectSprite, -screenX - size, screenY, size, size);
                            ctx.restore();
                        } else {
                            ctx.drawImage(effectSprite, screenX, screenY, size, size);
                        }
                    }
                }
            }
        }
        
        ctx.globalAlpha = 1.0;
    }
    
    clearEffects() {
        this.activeEffects = {
            walk: null,
            run: null,
            jump: null
        };
    }
}

const effectsManager = new EffectsManager();