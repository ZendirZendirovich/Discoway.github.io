// Управление игрой
class Controls {
    constructor() {
        this.settings = {
            left: 'ArrowLeft',
            right: 'ArrowRight',
            run: 'Shift',
            jump: 'Space'
        };
        
        this.keys = {};
        this.listeningInput = null;
        this.mobileButtons = {
            left: false,
            right: false,
            run: false,
            jump: false
        };
        
        this.joystickActive = false;
        this.joystickDirection = 0; // -1: left, 0: neutral, 1: right
        
        this.loadControls();
        this.setupEventListeners();
        this.setupMobileControls();
        this.setupJoystick();
    }
    
    loadControls() {
        const savedControls = localStorage.getItem('platformerControls');
        if (savedControls) {
            this.settings = JSON.parse(savedControls);
        }
    }
    
    saveControls() {
        localStorage.setItem('platformerControls', JSON.stringify(this.settings));
    }
    
    setupJoystick() {
        const joystickContainer = document.getElementById('joystick-container');
        const joystickHandle = document.getElementById('joystick-handle');
        const joystickBase = document.getElementById('joystick-base');
        
        if (!joystickContainer || !joystickHandle) return;
        
        let baseRect = joystickBase.getBoundingClientRect();
        let baseCenterX = baseRect.left + baseRect.width / 2;
        let baseCenterY = baseRect.top + baseRect.height / 2;
        const maxDistance = baseRect.width / 3;
        
        const updateBasePosition = () => {
            baseRect = joystickBase.getBoundingClientRect();
            baseCenterX = baseRect.left + baseRect.width / 2;
            baseCenterY = baseRect.top + baseRect.height / 2;
        };
        
        const updateJoystick = (clientX, clientY) => {
            updateBasePosition();
            const deltaX = clientX - baseCenterX;
            const distance = Math.abs(deltaX);
            
            if (distance > maxDistance) {
                const direction = deltaX > 0 ? 1 : -1;
                const limitedX = maxDistance * direction;
                joystickHandle.style.transform = `translate(calc(-50% + ${limitedX}px), -50%)`;
                
                // Определяем направление
                this.joystickDirection = direction;
            } else {
                joystickHandle.style.transform = `translate(calc(-50% + ${deltaX}px), -50%)`;
                
                // Определяем направление с небольшим dead zone
                if (deltaX < -15) {
                    this.joystickDirection = -1;
                } else if (deltaX > 15) {
                    this.joystickDirection = 1;
                } else {
                    this.joystickDirection = 0;
                }
            }
            
            joystickHandle.classList.add('active');
        };
        
        const resetJoystick = () => {
            joystickHandle.style.transform = 'translate(-50%, -50%)';
            joystickHandle.classList.remove('active');
            this.joystickDirection = 0;
            this.joystickActive = false;
        };
        
        // Touch events
        joystickContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.joystickActive = true;
            updateJoystick(e.touches[0].clientX, e.touches[0].clientY);
        });
        
        joystickContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.joystickActive) {
                updateJoystick(e.touches[0].clientX, e.touches[0].clientY);
            }
        });
        
        joystickContainer.addEventListener('touchend', (e) => {
            e.preventDefault();
            resetJoystick();
        });
        
        joystickContainer.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            resetJoystick();
        });
        
        // Mouse events for testing
        joystickContainer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.joystickActive = true;
            updateJoystick(e.clientX, e.clientY);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.joystickActive) {
                updateJoystick(e.clientX, e.clientY);
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (this.joystickActive) {
                resetJoystick();
            }
        });

        // Обновляем позицию при ресайзе
        window.addEventListener('resize', () => {
            updateBasePosition();
        });
    }
    
    setupMobileControls() {
        // Находим кнопки только если они существуют
        const runBtn = document.getElementById('mobile-run');
        const jumpBtn = document.getElementById('mobile-jump');
        const settingsBtn = document.getElementById('mobile-settings');
        const closeMobileSettings = document.getElementById('close-mobile-settings');
        const mobileSettingsModal = document.getElementById('mobile-settings-modal');
        
        // Обновляем смайлы кнопок
        if (runBtn) runBtn.innerHTML = '🏃‍♂️';
        if (jumpBtn) jumpBtn.innerHTML = '⬆️';
        
        // Кнопка бега
        if (runBtn) {
            runBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileButtons.run = true;
            });
            
            runBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileButtons.run = false;
            });
            
            runBtn.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.mobileButtons.run = false;
            });
            
            runBtn.addEventListener('mousedown', () => this.mobileButtons.run = true);
            runBtn.addEventListener('mouseup', () => this.mobileButtons.run = false);
            runBtn.addEventListener('mouseleave', () => this.mobileButtons.run = false);
        }
        
        // Кнопка прыжка
        if (jumpBtn) {
            jumpBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileButtons.jump = true;
            });
            
            jumpBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileButtons.jump = false;
            });
            
            jumpBtn.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.mobileButtons.jump = false;
            });
            
            jumpBtn.addEventListener('mousedown', () => this.mobileButtons.jump = true);
            jumpBtn.addEventListener('mouseup', () => this.mobileButtons.jump = false);
            jumpBtn.addEventListener('mouseleave', () => this.mobileButtons.jump = false);
        }
        
        // Кнопка настроек для мобильных
        if (settingsBtn && mobileSettingsModal) {
            settingsBtn.addEventListener('click', () => {
                mobileSettingsModal.style.display = 'block';
            });
        }
        
        if (closeMobileSettings && mobileSettingsModal) {
            closeMobileSettings.addEventListener('click', () => {
                mobileSettingsModal.style.display = 'none';
            });
        }
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const saveBtn = document.getElementById('save-settings');
        const resetBtn = document.getElementById('reset-settings');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                const modal = document.getElementById('settings-modal');
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                } else {
                    this.updateControlInputs();
                    modal.style.display = 'block';
                }
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveControls();
                if (settingsModal) settingsModal.style.display = 'none';
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.settings = {
                    left: 'ArrowLeft',
                    right: 'ArrowRight',
                    run: 'Shift',
                    jump: 'Space'
                };
                this.updateControlInputs();
                this.saveControls();
            });
        }
        
        document.querySelectorAll('.key-input').forEach(input => {
            input.addEventListener('click', () => {
                if (this.listeningInput) {
                    this.listeningInput.classList.remove('listening');
                }
                
                this.listeningInput = input;
                input.classList.add('listening');
                input.textContent = 'Нажмите клавишу...';
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (this.listeningInput) {
                const action = this.listeningInput.getAttribute('data-action');
                this.settings[action] = e.key === ' ' ? 'Space' : e.key;
                this.listeningInput.textContent = this.settings[action];
                this.listeningInput.classList.remove('listening');
                this.listeningInput = null;
                e.preventDefault();
            }
        });

        document.addEventListener('click', (e) => {
            const modal = document.getElementById('settings-modal');
            const mobileModal = document.getElementById('mobile-settings-modal');
            
            if (modal && modal.style.display === 'block' && !modal.contains(e.target) && e.target !== settingsBtn) {
                modal.style.display = 'none';
            }
            
            if (mobileModal && mobileModal.style.display === 'block' && !mobileModal.contains(e.target) && e.target.id !== 'mobile-settings') {
                mobileModal.style.display = 'none';
            }
        });
    }
    
    updateControlInputs() {
        document.querySelectorAll('.key-input').forEach(input => {
            const action = input.getAttribute('data-action');
            input.textContent = this.settings[action];
        });
    }
    
    isKeyPressed(action) {
        const key = this.settings[action];
        
        const keyboardPressed = this.keys[key] || 
            (key === 'Shift' && (this.keys['Shift'] || this.keys['ShiftLeft'] || this.keys['ShiftRight'])) ||
            (key === 'Space' && this.keys[' ']);
        
        return keyboardPressed;
    }
    
    isMobileButtonPressed(action) {
        return this.mobileButtons[action] || false;
    }
    
    isJoystickDirection(direction) {
        if (!this.joystickActive) return false;
        return this.joystickDirection === direction;
    }
    
    isActionPressed(action) {
        const keyboardPressed = this.isKeyPressed(action);
        const mobilePressed = this.isMobileButtonPressed(action);
        
        let gamepadPressed = false;
        if (gamepadManager.connected) {
            switch(action) {
                case 'left':
                    gamepadPressed = gamepadManager.getMovement() === -1;
                    break;
                case 'right':
                    gamepadPressed = gamepadManager.getMovement() === 1;
                    break;
                case 'run':
                    gamepadPressed = gamepadManager.isRunning();
                    break;
                case 'jump':
                    gamepadPressed = gamepadManager.isJumping();
                    break;
            }
        }
        
        // Добавляем управление джойстиком
        const joystickPressed = 
            (action === 'left' && this.isJoystickDirection(-1)) ||
            (action === 'right' && this.isJoystickDirection(1));
        
        return keyboardPressed || mobilePressed || gamepadPressed || joystickPressed;
    }
}

const controls = new Controls();