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
        
        this.loadControls();
        this.setupEventListeners();
        this.setupMobileControls();
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
    
    setupMobileControls() {
        const leftBtn = document.getElementById('mobile-left');
        const rightBtn = document.getElementById('mobile-right');
        const runBtn = document.getElementById('mobile-run');
        const jumpBtn = document.getElementById('mobile-jump');
        const settingsBtn = document.getElementById('mobile-settings');
        const closeMobileSettings = document.getElementById('close-mobile-settings');
        const mobileSettingsModal = document.getElementById('mobile-settings-modal');
        
        if (runBtn) runBtn.innerHTML = '🏃‍♂️';
        if (jumpBtn) jumpBtn.innerHTML = '⬆️';
        
        if (leftBtn) {
            leftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileButtons.left = true;
            });
            
            leftBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileButtons.left = false;
            });
            
            leftBtn.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.mobileButtons.left = false;
            });
            
            leftBtn.addEventListener('mousedown', () => this.mobileButtons.left = true);
            leftBtn.addEventListener('mouseup', () => this.mobileButtons.left = false);
            leftBtn.addEventListener('mouseleave', () => this.mobileButtons.left = false);
        }
        
        if (rightBtn) {
            rightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileButtons.right = true;
            });
            
            rightBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileButtons.right = false;
            });
            
            rightBtn.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.mobileButtons.right = false;
            });
            
            rightBtn.addEventListener('mousedown', () => this.mobileButtons.right = true);
            rightBtn.addEventListener('mouseup', () => this.mobileButtons.right = false);
            rightBtn.addEventListener('mouseleave', () => this.mobileButtons.right = false);
        }
        
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
        
        return keyboardPressed || mobilePressed || gamepadPressed;
    }
}

const controls = new Controls();