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

        // プレイヤーのターゲット位置を保存する変数を追加
        this.targetPosition = null;

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
                    if (!player.isAlive) {
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

        this.mouseClick = { x: 0, y: 0 };

        window.addEventListener('mousedown', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseClick = { x: event.clientX - rect.left, y: event.clientY - rect.top };
            this.targetPosition = { x: this.mouseClick.x + this.camera.x, y: this.mouseClick.y + this.camera.y }; // ターゲット位置を設定
        });

        window.addEventListener('mouseup', () => {
            this.mouseClick = { x: 0, y: 0 };
            this.targetPosition = null; // マウスボタンが離されたときにターゲット位置をリセット
        });
    }

    // ゲームループでターゲット位置に向かう処理を追加
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

        // ターゲット位置に向かって移動するロジック
        if (this.targetPosition && player) {
            const dx = this.targetPosition.x - player.x;
            const dy = this.targetPosition.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 一定の範囲内でプレイヤーを移動させる
            if (distance > 1) {
                player.x += dx / distance * 2; // スピード調整
                player.y += dy / distance * 2; // スピード調整
            } else {
                this.targetPosition = null; // 目標に到達したらリセット
            }
        }

        this.ctx.restore();

        if (this.deathScreen) {
            displayDeathScreen(this.ctx, this.width, this.height);
            return;
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
