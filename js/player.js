// Игрок и его анимации
class Player {
    constructor() {
        this.x = 200;
        this.y = 500;
        this.width = 64;
        this.height = 64;
        this.velX = 0;
        this.velY = 0;
        
        // Фиксированная скорость на всех устройствах
        this.speed = 5;
        this.runSpeed = 8;
        this.maxWalkSpeed = 5;
        this.maxRunSpeed = 8;
        
        this.isJumping = false;
        this.isRunning = false;
        this.facingRight = true;
        this.onGround = false;
        this.jumpCooldown = 0;
        this.canJump = true;
        this.acceleration = 0.5;
        this.currentSpeed = 0;
        
        this.GRAVITY = 0.5;
        this.JUMP_FORCE = -15; // Уменьшил силу прыжка
        
        // Переменная для отслеживания столкновения со стеной
        this.isAgainstWall = false;
        this.wallDirection = 0; // -1 слева, 1 справа, 0 нет стены
        
        this.animations = {
            idle: { frames: 1, currentFrame: 0, frameTime: 0, frameDelay: 200 },
            walk: { frames: 2, currentFrame: 0, frameTime: 0, frameDelay: 200 },
            run: { frames: 2, currentFrame: 0, frameTime: 0, frameDelay: 100 },
            jump: { frames: 1, currentFrame: 0, frameTime: 0, frameDelay: 200 }
        };

        // Убираем контроль времени для прыжка, оставляем только для анимаций
        this.lastUpdateTime = performance.now();
    }
    
    isGameActive() {
        // Проверяем активна ли игра через глобальный экземпляр
        return gameInstance && gameInstance.gameActive;
    }
    
    update(platforms) {
        // ФИКСИРОВАННАЯ физика - не зависим от deltaTime для движения и прыжка
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastUpdateTime) / 16.67, 2);
        this.lastUpdateTime = currentTime;

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
        
        // Разгон и замедление - ФИКСИРОВАННОЕ, не зависим от deltaTime
        if (isMoving) {
            const targetSpeed = wantsToRun ? this.maxRunSpeed : this.maxWalkSpeed;
            this.currentSpeed = Math.min(this.currentSpeed + this.acceleration, targetSpeed);
            this.isRunning = this.currentSpeed >= this.maxRunSpeed * 0.8;
        } else {
            this.currentSpeed = Math.max(this.currentSpeed - this.acceleration * 2, 0);
            this.isRunning = false;
        }
        
        // Движение влево (только если не уперлись в стену справа)
        if (controls.isActionPressed('left') && !(this.isAgainstWall && this.wallDirection === 1)) {
            this.velX = -this.currentSpeed;
            this.facingRight = false;
        }
        
        // Движение вправо (только если не уперлись в стену слева)
        if (controls.isActionPressed('right') && !(this.isAgainstWall && this.wallDirection === -1)) {
            this.velX = this.currentSpeed;
            this.facingRight = true;
        }
        
        // Прыжок - ФИКСИРОВАННАЯ сила, не зависим от deltaTime
        if (controls.isActionPressed('jump') && this.onGround && this.jumpCooldown === 0 && this.canJump) {
            this.velY = this.JUMP_FORCE;
            this.isJumping = true;
            this.onGround = false;
            this.jumpCooldown = 10; // Уменьшил кулдаун
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
        
        // Применяем гравитацию - ФИКСИРОВАННАЯ, не зависим от deltaTime
        this.velY += this.GRAVITY;
        
        // Обновляем позицию
        this.x += this.velX;
        this.y += this.velY;
        
        // Проверка столкновений с платформами
        this.checkCollisions(platforms);
        
        // Ограничение по границам экрана
        this.constrainToBounds();
        
        // Обновляем анимации с deltaTime (только для анимаций это нормально)
        this.updateAnimations(deltaTime);
    }
    
    checkCollisions(platforms) {
        this.onGround = false;
        this.isAgainstWall = false;
        this.wallDirection = 0;
        
        for (const platform of platforms) {
            // Проверяем пересечение по осям
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                
                // Вычисляем глубины проникновения с каждой стороны
                const overlapLeft = (this.x + this.width) - platform.x;
                const overlapRight = (platform.x + platform.width) - this.x;
                const overlapTop = (this.y + this.height) - platform.y;
                const overlapBottom = (platform.y + platform.height) - this.y;
                
                // Находим минимальное перекрытие
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                
                // Разрешаем коллизию в зависимости от стороны с минимальным перекрытием
                if (minOverlap === overlapTop && this.velY > 0) {
                    // Столкновение сверху (игрок падает на платформу)
                    this.y = platform.y - this.height;
                    this.velY = 0;
                    this.onGround = true;
                    this.isJumping = false;
                }
                else if (minOverlap === overlapBottom && this.velY < 0) {
                    // Столкновение снизу (игрок ударяется головой)
                    this.y = platform.y + platform.height;
                    this.velY = 0;
                }
                else if (minOverlap === overlapLeft && this.velX > 0) {
                    // Столкновение справа
                    this.x = platform.x - this.width;
                    this.velX = 0;
                    this.isAgainstWall = true;
                    this.wallDirection = 1;
                }
                else if (minOverlap === overlapRight && this.velX < 0) {
                    // Столкновение слева
                    this.x = platform.x + platform.width;
                    this.velX = 0;
                    this.isAgainstWall = true;
                    this.wallDirection = -1;
                }
            }
        }
    }
    
    constrainToBounds() {
        if (this.x < 0) {
            this.x = 0;
            this.velX = 0;
            this.isAgainstWall = true;
            this.wallDirection = -1;
        }
        if (this.x + this.width > 1280) {
            this.x = 1280 - this.width;
            this.velX = 0;
            this.isAgainstWall = true;
            this.wallDirection = 1;
        }
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
        
        // Обновляем кадр анимации (только анимации используют deltaTime)
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