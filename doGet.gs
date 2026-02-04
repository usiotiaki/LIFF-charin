function doGet(e) {
  const noteID = e.parameter.noteID;
  const year = e.parameter.year;
  const month = e.parameter.month;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // 支出情報
  const sheet = ss.getSheetByName('Expenses');
  const rows = sheet.getDataRange().getValues();
  // ユーザー情報
  const usersSheet = ss.getSheetByName('Users');
  const usersRows = usersSheet.getDataRange().getValues();
  // ユーザー情報をIDですぐ引けるようにMap化しておく（高速化）
  const userMap = {};
  for (let i = 1; i < usersRows.length; i++) { // 1行目はヘッダーなのでスキップ
    const uRow = usersRows[i];
    const uId = uRow[1]; // B列: ユーザーID
    userMap[uId] = {
      userID:      uRow[1],
      displayName: uRow[2],
      pictureUrl:  uRow[3]
    };
  }
  
  const filteredData = [];
  
  // 全行を走査して該当月を抽出
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const dateVal = row[3]; // 支出日 (インデックス3: D列)
    const noteIDVal = row[1]; // 管理帳ID (インデックス1: B列)
    
    let rowYear, rowMonth;
    
    // 支出日の値があり(nullでない)、かつ日付として解釈できるか試みる
    let d = dateVal;
    if (dateVal) {
      const parsed = new Date(dateVal);
      // 有効な日付(Invalid Dateでない)なら採用
      if (!isNaN(parsed.getTime())) {
        d = parsed;
      }
    }

    if (d instanceof Date) {
      rowYear = d.getFullYear();
      rowMonth = d.getMonth() + 1;
    } else {
      continue; // 日付データでない行（ヘッダーなど）はスキップ
    }
    
    // デバッグ: IDが一致している行、または年月が一致している行があればログに出す
    if (noteID == noteIDVal || (rowYear == year && rowMonth == month)) {
      console.log(`[ROW ${i}] ID=${noteIDVal}, Date=${rowYear}/${rowMonth} (Target: ${year}/${month})`);
    }

    if (noteID == noteIDVal && rowYear == year && rowMonth == month) {
      // 支出記録を入力したユーザーの情報を取得
      const userID = row[2]; // ユーザーID (インデックス2: C列)
      
      // Mapからユーザー情報を取得（見つからない場合はデフォルト値を設定）
      const user = userMap[userID] || {
        userID: userID,
        displayName: "不明なユーザー",
        pictureUrl: ""
      };

      filteredData.push({ 
        date:  d.toLocaleDateString("sv"), // ロケール"sv"指定により"2026-02-04"の形の日付文字列を取得
        user:  user,
        title: row[4], 
        price: row[5] 
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(filteredData)).setMimeType(ContentService.MimeType.JSON);
}
