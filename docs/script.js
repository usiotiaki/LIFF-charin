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
    document.getElementById('date').value=getToday();
    document.getElementById('menuOverlay').classList.add("open");
    document.getElementById('recordModal').classList.add("open");
}

async function saveExpense() {
    sendData(); // 支出データをGASに送信
    closeModal();
}

// 今日の日付を取得
function getToday() {
    return date2Str(new Date())
}

// 日付を「YYYY-MM-DD」形式で返す
function date2Str(date) {
    return date.toLocaleDateString('sv')
}

// ローディング表示（左下トースト）

let toastFlg = 0; // トースト表示フラグ(flgが1以上の場合はトーストを削除しない)

function showLoading() {
    toastFlg++;
    let loader = document.getElementById('loading-toast');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loading-toast';
        loader.innerText = 'データ更新中...';
        // スタイル設定
        Object.assign(loader.style, {
            position: 'fixed',
            bottom: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '0 20px 20px 0',
            fontSize: '12px',
            zIndex: '9999',
            pointerEvents: 'none', // 操作を邪魔しない
            transition: '1s'
        });
        document.body.appendChild(loader);
    }
    loader.style.transition = '0.3s'
    loader.style.left = '0';
}

function hideLoading() {
    toastFlg--;
    if (toastFlg <= 0) {
        const loader = document.getElementById('loading-toast');
        if (loader) {
            loader.style.transition = '1s'
            loader.style.left = '-100%';
        }
    }
}
