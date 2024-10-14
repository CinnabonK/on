const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('reset');

let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// 通信サーバーと接続
const socket = new WebSocket('ws://localhost:8080');

// ゲームの勝利条件を確認
function checkWin() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            roundWon = true;
            break;
        }
    }
    if (roundWon) {
        statusText.textContent = `${currentPlayer} の勝利！`;
        gameActive = false;
        return true;
    }
    if (!gameState.includes('')) {
        statusText.textContent = '引き分けです！';
        gameActive = false;
        return true;
    }
    return false;
}

// セルがクリックされたときの処理
function cellClicked(event) {
    const index = event.target.getAttribute('data-index');
    if (gameState[index] === '' && gameActive) {
        gameState[index] = currentPlayer;
        event.target.textContent = currentPlayer;
        socket.send(JSON.stringify({ index, player: currentPlayer })); // 他のプレイヤーに送信
        if (!checkWin()) {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusText.textContent = `${currentPlayer} のターン`;
        }
    }
}

// 他のプレイヤーからの更新を受け取る
socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    gameState[data.index] = data.player;
    cells[data.index].textContent = data.player;
    checkWin();
};

cells.forEach(cell => cell.addEventListener('click', cellClicked));

// リセットボタンの処理
resetButton.addEventListener('click', () => {
    gameState = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => (cell.textContent = ''));
    currentPlayer = 'X';
    statusText.textContent = `${currentPlayer} のターン`;
    gameActive = true;
});
