// Игрок и его анимации
class Player {
    constructor() {
        this.x = 200;
        this.y = 500;
        this.width = 64;
        this.height = 64;
        this.velX = 0;
        this.velY = 0;
        
        // Настройки скорости для разных устройств
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Меньшая скорость на мобильных устройствах
        this.speed = this.isMobile ? 3 : 5;
        this.runSpeed = this.isMobile ? 5 : 8;
        this.maxWalkSpeed = this.isMobile ? 3 : 5;
        this.maxRunSpeed = this.isMobile ? 5 : 8;
        
        this.isJumping = false;
        this.isRunning = false;
        this.facingRight = true;
        this.onGround = false;
        this.jumpCooldown = 0;
        this.canJump = true;
        this.acceleration = this.isMobile ? 0.3 : 0.5;
        this.currentSpeed = 0;
        
        this.GRAVITY = 0.5;
        this.JUMP_FORCE = -15;
        
        this.animations = {
            idle: { frames: 1, currentFrame: 0, frameTime: 0, frameDelay: 200 },
            walk: { frames: 2, currentFrame: 0, frameTime: 0, frameDelay: 200 },
            run: { frames: 2, currentFrame: 0, frameTime: 0, frameDelay: 100 },
            jump: { frames: 1, currentFrame: 0, frameTime: 0, frameDelay: 200 }
        };
    }
    
    isGameActive() {
        // Проверяем активна ли игра через глобальный экземпляр
        return gameInstance && gameInstance.gameActive;
    }
    
    update(platforms) {
        // Если открыты настройки или игра не активна - блокируем управление
        if (document.getElementById('settings-modal').style.display === 'block' || !this.isGameActive()) {
            this.velX = 0;
            this.currentSpeed = 0;
            
            // Применяем гравитацию даже когда игра не активна
            if (!this.onGround) {
                this.velY += this.GRAVITY;
                this.y += this.velY;
                this.checkCollisions(platforms);
            }
            return;
        }
        
        // Сброс горизонтальной скорости
        this.velX = 0;
        
        // Обновляем кулдаун прыжка
        if (this.jumpCooldown > 0) {
            this.jumpCooldown--;
        }
        
        // Разрешаем прыжок когда отпустили кнопку
        if (!controls.isActionPressed('jump')) {
            this.canJump = true;
        }
        
        // Определяем состояние бега
        const wantsToRun = controls.isActionPressed('run');
        const isMoving = controls.isActionPressed('left') || controls.isActionPressed('right');
        
        // Разгон и замедление
        if (isMoving) {
            const targetSpeed = wantsToRun ? this.maxRunSpeed : this.maxWalkSpeed;
            this.currentSpeed = Math.min(this.currentSpeed + this.acceleration, targetSpeed);
            this.isRunning = this.currentSpeed >= this.maxRunSpeed * 0.8;
        } else {
            this.currentSpeed = Math.max(this.currentSpeed - this.acceleration * 2, 0);
            this.isRunning = false;
        }
        
        // Движение влево
        if (controls.isActionPressed('left')) {
            this.velX = -this.currentSpeed;
            this.facingRight = false;
        }
        
        // Движение вправо
        if (controls.isActionPressed('right')) {
            this.velX = this.currentSpeed;
            this.facingRight = true;
        }
        
        // Прыжок
        if (controls.isActionPressed('jump') && this.onGround && this.jumpCooldown === 0 && this.canJump) {
            this.velY = this.JUMP_FORCE;
            this.isJumping = true;
            this.onGround = false;
            this.jumpCooldown = 20;
            this.canJump = false;
            
            // Активируем эффект прыжка прямо на персонаже
            effectsManager.activateEffect(
                'jump',
                this.x,
                this.y,
                this.facingRight,
                this.width
            );
        }
        
        // Применяем гравитацию
        this.velY += this.GRAVITY;
        
        // Обновляем позицию
        this.x += this.velX;
        this.y += this.velY;
        
        // Проверка столкновений с платформами
        this.checkCollisions(platforms);
        
        // Ограничение по границам экрана
        this.constrainToBounds();
    }
    
    checkCollisions(platforms) {
        this.onGround = false;
        
        for (const platform of platforms) {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                
                // Столкновение сверху
                if (this.velY > 0 && this.y + this.height - this.velY <= platform.y) {
                    this.y = platform.y - this.height;
                    this.velY = 0;
                    this.onGround = true;
                    this.isJumping = false;
                }
                // Столкновение снизу (только для обычных платформ)
                else if (this.velY < 0 && this.y - this.velY >= platform.y + platform.height && platform.type === 'platform') {
                    this.y = platform.y + platform.height;
                    this.velY = 0;
                }
                // Столкновение сбоку
                else if (this.velX !== 0) {
                    if (this.velX > 0) {
                        this.x = platform.x - this.width;
                    } else {
                        this.x = platform.x + platform.width;
                    }
                }
            }
        }
    }
    
    constrainToBounds() {
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > 1280) this.x = 1280 - this.width;
        if (this.y > 720) {
            this.y = 500;
            this.velY = 0;
            this.onGround = true;
            this.isJumping = false;
        }
    }
    
    updateAnimations(deltaTime) {
        // Определяем текущую анимацию
        let currentAnim;
        
        if (this.isJumping) {
            currentAnim = this.animations.jump;
        } else if (this.velX !== 0) {
            currentAnim = this.isRunning ? this.animations.run : this.animations.walk;
        } else {
            currentAnim = this.animations.idle;
        }
        
        // Обновляем кадр анимации
        currentAnim.frameTime += deltaTime;
        if (currentAnim.frameTime >= currentAnim.frameDelay) {
            currentAnim.frameTime = 0;
            currentAnim.currentFrame = (currentAnim.currentFrame + 1) % currentAnim.frames;
        }
    }
    
    draw(ctx, images) {
        // Определяем текущий спрайт
        let sprite;
        
        if (this.isJumping) {
            // В прыжке используем текущий кадр ходьбы/бега или idle
            if (this.velX !== 0) {
                const anim = this.isRunning ? this.animations.run : this.animations.walk;
                sprite = this.isRunning ? 
                    (anim.currentFrame === 0 ? images.run1 : images.run2) :
                    (anim.currentFrame === 0 ? images.move1 : images.move2);
            } else {
                sprite = images.idle;
            }
        } else if (this.velX !== 0) {
            // Ходьба или бег
            if (this.isRunning) {
                sprite = this.animations.run.currentFrame === 0 ? images.run1 : images.run2;
            } else {
                sprite = this.animations.walk.currentFrame === 0 ? images.move1 : images.move2;
            }
        } else {
            // Стояние на месте
            sprite = images.idle;
        }
        
        // Отрисовываем игрока
        if (!this.facingRight) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(sprite, -this.x - this.width, this.y, this.width, this.height);
            ctx.restore();
        } else {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        }
    }
}

const player = new Player();