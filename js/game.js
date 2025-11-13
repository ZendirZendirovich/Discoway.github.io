class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.loading = document.getElementById('loading');
        this.progressBar = document.getElementById('progress-bar');
        this.startScreen = document.getElementById('start-screen');
        this.rotateScreen = document.getElementById('rotate-screen');
        
        this.images = {};
        
        this.currentLevel = new TestLevel();
        
        this.roomWidth = this.currentLevel.roomWidth;
        this.roomHeight = this.currentLevel.roomHeight;
        this.platforms = this.currentLevel.getPlatforms();
        
        this.canvas.width = 1280;
        this.canvas.height = 720;
        
        this.camera = {
            x: 0,
            y: 0,
            width: 1280,
            height: 720,
            followSpeed: this.currentLevel.getSettings().cameraFollowSpeed,
            offsetX: 640,
            offsetY: 360
        };
        
        this.lastTime = 0;
        this.gameStarted = false;
        this.gameActive = false;
        this.isMobile = this.checkIfMobile();
        this.imagesLoaded = false;

        this.light = {
            x: 1100,
            y: 50,
            radius: 500,
            intensity: 0.7
        };
        
        this.centerGameContainer();
        this.setupOrientationHandler();
        this.showAppropriateScreen();
        
        if (!this.isMobile || this.isLandscape()) {
            this.loadImages();
        }
        
        window.addEventListener('resize', () => {
            this.centerGameContainer();
            this.handleOrientationChange();
        });
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
    }
    
    loadLevel(LevelClass) {
        this.currentLevel = new LevelClass();
        this.roomWidth = this.currentLevel.roomWidth;
        this.roomHeight = this.currentLevel.roomHeight;
        this.platforms = this.currentLevel.getPlatforms();
        
        this.camera.followSpeed = this.currentLevel.getSettings().cameraFollowSpeed;
        
        const startPos = this.currentLevel.getPlayerStart();
        player.x = startPos.x;
        player.y = startPos.y;
        player.velX = 0;
        player.velY = 0;
        player.onGround = false;
        player.isJumping = false;
        
        const settings = this.currentLevel.getSettings();
        player.GRAVITY = settings.gravity;
        player.JUMP_FORCE = settings.jumpForce;
        
        this.camera.x = player.x - this.camera.offsetX;
        this.camera.y = player.y - this.camera.offsetY;
        this.constrainCamera();
        
        effectsManager.clearEffects();
    }
    
    checkIfMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ||
               window.innerWidth <= 1024;
    }
    
    isLandscape() {
        return window.innerWidth > window.innerHeight;
    }
    
    setupOrientationHandler() {
        window.addEventListener('resize', () => {
            this.handleOrientationChange();
        });
    }
    
    handleOrientationChange() {
        if (this.isMobile) {
            const isLandscape = this.isLandscape();
            
            if (isLandscape) {
                if (this.rotateScreen) {
                    this.rotateScreen.style.display = 'none';
                }
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) {
                    gameContainer.style.display = 'block';
                }
                document.body.style.background = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)';
                
                if (!this.imagesLoaded) {
                    this.loading.style.display = 'block';
                    this.loadImages();
                }
            } else {
                if (this.rotateScreen) {
                    this.rotateScreen.style.display = 'flex';
                }
                if (this.loading) {
                    this.loading.style.display = 'none';
                }
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) {
                    gameContainer.style.display = 'none';
                }
                document.body.style.background = '#000';
            }
        }
    }
    
    showAppropriateScreen() {
        if (this.isMobile) {
            const isLandscape = this.isLandscape();
            
            if (isLandscape) {
                this.loading.style.display = 'block';
                this.rotateScreen.style.display = 'none';
                document.body.style.background = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)';
            } else {
                this.loading.style.display = 'none';
                this.rotateScreen.style.display = 'flex';
                document.body.style.background = '#000';
            }
        } else {
            this.loading.style.display = 'block';
            this.rotateScreen.style.display = 'none';
            document.body.style.background = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)';
        }
    }
    
    centerGameContainer() {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.margin = 'auto';
            gameContainer.style.position = 'relative';
            gameContainer.style.left = 'auto';
            gameContainer.style.right = 'auto';
            gameContainer.style.top = 'auto';
            gameContainer.style.bottom = 'auto';
        }
    }
    
    setupStartScreen() {
        this.startScreen.addEventListener('click', () => {
            this.startGame();
        });
    }
    
    checkMobileDevice() {
        if (this.isMobile) {
            const settingsBtn = document.getElementById('settings-btn');
            if (settingsBtn) {
                settingsBtn.style.display = 'none';
            }
        }
    }
    
    startGame() {
        if (!this.gameActive && this.gameStarted) {
            this.gameActive = true;
            this.startScreen.style.display = 'none';
            
            this.checkMobileDevice();
            
            audioManager.playBackgroundMusic();
            
            const startPos = this.currentLevel.getPlayerStart();
            player.x = startPos.x;
            player.y = startPos.y;
            player.velX = 0;
            player.velY = 0;
            player.onGround = false;
            player.isJumping = false;
            
            const settings = this.currentLevel.getSettings();
            player.GRAVITY = settings.gravity;
            player.JUMP_FORCE = settings.jumpForce;
            
            this.camera.x = player.x - this.camera.offsetX;
            this.camera.y = player.y - this.camera.offsetY;
            
            this.constrainCamera();
            
            effectsManager.clearEffects();
        }
    }
    
    updateCamera() {
        if (!this.gameActive) return;
        
        const targetX = player.x - this.camera.offsetX;
        const targetY = player.y - this.camera.offsetY;
        
        this.camera.x += (targetX - this.camera.x) * this.camera.followSpeed;
        this.camera.y += (targetY - this.camera.y) * this.camera.followSpeed;
        
        this.constrainCamera();
    }
    
    constrainCamera() {
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.roomWidth - this.camera.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.roomHeight - this.camera.height));
    }
    
    worldToScreen(x, y) {
        return {
            x: x - this.camera.x,
            y: y - this.camera.y
        };
    }
    
    loadImages() {
        const imageSources = {
            'idle': 'images/player/idle.png',
            'move1': 'images/player/move1.png',
            'move2': 'images/player/move2.png',
            'run1': 'images/player/run1.png',
            'run2': 'images/player/run2.png',
            'fall': 'images/player/fall.png',
            
            'moveef1': 'images/effects/moveef1.png',
            'moveef2': 'images/effects/moveef2.png',
            'moveef3': 'images/effects/moveef3.png',
            'moveef4': 'images/effects/moveef4.png',
            'moveef5': 'images/effects/moveef5.png',
            'moveef6': 'images/effects/moveef6.png',
            
            'runef1': 'images/effects/runef1.png',
            'runef2': 'images/effects/runef2.png',
            
            'jumpef1': 'images/effects/jumpef1.png',
            'jumpef2': 'images/effects/jumpef2.png',
            'jumpef3': 'images/effects/jumpef3.png',
            'jumpef4': 'images/effects/jumpef4.png',
            'jumpef5': 'images/effects/jumpef5.png',
            
            'wall': 'images/environment/wall.png'
        };
        
        let loaded = 0;
        const total = Object.keys(imageSources).length;
        
        for (const [key, src] of Object.entries(imageSources)) {
            this.images[key] = new Image();
            this.images[key].onload = () => {
                loaded++;
                const progress = (loaded / total) * 100;
                if (this.progressBar) {
                    this.progressBar.style.width = `${progress}%`;
                }
                if (this.loading) {
                    const loadingText = this.loading.querySelector('div');
                    if (loadingText) {
                        loadingText.textContent = `ЗАГРУЗКА РЕСУРСОВ... ${Math.round(progress)}%`;
                    }
                }
                
                if (loaded === total) {
                    this.imagesLoaded = true;
                    setTimeout(() => {
                        if (this.loading) {
                            this.loading.style.display = 'none';
                        }
                        if (this.startScreen) {
                            this.startScreen.style.display = 'flex';
                        }
                        this.gameStarted = true;
                        this.setupStartScreen();
                        this.gameLoop();
                    }, 500);
                }
            };
            
            this.images[key].onerror = () => {
                this.createPixelSprite(key);
                loaded++;
                const progress = (loaded / total) * 100;
                if (this.progressBar) {
                    this.progressBar.style.width = `${progress}%`;
                }
                if (this.loading) {
                    const loadingText = this.loading.querySelector('div');
                    if (loadingText) {
                        loadingText.textContent = `ЗАГРУЗКА РЕСУРСОВ... ${Math.round(progress)}%`;
                    }
                }
                
                if (loaded === total) {
                    this.imagesLoaded = true;
                    setTimeout(() => {
                        if (this.loading) {
                            this.loading.style.display = 'none';
                        }
                        if (this.startScreen) {
                            this.startScreen.style.display = 'flex';
                        }
                        this.gameStarted = true;
                        this.setupStartScreen();
                        this.gameLoop();
                    }, 500);
                }
            };
            
            this.images[key].src = src;
        }
    }
    
    createPixelSprite(key) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 64;
        tempCanvas.height = 64;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingEnabled = false;
        
        if (key.includes('idle') || key.includes('move') || key.includes('run') || key === 'fall') {
            tempCtx.fillStyle = '#3498db';
            tempCtx.fillRect(0, 0, 64, 64);
            
            tempCtx.fillStyle = '#2980b9';
            tempCtx.fillRect(16, 16, 32, 32);
            
            tempCtx.fillStyle = '#2980b9';
            tempCtx.fillRect(24, 8, 16, 16);
            
            if (key.includes('move1') || key.includes('run1')) {
                tempCtx.fillStyle = '#2980b9';
                tempCtx.fillRect(12, 48, 12, 16);
                tempCtx.fillRect(40, 48, 12, 16);
            } else if (key.includes('move2') || key.includes('run2')) {
                tempCtx.fillStyle = '#2980b9';
                tempCtx.fillRect(16, 48, 12, 16);
                tempCtx.fillRect(36, 48, 12, 16);
            }
        } else if (key.includes('ef')) {
            const colors = {
                'move': ['#f1c40f', '#f39c12'],
                'run': ['#e74c3c', '#c0392b'],
                'jump': ['#2ecc71', '#27ae60']
            };
            
            let colorSet;
            if (key.includes('move')) colorSet = colors.move;
            else if (key.includes('run')) colorSet = colors.run;
            else colorSet = colors.jump;
            
            tempCtx.fillStyle = colorSet[0];
            tempCtx.fillRect(0, 0, 64, 64);
            
            tempCtx.fillStyle = colorSet[1];
            for (let i = 0; i < 8; i++) {
                const x = Math.floor(Math.random() * 56) + 4;
                const y = Math.floor(Math.random() * 56) + 4;
                const size = Math.floor(Math.random() * 8) + 4;
                tempCtx.fillRect(x, y, size, size);
            }
        } else if (key === 'wall') {
            tempCtx.fillStyle = '#8B4513';
            tempCtx.fillRect(0, 0, 64, 64);
            
            tempCtx.fillStyle = '#A0522D';
            for (let i = 0; i < 64; i += 16) {
                for (let j = 0; j < 64; j += 8) {
                    if ((i/16 + j/8) % 2 === 0) {
                        tempCtx.fillRect(i, j, 14, 6);
                    }
                }
            }
        }
        
        this.images[key] = tempCanvas;
    }
    
    drawSun() {
        const gradient = this.ctx.createRadialGradient(
            this.light.x, this.light.y, 0,
            this.light.x, this.light.y, this.light.radius
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 150, 1)');
        gradient.addColorStop(0.1, 'rgba(255, 230, 100, 0.9)');
        gradient.addColorStop(0.3, 'rgba(255, 200, 80, 0.7)');
        gradient.addColorStop(0.5, 'rgba(255, 180, 60, 0.5)');
        gradient.addColorStop(0.7, 'rgba(255, 150, 40, 0.3)');
        gradient.addColorStop(0.9, 'rgba(255, 120, 20, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.light.x, this.light.y, this.light.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    drawShadows() {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';
        
        let closestPlatform = null;
        let minDistance = Infinity;
        
        for (const platform of this.platforms) {
            const isAbovePlatform = player.x + player.width > platform.x && 
                                  player.x < platform.x + platform.width &&
                                  player.y + player.height <= platform.y;
            
            if (isAbovePlatform) {
                const distanceToPlatform = platform.y - (player.y + player.height);
                if (distanceToPlatform < minDistance) {
                    minDistance = distanceToPlatform;
                    closestPlatform = platform;
                }
            }
        }
        
        if (closestPlatform) {
            const shadowScale = Math.max(0.3, 1 - (minDistance / 200));
            const shadowAlpha = Math.max(0.1, 0.6 - (minDistance / 400));
            
            const shadowWidth = player.width * 0.8 * shadowScale;
            const shadowHeight = 8 * shadowScale;
            
            const shadowX = player.x + (player.width - shadowWidth) / 2;
            const shadowY = closestPlatform.y;
            
            const screenPos = this.worldToScreen(shadowX, shadowY);
            
            this.ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
            
            this.ctx.beginPath();
            this.ctx.ellipse(
                screenPos.x + shadowWidth / 2,
                screenPos.y,
                shadowWidth / 2,
                shadowHeight / 2,
                0, 0, Math.PI * 2
            );
            this.ctx.fill();
        } else {
            const groundLevel = 656;
            const isAboveGround = player.y + player.height <= groundLevel;
            
            if (isAboveGround) {
                const distanceToGround = groundLevel - (player.y + player.height);
                const shadowScale = Math.max(0.3, 1 - (distanceToGround / 300));
                const shadowAlpha = Math.max(0.1, 0.6 - (distanceToGround / 500));
                
                const shadowWidth = player.width * 0.8 * shadowScale;
                const shadowHeight = 10 * shadowScale;
                
                const shadowX = player.x + (player.width - shadowWidth) / 2;
                const shadowY = groundLevel;
                
                const screenPos = this.worldToScreen(shadowX, shadowY);
                
                this.ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
                
                this.ctx.beginPath();
                this.ctx.ellipse(
                    screenPos.x + shadowWidth / 2,
                    screenPos.y,
                    shadowWidth / 2,
                    shadowHeight / 2,
                    0, 0, Math.PI * 2
                );
                this.ctx.fill();
            }
        }
        
        this.ctx.restore();
    }
    
    drawLighting() {
        const lightingGradient = this.ctx.createRadialGradient(
            this.light.x, this.light.y, 50,
            this.light.x, this.light.y, 800
        );
        
        lightingGradient.addColorStop(0, 'rgba(255, 255, 150, 0.15)');
        lightingGradient.addColorStop(0.3, 'rgba(255, 230, 100, 0.1)');
        lightingGradient.addColorStop(0.6, 'rgba(255, 200, 80, 0.05)');
        lightingGradient.addColorStop(1, 'rgba(255, 180, 60, 0)');
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'overlay';
        this.ctx.fillStyle = lightingGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }
    
    drawSky() {
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(0.7, '#1E90FF');
        skyGradient.addColorStop(1, '#4682B4');
        
        this.ctx.save();
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }
    
    gameLoop(timestamp = 0) {
        const deltaTime = timestamp - this.lastTime || 0;
        this.lastTime = timestamp;
        
        gamepadManager.update();
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateCamera();
        
        this.drawSky();
        
        this.currentLevel.drawPlatforms(this.ctx, this.camera, this.worldToScreen.bind(this), this.images);
        
        this.drawShadows();
        
        if (this.gameActive) {
            player.update(this.platforms);
            player.updateAnimations(deltaTime);
            effectsManager.updateEffects(deltaTime, player);
        }
        
        player.draw(this.ctx, this.images, this.camera);
        effectsManager.drawEffects(this.ctx, this.images, this.camera);
        
        this.drawLighting();
        
        this.drawSun();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

let gameInstance = null;

window.addEventListener('load', () => {
    gameInstance = new Game();
});