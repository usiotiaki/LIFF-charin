let calendar; // カレンダーをグローバル変数にしてどこからでも呼べるようにする

document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ja',
        datesSet: function(info) { // 月が切り替わった時などに年月表示を更新する
            // カレンダーが動くたびに表示テキストを更新
            const title = info.view.title;
            document.getElementById('currentMonthText').innerText = title;
        },
        height: 'auto',
        headerToolbar: false, // 標準のヘッダーは非表示
        dayCellContent: function(arg) {
            // 日付の数字だけを取り出す
            return arg.date.getDate();
        },
        // 日付マスに予算と実績を流し込む
        dayCellDidMount: function(info) {
            const content = document.createElement('div');
            content.className = 'day-cell-content';
            // ※本来はここにGASから取得したデータを入れます
            content.innerHTML = `
                <div class="budget-val">3,540</div>
                <div class="spend-val">-7,500</div>
            `;
            info.el.querySelector('.fc-daygrid-day-frame').appendChild(content);
        },
        // 日付をタップした時の処理
        dateClick: function(info) {
            alert('日付タップ: ' + info.dateStr + '\nここに詳細モーダルを出します');
        }
    });
    calendar.render();
    
    // セレクトボックスの選択肢（前後12ヶ月分など）を作成
    initMonthSelector();
});

// 前の月へ
function calPrev() {
    calendar.prev();
}

// 次の月へ
function calNext() {
    calendar.next();
}

// 特定の年月へジャンプ
function calJump(dateStr) {
    calendar.gotoDate(dateStr);
}

// セレクトボックスの中身を作る
function initMonthSelector() {
    const select = document.getElementById('monthSelector');
    const now = new Date();
    // 前後1年分（計24ヶ月）の選択肢を作成
    for (let i = -12; i <= 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const val = `${y}-${String(m).padStart(2, '0')}-01`;
        const text = `${y}年 ${m}月`;
        
        const opt = document.createElement('option');
        opt.value = val;
        opt.text = text;
        if (i === 0) opt.selected = true;
        select.appendChild(opt);
    }
}