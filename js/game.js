/**
 * Main Game File for Rex & Eddie: Mystery in Cloisterham
 * Initializes and runs the game
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game
    const game = new Game();
    game.init();
});

class Game {
    constructor() {
        this.engine = null;
        this.controls = null;
        this.isInitialized = false;
    }
    
    init() {
        console.log('Initializing Rex & Eddie: Mystery in Cloisterham');
        
        // Create game engine
        this.engine = new GameEngine('game-canvas');
        
        // Create game map (width, height, tileSize)
        const mapWidth = 3200;  // 50 tiles wide
        const mapHeight = 3200; // 50 tiles high
        const tileSize = 64;
        
        const map = new GameMap(mapWidth, mapHeight, tileSize);
        this.engine.setMap(map);
        
        // Create player character (Eddie)
        // Start in the middle of the map
        const playerX = mapWidth / 2;
        const playerY = mapHeight / 2;
        const player = new PlayerCharacter(playerX, playerY, "Eddie");
        this.engine.setPlayer(player);
        
        // Create controls
        this.controls = new Controls(this.engine);
        
        // Add Rex as an NPC who left clues
        this.addNPCs();
        
        // Start the game loop
        this.engine.start();
        this.isInitialized = true;
        
        // Set up the game update loop
        this.setupUpdateLoop();
        
        // Show welcome message
        setTimeout(() => {
            this.showWelcomeMessage();
        }, 1000);
    }
    
    setupUpdateLoop() {
        // Set up a separate update loop for controls and other non-rendering updates
        const updateLoop = (deltaTime) => {
            if (this.controls) {
                this.controls.update(deltaTime);
            }
            
            // Request next update
            requestAnimationFrame((timestamp) => {
                const delta = (timestamp - lastTimestamp) / 1000;
                lastTimestamp = timestamp;
                updateLoop(delta);
            });
        };
        
        let lastTimestamp = performance.now();
        updateLoop(0);
    }
    
    addNPCs() {
        if (!this.engine || !this.engine.map) return;
        
        // Add Rex as an NPC with the 'eddie' type (keeping the type name for compatibility)
        const rexX = this.engine.player.x + 100;
        const rexY = this.engine.player.y;
        const rex = new NPC(rexX, rexY, "Rex", "#e74c3c", [
            "Hello Eddie! I've got a mystery for you to solve.",
            "I've hidden clues all over Rochester for you to find.",
            "Start by checking out the Cathedral.",
            "Don't forget your detective notebook!",
            "I'll be around town if you need hints."
        ], 'eddie'); // Keep 'eddie' type for compatibility
        this.engine.addEntity(rex);
        
        // Add an interactive action to Rex
        this.engine.map.addInteractiveObject({
            x: rexX - 16,
            y: rexY - 16,
            width: 64,
            height: 64,
            type: 'npc',
            action: () => {
                const dialogue = rex.talk();
                if (dialogue && this.controls) {
                    this.controls.showDialog(dialogue);
                }
            }
        });
        
        // Add other NPCs later - could add shopkeepers, witnesses, etc.
    }
    showWelcomeMessage() {
        if (this.controls) {
            this.controls.showDialog(
                "Welcome to Rex & Eddie: Mystery in Cloisterham!\n\n" +
                "You play as Eddie, a detective whose partner Rex has left clues around Rochester for you to solve.\n\n" +
                "Use WASD keys to move around, or click where you want to go.\n" +
                "Press E to interact with objects and characters.\n" +
                "Press I to open your inventory.\n\n" +
                "Explore the town and find the clues Rex has hidden!"
            );
        }
    }
}