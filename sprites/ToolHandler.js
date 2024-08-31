class ToolHandler {
    constructor(player, world) {
        this.player = player;
        this.world = world;
        this.swordDamage = 35;
        this.WiperDamage = 40;
        this.bowCooldown = 0; // Cooldown counter in frames
        this.bowCooldownDuration = 15; // Duration of cooldown in frames
    }

    usePickaxe(blockX, blockY) {
        // Check if the block is within the specified range before breaking
        if (this.isWithinRange(blockX, blockY, 3)) {
            // Logic to break blocks
            const removedBlockType = this.player.world.removeBlock(blockX, blockY);
            if (removedBlockType && removedBlockType !== 'sky') {
                this.player.inventory.addItem(removedBlockType);
            }
        }
    }

    useSword() {
        // Logic to attack mobs within range
        const mobsInRange = this.player.game.sprites.filter(sprite =>
            sprite instanceof Mob && this.isWithinRange(sprite.x, sprite.y, 3));

        mobsInRange.forEach(mob => {
            // isMouseOverMob is a method that checks if the mouse is over the mob
            if (this.isMouseOverMob(mob)) {
                mob.takeDamage(this.swordDamage); // Damage amount
            }
        });
    }

    useWiper() {
        // Logic to attack mobs within range
        const mobsInRange = this.player.game.sprites.filter(sprite =>
            sprite instanceof Mob && this.isWithinRange(sprite.x, sprite.y, 6));

        mobsInRange.forEach(mob => {
            // isMouseOverMob is a method that checks if the mouse is over the mob
            if (this.isMouseOverMob(mob)) {
                mob.takeDamage(this.WiperDamage); // Damage amount
            }
        });
    }
    useBow() {
        if (this.bowCooldown > 0) {
            return;
        }
        const mouse = this.getMouse();

        // Calculate the angle between the player's center and the mouse click
        const playerCenterX = this.player.x + this.player.size / 2;
        const playerCenterY = this.player.y + this.player.size; // Assuming the player's center is at middle height
        const angle = Math.atan2(mouse.y - playerCenterY, mouse.x - playerCenterX);

        // Create an arrow object with the calculated angle
        const arrow = new Arrow(this.player.game, this.world, playerCenterX, playerCenterY, angle);
        this.player.game.add(arrow); // Assuming the game has a method to add sprites

        // Activate the cooldown
        this.bowCooldown = this.bowCooldownDuration;
    }

    // Helper method to check if a block position is within 3 blocks range of the player
    isWithinRange(blockX, blockY, range) {

        // Determine the direction of the block relative to the player
        const isRight = blockX > this.player.x;
        const isBelow = blockY > this.player.y;

        // Adjust distance calculation based on direction
        const adjustedX = isRight ? this.player.x + this.player.size : this.player.x;
        const adjustedY = isBelow ? this.player.y + this.player.size * 2 : this.player.y;

        // Calculate the distance from the player's position to the block
        const distanceX = Math.abs(blockX - adjustedX);
        const distanceY = Math.abs(blockY - adjustedY);

        return distanceX < range * blockSize && distanceY < range * blockSize;
    }

    // Method to check if mouse is over a mob
    isMouseOverMob(mob) {
        const mouse = this.getMouse();

        return mouse.x >= mob.x && mouse.x <= mob.x + mob.size &&
            mouse.y >= mob.y && mouse.y <= mob.y + mob.size * 2;
    }

    getMouse() {
        const mouse = this.player.game.getMouse();
        const camera = this.player.game.getCamera();
        const x = mouse.x + camera.x;
        const y = mouse.y + camera.y;

        return { x, y };
    }

    update() {
        // Update the cooldown counter
        if (this.bowCooldown > 0) {
            this.bowCooldown--;
        }
    }

}
