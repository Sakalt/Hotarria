class Player {
    constructor(game, x, y, inventory) {
        this.game = game;
        this.world = this.game.getWorld();
        this.x = x;
        this.y = y;
        this.speed = 5;
        this.size = 16;
        this.inventory = inventory;

        this.keys = new Set();

        this.gravity = 3;
        this.grounded = false;

        this.velocityY = 0;
        this.jumpForce = 17;

        this.health = 100; // Starting health
        this.maxHealth = 100; // Maximum health
        this.damageCooldown = 0; // Cooldown frames
        this.isArmorEquipped = false; // Property to track armor status
        this.isJetPackEquipped = false; // Track jetpack status

        this.mobMeatCooldown = 0; // Cooldown time in frames for mob-meat
        this.mobMeatCooldownDuration = 300; // 5 seconds at 60 FPS

        this.isAlive = true;

        this.toolHandler = new ToolHandler(this, this.world);
        this.blockHandler = new BlockHandler(this, this.world);

        // Spritesheet and animation properties
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'images/player.png';
        this.frameWidth = 24; // Width of each frame in the spritesheet
        this.frameHeight = 38; // Height of each frame in the spritesheet
        this.currentFrame = 0; // Current frame index
        this.isMoving = false; // Track if the player is moving
        this.facingLeft = false; // Track if the player is facing left
        this.jumping = false;
        this.jumpImage = new Image();
        this.jumpImage.src = 'images/jump.png';

        // Additional sprites for armored player
        this.armoredSpriteSheet = new Image();
        this.armoredSpriteSheet.src = 'images/player-armor.png';
        this.armoredJumpImage = new Image();
        this.armoredJumpImage.src = 'images/jump-armor.png'; 

        // Additional sprite for jetpack
        this.jetpackImage = new Image();
        this.jetpackImage.src = 'images/player-jetpack.png';

        // Initialize button events
        this.initControls();
    }

    initControls() {
        document.getElementById('left').addEventListener('touchstart', () => this.keys.add('a'));
        document.getElementById('left').addEventListener('touchend', () => this.keys.delete('a'));
        
        document.getElementById('right').addEventListener('touchstart', () => this.keys.add('d'));
        document.getElementById('right').addEventListener('touchend', () => this.keys.delete('d'));
        
        document.getElementById('jump').addEventListener('touchstart', () => this.keys.add('w'));
        document.getElementById('jump').addEventListener('touchend', () => this.keys.delete('w'));
        
        document.getElementById('use').addEventListener('touchstart', () => this.keys.add('u'));
        document.getElementById('use').addEventListener('touchend', () => this.keys.delete('u'));
    }

    draw(ctx) {
        let image;
        // Select the correct image based on armor, jetpack, and jumping status
        if (this.isJetPackEquipped) {
            image = this.jetpackImage;
        } else if (this.isArmorEquipped) {
            image = this.jumping ? this.armoredJumpImage : this.armoredSpriteSheet;
        } else {
            image = this.jumping ? this.jumpImage : this.spriteSheet;
        }

        if (this.jumping) this.currentFrame = 0;

        const sx = this.currentFrame * this.frameWidth;

        ctx.save(); // Save the current context state

        // Correct the condition for flipping the image
        if (this.facingLeft || (this.jumping && this.facingLeft)) {
            ctx.scale(-1, 1); // Flip horizontally
            ctx.translate(-this.x * 2 - this.size, 0); // Translate to correct position
        }

        // Draw the current frame of the player
        ctx.drawImage(image, sx, 0, this.frameWidth, this.frameHeight, this.x, this.y, this.size, this.size * 2);

        ctx.restore(); // Restore the context to its original state
    }

    update() {
        // Check if the bottom of the player is touching the bottom of the world
        if (this.y + this.size * 2 >= this.world.height) {
            this.isAlive = false;
        }

        if (!this.isAlive) {
            // Find the boss and delete him if he exists
            const boss = this.game.sprites.find(sprite => sprite instanceof Boss);
            if (boss) {
                boss.deleteBoss();
            }
            this.game.deathScreen = true;
            return;
        }

        if (this.keys.has('a')) {
            this.isMoving = true;
            this.facingLeft = true;
            if (this.x - this.speed >= 0) {
                for (let i = 0; i < this.speed; i++) {
                    this.move(-1, 0);
                }
            } else {
                this.x = 0;
            }
        }
        else if (this.keys.has('d')) {
            this.isMoving = true;
            this.facingLeft = false;
            if (this.x + this.speed + this.size * 2 <= this.world.getWidth()) {
                for (let i = 0; i < this.speed; i++) {
                    this.move(1, 0);
                }
            }
        } else {
            this.isMoving = false;
        }

        // Modify gravity and jump logic when jetpack is equipped
        if (this.isJetPackEquipped) {
            this.isMoving = false;
            this.jumping = false;
            // No gravity effect and allow vertical movement
            if (this.keys.has('w')) {
                for (let i = 0; i < this.speed; i++) {
                    this.move(0, -1);
                }
            }
            if (this.keys.has('s')) {
                for (let i = 0; i < this.speed; i++) {
                    this.move(0, 1);
                }
            }
        } else {
            // Gravity and jump logic
            for (let i = 0; i < this.velocityY; i++) {
                this.move(0, -1);
            }
            if (this.velocityY > 0) {
                this.velocityY -= this.gravity;
            }
            if (this.y + this.size * 2 >= this.world.height) {
                this.isAlive = false;
                return;
            }
            if (this.canMoveTo(this.x, this.y + this.size, this.x, this.y + this.size + 1, false, true)) {
                for (let i = 0; i < this.gravity; i++) {
                    this.move(0, 1);
                }
            } else {
                this.jumping = false;
                this.grounded = true;
                this.velocityY = 0;
            }
            if (this.keys.has('w') && this.grounded) {
                if (this.y - (this.jumpForce + this.jumpForce + 1) / 2 >= 0) {
                    this.velocityY = this.jumpForce;
                    this.grounded = false;
                    this.jumping = true;
                }
            }
        }

        if (this.keys.has('u')) {
            this.useSelectedItem();
        }

        // Update the frame index for walking animation
        if (!this.jumping) {
            if (this.isMoving) {
                this.currentFrame = (this.currentFrame + 1) % 3;
            } else {
                this.currentFrame = 0; // Standing still frame
            }
        }

        // Reduce cooldown
        if (this.damageCooldown > 0) {
            this.damageCooldown--;
        }

        // Decrease the cooldown timer for mob-meat
        if (this.mobMeatCooldown > 0) {
            this.mobMeatCooldown--;
        }

        this.toolHandler.update();
    }

    useSelectedItem() {
        const mouse = this.game.getMouse();
        const camera = this.game.getCamera();
        const blockX = mouse.x + camera.x;
        const blockY = mouse.y + camera.y;
        const selectedSlot = this.inventory.selectedSlot;
        const selectedItem = this.inventory.items[selectedSlot];

        if (selectedItem) {
            if (selectedItem.name === "pickaxe") {
                this.toolHandler.usePickaxe(blockX, blockY);
            } else if (selectedItem.name === "sword") {
                this.toolHandler.useSword();
            } else if (selectedItem.name === "bow") {
                this.toolHandler.useBow();
            } else if (selectedItem.name === "armor" && !this.isArmorEquipped) {
                this.maxHealth = 200; // Increase max health
                this.isArmorEquipped = true; // Set armor as equipped
                this.inventory.reduceItemCount(this.inventory.selectedSlot); // Remove armor from inventory
            } else if (selectedItem.isPlaceable) {
                this.blockHandler.placeBlock(blockX, blockY, selectedItem.name);
            } else if (selectedItem.name === "mob-meat") {
                if (this.mobMeatCooldown <= 0) {
                    this.health = Math.min(this.health + 20, this.maxHealth); // Increase health by 20
                    this.inventory.reduceItemCount(this.inventory.selectedSlot); // Remove mob-meat from inventory
                    this.mobMeatCooldown = this.mobMeatCooldownDuration; // Reset cooldown
                }
            }
        }
    }

    canMoveTo(x1, y1, x2, y2, ignoreLeftRight, ignoreTopBottom) {
        // Check if movement is possible based on collision detection
        if (!ignoreLeftRight && (this.game.isBlocked(x1, y1) || this.game.isBlocked(x2, y2))) {
            return false;
        }
        if (!ignoreTopBottom && (this.game.isBlocked(x1, y1) || this.game.isBlocked(x2, y2))) {
            return false;
        }
        return true;
    }

    move(dx, dy) {
        // Check if the new position is valid
        if (this.canMoveTo(this.x + dx, this.y + dy, this.x + dx + this.size, this.y + dy + this.size, true, true)) {
            this.x += dx;
            this.y += dy;
        }
    }
}
