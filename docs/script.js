// オーバーレイタップ時の共通処理/すべてのメニュー・モーダルを閉じる
function closeModal() {
    document.getElementById('menuOverlay').classList.remove("open");

    document.getElementById('switchMenu').classList.remove("open");
    document.getElementById('btn-switch').classList.remove("open");
    document.getElementById('recordModal').classList.remove("open");
    document.getElementById('detailModal').classList.remove("open");
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
function showLoading(text) {
    toastFlg++;
    let loader = document.getElementById('loading-toast');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loading-toast';
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
    loader.innerText = text;
    loader.style.transition = '0.3s'
    loader.style.left = '0';
}
// ローディング非表示
function hideLoading(n = 1) {
    toastFlg = toastFlg < n ? 0 : toastFlg - n;
    if (toastFlg == 0) {
        const loader = document.getElementById('loading-toast');
        if (loader) {
            loader.style.transition = '1s'
            loader.style.left = '-100%';
        }
    }
}

// 支出詳細モーダルを表示する
function showDetailModal(dateStr) {
    const data = expenseCache[dateStr];
    if (!data) return;

    const modal = document.getElementById('detailModal');
    const listEl = document.getElementById('detailList');
    const dateEl = document.getElementById('detailDate');
    const totalEl = document.getElementById('detailTotal');

    // 日付と合計金額を設定
    const d = new Date(dateStr);
    dateEl.innerText = `${d.getMonth() + 1}月${d.getDate()}日`;
    totalEl.innerText = `¥${data.total.toLocaleString()}`;

    // リストをクリア
    listEl.innerHTML = '';

    // 支出項目をリストに追加
    data.detail.forEach(item => {
        const li = document.createElement('li');
        li.className = 'detail-item';
        
        const userIcon = item.user.pictureUrl ? `<img src="${item.user.pictureUrl}" class="user-icon" alt="">` : `<div class="user-icon-placeholder"></div>`;
        
        li.innerHTML = `
            <div class="detail-item-user">
                ${userIcon}
                <span>${item.user.displayName}</span>
            </div>
            <div class="detail-item-title">${item.title || '（項目名なし）'}</div>
            <div class="detail-item-price">¥${item.price.toLocaleString()}</div>
        `;
        listEl.appendChild(li);
    });

    // モーダルとオーバーレイを表示
    document.getElementById('menuOverlay').classList.add("open");
    modal.classList.add("open");
}
