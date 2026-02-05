const GAS_URL = "https://script.google.com/macros/s/AKfycbz9mQ4PETqw_1aMcDw3h-wBs3cczqkJM9XxwAZFae4DxvTw_a1Ji_jyBRO0a_qtPkJt/exec";
let userProfile = null;

// liff.init({ liffId: "2009004003-HY8btsxr" })
// .then(() => {
//     if (!liff.isLoggedIn()) {
//         liff.login();
//     } else {
//         liff.getProfile().then(profile => {
//             userProfile = profile;
//             // ユーザー情報をGASに送信して登録・更新
//             registerUserToGas(profile);
//         });
//     }
// })
// .catch(err => alert("初期化エラー: " + err));

// ローカルテスト用
const profile = {
    userId: "hogehoge",
    displayName: "tiaki",
    pictureUrl: "https://profile.line-scdn.net/0h7sa4jjxxaFxMTUB5S_wWIzwdazZvPDFOZH51M3BINDxydCoMMi53PHlLMDxydS4NMHsnai4eZDhAXh86UhuUaEt9NW1wdS4LZSomuA"
}
userProfile = profile;
registerUserToGas(profile);


async function sendData() {
    const noteID = document.getElementById('noteID').value;
    const date   = document.getElementById('date').value;
    const title  = document.getElementById('title').value;
    const price  = document.getElementById('price').value;
    const btn    = document.getElementById('send-btn');

    if (!date || !price) {
        alert("支払日と金額を入力してください！");
        return;
    }

    btn.disabled = true;
    showLoading("保存中...");

    const payload = {
        action: "record", // 支出記録のアクションを指定
        noteID: noteID,
        userID: userProfile.userId,
        date : date,
        title: title,
        price: price
    };

    try {
        // GASにデータを送信
        const response = await fetch(GAS_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showLoading("✅ 保存完了!");
            
            document.getElementById('title').value = "";
            document.getElementById('price').value = "";
            
            // // LINEのトークにメッセージを飛ばす（オプション）
            // if (liff.isInClient()) {
            //     liff.sendMessages([{
            //         type: 'text',
            //         text: `💰 ${userProfile.displayName}が「${title}」に${price}円使ったよ！`
            //     }]);
            // }
        }
    } catch (e) {
        showLoading("❌ エラー: " + e);
    } finally {
        setTimeout(() => {
            hideLoading(2);
        }, 3000);
        btn.disabled = false;
    }
}

// ユーザー情報をGASに登録・更新する
async function registerUserToGas(profile) {
    const noteID = document.getElementById('noteID').value;
    const payload = {
        action: "register_user",
        userID: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        noteID: noteID // 画面上のnoteIDも紐付けのために送信
    };

    try {
        // バックグラウンドで送信するためawaitしない、またはエラーハンドリングを軽めにする
        fetch(GAS_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        }).then(res => console.log("User update request sent"));
    } catch (e) {
        console.error("ユーザー登録エラー:", e);
    }
}

// 指定した年月の支出データをGASから取得する
async function fetchMonthData(year, month) {
    try {
        const noteID = document.getElementById('noteID').value;
        // GASのWebアプリURLにクエリパラメータを付与してGETリクエスト
        const url = `${GAS_URL}?noteID=${noteID}&year=${year}&month=${month}`;
        const res = await fetch(url);
        const data = await res.json();
        return data; // [{date: '2024-10-01', price: 1000, ...}, ...] の形式を想定
    } catch (e) {
        console.error("データ取得エラー:", e);
        return [];
    }
}
