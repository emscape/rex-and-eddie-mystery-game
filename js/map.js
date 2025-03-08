/**
 * Map System for Rex & Eddie: Mystery in Cloisterham
 * Handles the game world, buildings, and interactive elements
 */

class GameMap {
    constructor(width, height, tileSize = 64) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.layers = {
            ground: [],
            objects: [],
            collision: []
        };
        this.buildings = [];
        this.interactiveObjects = [];
        
        // Initialize empty layers
        this.initializeLayers();
        
        // Load map assets
        this.assets = {
            tiles: {},
            buildings: {}
        };
        
        this.loadAssets();
    }
    
    initializeLayers() {
        // Calculate grid dimensions
        const gridWidth = Math.ceil(this.width / this.tileSize);
        const gridHeight = Math.ceil(this.height / this.tileSize);
        
        // Initialize each layer with empty values
        for (let y = 0; y < gridHeight; y++) {
            this.layers.ground[y] = [];
            this.layers.objects[y] = [];
            this.layers.collision[y] = [];
            
            for (let x = 0; x < gridWidth; x++) {
                this.layers.ground[y][x] = 0; // Default ground tile
                this.layers.objects[y][x] = -1; // No object
                this.layers.collision[y][x] = 0; // No collision
            }
        }
    }
    
    async loadAssets() {
        // In a real implementation, this would load images for tiles and buildings
        // For now, we'll use colored rectangles for simplicity
        
        // Define enhanced tile types with more appealing colors
        this.assets.tiles = {
            0: { color: '#5d9e5f', pattern: 'grass' }, // Grass
            1: { color: '#a8a197', pattern: 'path' },  // Path
            2: { color: '#5b92c9', pattern: 'water' }, // Water
            3: { color: '#9c8772', pattern: 'dirt' }   // Dirt
        };
        
        // Create a simple map of Cloisterham
        this.createCloisterhamMap();
    }
    
    createCloisterhamMap() {
        // Create a map layout for Rochester (Cloisterham in the game)
        // Based on the real Rochester, England, UK
        
        const gridWidth = Math.ceil(this.width / this.tileSize);
        const gridHeight = Math.ceil(this.height / this.tileSize);
        
        // Fill the ground with grass
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                this.layers.ground[y][x] = 0; // Grass
            }
        }
        
        // Add River Medway (east-west)
        const riverY = Math.floor(gridHeight * 0.6);
        for (let x = 0; x < gridWidth; x++) {
            for (let ry = 0; ry < 4; ry++) {
                const y = riverY + ry;
                if (y < gridHeight) {
                    this.layers.ground[y][x] = 2; // Water
                    this.layers.collision[y][x] = 1; // Collision
                }
            }
        }
        
        // Add Rochester Bridge
        const bridgeX = Math.floor(gridWidth * 0.4);
        for (let ry = 0; ry < 4; ry++) {
            const y = riverY + ry;
            if (y < gridHeight) {
                this.layers.ground[y][bridgeX] = 1; // Path
                this.layers.collision[y][bridgeX] = 0; // No collision
            }
        }
        
        // Add High Street (main east-west road)
        const highStreetY = Math.floor(gridHeight * 0.4);
        for (let x = 0; x < gridWidth; x++) {
            this.layers.ground[highStreetY][x] = 1; // Path
            this.layers.ground[highStreetY + 1][x] = 1; // Path
        }
        
        // Add north-south streets
        const streets = [
            Math.floor(gridWidth * 0.25), // West street
            Math.floor(gridWidth * 0.5),  // Central street
            Math.floor(gridWidth * 0.75)  // East street
        ];
        
        for (const streetX of streets) {
            for (let y = 0; y < gridHeight; y++) {
                // Don't overwrite the river
                if (y < riverY || y > riverY + 3) {
                    this.layers.ground[y][streetX] = 1; // Path
                }
            }
        }
        
        // Add key landmarks
        
        // 1. Rochester Cathedral (large building north of High Street)
        const cathedralX = streets[1] - 5;
        const cathedralY = highStreetY - 12;
        this.addBuilding("Cathedral", cathedralX, cathedralY, 12, 10);
        
        // 2. High Street Cheese Shop (small building on High Street)
        const cheeseShopX = streets[0] + 3;
        const cheeseShopY = highStreetY - 4;
        this.addBuilding("High Street Cheese Shop", cheeseShopX, cheeseShopY, 6, 3);
        
        // 3. Pentagon Shopping Center (large building east side)
        const pentagonX = streets[2] + 2;
        const pentagonY = highStreetY - 8;
        this.addBuilding("Pentagon Shopping Center", pentagonX, pentagonY, 10, 7);
        
        // 4. Rex & Eddie's Office (medium building near the bridge)
        const officeX = bridgeX - 8;
        const officeY = highStreetY + 5;
        this.addBuilding("Rex & Eddie's Office", officeX, officeY, 7, 5);
        
        // Add some additional buildings for atmosphere
        this.addBuilding("Rochester Castle", cathedralX - 10, cathedralY + 2, 8, 8);
        this.addBuilding("Town Hall", streets[1] + 3, highStreetY - 5, 8, 4);
        this.addBuilding("Library", streets[0] - 6, highStreetY + 8, 6, 4);
        this.addBuilding("Police Station", streets[2] - 4, highStreetY + 10, 6, 4);
        
        // Add trees and decorative elements
        this.addDecorations();
    }
    
    addBuilding(name, x, y, width, height) {
        const building = {
            name,
            x: x * this.tileSize,
            y: y * this.tileSize,
            width: width * this.tileSize,
            height: height * this.tileSize,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
            entrance: {
                x: (x + Math.floor(width / 2)) * this.tileSize,
                y: (y + height) * this.tileSize
            },
            interior: null // Will be defined later
        };
        
        // Add collision for the building
        for (let by = 0; by < height; by++) {
            for (let bx = 0; bx < width; bx++) {
                const mapX = x + bx;
                const mapY = y + by;
                if (mapY >= 0 && mapY < this.layers.collision.length &&
                    mapX >= 0 && mapX < this.layers.collision[mapY].length) {
                    this.layers.collision[mapY][mapX] = 1; // Collision
                }
            }
        }
        
        this.buildings.push(building);
        
        // Add an interactive area at the entrance
        this.addInteractiveObject({
            x: building.entrance.x,
            y: building.entrance.y,
            width: this.tileSize,
            height: this.tileSize,
            type: 'building_entrance',
            buildingName: name,
            action: () => {
                console.log(`Entering ${name}`);
                // This will be expanded later to actually enter buildings
            }
        });
    }
    
    addDecorations() {
        // Add trees and other decorative elements
        const gridWidth = Math.ceil(this.width / this.tileSize);
        const gridHeight = Math.ceil(this.height / this.tileSize);
        
        // Add some trees in the northern part
        for (let i = 0; i < 30; i++) {
            const x = Math.floor(Math.random() * gridWidth);
            const y = Math.floor(Math.random() * (gridHeight / 4));
            
            // Don't place on paths or buildings
            if (this.layers.ground[y][x] === 0 && this.layers.collision[y][x] === 0) {
                this.layers.objects[y][x] = 1; // Tree
                this.layers.collision[y][x] = 1; // Collision
            }
        }
        
        // Add some trees in the southern part (below the river)
        const riverY = Math.floor(gridHeight * 3 / 4);
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * gridWidth);
            const y = Math.floor(riverY + 3 + Math.random() * (gridHeight - riverY - 3));
            
            if (y < gridHeight && this.layers.ground[y][x] === 0 && this.layers.collision[y][x] === 0) {
                this.layers.objects[y][x] = 1; // Tree
                this.layers.collision[y][x] = 1; // Collision
            }
        }
    }
    
    addInteractiveObject(object) {
        this.interactiveObjects.push(object);
    }
    
    getInteractiveObjectAt(x, y) {
        return this.interactiveObjects.find(obj => {
            return x >= obj.x && x < obj.x + obj.width &&
                   y >= obj.y && y < obj.y + obj.height;
        });
    }
    
    getBuildingByName(name) {
        return this.buildings.find(building => building.name === name);
    }
    
    isCollision(x, y) {
        // Convert world coordinates to grid coordinates
        const gridX = Math.floor(x / this.tileSize);
        const gridY = Math.floor(y / this.tileSize);
        
        // Check if out of bounds
        if (gridY < 0 || gridY >= this.layers.collision.length ||
            gridX < 0 || gridX >= this.layers.collision[gridY].length) {
            return true;
        }
        
        // Check collision layer
        return this.layers.collision[gridY][gridX] === 1;
    }
    
    // Helper methods for drawing tile details
    drawGrassDetail(ctx, x, y) {
        // Draw small grass blades
        ctx.fillStyle = '#7fbf81';
        
        // Random grass blades
        for (let i = 0; i < 5; i++) {
            const grassX = x + Math.random() * this.tileSize;
            const grassY = y + Math.random() * this.tileSize;
            const grassHeight = 2 + Math.random() * 5;
            const grassWidth = 1 + Math.random() * 2;
            
            ctx.fillRect(
                grassX,
                grassY - grassHeight,
                grassWidth,
                grassHeight
            );
        }
        
        // Occasionally add a flower
        if (Math.random() > 0.9) {
            const flowerX = x + 5 + Math.random() * (this.tileSize - 10);
            const flowerY = y + 5 + Math.random() * (this.tileSize - 10);
            const flowerSize = 3 + Math.random() * 2;
            
            // Flower color (randomly yellow or white)
            ctx.fillStyle = Math.random() > 0.5 ? '#f9ed69' : '#f0f0f0';
            
            // Draw flower petals
            ctx.beginPath();
            ctx.arc(flowerX, flowerY, flowerSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Flower center
            ctx.fillStyle = '#f38181';
            ctx.beginPath();
            ctx.arc(flowerX, flowerY, flowerSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawPathDetail(ctx, x, y, gridX, gridY) {
        // Add some texture to paths
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        
        // Create a pattern based on grid position
        const patternOffset = (gridX + gridY) % 2 === 0;
        
        // Draw small stones/pebbles
        for (let i = 0; i < 8; i++) {
            const stoneX = x + (patternOffset ? 10 : 20) + (i % 4) * 10;
            const stoneY = y + (patternOffset ? 10 : 20) + Math.floor(i / 4) * 20;
            const stoneSize = 2 + Math.random() * 3;
            
            ctx.beginPath();
            ctx.arc(stoneX, stoneY, stoneSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add path edges
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(x, y, this.tileSize, 2);
        ctx.fillRect(x, y + this.tileSize - 2, this.tileSize, 2);
    }
    
    drawWaterDetail(ctx, x, y) {
        // Add simple water texture without animations
        
        // Static water pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        
        // Draw a few static highlights
        for (let i = 0; i < 3; i++) {
            const highlightX = x + 10 + (i * 15);
            const highlightY = y + 15 + (i * 10);
            
            ctx.beginPath();
            ctx.fillRect(highlightX, highlightY, 10, 2);
            ctx.fill();
        }
    }
    
    drawDirtDetail(ctx, x, y) {
        // Add dirt texture with small rocks and variations
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        
        // Small rocks
        for (let i = 0; i < 6; i++) {
            const rockX = x + 5 + Math.random() * (this.tileSize - 10);
            const rockY = y + 5 + Math.random() * (this.tileSize - 10);
            const rockSize = 1 + Math.random() * 3;
            
            ctx.beginPath();
            ctx.arc(rockX, rockY, rockSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Dirt variations
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < 3; i++) {
            const variationX = x + Math.random() * this.tileSize;
            const variationY = y + Math.random() * this.tileSize;
            const variationSize = 3 + Math.random() * 8;
            
            ctx.beginPath();
            ctx.arc(variationX, variationY, variationSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    render(ctx, camera) {
        // Calculate visible tile range
        const startX = Math.floor(camera.x / this.tileSize);
        const startY = Math.floor(camera.y / this.tileSize);
        const endX = Math.ceil((camera.x + camera.width) / this.tileSize);
        const endY = Math.ceil((camera.y + camera.height) / this.tileSize);
        
        // Render ground layer
        for (let y = startY; y < endY; y++) {
            if (y < 0 || y >= this.layers.ground.length) continue;
            
            for (let x = startX; x < endX; x++) {
                if (x < 0 || x >= this.layers.ground[y].length) continue;
                
                const tileType = this.layers.ground[y][x];
                const tile = this.assets.tiles[tileType];
                
                if (tile) {
                    const screenX = x * this.tileSize - camera.x;
                    const screenY = y * this.tileSize - camera.y;
                    
                    // Draw base tile color
                    ctx.fillStyle = tile.color;
                    ctx.fillRect(
                        screenX,
                        screenY,
                        this.tileSize,
                        this.tileSize
                    );
                    
                    // Add pattern details based on tile type
                    switch(tile.pattern) {
                        case 'grass':
                            // Add grass details
                            if (Math.random() > 0.7) {
                                this.drawGrassDetail(ctx, screenX, screenY);
                            }
                            break;
                            
                        case 'path':
                            // Add path texture
                            this.drawPathDetail(ctx, screenX, screenY, x, y);
                            break;
                            
                        case 'water':
                            // Add water ripples
                            this.drawWaterDetail(ctx, screenX, screenY);
                            break;
                            
                        case 'dirt':
                            // Add dirt texture
                            this.drawDirtDetail(ctx, screenX, screenY);
                            break;
                    }
                }
            }
        }
        
        // Render buildings
        for (const building of this.buildings) {
            // Check if building is visible
            if (building.x + building.width < camera.x || 
                building.x > camera.x + camera.width ||
                building.y + building.height < camera.y || 
                building.y > camera.y + camera.height) {
                continue;
            }
            
            // Draw building with shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(
                building.x - camera.x + 5,
                building.y - camera.y + 5,
                building.width,
                building.height
            );
            
            // Draw building
            ctx.fillStyle = building.color;
            ctx.fillRect(
                building.x - camera.x,
                building.y - camera.y,
                building.width,
                building.height
            );
            
            // Draw windows
            this.drawBuildingWindows(ctx, building, camera);
            
            // Draw building name
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Lora, serif';
            ctx.textAlign = 'center';
            ctx.fillText(
                building.name,
                building.x + building.width / 2 - camera.x,
                building.y + building.height / 2 - camera.y
            );
            
            // Draw entrance
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(
                building.entrance.x - camera.x - this.tileSize / 4,
                building.entrance.y - camera.y - this.tileSize / 4,
                this.tileSize / 2,
                this.tileSize / 2
            );
        }
        
        // Render object layer (trees, etc.)
        for (let y = startY; y < endY; y++) {
            if (y < 0 || y >= this.layers.objects.length) continue;
            
            for (let x = startX; x < endX; x++) {
                if (x < 0 || x >= this.layers.objects[y].length) continue;
                
                const objectType = this.layers.objects[y][x];
                
                if (objectType === 1) { // Tree
                    this.drawTree(ctx, x, y, camera);
                }
            }
        }
        
        // Debug: render collision layer
        if (false) { // Set to true to see collision areas
            ctx.globalAlpha = 0.3;
            for (let y = startY; y < endY; y++) {
                if (y < 0 || y >= this.layers.collision.length) continue;
                
                for (let x = startX; x < endX; x++) {
                    if (x < 0 || x >= this.layers.collision[y].length) continue;
                    
                    if (this.layers.collision[y][x] === 1) {
                        ctx.fillStyle = '#ff0000';
                        ctx.fillRect(
                            x * this.tileSize - camera.x,
                            y * this.tileSize - camera.y,
                            this.tileSize,
                            this.tileSize
                        );
                    }
                }
            }
            ctx.globalAlpha = 1.0;
        }
        
        // Debug: render interactive areas
        if (false) { // Set to true to see interactive areas
            ctx.globalAlpha = 0.5;
            for (const obj of this.interactiveObjects) {
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(
                    obj.x - camera.x,
                    obj.y - camera.y,
                    obj.width,
                    obj.height
                );
            }
            ctx.globalAlpha = 1.0;
        }
    }
    
    // Enhanced tree drawing
    drawTree(ctx, x, y, camera) {
        const screenX = x * this.tileSize - camera.x;
        const screenY = y * this.tileSize - camera.y;
        
        // Draw tree shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(
            screenX + this.tileSize / 2 + 5,
            screenY + this.tileSize - 5,
            this.tileSize / 3,
            this.tileSize / 6,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw tree trunk
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(
            screenX + this.tileSize / 3,
            screenY + this.tileSize / 2,
            this.tileSize / 3,
            this.tileSize / 2
        );
        
        // Draw tree top (multiple layers for more depth)
        const treeColors = ['#1e6f50', '#2d8a63', '#3aa476'];
        
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = treeColors[i];
            ctx.beginPath();
            ctx.arc(
                screenX + this.tileSize / 2,
                screenY + this.tileSize / 3 - i * 5,
                this.tileSize / 3 - i * 3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
    
    // Draw windows on buildings
    drawBuildingWindows(ctx, building, camera) {
        const windowSize = this.tileSize / 4;
        const windowSpacingX = this.tileSize / 2;
        const windowSpacingY = this.tileSize / 2;
        
        // Calculate how many windows can fit
        const windowsX = Math.floor(building.width / windowSpacingX) - 1;
        const windowsY = Math.floor(building.height / windowSpacingY) - 1;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        for (let wy = 0; wy < windowsY; wy++) {
            for (let wx = 0; wx < windowsX; wx++) {
                // Skip some windows randomly for variety
                if (Math.random() > 0.8) continue;
                
                const windowX = building.x + windowSpacingX + wx * windowSpacingX - camera.x;
                const windowY = building.y + windowSpacingY + wy * windowSpacingY - camera.y;
                
                ctx.fillRect(
                    windowX,
                    windowY,
                    windowSize,
                    windowSize
                );
            }
        }
    }
}