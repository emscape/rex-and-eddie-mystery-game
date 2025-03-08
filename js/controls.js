/**
 * Controls System for Rex & Eddie: Mystery in Cloisterham
 * Handles keyboard (WASD) and mouse (point & click) input
 */

class Controls {
    constructor(engine) {
        this.engine = engine;
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            e: false, // Interaction key
            i: false  // Inventory key
        };
        
        this.mousePosition = { x: 0, y: 0 };
        this.isMouseDown = false;
        this.clickTarget = null;
        
        // Bind event listeners
        this.bindEventListeners();
    }
    
    bindEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mouse events
        this.engine.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.engine.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.engine.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.engine.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Touch events for mobile
        this.engine.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.engine.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.engine.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        
        // UI events
        const dialogClose = document.getElementById('dialog-close');
        if (dialogClose) {
            dialogClose.addEventListener('click', () => this.closeDialog());
        }
        
        const inventoryClose = document.getElementById('inventory-close');
        if (inventoryClose) {
            inventoryClose.addEventListener('click', () => this.closeInventory());
        }
    }
    
    handleKeyDown(e) {
        switch (e.key.toLowerCase()) {
            case 'w':
                this.keys.w = true;
                break;
            case 'a':
                this.keys.a = true;
                break;
            case 's':
                this.keys.s = true;
                break;
            case 'd':
                this.keys.d = true;
                break;
            case 'e':
                this.keys.e = true;
                this.handleInteraction();
                break;
            case 'i':
                this.keys.i = true;
                this.toggleInventory();
                break;
            case 'escape':
                this.closeDialog();
                this.closeInventory();
                break;
        }
    }
    
    handleKeyUp(e) {
        switch (e.key.toLowerCase()) {
            case 'w':
                this.keys.w = false;
                break;
            case 'a':
                this.keys.a = false;
                break;
            case 's':
                this.keys.s = false;
                break;
            case 'd':
                this.keys.d = false;
                break;
            case 'e':
                this.keys.e = false;
                break;
            case 'i':
                this.keys.i = false;
                break;
        }
    }
    
    handleMouseDown(e) {
        this.isMouseDown = true;
        this.updateMousePosition(e);
    }
    
    handleMouseUp(e) {
        this.isMouseDown = false;
        this.updateMousePosition(e);
    }
    
    handleMouseMove(e) {
        this.updateMousePosition(e);
    }
    
    handleClick(e) {
        this.updateMousePosition(e);
        this.handlePointAndClick();
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        this.isMouseDown = true;
        this.updateTouchPosition(e);
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.isMouseDown = false;
        this.handlePointAndClick();
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        this.updateTouchPosition(e);
    }
    
    updateMousePosition(e) {
        const rect = this.engine.canvas.getBoundingClientRect();
        this.mousePosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    updateTouchPosition(e) {
        if (e.touches.length > 0) {
            const rect = this.engine.canvas.getBoundingClientRect();
            this.mousePosition = {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
    }
    
    handlePointAndClick() {
        if (!this.engine.player || !this.engine.map) return;
        
        // Convert screen coordinates to world coordinates
        const worldPos = this.engine.screenToWorld(this.mousePosition.x, this.mousePosition.y);
        
        // Check if clicked on an interactive object
        const interactiveObject = this.engine.map.getInteractiveObjectAt(worldPos.x, worldPos.y);
        if (interactiveObject) {
            interactiveObject.action();
            return;
        }
        
        // Otherwise, move to the clicked position
        this.engine.player.moveTo(worldPos.x, worldPos.y, this.engine.map);
    }
    
    handleInteraction() {
        if (!this.engine.player || !this.engine.map) return;
        
        this.engine.player.interact(this.engine.map);
    }
    
    toggleInventory() {
        const inventory = document.getElementById('inventory');
        if (inventory) {
            if (inventory.classList.contains('hidden')) {
                this.openInventory();
            } else {
                this.closeInventory();
            }
        }
    }
    
    openInventory() {
        const inventory = document.getElementById('inventory');
        const inventoryItems = document.getElementById('inventory-items');
        
        if (inventory && inventoryItems && this.engine.player) {
            // Clear inventory display
            inventoryItems.innerHTML = '';
            
            // Add items to inventory display
            for (const item of this.engine.player.inventory) {
                const itemElement = document.createElement('div');
                itemElement.className = 'inventory-item';
                itemElement.textContent = item.name || '?';
                itemElement.addEventListener('click', () => {
                    console.log(`Selected item: ${item.name}`);
                    // Item use logic will be added later
                });
                inventoryItems.appendChild(itemElement);
            }
            
            // Show inventory
            inventory.classList.remove('hidden');
        }
    }
    
    closeInventory() {
        const inventory = document.getElementById('inventory');
        if (inventory) {
            inventory.classList.add('hidden');
        }
    }
    
    showDialog(text) {
        const dialogBox = document.getElementById('dialog-box');
        const dialogText = document.getElementById('dialog-text');
        
        if (dialogBox && dialogText) {
            dialogText.textContent = text;
            dialogBox.classList.remove('hidden');
        }
    }
    
    closeDialog() {
        const dialogBox = document.getElementById('dialog-box');
        if (dialogBox) {
            dialogBox.classList.add('hidden');
        }
    }
    
    update(deltaTime) {
        if (!this.engine.player || !this.engine.map || this.engine.player.isMoving) return;
        
        // Handle WASD movement
        if (this.keys.w || this.keys.a || this.keys.s || this.keys.d) {
            const moveDistance = this.engine.player.speed * deltaTime;
            
            if (this.keys.w) {
                this.engine.player.moveInDirection('up', moveDistance, this.engine.map);
            } else if (this.keys.s) {
                this.engine.player.moveInDirection('down', moveDistance, this.engine.map);
            } else if (this.keys.a) {
                this.engine.player.moveInDirection('left', moveDistance, this.engine.map);
            } else if (this.keys.d) {
                this.engine.player.moveInDirection('right', moveDistance, this.engine.map);
            }
        }
    }
}