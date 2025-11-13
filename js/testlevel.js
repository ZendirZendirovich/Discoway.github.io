class TestLevel {
    constructor() {
        this.name = "Тестовый уровень";
        this.roomWidth = 2560;
        this.roomHeight = 720;
        
        this.platforms = [
            { x: 0, y: 656, width: 2560, height: 64, type: 'ground' },
            
            { x: 300, y: 500, width: 200, height: 20, type: 'platform' },
            { x: 200, y: 300, width: 150, height: 20, type: 'platform' },
            { x: 100, y: 400, width: 120, height: 20, type: 'platform' },
            { x: 400, y: 200, width: 180, height: 20, type: 'platform' },
            
            { x: 600, y: 400, width: 200, height: 20, type: 'platform' },
            { x: 800, y: 350, width: 200, height: 20, type: 'platform' },
            { x: 1000, y: 450, width: 150, height: 20, type: 'platform' },
            { x: 1200, y: 300, width: 180, height: 20, type: 'platform' },
            
            { x: 1500, y: 500, width: 200, height: 20, type: 'platform' },
            { x: 1700, y: 350, width: 150, height: 20, type: 'platform' },
            { x: 1900, y: 250, width: 120, height: 20, type: 'platform' },
            { x: 2100, y: 400, width: 180, height: 20, type: 'platform' },
            { x: 2300, y: 300, width: 200, height: 20, type: 'platform' }
        ];
        
        this.playerStart = { x: 200, y: 500 };
        
        this.settings = {
            gravity: 0.5,
            jumpForce: -15,
            cameraFollowSpeed: 0.1
        };
        
        this.colors = {
            platformTop: '#32CD32',
            platformBody: '#8B4513',
            groundLine: '#32CD32'
        };
    }
    
    getPlayerStart() {
        return this.playerStart;
    }
    
    getPlatforms() {
        return this.platforms;
    }
    
    getSettings() {
        return this.settings;
    }
    
    getColors() {
        return this.colors;
    }
    
    drawGround(ctx, camera, worldToScreen, images) {
        const groundPlatform = this.platforms.find(p => p.type === 'ground');
        if (!groundPlatform) return;
        
        const screenPos = worldToScreen(groundPlatform.x, groundPlatform.y);
        const colors = this.getColors();
        
        const tileWidth = 64;
        const tileHeight = 64;
        
        const startTileX = Math.floor(camera.x / tileWidth);
        const endTileX = Math.ceil((camera.x + camera.width) / tileWidth);
        
        for (let tileX = startTileX; tileX < endTileX; tileX++) {
            const worldX = tileX * tileWidth;
            const screenX = worldX - camera.x;
            
            if (worldX >= 0 && worldX < this.roomWidth) {
                ctx.drawImage(images.wall, screenX, screenPos.y, tileWidth, tileHeight);
                
                ctx.fillStyle = colors.groundLine;
                ctx.fillRect(screenX, screenPos.y, tileWidth, 5);
            }
        }
    }
    
    drawFlyingPlatforms(ctx, camera, worldToScreen) {
        const colors = this.getColors();
        
        this.platforms.forEach(platform => {
            if (platform.type === 'platform') {
                const screenPos = worldToScreen(platform.x, platform.y);
                
                const visualHeight = 15;
                
                ctx.fillStyle = colors.platformTop;
                ctx.fillRect(
                    screenPos.x, 
                    screenPos.y, 
                    platform.width, 
                    5
                );
                
                ctx.fillStyle = colors.platformBody;
                ctx.fillRect(
                    screenPos.x, 
                    screenPos.y + 5, 
                    platform.width, 
                    visualHeight - 5
                );
            }
        });
    }
    
    drawPlatforms(ctx, camera, worldToScreen, images) {
        this.drawGround(ctx, camera, worldToScreen, images);
        this.drawFlyingPlatforms(ctx, camera, worldToScreen);
    }
}