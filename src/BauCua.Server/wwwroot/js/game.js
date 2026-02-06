// Biểu tượng (khớp với enum DiceSymbol trên server)
const SYMBOLS = ['bau', 'cua', 'tom', 'ca', 'ga', 'nai'];

// Trạng thái game
const state = {
    balance: 0,
    currentBets: { bau: 0, cua: 0, tom: 0, ca: 0, ga: 0, nai: 0 },
    selectedChip: 10,
    isRolling: false,
    soundEnabled: true,
    audio: {},
    connection: null  // SignalR connection
};

// Khởi tạo game
document.addEventListener('DOMContentLoaded', () => {
    initAudio();
    initEventListeners();
    initSignalR();
    simulateLoading();
});

// Khởi tạo SignalR
async function initSignalR() {
    state.connection = new signalR.HubConnectionBuilder()
        .withUrl("/baucua-hub")
        .withAutomaticReconnect()
        .build();

    // Nhận kết quả xúc xắc từ server
    state.connection.on("ReceiveDiceResult", (diceResult) => {
        console.log("Kết quả từ server:", diceResult);
        displayDiceResult(diceResult);
    });

    // Nhận thông báo thắng
    state.connection.on("ReceiveWin", (result) => {
        console.log("Thắng:", result);
        state.balance = result.newBalance;
        showWinEffect(result.amount);
        playSound('win');
        updateUI();
    });

    // Nhận thông báo thua
    state.connection.on("ReceiveLose", () => {
        playSound('lose');
    });

    // Cập nhật số dư
    state.connection.on("UpdateBalance", (newBalance) => {
        state.balance = newBalance;
        updateUI();
    });

    // Kết nối
    try {
        await state.connection.start();
        console.log("Đã kết nối SignalR");
    } catch (err) {
        console.error("Lỗi kết nối SignalR:", err);
    }
}

// Khởi tạo audio
function initAudio() {
    state.audio = {
        roll: document.getElementById('sound-roll'),
        win: document.getElementById('sound-win'),
        lose: document.getElementById('sound-lose'),
        bet: document.getElementById('sound-bet'),
        bgm: document.getElementById('sound-bgm')
    };
    Object.values(state.audio).forEach(a => { if (a) a.load(); });
}

// Gắn sự kiện
function initEventListeners() {
    document.getElementById('play-button').addEventListener('click', startGame);
    document.getElementById('roll-button').addEventListener('click', rollDice);
    document.getElementById('home-button').addEventListener('click', () => location.reload());
    document.getElementById('sound-button').addEventListener('click', toggleSound);

    // Chọn chip
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('chip-active'));
            chip.classList.add('chip-active');
            state.selectedChip = parseInt(chip.dataset.value);
        });
    });

    // Đặt cược
    document.querySelectorAll('.bet-card').forEach(card => {
        card.addEventListener('click', () => {
            if (state.isRolling) return;
            placeBet(card.dataset.symbol);
        });
    });

    document.getElementById('btn-close-overlay').addEventListener('click', hideOverlay);
}

// Giả lập loading
function simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            document.getElementById('loading-bar').style.width = '100%';
            document.getElementById('loading-text').innerText = '100%';
            setTimeout(() => {
                document.getElementById('play-button').style.display = 'block';
            }, 500);
        } else {
            document.getElementById('loading-bar').style.width = progress + '%';
            document.getElementById('loading-text').innerText = Math.floor(progress) + '%';
        }
    }, 100);
}

// Bắt đầu game
function startGame() {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';

    // Phát nhạc nền
    if (state.soundEnabled && state.audio.bgm) {
        state.audio.bgm.currentTime = 0;
        state.audio.bgm.play().catch(() => {
            document.addEventListener('click', () => state.audio.bgm.play(), { once: true });
        });
    }
    updateUI();
}

// Đặt cược - gửi lên server
async function placeBet(symbol) {
    if (state.balance < state.selectedChip) {
        showOverlay('Thông báo', 'Không đủ VNĐ!');
        return;
    }

    // Map symbol name to enum value
    const symbolIndex = SYMBOLS.indexOf(symbol);
    if (symbolIndex === -1) return;

    try {
        // Gửi cược lên server
        await state.connection.invoke("PlaceBet", {
            symbol: symbolIndex,
            amount: state.selectedChip
        });

        // Cập nhật UI local (server sẽ gửi UpdateBalance)
        state.currentBets[symbol] += state.selectedChip;
        updateUI();
    } catch (err) {
        console.error("Lỗi đặt cược:", err);
        showOverlay('Lỗi', 'Không thể đặt cược!');
    }
}

// Lắc xúc xắc - yêu cầu server
async function rollDice() {
    if (state.isRolling) return;

    const totalBet = Object.values(state.currentBets).reduce((a, b) => a + b, 0);
    if (totalBet === 0) {
        showOverlay('Thông báo', 'Vui lòng đặt cược!');
        return;
    }

    state.isRolling = true;
    document.getElementById('roll-button').disabled = true;
    playSound('roll');

    // Animation lắc
    const diceElements = [
        document.getElementById('dice-0'),
        document.getElementById('dice-1'),
        document.getElementById('dice-2')
    ];
    diceElements.forEach(el => el.classList.add('rolling'));

    // Animation đổi hình ngẫu nhiên
    let rollCount = 0;
    const maxRolls = 15;
    state.rollInterval = setInterval(() => {
        diceElements.forEach(el => {
            const randomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            el.querySelector('img').src = `assets/images/${randomSymbol}.png`;
        });
        rollCount++;
        if (rollCount >= maxRolls) {
            clearInterval(state.rollInterval);
        }
    }, 100);

    try {
        // Gọi server để lắc (server sẽ gửi ReceiveDiceResult)
        await state.connection.invoke("RollDice");
    } catch (err) {
        console.error("Lỗi lắc xúc xắc:", err);
        clearInterval(state.rollInterval);
        diceElements.forEach(el => el.classList.remove('rolling'));
        state.isRolling = false;
        document.getElementById('roll-button').disabled = false;
    }
}

// Hiển thị kết quả xúc xắc từ server
function displayDiceResult(diceResult) {
    // Dừng animation
    if (state.rollInterval) {
        clearInterval(state.rollInterval);
        state.rollInterval = null;
    }

    const diceElements = [
        document.getElementById('dice-0'),
        document.getElementById('dice-1'),
        document.getElementById('dice-2')
    ];

    // diceResult là mảng số (enum values)
    diceResult.forEach((symbolIndex, idx) => {
        const symbolName = SYMBOLS[symbolIndex];
        diceElements[idx].classList.remove('rolling');
        diceElements[idx].querySelector('img').src = `assets/images/${symbolName}.png`;

        // Highlight ô thắng
        const card = document.querySelector(`.bet-card[data-symbol="${symbolName}"]`);
        if (card) card.classList.add('winning');
    });

    // Kiểm tra thắng thua local
    checkWinLose(diceResult);

    state.isRolling = false;
    document.getElementById('roll-button').disabled = false;

    // Reset sau 3s
    setTimeout(() => {
        Object.keys(state.currentBets).forEach(key => state.currentBets[key] = 0);
        document.querySelectorAll('.bet-card').forEach(card => card.classList.remove('winning', 'active-bet'));
        updateUI();
    }, 3000);
}

// Kiểm tra thắng thua (nếu server không gửi ReceiveWin)
function checkWinLose(diceResult) {
    let hasWin = false;
    diceResult.forEach(symbolIndex => {
        const symbolName = SYMBOLS[symbolIndex];
        if (state.currentBets[symbolName] > 0) {
            hasWin = true;
        }
    });

    if (!hasWin) {
        playSound('lose');
    }
}

// Cập nhật giao diện
function updateUI() {
    document.getElementById('balance').innerText = state.balance.toLocaleString();

    SYMBOLS.forEach(symbol => {
        const amountEl = document.getElementById(`bet-${symbol}`);
        if (amountEl) {
            amountEl.innerText = state.currentBets[symbol].toLocaleString();
            amountEl.style.display = state.currentBets[symbol] > 0 ? 'block' : 'none';
        }

        const cardEl = document.querySelector(`.bet-card[data-symbol="${symbol}"]`);
        if (cardEl) {
            cardEl.classList.toggle('active-bet', state.currentBets[symbol] > 0);
        }
    });
}

// Bật/tắt âm thanh
function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    const btn = document.getElementById('sound-button');
    btn.style.opacity = state.soundEnabled ? '1' : '0.5';

    if (state.audio.bgm) {
        state.soundEnabled ? state.audio.bgm.play().catch(() => { }) : state.audio.bgm.pause();
    }
}

// Phát âm thanh
function playSound(type) {
    if (!state.soundEnabled || !state.audio[type]) return;
    if (type !== 'bgm') {
        const sound = state.audio[type].cloneNode();
        sound.volume = state.audio[type].volume;
        sound.play().catch(() => { });
    } else {
        state.audio[type].currentTime = 0;
        state.audio[type].play().catch(() => { });
    }
}

// Hiện thông báo
function showOverlay(title, message) {
    document.getElementById('overlay-title').innerText = title;
    document.getElementById('overlay-message').innerText = message;
    document.getElementById('overlay').style.display = 'flex';
}

// Ẩn thông báo
function hideOverlay() {
    document.getElementById('overlay').style.display = 'none';
}

// Hiệu ứng thắng
function showWinEffect(amount) {
    const wrapper = document.querySelector('.game-wrapper');
    const effect = document.createElement('div');
    effect.className = 'win-animation';
    effect.innerText = `+${amount.toLocaleString()} VNĐ`;
    wrapper.appendChild(effect);
    setTimeout(() => effect.remove(), 2500);
}
