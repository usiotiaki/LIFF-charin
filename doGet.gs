function doGet(e) {
  const action = e.parameter.action;

  if (action === 'get_note_info') {
    return getNoteInfo(e);
  } else {
    // デフォルトは支出情報の取得
    return getExpenses(e);
  }
}

// 管理帳情報（予算など）を取得
function getNoteInfo(e) {
  const noteID = e.parameter.noteID;

  // --- Notesシートから管理帳名、予算情報を取得 ---
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const notesSheet = ss.getSheetByName('Notes');
  const notesRows = notesSheet.getDataRange().getValues();

  let noteName = "名称未設定"; // デフォルトは"名称未設定"
  let monthlyBudget = 0;     // デフォルトは0
  for (let i = 1; i < notesRows.length; i++) { // 1行目はヘッダーなのでスキップ
    const nRow = notesRows[i];
    const currentNoteID = nRow[1]; // B列: noteID
    if (Number(currentNoteID) === Number(noteID)) {
      noteName = nRow[2] || "名称未設定"; // C列: name (空の場合は"名称未設定")
      monthlyBudget = nRow[3] || 0; // D列: budget (空の場合は0)
      break; // 見つかったらループを抜ける
    }
  }

  // 支出情報
  return ContentService.createTextOutput(JSON.stringify({
    name: noteName,
    budget: monthlyBudget
  })).setMimeType(ContentService.MimeType.JSON);
}

// 支出情報を取得
function getExpenses(e) {
  const noteID = e.parameter.noteID;
  const year = e.parameter.year;
  const month = e.parameter.month;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

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
