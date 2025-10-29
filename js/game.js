// Основной игровой цикл
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.loading = document.getElementById('loading');
        this.progressBar = document.getElementById('progress-bar');
        this.startScreen = document.getElementById('start-screen');
        this.rotateScreen = document.getElementById('rotate-screen');
        
        this.images = {};
        this.platforms = [
            { x: 0, y: 656, width: 1280, height: 64, type: 'ground' },
            { x: 300, y: 500, width: 200, height: 20, type: 'platform' },
            { x: 600, y: 400, width: 200, height: 20, type: 'platform' },
            { x: 200, y: 300, width: 150, height: 20, type: 'platform' },
            { x: 500, y: 200, width: 150, height: 20, type: 'platform' },
            { x: 800, y: 350, width: 200, height: 20, type: 'platform' }
        ];
        
        this.lastTime = 0;
        this.gameStarted = false;
        this.gameActive = false;
        this.isMobile = this.checkIfMobile();
        
        // Центрируем игровой контейнер
        this.centerGameContainer();
        
        // Настраиваем обработчик ориентации
        this.setupOrientationHandler();
        
        // Показываем соответствующий экран в зависимости от устройства и ориентации
        this.showAppropriateScreen();
        
        this.loadImages();
        
        // Обработчик изменения размера окна
        window.addEventListener('resize', () => {
            this.centerGameContainer();
            this.handleOrientationChange();
        });
        
        // Обработчик изменения ориентации
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
    }
    
    checkIfMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    }
    
    setupOrientationHandler() {
        // Также проверяем resize для детекции ориентации
        window.addEventListener('resize', () => {
            this.handleOrientationChange();
        });
    }
    
    handleOrientationChange() {
        if (this.isMobile) {
            const isLandscape = window.innerWidth > window.innerHeight;
            
            if (isLandscape) {
                // Ландшафтная ориентация - скрываем экран поворота
                if (this.rotateScreen) {
                    this.rotateScreen.style.display = 'none';
                }
                if (this.loading) {
                    this.loading.style.display = 'block';
                }
                // Показываем игровой контейнер
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) {
                    gameContainer.style.display = 'block';
                }
                // Меняем фон body
                document.body.style.background = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)';
            } else {
                // Портретная ориентация - показываем экран поворота
                if (this.rotateScreen) {
                    this.rotateScreen.style.display = 'flex';
                }
                if (this.loading) {
                    this.loading.style.display = 'none';
                }
                // Скрываем игровой контейнер
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) {
                    gameContainer.style.display = 'none';
                }
                // Меняем фон body на черный
                document.body.style.background = '#000';
            }
        }
    }
    
    showAppropriateScreen() {
        if (this.isMobile) {
            const isLandscape = window.innerWidth > window.innerHeight;
            
            if (isLandscape) {
                // Ландшафтная ориентация - показываем загрузку
                this.loading.style.display = 'block';
                this.rotateScreen.style.display = 'none';
                document.body.style.background = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)';
            } else {
                // Портретная ориентация - показываем экран поворота
                this.loading.style.display = 'none';
                this.rotateScreen.style.display = 'flex';
                document.body.style.background = '#000';
            }
        } else {
            // Десктоп - сразу показываем загрузку
            this.loading.style.display = 'block';
            this.rotateScreen.style.display = 'none';
            document.body.style.background = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)';
        }
    }
    
    centerGameContainer() {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.margin = 'auto';
        }
    }
    
    setupStartScreen() {
        this.startScreen.addEventListener('click', () => {
            this.startGame();
        });
    }
    
    checkMobileDevice() {
        if (this.isMobile) {
            console.log("Мобильное устройство обнаружено");
            // Скрываем обычную кнопку настроек на мобильных
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
            
            // Проверяем мобильное устройство
            this.checkMobileDevice();
            
            audioManager.playBackgroundMusic();
            console.log("Игра началась! Музыка запущена.");
            
            // Перезапускаем игрока на стартовую позицию
            player.x = 200;
            player.y = 500;
            player.velX = 0;
            player.velY = 0;
            player.onGround = false;
            player.isJumping = false;
            
            // Очищаем эффекты
            effectsManager.clearEffects();
        }
    }
    
    loadImages() {
        const imageSources = {
            'idle': 'images/player/idle.png',
            'move1': 'images/player/move1.png',
            'move2': 'images/player/move2.png',
            'run1': 'images/player/run1.png',
            'run2': 'images/player/run2.png',
            
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
            
            'wall': 'images/environment/wall.png',
            'grass': 'images/environment/grass.png',
            'platform': 'images/environment/platform.png'
        };
        
        let loaded = 0;
        const total = Object.keys(imageSources).length;
        
        // Проверяем ориентацию перед началом загрузки
        if (this.isMobile) {
            const isLandscape = window.innerWidth > window.innerHeight;
            if (!isLandscape) {
                console.log("Ожидаем ландшафтную ориентацию для загрузки ресурсов");
                return; // Не загружаем ресурсы пока телефон не перевернут
            }
        }
        
        for (const [key, src] of Object.entries(imageSources)) {
            this.images[key] = new Image();
            this.images[key].onload = () => {
                loaded++;
                const progress = (loaded / total) * 100;
                this.progressBar.style.width = `${progress}%`;
                this.loading.querySelector('div').textContent = `ЗАГРУЗКА РЕСУРСОВ... ${Math.round(progress)}%`;
                
                if (loaded === total) {
                    setTimeout(() => {
                        // Скрываем белый экран загрузки
                        this.loading.style.display = 'none';
                        // Показываем черный стартовый экран
                        this.startScreen.style.display = 'flex';
                        this.gameStarted = true;
                        this.setupStartScreen();
                        this.gameLoop();
                        console.log("Все ресурсы загружены, ожидаем клика для начала игры");
                    }, 500);
                }
            };
            this.images[key].src = src;
            
            this.images[key].onerror = () => {
                this.createPixelSprite(key);
                loaded++;
                const progress = (loaded / total) * 100;
                this.progressBar.style.width = `${progress}%`;
                this.loading.querySelector('div').textContent = `ЗАГРУЗКА РЕСУРСОВ... ${Math.round(progress)}%`;
                
                if (loaded === total) {
                    setTimeout(() => {
                        // Скрываем белый экран загрузки
                        this.loading.style.display = 'none';
                        // Показываем черный стартовый экран
                        this.startScreen.style.display = 'flex';
                        this.gameStarted = true;
                        this.setupStartScreen();
                        this.gameLoop();
                        console.log("Все ресурсы загружены (с запасными спрайтами), ожидаем клика для начала игры");
                    }, 500);
                }
            };
        }
    }
    
    createPixelSprite(key) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 64;
        tempCanvas.height = 64;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingEnabled = false;
        
        if (key.includes('idle') || key.includes('move') || key.includes('run')) {
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
        } else if (key === 'grass') {
            tempCtx.fillStyle = '#27ae60';
            tempCtx.fillRect(0, 0, 64, 10);
            
            tempCtx.fillStyle = '#2ecc71';
            for (let i = 0; i < 64; i += 4) {
                const height = 4 + Math.floor(Math.random() * 4);
                tempCtx.fillRect(i, 10 - height, 3, height);
            }
        } else if (key === 'platform') {
            tempCtx.fillStyle = '#7f8c8d';
            tempCtx.fillRect(0, 0, 64, 20);
            
            tempCtx.fillStyle = '#95a5a6';
            tempCtx.fillRect(0, 0, 64, 3);
        }
        
        this.images[key] = tempCanvas;
    }
    
    drawPlatforms() {
        for (const platform of this.platforms) {
            if (platform.type === 'ground') {
                this.ctx.drawImage(this.images.wall, platform.x, platform.y, 64, 64);
                this.ctx.drawImage(this.images.grass, platform.x, platform.y - 10, 64, 10);
                
                const middleWidth = platform.width - 128;
                for (let x = platform.x + 64; x < platform.x + 64 + middleWidth; x += 64) {
                    const width = Math.min(64, platform.x + platform.width - x);
                    this.ctx.drawImage(this.images.wall, x, platform.y, width, 64);
                    this.ctx.drawImage(this.images.grass, x, platform.y - 10, width, 10);
                }
                
                this.ctx.drawImage(this.images.wall, platform.x + platform.width - 64, platform.y, 64, 64);
                this.ctx.drawImage(this.images.grass, platform.x + platform.width - 64, platform.y - 10, 64, 10);
            } else {
                this.ctx.drawImage(this.images.platform, platform.x, platform.y, platform.width, platform.height);
            }
        }
    }
    
    gameLoop(timestamp = 0) {
        const deltaTime = timestamp - this.lastTime || 0;
        this.lastTime = timestamp;
        
        gamepadManager.update();
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Всегда рисуем платформы
        this.drawPlatforms();
        
        // Обновляем игру только если она активна
        if (this.gameActive) {
            player.update(this.platforms);
            player.updateAnimations(deltaTime);
            effectsManager.updateEffects(deltaTime, player);
        }
        
        // Всегда рисуем игрока (даже если игра не активна)
        player.draw(this.ctx, this.images);
        
        // Всегда рисуем эффекты
        effectsManager.drawEffects(this.ctx, this.images);
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Создаем глобальную переменную для доступа к состоянию игры
let gameInstance = null;

window.addEventListener('load', () => {
    gameInstance = new Game();
});