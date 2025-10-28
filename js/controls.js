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
        
        this.loadControls();
        this.setupEventListeners();
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
        
        settingsBtn.addEventListener('click', () => {
            const modal = document.getElementById('settings-modal');
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            } else {
                this.updateControlInputs();
                modal.style.display = 'block';
            }
        });
        
        saveBtn.addEventListener('click', () => {
            this.saveControls();
            settingsModal.style.display = 'none';
        });
        
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
            if (modal.style.display === 'block' && !modal.contains(e.target) && e.target !== settingsBtn) {
                modal.style.display = 'none';
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
    
    isActionPressed(action) {
        const keyboardPressed = this.isKeyPressed(action);
        
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
        
        return keyboardPressed || gamepadPressed;
    }
}

const controls = new Controls();