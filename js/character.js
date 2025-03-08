/**
 * Character System for Rex & Eddie: Mystery in Cloisterham
 * Handles player character and NPCs
 */

class Character {
    constructor(x, y, name, color = '#3498db') {
        this.x = x;
        this.y = y;
        this.name = name;
        this.color = color;
        this.width = 32;
        this.height = 48;
        this.speed = 200; // Pixels per second
        this.direction = 'down'; // 'up', 'down', 'left', 'right'
        this.isMoving = false;
        this.targetX = x;
        this.targetY = y;
        this.inventory = [];
        this.sprite = null; // Will be used for character sprites later
        
        // Animation properties
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 0.2; // Seconds per frame
    }
    
    update(deltaTime) {
        // Update animation
        if (this.isMoving) {
            this.animationTimer += deltaTime;
            if (this.animationTimer >= this.animationSpeed) {
                this.animationTimer = 0;
                this.animationFrame = (this.animationFrame + 1) % 4;
            }
        } else {
            this.animationFrame = 0;
        }
        
        // Move towards target if needed
        if (this.isMoving) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.speed * deltaTime) {
                // We've reached the target
                this.x = this.targetX;
                this.y = this.targetY;
                this.isMoving = false;
            } else {
                // Move towards target
                const moveX = (dx / distance) * this.speed * deltaTime;
                const moveY = (dy / distance) * this.speed * deltaTime;
                
                // Update position
                this.x += moveX;
                this.y += moveY;
                
                // Update direction based on movement
                if (Math.abs(moveX) > Math.abs(moveY)) {
                    this.direction = moveX > 0 ? 'right' : 'left';
                } else {
                    this.direction = moveY > 0 ? 'down' : 'up';
                }
            }
        }
    }
    
    render(ctx, camera) {
        // Only render if on screen
        if (this.x + this.width < camera.x ||
            this.x > camera.x + camera.width ||
            this.y + this.height < camera.y ||
            this.y > camera.y + camera.height) {
            return;
        }
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Draw character shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(
            screenX + this.width / 2,
            screenY + this.height - 3,
            this.width / 2,
            this.width / 4,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Animation offset for walking
        const bounceOffset = this.isMoving ? Math.sin(this.animationFrame * Math.PI) * 2 : 0;
        
        // Draw character legs
        this.drawLegs(ctx, screenX, screenY + bounceOffset, this.animationFrame);
        
        // Draw character body
        ctx.fillStyle = this.color;
        // Rounded rectangle for body
        this.roundRect(
            ctx,
            screenX + this.width * 0.1,
            screenY + this.height * 0.2 + bounceOffset,
            this.width * 0.8,
            this.height * 0.5,
            5
        );
        
        // Draw character head
        ctx.fillStyle = '#f5d7b5'; // Skin tone
        ctx.beginPath();
        ctx.arc(
            screenX + this.width / 2,
            screenY + this.height * 0.15 + bounceOffset,
            this.width / 3,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw character face (eyes and mouth based on direction)
        this.drawFace(ctx, screenX, screenY + bounceOffset);
        
        // Draw character name with shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = '12px Quicksand, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
            this.name,
            screenX + this.width / 2 + 1,
            screenY - 6 + 1
        );
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Quicksand, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
            this.name,
            screenX + this.width / 2,
            screenY - 6
        );
    }
    
    // Helper method to draw rounded rectangles
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw character legs
    drawLegs(ctx, x, y, frame) {
        const legWidth = this.width * 0.2;
        const legHeight = this.height * 0.3;
        const legSpacing = this.width * 0.3;
        
        // Leg color (pants)
        ctx.fillStyle = '#4a6fa5'; // Blue pants
        
        // Left leg with animation
        let leftLegOffset = 0;
        let rightLegOffset = 0;
        
        if (this.isMoving) {
            leftLegOffset = Math.sin(frame * Math.PI) * 5;
            rightLegOffset = -leftLegOffset;
        }
        
        // Left leg
        this.roundRect(
            ctx,
            x + this.width / 2 - legSpacing,
            y + this.height * 0.7 + leftLegOffset,
            legWidth,
            legHeight,
            3
        );
        
        // Right leg
        this.roundRect(
            ctx,
            x + this.width / 2 + legSpacing - legWidth,
            y + this.height * 0.7 + rightLegOffset,
            legWidth,
            legHeight,
            3
        );
    }
    
    // Draw character face
    drawFace(ctx, x, y) {
        const centerX = x + this.width / 2;
        const centerY = y + this.height * 0.15;
        const eyeSpacing = this.width / 6;
        
        // Eyes
        ctx.fillStyle = '#333333';
        
        // Position eyes based on direction
        switch (this.direction) {
            case 'up':
                // Eyes looking up
                ctx.beginPath();
                ctx.ellipse(centerX - eyeSpacing, centerY - 2, 2, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(centerX + eyeSpacing, centerY - 2, 2, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'down':
                // Eyes looking down
                ctx.beginPath();
                ctx.ellipse(centerX - eyeSpacing, centerY + 2, 2, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(centerX + eyeSpacing, centerY + 2, 2, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'left':
                // Eyes looking left
                ctx.beginPath();
                ctx.ellipse(centerX - eyeSpacing - 2, centerY, 3, 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(centerX + eyeSpacing - 2, centerY, 3, 2, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'right':
                // Eyes looking right
                ctx.beginPath();
                ctx.ellipse(centerX - eyeSpacing + 2, centerY, 3, 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(centerX + eyeSpacing + 2, centerY, 3, 2, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        
        // Mouth
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // Smile if moving, neutral otherwise
        if (this.isMoving) {
            ctx.arc(centerX, centerY + 8, 5, 0.1, Math.PI - 0.1);
        } else {
            ctx.moveTo(centerX - 5, centerY + 8);
            ctx.lineTo(centerX + 5, centerY + 8);
        }
        
        ctx.stroke();
    }
    
    moveTo(x, y, map) {
        // Check if the destination is walkable
        if (map && map.isCollision(x, y)) {
            // Find nearest walkable position
            const directions = [
                { dx: 0, dy: -1 }, // Up
                { dx: 1, dy: 0 },  // Right
                { dx: 0, dy: 1 },  // Down
                { dx: -1, dy: 0 }, // Left
            ];
            
            let found = false;
            let radius = 1;
            
            while (!found && radius < 5) {
                for (const dir of directions) {
                    const newX = x + dir.dx * radius * map.tileSize;
                    const newY = y + dir.dy * radius * map.tileSize;
                    
                    if (!map.isCollision(newX, newY)) {
                        x = newX;
                        y = newY;
                        found = true;
                        break;
                    }
                }
                radius++;
            }
            
            if (!found) {
                console.log("Could not find walkable position");
                return false;
            }
        }
        
        this.targetX = x;
        this.targetY = y;
        this.isMoving = true;
        return true;
    }
    
    moveInDirection(direction, distance, map) {
        let dx = 0;
        let dy = 0;
        
        switch (direction) {
            case 'up':
                dy = -distance;
                break;
            case 'down':
                dy = distance;
                break;
            case 'left':
                dx = -distance;
                break;
            case 'right':
                dx = distance;
                break;
        }
        
        // Check if the new position is walkable
        const newX = this.x + dx;
        const newY = this.y + dy;
        
        if (map && map.isCollision(newX, newY)) {
            return false;
        }
        
        this.direction = direction;
        this.targetX = newX;
        this.targetY = newY;
        this.isMoving = true;
        return true;
    }
    
    interact(map) {
        // Check for interactive objects in front of the character
        let checkX = this.x;
        let checkY = this.y;
        const checkDistance = 32;
        
        switch (this.direction) {
            case 'up':
                checkY -= checkDistance;
                break;
            case 'down':
                checkY += checkDistance;
                break;
            case 'left':
                checkX -= checkDistance;
                break;
            case 'right':
                checkX += checkDistance;
                break;
        }
        
        const interactiveObject = map.getInteractiveObjectAt(checkX, checkY);
        if (interactiveObject) {
            interactiveObject.action();
            return true;
        }
        
        return false;
    }
    
    addToInventory(item) {
        this.inventory.push(item);
    }
    
    removeFromInventory(item) {
        const index = this.inventory.indexOf(item);
        if (index !== -1) {
            this.inventory.splice(index, 1);
            return true;
        }
        return false;
    }
}

class PlayerCharacter extends Character {
    constructor(x, y, name = "Eddie") {
        super(x, y, name, '#2ecc71'); // Green color for player (Eddie)
        this.isPlayer = true;
        this.hasNotebook = true; // Eddie has a notebook as a detective
    }
    
    // Override render to add player-specific visuals
    render(ctx, camera) {
        // Call the parent render method first
        super.render(ctx, camera);
        
        // Only render if on screen
        if (this.x + this.width < camera.x ||
            this.x > camera.x + camera.width ||
            this.y + this.height < camera.y ||
            this.y > camera.y + camera.height) {
            return;
        }
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Add glasses (Eddie wears glasses)
        this.drawGlasses(ctx, screenX, screenY);
        
        // Add notebook if the player has one
        if (this.hasNotebook) {
            this.drawNotebook(ctx, screenX, screenY);
        }
    }
    
    // Draw glasses
    drawGlasses(ctx, x, y) {
        const centerX = x + this.width / 2;
        const eyeY = y + this.height * 0.15;
        const eyeSpacing = this.width / 6;
        
        // Glasses frame
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        // Left lens
        ctx.beginPath();
        ctx.arc(centerX - eyeSpacing, eyeY, 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Right lens
        ctx.beginPath();
        ctx.arc(centerX + eyeSpacing, eyeY, 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Bridge of glasses
        ctx.beginPath();
        ctx.moveTo(centerX - eyeSpacing + 3, eyeY);
        ctx.lineTo(centerX + eyeSpacing - 3, eyeY);
        ctx.stroke();
    }
    
    // Draw a notebook
    drawNotebook(ctx, x, y) {
        // Only draw if not moving or facing left/right
        if (this.isMoving && this.direction !== 'left' && this.direction !== 'right') return;
        
        const notebookX = this.direction === 'left'
            ? x - 5
            : x + this.width - 10;
            
        const notebookY = y + this.height * 0.4;
        
        // Notebook
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(notebookX, notebookY, 10, 15);
        
        // Notebook lines
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(notebookX + 1, notebookY + 4 + i * 4);
            ctx.lineTo(notebookX + 9, notebookY + 4 + i * 4);
            ctx.stroke();
        }
    }
}

class NPC extends Character {
    constructor(x, y, name, color, dialogues = [], npcType = 'generic') {
        super(x, y, name, color);
        this.dialogues = dialogues;
        this.currentDialogueIndex = 0;
        this.npcType = npcType; // 'generic', 'eddie', 'police', 'shopkeeper', etc.
    }
    
    render(ctx, camera) {
        // Call the parent render method first
        super.render(ctx, camera);
        
        // Only render if on screen
        if (this.x + this.width < camera.x ||
            this.x > camera.x + camera.width ||
            this.y + this.height < camera.y ||
            this.y > camera.y + camera.height) {
            return;
        }
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Add NPC-specific accessories based on type
        if (this.npcType === 'eddie') {
            this.drawEddieAccessories(ctx, screenX, screenY);
        } else if (this.npcType === 'police') {
            this.drawPoliceAccessories(ctx, screenX, screenY);
        } else if (this.npcType === 'shopkeeper') {
            this.drawShopkeeperAccessories(ctx, screenX, screenY);
        }
        
        // Add speech indicator if NPC has dialogues
        if (this.dialogues.length > 0) {
            this.drawSpeechIndicator(ctx, screenX, screenY);
        }
    }
    
    // Draw Rex's accessories (detective hat and magnifying glass)
    drawEddieAccessories(ctx, x, y) {
        // Rename this method but keep the same name for backward compatibility
        this.drawRexAccessories(ctx, x, y);
    }
    
    // Draw Rex's accessories (detective hat and magnifying glass)
    drawRexAccessories(ctx, x, y) {
        // Draw detective hat
        const hatY = y + this.height * 0.05;
        const hatX = x + this.width / 2;
        
        // Hat brim
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.ellipse(
            hatX,
            hatY,
            this.width / 2.5,
            this.width / 6,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Hat top
        ctx.fillStyle = '#222222';
        this.roundRect(
            ctx,
            hatX - this.width / 6,
            hatY - this.height / 6,
            this.width / 3,
            this.height / 8,
            3
        );
        
        // Draw magnifying glass if not moving
        if (!this.isMoving) {
            const glassX = this.direction === 'left'
                ? x - 5
                : x + this.width * 0.8;
                
            const glassY = y + this.height * 0.4;
            
            // Handle
            ctx.fillStyle = '#8B4513';
            ctx.save();
            ctx.translate(glassX, glassY);
            ctx.rotate(this.direction === 'left' ? -Math.PI / 4 : Math.PI / 4);
            ctx.fillRect(-2, 0, 4, 15);
            ctx.restore();
            
            // Glass rim
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(glassX, glassY, 8, 0, Math.PI * 2);
            ctx.stroke();
            
            // Glass
            ctx.fillStyle = 'rgba(200, 230, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(glassX, glassY, 7, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Draw police officer accessories
    drawPoliceAccessories(ctx, x, y) {
        // Police hat
        ctx.fillStyle = '#1a3c6e';
        this.roundRect(
            ctx,
            x + this.width * 0.15,
            y,
            this.width * 0.7,
            this.height * 0.1,
            3
        );
        
        // Badge
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(
            x + this.width * 0.3,
            y + this.height * 0.35,
            this.width * 0.1,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    // Draw shopkeeper accessories
    drawShopkeeperAccessories(ctx, x, y) {
        // Apron
        ctx.fillStyle = '#7d5a44';
        ctx.fillRect(
            x + this.width * 0.2,
            y + this.height * 0.3,
            this.width * 0.6,
            this.height * 0.4
        );
        
        // Apron strap
        ctx.fillRect(
            x + this.width * 0.4,
            y + this.height * 0.2,
            this.width * 0.2,
            this.height * 0.1
        );
    }
    
    // Draw speech indicator (a small speech bubble)
    drawSpeechIndicator(ctx, x, y) {
        // Only show indicator if not moving and not currently in dialogue
        if (this.isMoving) return;
        
        const bubbleX = x + this.width * 0.7;
        const bubbleY = y - 15;
        
        // Speech bubble
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Bubble tail
        ctx.beginPath();
        ctx.moveTo(bubbleX - 3, bubbleY + 6);
        ctx.lineTo(bubbleX, bubbleY + 12);
        ctx.lineTo(bubbleX + 3, bubbleY + 6);
        ctx.fill();
        
        // Dots inside bubble
        ctx.fillStyle = '#333';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(bubbleX - 3 + i * 3, bubbleY, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    talk() {
        if (this.dialogues.length === 0) {
            return null;
        }
        
        const dialogue = this.dialogues[this.currentDialogueIndex];
        this.currentDialogueIndex = (this.currentDialogueIndex + 1) % this.dialogues.length;
        return dialogue;
    }
}