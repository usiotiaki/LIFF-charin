function doPost(e) {
  // 送られてきたデータを解析
  const data = JSON.parse(e.postData.contents);
  const action = data.action; // 'record' または 'register_user'

  // 1. ユーザー登録・更新処理
  if (action === 'register_user') {
    return registerUser(data);
  } 
  // 2. 支出記録処理
  else if (action === 'record') {
    return recordExpense(data);
  }
}

// ユーザー情報の登録・更新関数
function registerUser(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Users');
  const lastRow = sheet.getLastRow();
  
  // 既存ユーザーの検索
  let targetRow = -1;
  if (lastRow > 1) {
    const userIds = sheet.getRange(2, 2, lastRow - 1, 2).getValues().flat();
    const index = userIds.indexOf(data.userId);
    if (index !== -1) {
      targetRow = index + 2; // 行番号は+2 (ヘッダー分と0始まりの補正)
    }
  }

  const timestamp = new Date();

  if (targetRow !== -1) {
    // 更新
    sheet.getRange(targetRow, 3).setValue(data.displayName); // ユーザー名
    sheet.getRange(targetRow, 4).setValue(data.pictureUrl);  // ユーザーアイコンURL
    sheet.getRange(targetRow, 5).setValue(data.noteID);      // 管理帳ID
    sheet.getRange(targetRow, 6).setValue(timestamp);        // updated_at
  } else {
    // 新規登録
    sheet.appendRow([
      timestamp,        // created_at
      data.userID,      // ユーザーID
      data.displayName, // ユーザー名
      data.pictureUrl,  // ユーザーアイコンURL
      data.noteID,      // 管理帳ID
      timestamp         // updated_at
    ]);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'User updated' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 支出記録処理
function recordExpense(data) {  
  // スプレッドシートを取得
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Expenses');
  
  // データを末尾に追加 [登録日時, 管理帳ID, 名前, 支出日, 項目, 金額]
  sheet.appendRow([
    new Date(),
    data.noteID,
    data.userID,
    data.date,
    data.title,
    data.price
  ]);
  
  // 完了したことをLIFFに返事する
  return ContentService.createTextOutput(
    JSON.stringify({ result: 'success' })
  ).setMimeType(ContentService.MimeType.JSON);
}
