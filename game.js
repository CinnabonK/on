const socket = new WebSocket('wss://your-paizacloud-server-url');
let roomId = '';
let currentPlayer = '';
let gameActive = false;

document.getElementById('create-room-btn').addEventListener('click', createRoom);
document.getElementById('join-room-btn').addEventListener('click', joinRoom);

const cells = document.querySelectorAll('[data-cell]');
cells.forEach(cell => cell.addEventListener('click', handleClick));

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'startGame') {
        startGame(data.player);
    } else if (data.type === 'move') {
        updateBoard(data.index, data.player);
    } else if (data.type === 'gameOver') {
        gameOver(data.winner);
    }
};

function createRoom() {
    roomId = Math.random().toString(36).substring(7);
    socket.send(JSON.stringify({ type: 'createRoom', roomId }));
    document.getElementById('room-section').classList.add('hidden');
    document.getElementById('game-board').classList.remove('hidden');
}

function joinRoom() {
    roomId = document.getElementById('room-id').value;
    socket.send(JSON.stringify({ type: 'joinRoom', roomId }));
    document.getElementById('room-section').classList.add('hidden');
    document.getElementById('game-board').classList.remove('hidden');
}

function startGame(player) {
    currentPlayer = player;
    gameActive = true;
    document.getElementById('status').innerText = `${player === 'X' ? 'あなたのターン' : '相手のターン'}`;
}

function handleClick(e) {
    if (!gameActive || currentPlayer !== 'X') return;

    const index = Array.from(cells).indexOf(e.target);
    socket.send(JSON.stringify({ type: 'move', index, roomId, player: currentPlayer }));
}

function updateBoard(index, player) {
    cells[index].innerText = player;
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    document.getElementById('status').innerText = `${currentPlayer === 'X' ? 'あなたのターン' : '相手のターン'}`;
}

function gameOver(winner) {
    gameActive = false;
    document.getElementById('status').innerText = winner ? `${winner}の勝利！` : '引き分け';
}
