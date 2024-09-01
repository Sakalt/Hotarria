/* これはメインのゲームエンジンです。ゲームの設定、ゲームループの管理、ユーザー入力の処理、
   および他のゲーム要素の調整を行います。また、プレイヤーが死亡または勝利したか、ゲームが一時停止されているかなど、ゲームの状態も管理します。 */

class Game {
    // キャンバスとスプライトの配列を作成します
    constructor(width, height) {
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.sprites = [];
        this.canvas.width = width;
        this.canvas.height = height;
        document.body.appendChild(this.canvas);

        this.deathScreen = false; // 死亡画面を表示するかどうか

        this.selectedSlot = 0;

        this.world = new World(this.width, this.height);
        this.keys = new Set();
        this.camera = { x: 0, y: 0 };

        // キーボードの入力をリスニング
        window.addEventListener('keydown', (event) => {
            /*
            サウンドトラックはイベントリスナー内でのみ初期化できます。
            これはブラウザがイベントリスナーを介してのみ音声を許可するためです。
            */
            if (!soundtrack) {
                initSoundtrack("nature");
            }

            // キー入力による動作の管理
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

            // インベントリスロットの選択（数字キー対応）
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
            this.mouseClick = { x: event.clientX, y: event.clientY };
        });

        window.addEventListener('mouseup', () => {
            this.mouseClick = { x: 0, y: 0 };
        });
    }

    // 各種ゲッター関数
    getCanvas() {
        return this.canvas;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getWorld() {
        return this.world;
    }

    getKeys() {
        return this.keys;
    }

    getMouse() {
        return this.mouseClick;
    }

    getCamera() {
        return this.camera;
    }

    start() {
        // ゲームループを開始
        this.loop();
    }

    // スプライトを配列に追加
    add(obj) {
        this.sprites.push(obj);
    }

    loop() {
        // キャンバスをクリア
        this.ctx.clearRect(0, 0, this.width, this.height);

        // カメラの更新
        const player = this.sprites.find(sprite => sprite instanceof Player);
        if (player) {
            this.camera.x = Math.max(0, Math.min(this.world.width - this.width, player.x - this.width / 2));
            this.camera.y = Math.max(0, Math.min(this.world.height - this.height, player.y - this.height / 2));
        }

        // カメラオフセットでワールドを描画
        this.ctx.save();
        this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));
        this.world.draw(this.ctx);

        // 非UIスプライトをすべて更新
        for (let i = 0; i < this.sprites.length; i++) {
            if (!this.sprites[i].isUI) {
                this.sprites[i].update();
            }
        }

        // 非UIスプライトをすべて描画
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

        // UIスプライトをすべて更新
        for (let i = 0; i < this.sprites.length; i++) {
            if (this.sprites[i].isUI) {
                this.sprites[i].update();
            }
        }

        // UIスプライトをすべて描画
        for (let i = 0; i < this.sprites.length; i++) {
            if (this.sprites[i].isUI) {
                this.sprites[i].draw(this.ctx);
            }
        }

        // 次のフレームをスケジュール
        requestAnimationFrame(() => { this.loop() });
    }
}
