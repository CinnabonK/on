const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
let currentPlayer = 'X'; // プレイヤー X か O
let gameState = Array(9).fill(null);

// WebSocketサーバーに接続
const socket = new WebSocket('ws://localhost:8080/ws');

// WebSocketが開いたときの処理
socket.addEventListener('open', () => {
    console.log('Connected to the server');
});

// セルがクリックされたときの処理
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const index = cell.getAttribute('data-index');

        // すでに記号がある場合は無視
        if (gameState[index] !== null) return;

        // 現在のプレイヤーの記号をボードにセット
        gameState[index] = currentPlayer;
        cell.textContent = currentPlayer;

        // 次のプレイヤーに交代
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

        // WebSocketで他のプレイヤーに通知
        socket.send(JSON.stringify({ index, player: gameState[index] }));

        // 勝利条件をチェック
        checkWinner();
    });
});

// WebSocketメッセージを受信したときの処理
socket.addEventListener('message', (event) => {
    const { index, player } = JSON.parse(event.data);

    // 他プレイヤーの動作を反映
    gameState[index] = player;
    cells[index].textContent = player;
});

// 勝利条件をチェック
function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // 縦
        [0, 4, 8], [2, 4, 6]  // 斜め
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            alert(`${gameState[a]} wins!`);
            resetGame();
            break;
        }
    }
}

// ゲームリセット
function resetGame() {
    gameState.fill(null);
    cells.forEach(cell => cell.textContent = '');
    currentPlayer = 'X';
}
