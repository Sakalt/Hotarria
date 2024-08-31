class Crafting extends Sprite {
    constructor(game, inventory, screenWidth, screenHeight, spriteImage) {
        super(true); // Setting isUI to true
        this.game = game;
        this.inventory = inventory;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.width = screenWidth * 0.05; // 5% of the screen width
        this.height = screenHeight * 0.05; // 5% of the screen height
        this.x = screenWidth * 0.1; // Positioned 10% from the left
        this.y = screenHeight * 0.97 - this.height; // Positioned 3% above the bottom
        this.recipeOffset = 250;
        this.spriteImage = spriteImage; // The image for the crafting sprite
        this.toggleRecipes = false; // State to toggle recipe list
        this.recipes = []; // Array to store recipe objects
        this.loadRecipes(); // Initialize recipes

        this.lastClickTime = 0; // Timer to track the last click time
        this.clickCooldown = 30; // 30 frames cooldown (0.5 seconds at 60 FPS)
    }

    loadRecipes() {
        // Here you would create Recipe instances and push them into this.recipes
        this.recipes.push(new Recipe('jetpack', {'boss-meat': 3, 'diamond': 5, "iron": 10}));
        this.recipes.push(new Recipe('summon', {'mob-meat': 10, 'diamond': 5}));
        this.recipes.push(new Recipe('armor', {'iron': 10, 'diamond': 5}));
        this.recipes.push(new Recipe('bow', {'stone': 10, 'iron': 5}));
        this.recipes.push(new Recipe('Wiper', {'diamond': 4, 'iron': 6}));
    }

    draw(ctx) {
        ctx.save(); // Save current state
        // Draw the crafting button
        if (this.spriteImage) {
            ctx.drawImage(this.spriteImage, this.x, this.y, this.width, this.height);
        }
        // Draw the "Craft" text below the sprite
        ctx.fillStyle = 'black';
        ctx.font = 'bold 16px Arial';
        ctx.fillText("Craft", this.x + this.width / 2 - ctx.measureText("Craft").width / 2, this.y + this.height + 15);
        ctx.restore(); // Restore to the saved state

        // Draw the recipe list if shown
        if (this.toggleRecipes) {
            this.recipes.forEach((recipe, index) => {
                // Calculate Y position for each recipe
                let offsetY = (index * (recipe.height + 20));
                recipe.draw(ctx, 10, this.recipeOffset - offsetY); // Multiply width as needed
            });
        }
    }

    update() {

        if (this.lastClickTime > 0) {
            this.lastClickTime--;
        }

        // Get mouse click coordinates
        const mouseX = this.game.mouseClick.x;
        const mouseY = this.game.mouseClick.y;

        // Check if the click is within the crafting menu
        if (mouseX >= this.x && mouseX <= this.x + this.width &&
            mouseY >= this.y && mouseY <= this.y + this.height) {
            this.toggleRecipesMenu(); // Call the showRecipes method
        }

        if (this.toggleRecipes) {
            this.recipes.forEach((recipe, index) => {
                let offsetY = (index * (recipe.height + 20));
                if (mouseY >= this.recipeOffset - offsetY && mouseY <= this.recipeOffset - offsetY + recipe.height &&
                    mouseX >= 10 && mouseX <= 10 + 48) {
                    // Attempt to craft the item if the recipe is clicked
                    recipe.craft(this.inventory);
                }
            });
        }
    }

    toggleRecipesMenu() {
        if (!this.lastClickTime) {
            this.toggleRecipes = !this.toggleRecipes;
            this.lastClickTime = this.clickCooldown;
        }
    }
}
