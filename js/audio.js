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
    }

    playBackgroundMusic() {
        if (!this.isPlaying) {
            this.currentMusic = this.backgroundMusic;
            this.backgroundMusic.play().then(() => {
                this.isPlaying = true;
                console.log("Фоновая музыка начала играть");
            }).catch(error => {
                console.log("Ошибка воспроизведения музыки:", error);
            });
        }
    }

    playGameOverMusic() {
        this.stopMusic();
        this.currentMusic = this.gameOverMusic;
        this.gameOverMusic.play().then(() => {
            this.isPlaying = true;
            console.log("Game Over музыка начала играть");
        }).catch(error => {
            console.log("Ошибка воспроизведения Game Over музыки:", error);
        });
    }

    stopMusic() {
        if (this.isPlaying && this.currentMusic) {
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