class GamepadManager {
    constructor() {
        this.gamepads = new Map();
        this.connected = false;
        this.gamepadIndex = null;
        this.buttons = {};
        this.axes = {};
        this.deadZone = 0.3;
        
        this.setupEventListeners();
        this.updateGamepadStatus();
    }
    
    setupEventListeners() {
        window.addEventListener("gamepadconnected", (e) => {
            this.gamepads.set(e.gamepad.index, e.gamepad);
            this.connected = true;
            this.gamepadIndex = e.gamepad.index;
            this.updateGamepadStatus();
        });
        
        window.addEventListener("gamepaddisconnected", (e) => {
            this.gamepads.delete(e.gamepad.index);
            this.connected = this.gamepads.size > 0;
            this.gamepadIndex = this.gamepads.size > 0 ? Array.from(this.gamepads.keys())[0] : null;
            this.updateGamepadStatus();
        });
    }
    
    updateGamepadStatus() {
        const statusElement = document.getElementById('gamepad-status');
        const indicator = document.getElementById('gamepad-indicator');
        
        if (this.connected) {
            statusElement.textContent = 'Подключен';
            statusElement.classList.add('connected');
            indicator.classList.add('connected');
        } else {
            statusElement.textContent = 'Не подключен';
            statusElement.classList.remove('connected');
            indicator.classList.remove('connected');
        }
    }
    
    update() {
        if (!this.connected) return;
        
        const gamepad = navigator.getGamepads()[this.gamepadIndex];
        if (!gamepad) return;
        
        this.buttons = {
            a: gamepad.buttons[0]?.pressed || false,
            b: gamepad.buttons[1]?.pressed || false,
            x: gamepad.buttons[2]?.pressed || false,
            y: gamepad.buttons[3]?.pressed || false,
            lb: gamepad.buttons[4]?.pressed || false,
            rb: gamepad.buttons[5]?.pressed || false,
            lt: gamepad.buttons[6]?.value > 0.5,
            rt: gamepad.buttons[7]?.value > 0.3,
            back: gamepad.buttons[8]?.pressed || false,
            start: gamepad.buttons[9]?.pressed || false,
            leftStick: gamepad.buttons[10]?.pressed || false,
            rightStick: gamepad.buttons[11]?.pressed || false,
            up: gamepad.buttons[12]?.pressed || false,
            down: gamepad.buttons[13]?.pressed || false,
            left: gamepad.buttons[14]?.pressed || false,
            right: gamepad.buttons[15]?.pressed || false
        };
        
        this.axes = {
            leftX: this.applyDeadZone(gamepad.axes[0]),
            leftY: this.applyDeadZone(gamepad.axes[1]),
            rightX: this.applyDeadZone(gamepad.axes[2]),
            rightY: this.applyDeadZone(gamepad.axes[3])
        };
    }
    
    applyDeadZone(value) {
        return Math.abs(value) > this.deadZone ? value : 0;
    }
    
    isButtonPressed(button) {
        return this.buttons[button] || false;
    }
    
    getAxis(axis) {
        return this.axes[axis] || 0;
    }
    
    getMovement() {
        const stickX = this.getAxis('leftX');
        const dpadLeft = this.isButtonPressed('left');
        const dpadRight = this.isButtonPressed('right');
        
        let direction = 0;
        if (stickX < -0.5 || dpadLeft) direction = -1;
        if (stickX > 0.5 || dpadRight) direction = 1;
        
        return direction;
    }
    
    isRunning() {
        return this.isButtonPressed('rt');
    }
    
    isJumping() {
        return this.isButtonPressed('a');
    }
}

const gamepadManager = new GamepadManager();