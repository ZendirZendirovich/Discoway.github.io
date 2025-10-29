// Фоновая музыка
class AudioManager {
    constructor() {
        this.backgroundMusic = new Audio('audio/background-music.mp3');
        this.gameOverMusic = new Audio('audio/gameover.mp3');
        this.backgroundMusic.loop = true;
        this.gameOverMusic.loop = true;
        
        // Настройки громкости
        this.volume = 0.5;
        this.isMuted = false;
        this.isPlaying = false;
        this.currentMusic = null;
        this.audioContext = null;
        
        this.setupAudioContext();
        this.setupVisibilityHandler();
        this.loadVolumeSettings();
        this.updateVolume();
        this.setupMusicControls();
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
            } else if (this.isPlaying && !this.isMuted) {
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

    setupMusicControls() {
        // Кнопки переключения музыки
        const toggleMusicBtn = document.getElementById('toggle-music');
        const mobileToggleMusicBtn = document.getElementById('mobile-toggle-music');
        
        if (toggleMusicBtn) {
            toggleMusicBtn.addEventListener('click', () => {
                this.toggleMute();
            });
        }
        
        if (mobileToggleMusicBtn) {
            mobileToggleMusicBtn.addEventListener('click', () => {
                this.toggleMute();
            });
        }

        // Кнопки громкости для десктопа
        const volumeUp = document.getElementById('volume-up');
        const volumeDown = document.getElementById('volume-down');
        
        if (volumeUp) {
            volumeUp.addEventListener('click', () => {
                this.setVolume(this.volume + 0.1);
            });
        }
        
        if (volumeDown) {
            volumeDown.addEventListener('click', () => {
                this.setVolume(this.volume - 0.1);
            });
        }

        // Кнопки громкости для мобильных
        const mobileVolumeUp = document.getElementById('mobile-volume-up');
        const mobileVolumeDown = document.getElementById('mobile-volume-down');
        
        if (mobileVolumeUp) {
            mobileVolumeUp.addEventListener('click', () => {
                this.setVolume(this.volume + 0.1);
            });
        }
        
        if (mobileVolumeDown) {
            mobileVolumeDown.addEventListener('click', () => {
                this.setVolume(this.volume - 0.1);
            });
        }
    }

    loadVolumeSettings() {
        const savedVolume = localStorage.getItem('gameVolume');
        const savedMute = localStorage.getItem('gameMute');
        
        if (savedVolume !== null) {
            this.volume = parseFloat(savedVolume);
        }
        
        if (savedMute !== null) {
            this.isMuted = savedMute === 'true';
        }
        
        this.updateUI();
    }

    saveVolumeSettings() {
        localStorage.setItem('gameVolume', this.volume.toString());
        localStorage.setItem('gameMute', this.isMuted.toString());
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.updateVolume();
        this.updateUI();
        this.saveVolumeSettings();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateVolume();
        this.updateUI();
        this.saveVolumeSettings();
        
        if (this.isMuted) {
            this.pauseMusic();
        } else if (this.isPlaying) {
            this.resumeMusic();
        }
    }

    updateVolume() {
        const actualVolume = this.isMuted ? 0 : this.volume * 0.3;
        this.backgroundMusic.volume = actualVolume;
        this.gameOverMusic.volume = actualVolume;
    }

    updateUI() {
        // Обновляем кнопки переключения музыки
        const toggleMusicBtn = document.getElementById('toggle-music');
        const mobileToggleMusicBtn = document.getElementById('mobile-toggle-music');
        
        if (toggleMusicBtn) {
            if (this.isMuted) {
                toggleMusicBtn.classList.add('muted');
                toggleMusicBtn.textContent = 'ВЫКЛЮЧЕНО';
            } else {
                toggleMusicBtn.classList.remove('muted');
                toggleMusicBtn.textContent = 'ВКЛЮЧЕНО';
            }
        }
        
        if (mobileToggleMusicBtn) {
            if (this.isMuted) {
                mobileToggleMusicBtn.classList.add('muted');
                mobileToggleMusicBtn.textContent = 'ВЫКЛЮЧЕНО';
            } else {
                mobileToggleMusicBtn.classList.remove('muted');
                mobileToggleMusicBtn.textContent = 'ВКЛЮЧЕНО';
            }
        }
        
        // Обновляем полосы громкости
        const volumeLevel = document.getElementById('volume-level');
        const mobileVolumeLevel = document.getElementById('mobile-volume-level');
        const volumeValue = document.getElementById('volume-value');
        const mobileVolumeValue = document.getElementById('mobile-volume-value');
        
        if (volumeLevel) {
            volumeLevel.style.width = `${this.volume * 100}%`;
        }
        
        if (mobileVolumeLevel) {
            mobileVolumeLevel.style.width = `${this.volume * 100}%`;
        }
        
        if (volumeValue) {
            volumeValue.textContent = `${Math.round(this.volume * 100)}%`;
        }
        
        if (mobileVolumeValue) {
            mobileVolumeValue.textContent = `${Math.round(this.volume * 100)}%`;
        }
    }

    async playBackgroundMusic() {
        if (!this.isPlaying && !this.isMuted) {
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
        if (this.isMuted) return;
        
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
        if (this.isPlaying && this.currentMusic && !this.isMuted) {
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