class Game {
    constructor(width, height) {
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.sprites = [];
        this.canvas.width = width;
        this.canvas.height = height;
        document.body.appendChild(this.canvas);

        this.deathScreen = false;
        this.selectedSlot = 0;
        this.world = new World(this.width, this.height);
        this.keys = new Set();
        this.camera = { x: 0, y: 0 };

        this.mouseClick = { x: 0, y: 0 };
        this.isMousePressed = false; // マウスが押されているかどうか

        // マウスクリック処理を追加
        window.addEventListener('mousedown', (event) => {
            this.mouseClick = { x: event.clientX, y: event.clientY };
            this.isMousePressed = true;
        });

        window.addEventListener('mouseup', () => {
            this.isMousePressed = false;
        });

        // キーボードの入力をリスニング
        window.addEventListener('keydown', (event) => {
            if (!soundtrack) {
                initSoundtrack("nature");
            }

            switch (event.key) {
                case 'w':
                case 'ArrowUp':
                    this.keys.add('w');
                    break;
                case 'a':
                case 'ArrowLeft':
                    this.keys.add('a');
                    break;
                case 'd':
                case 'ArrowRight':
                    this.keys.add('d');
                    break;
                case 's':
                case 'ArrowDown':
                    this.keys.add('s');
                    break;
                case 'r':
                    const player = this.sprites.find(sprite => sprite instanceof Player);
                    if (player && !player.isAlive) {
                        this.deathScreen = false;
                        player.respawn();
                    }
                    break;
            }

            if (event.key >= '1' && event.key <= '9') {
                this.selectedSlot = parseInt(event.key) - 1;
            } else if (event.key === '0') {
                this.selectedSlot = 9;
            }
        });

        window.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'w':
                case 'ArrowUp':
                    this.keys.delete('w');
                    break;
                case 'a':
                case 'ArrowLeft':
                    this.keys.delete('a');
                    break;
                case 'd':
                case 'ArrowRight':
                    this.keys.delete('d');
                    break;
                case 's':
                case 'ArrowDown':
                    this.keys.delete('s');
                    break;
            }
        });
    }

    start() {
        this.loop();
    }

    add(obj) {
        this.sprites.push(obj);
    }

    loop() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        const player = this.sprites.find(sprite => sprite instanceof Player);
        if (player) {
            this.camera.x = Math.max(0, Math.min(this.world.width - this.width, player.x - this.width / 2));
            this.camera.y = Math.max(0, Math.min(this.world.height - this.height, player.y - this.height / 2));
        }

        this.ctx.save();
        this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));
        this.world.draw(this.ctx);

        for (let i = 0; i < this.sprites.length; i++) {
            if (!this.sprites[i].isUI) {
                this.sprites[i].update();
            }
        }

        for (let i = 0; i < this.sprites.length; i++) {
            if (!this.sprites[i].isUI) {
                this.sprites[i].draw(this.ctx);
            }
        }

        this.ctx.restore();

        if (this.deathScreen) {
            displayDeathScreen(this.ctx, this.width, this.height);
            return;
        }

        // プレイヤーの移動処理を追加
        if (this.isMousePressed && player) {
            const targetX = this.mouseClick.x + this.camera.x;
            const targetY = this.mouseClick.y + this.camera.y;

            const dx = targetX - player.x;
            const dy = targetY - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 1) {
                player.x += (dx / distance) * player.speed;
                player.y += (dy / distance) * player.speed;
            }
        }

        for (let i = 0; i < this.sprites.length; i++) {
            if (this.sprites[i].isUI) {
                this.sprites[i].update();
            }
        }

        for (let i = 0; i < this.sprites.length; i++) {
            if (this.sprites[i].isUI) {
                this.sprites[i].draw(this.ctx);
            }
        }

        requestAnimationFrame(() => { this.loop() });
    }
}
