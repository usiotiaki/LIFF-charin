let calendar; // カレンダーをグローバル変数にしてどこからでも呼べるようにする
let expenseCache = {}; // 日付ごとの支出合計を保持するオブジェクト

document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ja',
        datesSet: function(info) { // 月が切り替わった時などに年月表示を更新する
            // カレンダーが動くたびに表示テキストを更新
            const title = info.view.title;
            document.getElementById('currentMonthText').innerText = title;
            
            // 表示中の年月を取得してデータを更新
            const d = calendar.getDate();
            console.log(d);
            updateCalendarData(d.getFullYear(), d.getMonth() + 1);
        },
        height: 'auto',
        headerToolbar: false, // 標準のヘッダーは非表示
        dayCellContent: function(arg) {
            const dateStr = date2Str(arg.date);
            let total = 0;
            if ( expenseCache[dateStr] && expenseCache[dateStr].total ){
                total = expenseCache[dateStr].total;
            }
            
            // 日付の数字部分（FullCalendarのデフォルト構造に寄せる）
            let html = `<div class="fc-daygrid-day-top"><a class="fc-daygrid-day-number">${arg.date.getDate()}</a></div>`;
            
            // 支出情報の部分
            html += `<div class="day-cell-content">`;
            html += `<div class="budget-val">3,540</div>`;
            const h = total > 0 ? `<div class="spend-val">-${total.toLocaleString()}</div>` : `<div class="spend0-val">0</div>`;
            html += h+`</div>`;

            return { html: html };
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

// データを取得してカレンダーを再描画する
async function updateCalendarData(year, month) {
    if (typeof fetchMonthData === 'function') {
        showLoading("データ取得中...");
        const data = await fetchMonthData(year, month);
        
        // データを日付ごとに集計してキャッシュを更新
        let cache = {};
        data.forEach(item => {
            // item.date は "YYYY-MM-DD" 形式、price は数値または文字列を想定
            const d = item.date.substring(0, 10);
            const p = parseInt(item.price, 10);
            if (!isNaN(p)) {
                if( !cache[d] ){
                    cache[d] = {
                        total: 0,
                        detail: []
                    };
                }
                cache[d].total = (cache[d].total || 0) + p;
                cache[d].detail.push(item);
            }
        });
        console.log( cache );
        Object.keys(cache).forEach( k => {
            expenseCache[k] = cache[k];
        });

        // カレンダーの表示を更新（dayCellDidMountが再度走る）
        console.log( "updateCalendarDataカレンダーレンダリング！！" )
        hideLoading();
        calendar.render();
    }
}
