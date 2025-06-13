// テトリスゲームの実装
class Tetris {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 30;
        
        // キャンバスサイズを設定
        this.canvas.width = this.BOARD_WIDTH * this.BLOCK_SIZE;
        this.canvas.height = this.BOARD_HEIGHT * this.BLOCK_SIZE;
        
        this.board = this.createBoard();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        
        this.currentPiece = null;
        this.nextPiece = null;
        
        this.dropTime = 0;
        this.dropInterval = 1000; // 1秒
        
        this.setupEventListeners();
        this.init();
    }
    
    // テトリスのピース定義
    pieces = [
        // I-piece (水色)
        {
            shape: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            color: '#00f5ff'
        },
        // O-piece (黄色)
        {
            shape: [
                [1, 1],
                [1, 1]
            ],
            color: '#ffff00'
        },
        // T-piece (紫)
        {
            shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: '#a000f0'
        },
        // S-piece (緑)
        {
            shape: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            color: '#00f000'
        },
        // Z-piece (赤)
        {
            shape: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            color: '#f00000'
        },
        // J-piece (青)
        {
            shape: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: '#0000f0'
        },
        // L-piece (オレンジ)
        {
            shape: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: '#ff7f00'
        }
    ];
    
    createBoard() {
        return Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
    }
    
    createPiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        const piece = JSON.parse(JSON.stringify(this.pieces[pieceIndex])); // ディープコピー
        return {
            shape: piece.shape,
            color: piece.color,
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
            y: 0
        };
    }
    
    init() {
        this.currentPiece = this.createPiece();
        this.nextPiece = this.createPiece();
        this.updateDisplay();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || this.paused) {
                if (e.code === 'Space') {
                    this.togglePause();
                }
                return;
            }
            
            switch (e.code) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    break;
                case 'Space':
                    this.togglePause();
                    break;
            }
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }
    
    movePiece(dx, dy) {
        if (this.isValidMove(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            this.draw();
            return true;
        }
        return false;
    }
    
    rotatePiece() {
        const rotated = this.rotate(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (!this.isValidMove(this.currentPiece, 0, 0)) {
            this.currentPiece.shape = originalShape;
        } else {
            this.draw();
        }
    }
    
    rotate(matrix) {
        const n = matrix.length;
        const rotated = Array(n).fill().map(() => Array(n).fill(0));
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                rotated[j][n - 1 - i] = matrix[i][j];
            }
        }
        
        return rotated;
    }
    
    isValidMove(piece, dx, dy) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    if (boardX < 0 || boardX >= this.BOARD_WIDTH || 
                        boardY >= this.BOARD_HEIGHT || 
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    placePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        
        if (!this.isValidMove(this.currentPiece, 0, 0)) {
            this.gameOver = true;
            this.showGameOver();
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // 同じ行をもう一度チェック
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateDisplay();
        }
    }
    
    draw() {
        // ボードをクリア
        this.ctx.fillStyle = '#1a202c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 配置済みのブロックを描画
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(this.ctx, x, y, this.board[y][x]);
                }
            }
        }
        
        // 現在のピースを描画
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.drawBlock(this.ctx, 
                            this.currentPiece.x + x, 
                            this.currentPiece.y + y, 
                            this.currentPiece.color);
                    }
                }
            }
        }
        
        // 次のピースを描画
        this.drawNextPiece();
    }
    
    drawBlock(ctx, x, y, color) {
        const pixelX = x * this.BLOCK_SIZE;
        const pixelY = y * this.BLOCK_SIZE;
        
        ctx.fillStyle = color;
        ctx.fillRect(pixelX, pixelY, this.BLOCK_SIZE, this.BLOCK_SIZE);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(pixelX, pixelY, this.BLOCK_SIZE, this.BLOCK_SIZE);
    }
    
    drawNextPiece() {
        this.nextCtx.fillStyle = '#fff';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const blockSize = 15;
            const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
            const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;
            
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        const pixelX = offsetX + x * blockSize;
                        const pixelY = offsetY + y * blockSize;
                        
                        this.nextCtx.fillStyle = this.nextPiece.color;
                        this.nextCtx.fillRect(pixelX, pixelY, blockSize, blockSize);
                        
                        this.nextCtx.strokeStyle = '#000';
                        this.nextCtx.lineWidth = 1;
                        this.nextCtx.strokeRect(pixelX, pixelY, blockSize, blockSize);
                    }
                }
            }
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('level').textContent = this.level;
    }
    
    gameLoop(timestamp = 0) {
        if (this.gameOver) return;
        
        if (!this.paused) {
            if (timestamp - this.dropTime > this.dropInterval) {
                if (!this.movePiece(0, 1)) {
                    this.placePiece();
                }
                this.dropTime = timestamp;
            }
            
            this.draw();
        }
        
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
    
    togglePause() {
        this.paused = !this.paused;
    }
    
    showGameOver() {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    restart() {
        this.board = this.createBoard();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.dropInterval = 1000;
        this.dropTime = 0;
        
        this.currentPiece = this.createPiece();
        this.nextPiece = this.createPiece();
        
        document.getElementById('game-over').classList.add('hidden');
        this.updateDisplay();
        this.gameLoop();
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    try {
        new Tetris();
        console.log('テトリスゲームが正常に開始されました');
    } catch (error) {
        console.error('ゲームの開始中にエラーが発生しました:', error);
        alert('ゲームの読み込み中にエラーが発生しました。ページを再読み込みしてください。');
    }
});