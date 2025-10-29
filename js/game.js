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
        // Исправленные платформы - убираем пересечения
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
        this.imagesLoaded = false;

        // Настройки освещения - ОЧЕНЬ большое солнце у самого края
        this.light = {
            x: 1180,  // Еще правее, прямо у края
            y: 50,    // Очень высоко
            radius: 400, // ОЧЕНЬ БОЛЬШОЙ радиус
            intensity: 0.9
        };
        
        // Центрируем игровой контейнер
        this.centerGameContainer();
        
        // Настраиваем обработчик ориентации
        this.setupOrientationHandler();
        
        // Показываем соответствующий экран в зависимости от устройства и ориентации
        this.showAppropriateScreen();
        
        // Загружаем изображения только если в ландшафтной ориентации
        if (!this.isMobile || this.isLandscape()) {
            this.loadImages();
        }
        
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
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ||
               window.innerWidth <= 1024;
    }
    
    isLandscape() {
        return window.innerWidth > window.innerHeight;
    }
    
    setupOrientationHandler() {
        // Также проверяем resize для детекции ориентации
        window.addEventListener('resize', () => {
            this.handleOrientationChange();
        });
    }
    
    handleOrientationChange() {
        if (this.isMobile) {
            const isLandscape = this.isLandscape();
            
            if (isLandscape) {
                // Ландшафтная ориентация - скрываем экран поворота
                if (this.rotateScreen) {
                    this.rotateScreen.style.display = 'none';
                }
                // Показываем игровой контейнер
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) {
                    gameContainer.style.display = 'block';
                }
                // Меняем фон body
                document.body.style.background = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)';
                
                // Загружаем изображения если еще не загружены
                if (!this.imagesLoaded) {
                    this.loading.style.display = 'block';
                    this.loadImages();
                }
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
            const isLandscape = this.isLandscape();
            
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
            // Принудительное центрирование
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
            console.log("Мобильное устройство или планшет обнаружено");
            // Скрываем обычную кнопку настроек на мобильных и планшетах
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
        
        console.log("Начинаем загрузку ресурсов...");
        
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
                console.log(`Загружено: ${key} (${loaded}/${total})`);
                
                if (loaded === total) {
                    this.imagesLoaded = true;
                    console.log("Все ресурсы загружены!");
                    setTimeout(() => {
                        // Скрываем белый экран загрузки
                        if (this.loading) {
                            this.loading.style.display = 'none';
                        }
                        // Показываем черный стартовый экран
                        if (this.startScreen) {
                            this.startScreen.style.display = 'flex';
                        }
                        this.gameStarted = true;
                        this.setupStartScreen();
                        this.gameLoop();
                        console.log("Ожидаем клика для начала игры");
                    }, 500);
                }
            };
            
            this.images[key].onerror = () => {
                console.log(`Ошибка загрузки: ${src}, создаем замену`);
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
                        // Скрываем белый экран загрузки
                        if (this.loading) {
                            this.loading.style.display = 'none';
                        }
                        // Показываем черный стартовый экран
                        if (this.startScreen) {
                            this.startScreen.style.display = 'flex';
                        }
                        this.gameStarted = true;
                        this.setupStartScreen();
                        this.gameLoop();
                        console.log("Все ресурсы загружены (с запасными спрайтами)");
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
    
    drawSun() {
        // Рисуем ОЧЕНЬ большое солнце у самого края
        const gradient = this.ctx.createRadialGradient(
            this.light.x, this.light.y, 0,
            this.light.x, this.light.y, this.light.radius
        );
        
        // Мягкие цвета с плавными переходами
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.05, 'rgba(255, 255, 220, 0.95)');
        gradient.addColorStop(0.1, 'rgba(255, 255, 200, 0.9)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 180, 0.8)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 150, 0.6)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 120, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.light.x, this.light.y, this.light.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    drawShadows() {
        // Рисуем только ОДНУ тень от игрока - на ближайшей платформе под ним
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';
        
        let closestPlatform = null;
        let minDistance = Infinity;
        
        // Ищем ближайшую платформу под игроком
        for (const platform of this.platforms) {
            // Проверяем, находится ли игрок над этой платформой
            const isAbovePlatform = player.x + player.width > platform.x && 
                                  player.x < platform.x + platform.width &&
                                  player.y + player.height <= platform.y;
            
            if (isAbovePlatform) {
                const distanceToPlatform = platform.y - (player.y + player.height);
                // Ищем платформу с наименьшим расстоянием (самую близкую)
                if (distanceToPlatform < minDistance) {
                    minDistance = distanceToPlatform;
                    closestPlatform = platform;
                }
            }
        }
        
        // Если нашли платформу под игроком - рисуем тень на ней
        if (closestPlatform) {
            const shadowScale = Math.max(0.3, 1 - (minDistance / 200));
            const shadowAlpha = Math.max(0.1, 0.6 - (minDistance / 400));
            
            const shadowWidth = player.width * 0.8 * shadowScale;
            const shadowHeight = 8 * shadowScale;
            
            const shadowX = player.x + (player.width - shadowWidth) / 2;
            const shadowY = closestPlatform.y;
            
            this.ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
            
            this.ctx.beginPath();
            this.ctx.ellipse(
                shadowX + shadowWidth / 2,
                shadowY,
                shadowWidth / 2,
                shadowHeight / 2,
                0, 0, Math.PI * 2
            );
            this.ctx.fill();
        } else {
            // Если нет платформ под игроком - рисуем тень на земле
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
                
                this.ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
                
                this.ctx.beginPath();
                this.ctx.ellipse(
                    shadowX + shadowWidth / 2,
                    shadowY,
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
        // Создаем градиент для освещения от ОЧЕНЬ большого солнца
        const lightingGradient = this.ctx.createRadialGradient(
            this.light.x, this.light.y, 100,
            this.light.x, this.light.y, 1000
        );
        
        lightingGradient.addColorStop(0, 'rgba(255, 255, 200, 0.25)');
        lightingGradient.addColorStop(0.3, 'rgba(255, 255, 180, 0.15)');
        lightingGradient.addColorStop(0.6, 'rgba(255, 255, 150, 0.08)');
        lightingGradient.addColorStop(1, 'rgba(255, 255, 120, 0)');
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'overlay';
        this.ctx.fillStyle = lightingGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
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
        
        // Рисуем базовые элементы
        this.drawPlatforms();
        
        // Рисуем тень перед игроком и эффектами
        this.drawShadows();
        
        // Обновляем игру только если она активна
        if (this.gameActive) {
            player.update(this.platforms);
            player.updateAnimations(deltaTime);
            effectsManager.updateEffects(deltaTime, player);
        }
        
        // Рисуем игрока и эффекты
        player.draw(this.ctx, this.images);
        effectsManager.drawEffects(this.ctx, this.images);
        
        // Рисуем освещение и солнце поверх всего
        this.drawLighting();
        this.drawSun();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Создаем глобальную переменную для доступа к состоянию игры
let gameInstance = null;

window.addEventListener('load', () => {
    gameInstance = new Game();
});