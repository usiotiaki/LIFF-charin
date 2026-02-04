function doGet(e) {
  const noteID = e.parameter.noteID;
  const year = e.parameter.year;
  const month = e.parameter.month;

  console.log(`[REQ] noteID=${noteID}, year=${year}, month=${month}`);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  
  const filteredData = [];
  
  // 全行を走査して該当月を抽出
  console.log( "rows.length:"+rows.length );
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
      console.log("parsed: " + parsed);
    }

    if (d instanceof Date) {
      rowYear = d.getFullYear();
      rowMonth = d.getMonth() + 1;
    } else {
      continue; // 日付データでない行（ヘッダーなど）はスキップ
    }
    
    console.log( "rowYear:"+rowYear+" year:"+year );
    console.log( "rowMonth:"+rowMonth+" month:"+month );
    console.log( "noteIDVal:"+noteIDVal+" noteID:"+noteID );
    
    // デバッグ: IDが一致している行、または年月が一致している行があればログに出す
    if (noteID == noteIDVal || (rowYear == year && rowMonth == month)) {
      console.log(`[ROW ${i}] ID=${noteIDVal}, Date=${rowYear}/${rowMonth} (Target: ${year}/${month})`);
    }

    if (noteID == noteIDVal && rowYear == year && rowMonth == month) {
      filteredData.push({ date: d.toLocaleDateString("sv"), title: row[4], price: row[5] });
      // ロケール"sv"指定により"2026-02-04"の形の日付文字列を取得
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(filteredData)).setMimeType(ContentService.MimeType.JSON);
}
