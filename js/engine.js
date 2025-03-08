/**
 * Game Engine for Rex & Eddie: Mystery in Cloisterham
 * Handles core game functionality, rendering, and game loop
 */

class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.lastTimestamp = 0;
        this.entities = [];
        this.player = null;
        this.map = null;
        this.camera = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        this.isRunning = false;
        
        // Initialize canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTimestamp = performance.now();
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }
    }

    stop() {
        this.isRunning = false;
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return;

        // Calculate delta time (time since last frame)
        const deltaTime = (timestamp - this.lastTimestamp) / 1000; // Convert to seconds
        this.lastTimestamp = timestamp;

        // Update game state
        this.update(deltaTime);

        // Render the game
        this.render();

        // Request next frame
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    update(deltaTime) {
        // Update all game entities
        for (const entity of this.entities) {
            if (entity.update) {
                entity.update(deltaTime);
            }
        }

        // Update camera position to follow player
        if (this.player) {
            this.camera.x = this.player.x - this.camera.width / 2;
            this.camera.y = this.player.y - this.camera.height / 2;
            
            // Ensure camera stays within map boundaries
            if (this.map) {
                this.camera.x = Math.max(0, Math.min(this.camera.x, this.map.width - this.camera.width));
                this.camera.y = Math.max(0, Math.min(this.camera.y, this.map.height - this.camera.height));
            }
        }
    }

    render() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render the map
        if (this.map) {
            this.map.render(this.ctx, this.camera);
        }

        // Render all entities
        const sortedEntities = [...this.entities].sort((a, b) => a.y - b.y);
        for (const entity of sortedEntities) {
            if (entity.render) {
                entity.render(this.ctx, this.camera);
            }
        }
    }

    addEntity(entity) {
        this.entities.push(entity);
        return entity;
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }

    setPlayer(player) {
        this.player = player;
        if (!this.entities.includes(player)) {
            this.addEntity(player);
        }
    }

    setMap(map) {
        this.map = map;
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.camera.x,
            y: screenY + this.camera.y
        };
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.camera.x,
            y: worldY - this.camera.y
        };
    }

    // Check if a world position is visible on screen
    isOnScreen(worldX, worldY, margin = 0) {
        return (
            worldX + margin >= this.camera.x &&
            worldX - margin <= this.camera.x + this.camera.width &&
            worldY + margin >= this.camera.y &&
            worldY - margin <= this.camera.y + this.camera.height
        );
    }
}