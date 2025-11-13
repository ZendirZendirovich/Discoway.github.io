class Player {
    constructor() {
        this.x = 200;
        this.y = 500;
        this.width = 64;
        this.height = 64;
        this.velX = 0;
        this.velY = 0;
        
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
        this.JUMP_FORCE = -15;
        
        this.isAgainstWall = false;
        this.wallDirection = 0;
        
        this.animations = {
            idle: { frames: 1, currentFrame: 0, frameTime: 0, frameDelay: 200 },
            walk: { frames: 2, currentFrame: 0, frameTime: 0, frameDelay: 200 },
            run: { frames: 2, currentFrame: 0, frameTime: 0, frameDelay: 100 },
            jump: { frames: 1, currentFrame: 0, frameTime: 0, frameDelay: 200 }
        };

        this.lastUpdateTime = performance.now();
    }
    
    isGameActive() {
        return gameInstance && gameInstance.gameActive;
    }
    
    update(platforms) {
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastUpdateTime) / 16.67, 2);
        this.lastUpdateTime = currentTime;

        if (document.getElementById('settings-modal').style.display === 'block' || !this.isGameActive()) {
            this.velX = 0;
            this.currentSpeed = 0;
            
            if (!this.onGround) {
                this.velY += this.GRAVITY;
                this.y += this.velY;
                this.checkCollisions(platforms);
            }
            return;
        }
        
        this.velX = 0;
        
        if (this.jumpCooldown > 0) {
            this.jumpCooldown--;
        }
        
        if (!controls.isActionPressed('jump')) {
            this.canJump = true;
        }
        
        if (controls.isActionPressed('jump') && this.onGround && this.jumpCooldown === 0 && this.canJump) {
            this.velY = this.JUMP_FORCE;
            this.isJumping = true;
            this.onGround = false;
            this.jumpCooldown = 10;
            this.canJump = false;
            
            effectsManager.activateEffect(
                'jump',
                this.x,
                this.y,
                this.facingRight,
                this.width
            );
        }
        
        const wantsToRun = controls.isActionPressed('run');
        const isMoving = controls.isActionPressed('left') || controls.isActionPressed('right');
        
        if (isMoving) {
            const targetSpeed = wantsToRun ? this.maxRunSpeed : this.maxWalkSpeed;
            this.currentSpeed = Math.min(this.currentSpeed + this.acceleration, targetSpeed);
            this.isRunning = this.currentSpeed >= this.maxRunSpeed * 0.8;
        } else {
            this.currentSpeed = Math.max(this.currentSpeed - this.acceleration * 2, 0);
            this.isRunning = false;
        }
        
        if (controls.isActionPressed('left') && !(this.isAgainstWall && this.wallDirection === 1)) {
            this.velX = -this.currentSpeed;
            this.facingRight = false;
        }
        
        if (controls.isActionPressed('right') && !(this.isAgainstWall && this.wallDirection === -1)) {
            this.velX = this.currentSpeed;
            this.facingRight = true;
        }
        
        this.velY += this.GRAVITY;
        
        this.x += this.velX;
        this.y += this.velY;
        
        this.checkCollisions(platforms);
        
        this.constrainToBounds();
        
        this.updateAnimations(deltaTime);
    }
    
    checkCollisions(platforms) {
        this.onGround = false;
        this.isAgainstWall = false;
        this.wallDirection = 0;
        
        for (const platform of platforms) {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                
                const overlapLeft = (this.x + this.width) - platform.x;
                const overlapRight = (platform.x + platform.width) - this.x;
                const overlapTop = (this.y + this.height) - platform.y;
                const overlapBottom = (platform.y + platform.height) - this.y;
                
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                
                if (minOverlap === overlapTop && this.velY > 0) {
                    this.y = platform.y - this.height;
                    this.velY = 0;
                    this.onGround = true;
                    this.isJumping = false;
                }
                else if (minOverlap === overlapBottom && this.velY < 0) {
                    this.y = platform.y + platform.height;
                    this.velY = 0;
                }
                else if (minOverlap === overlapLeft && this.velX > 0) {
                    this.x = platform.x - this.width;
                    this.velX = 0;
                    this.isAgainstWall = true;
                    this.wallDirection = 1;
                }
                else if (minOverlap === overlapRight && this.velX < 0) {
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
        if (this.x + this.width > 2560) {
            this.x = 2560 - this.width;
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
        let currentAnim;
        
        if (this.isJumping) {
            currentAnim = this.animations.jump;
        } else if (this.velX !== 0) {
            currentAnim = this.isRunning ? this.animations.run : this.animations.walk;
        } else {
            currentAnim = this.animations.idle;
        }
        
        currentAnim.frameTime += deltaTime;
        if (currentAnim.frameTime >= currentAnim.frameDelay) {
            currentAnim.frameTime = 0;
            currentAnim.currentFrame = (currentAnim.currentFrame + 1) % currentAnim.frames;
        }
    }
    
    draw(ctx, images, camera) {
        let sprite;
        
        if (!this.onGround && this.velY > 0) {
            sprite = images.fall;
        }
        else if (this.isJumping) {
            if (this.velX !== 0) {
                const anim = this.isRunning ? this.animations.run : this.animations.walk;
                sprite = this.isRunning ? 
                    (anim.currentFrame === 0 ? images.run1 : images.run2) :
                    (anim.currentFrame === 0 ? images.move1 : images.move2);
            } else {
                sprite = images.idle;
            }
        } else if (this.velX !== 0) {
            if (this.isRunning) {
                sprite = this.animations.run.currentFrame === 0 ? images.run1 : images.run2;
            } else {
                sprite = this.animations.walk.currentFrame === 0 ? images.move1 : images.move2;
            }
        } else {
            sprite = images.idle;
        }
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        if (screenX + this.width > 0 && screenX < camera.width && 
            screenY + this.height > 0 && screenY < camera.height) {
            
            if (!this.facingRight) {
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(sprite, -screenX - this.width, screenY, this.width, this.height);
                ctx.restore();
            } else {
                ctx.drawImage(sprite, screenX, screenY, this.width, this.height);
            }
        }
    }
}

const player = new Player();