// Фоновая музыка
class AudioManager {
    constructor() {
        this.backgroundMusic = new Audio('audio/background-music.mp3');
        this.gameOverMusic = new Audio('audio/gameover.mp3');
        this.backgroundMusic.loop = true;
        this.gameOverMusic.loop = true;
        this.backgroundMusic.volume = 0.3;
        this.gameOverMusic.volume = 0.3;
        this.isPlaying = false;
        this.currentMusic = null;
        this.audioContext = null;
        
        this.setupAudioContext();
        this.setupVisibilityHandler();
    }

    setupAudioContext() {
        // Создаем AudioContext для лучшего контроля
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log("Web Audio API не поддерживается");
        }
    }

    setupVisibilityHandler() {
        // Останавливаем музыку когда страница не активна
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseMusic();
            } else if (this.isPlaying) {
                this.resumeMusic();
            }
        });

        // Останавливаем музыку при закрытии/переходе
        window.addEventListener('beforeunload', () => {
            this.stopMusic();
        });

        // Останавливаем музыку когда страница выгружается
        window.addEventListener('pagehide', () => {
            this.stopMusic();
        });
    }

    async playBackgroundMusic() {
        if (!this.isPlaying) {
            // На мобильных устройствах требуем взаимодействие пользователя
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.currentMusic = this.backgroundMusic;
            try {
                await this.backgroundMusic.play();
                this.isPlaying = true;
                console.log("Фоновая музыка начала играть");
            } catch (error) {
                console.log("Ошибка воспроизведения музыки:", error);
                // На мобильных устройствах может потребоваться жест пользователя
                if (error.name === 'NotAllowedError') {
                    console.log("Требуется взаимодействие пользователя для воспроизведения аудио");
                }
            }
        }
    }

    async playGameOverMusic() {
        this.stopMusic();
        this.currentMusic = this.gameOverMusic;
        try {
            await this.gameOverMusic.play();
            this.isPlaying = true;
            console.log("Game Over музыка начала играть");
        } catch (error) {
            console.log("Ошибка воспроизведения Game Over музыки:", error);
        }
    }

    pauseMusic() {
        if (this.isPlaying && this.currentMusic) {
            this.currentMusic.pause();
        }
    }

    resumeMusic() {
        if (this.isPlaying && this.currentMusic) {
            this.currentMusic.play().catch(error => {
                console.log("Ошибка возобновления музыки:", error);
            });
        }
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.isPlaying = false;
        }
    }

    fadeOutMusic(duration = 1000) {
        if (this.isPlaying && this.currentMusic) {
            const startVolume = this.currentMusic.volume;
            const fadeOutInterval = 50;
            const steps = duration / fadeOutInterval;
            const stepSize = startVolume / steps;
            
            const fadeOut = setInterval(() => {
                if (this.currentMusic.volume > stepSize) {
                    this.currentMusic.volume -= stepSize;
                } else {
                    this.currentMusic.volume = 0;
                    this.stopMusic();
                    clearInterval(fadeOut);
                }
            }, fadeOutInterval);
        }
    }
}

const audioManager = new AudioManager();