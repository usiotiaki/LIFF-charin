function doPost(e) {
  // 送られてきたデータを解析
  const data = JSON.parse(e.postData.contents);
  
  // スプレッドシートを取得
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  
  // データを末尾に追加 [登録日時, 管理帳ID, 名前, 支出日, 項目, 金額]
  sheet.appendRow([
    new Date(),
    data.noteID,
    data.userName,
    data.date,
    data.title,
    data.price
  ]);
  
  // 完了したことをLIFFに返事する
  return ContentService.createTextOutput(
    JSON.stringify({ result: 'success' })
  ).setMimeType(ContentService.MimeType.JSON);
}
