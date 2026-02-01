// オーバーレイタップ時の共通処理/すべてのメニュー・モーダルを閉じる
function closeModal() {
    document.getElementById('menuOverlay').classList.remove("open");

    document.getElementById('switchMenu').classList.remove("open");
    document.getElementById('btn-switch').classList.remove("open");
    document.getElementById('recordModal').classList.remove("open");
}

function moveSwitchMenu() {
    document.getElementById('menuOverlay').classList.toggle("open");
    document.getElementById('switchMenu').classList.toggle("open");
    document.getElementById('btn-switch').classList.toggle("open");
}

function openRecord() {
    document.getElementById('menuOverlay').classList.add("open");
    document.getElementById('recordModal').classList.add("open");
}

async function saveExpense() {
    sendData(); // 支出データをGASに送信
    closeModal();
}
