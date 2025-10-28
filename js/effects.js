// Система эффектов
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
        // Обновляем существующие эффекты
        for (const [type, effect] of Object.entries(this.activeEffects)) {
            if (effect) {
                // Для эффектов движения обновляем позицию (следуют за персонажем)
                if (effect.type === 'walk' || effect.type === 'run') {
                    const config = effect.config;
                    const offsetX = effect.facingRight ? config.offsetX : -config.offsetX - config.size + player.width;
                    effect.x = player.x + offsetX;
                    effect.y = player.y + config.offsetY;
                    effect.facingRight = player.facingRight;
                }
                // Эффект прыжка НЕ обновляет позицию - остается на месте
                
                // Обновляем анимацию
                effect.frameTime += deltaTime;
                if (effect.frameTime >= effect.config.frameDelay) {
                    effect.frameTime = 0;
                    effect.currentFrame++;
                    
                    // Циклическая анимация для эффектов движения
                    if (effect.currentFrame >= effect.config.frames) {
                        if (effect.type === 'walk' || effect.type === 'run') {
                            effect.currentFrame = 0; // Зацикливаем анимацию
                        } else {
                            this.activeEffects[type] = null; // Удаляем эффект прыжка
                        }
                    }
                }
            }
        }
        
        // Управление эффектами движения в зависимости от состояния игрока
        if (player.onGround && player.velX !== 0) {
            const effectType = player.isRunning ? 'run' : 'walk';
            
            // Убираем противоположный эффект
            if (effectType === 'run') {
                this.activeEffects.walk = null; // Убираем эффект ходьбы при беге
            } else {
                this.activeEffects.run = null; // Убираем эффект бега при ходьбе
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
            // Убираем эффекты движения при прыжке или падении
            if (!player.onGround) {
                this.activeEffects.walk = null;
                // Эффект бега остается при прыжке
                if (player.velY > 0) { // Если падает вниз
                    this.activeEffects.run = null;
                }
            } else if (player.velX === 0) {
                // Убираем эффекты при остановке
                this.activeEffects.walk = null;
                this.activeEffects.run = null;
            }
        }
    }
    
    drawEffects(ctx, images) {
        ctx.globalAlpha = 0.75; // 75% прозрачность для всех эффектов
        
        for (const effect of Object.values(this.activeEffects)) {
            if (effect) {
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
                        ctx.drawImage(effectSprite, -effect.x - size, effect.y, size, size);
                        ctx.restore();
                    } else {
                        ctx.drawImage(effectSprite, effect.x, effect.y, size, size);
                    }
                }
            }
        }
        
        ctx.globalAlpha = 1.0; // Возвращаем нормальную прозрачность
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