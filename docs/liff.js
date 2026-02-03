const GAS_URL = "https://script.google.com/macros/s/AKfycbzLH_4nutB6wGiAVrxiUQ6vhbeilkIi4h8sh9G1T6nHZiauZcbuJqmCtXOy0ckRVtJk/exec";
let userProfile = null;

// liff.init({ liffId: "2009004003-HY8btsxr" })
// .then(() => {
//     if (!liff.isLoggedIn()) {
//         liff.login();
//     } else {
//         liff.getProfile().then(profile => {
//             userProfile = profile;
//             document.getElementById('displayName').innerText = profile.displayName + "さんの入力";
//             document.getElementById('pictureUrl').src = profile.pictureUrl;
//             document.getElementById('pictureUrl').style.display = "block";
//             document.getElementById('form').style.display = "block";
//         });
//     }
// })
// .catch(err => alert("初期化エラー: " + err));

async function sendData() {
    const noteID = document.getElementById('noteID').value;
    const date   = document.getElementById('date').value;
    const title  = document.getElementById('title').value;
    const price  = document.getElementById('price').value;
    const btn    = document.getElementById('send-btn');
    const status = document.getElementById('status');

    if (!title || !price) {
        alert("項目と金額を入力してください！");
        return;
    }

    btn.disabled = true;
    status.innerText = "保存中...";

    const payload = {
        noteID: noteID,
        // userName: userProfile.displayName,
        userName: "ちあき",
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
            status.innerText = "✅ 保存完了！";
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
        status.innerText = "❌ エラー: " + e;
    } finally {
        btn.disabled = false;
    }
}