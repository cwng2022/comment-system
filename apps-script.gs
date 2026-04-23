/**
 * ═══════════════════════════════════════════════════════════════════
 * 班級吐槽牆 · 後端 Apps Script
 *
 * 用法：
 *   1. 打開你嘅 Google Sheet
 *   2. 擴充功能 → Apps Script
 *   3. 將本檔案所有內容 copy-paste 入去，覆蓋原本嘅 function myFunction()
 *   4. 儲存（Ctrl/Cmd+S）
 *   5. 部署 → 新增部署 → 類型選「網頁應用程式」
 *      - 執行身分：我
 *      - 誰可以存取：任何人
 *   6. 複製 Web app URL，貼返入 index.html 嘅 APPS_SCRIPT_URL
 *
 * Sheet header（第一行）：
 *   A=id  B=createdAt  C=content  D=category  E=likes  F=status
 *   如果 sheet 空，第一次 POST 時會自動建立 header。
 * ═══════════════════════════════════════════════════════════════════
 */

const SHEET_HEADERS = ["id", "createdAt", "content", "category", "likes", "status"];

/**
 * 前端 POST 入口。body 期望係 JSON：
 *   { action: "create", record: {...} }
 *   { action: "update", id: "...", changes: { likes: 3 } }
 *   { action: "delete", id: "..." }
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = _getSheet();

    switch (body.action) {
      case "create": return _create(sheet, body.record);
      case "update": return _update(sheet, body.id, body.changes);
      case "delete": return _delete(sheet, body.id);
      default: return _json({ error: "unknown action: " + body.action });
    }
  } catch (err) {
    return _json({ error: err.toString() });
  }
}

/**
 * 前端 GET 入口：返回全部 records（下週 Week 5 或之後用到）
 * 測試方法：瀏覽器直接打開 Apps Script URL 就會睇到 JSON
 */
function doGet(e) {
  try {
    const sheet = _getSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return _json({ records: [] });

    const headers = data[0];
    const records = data.slice(1).map(row => {
      const record = {};
      headers.forEach((h, i) => record[h] = row[i]);
      return record;
    });
    return _json({ records: records });
  } catch (err) {
    return _json({ error: err.toString() });
  }
}

// ───────── CRUD implementations ─────────

function _create(sheet, r) {
  sheet.appendRow([
    r.id,
    r.createdAt,
    r.content,
    r.category,
    r.likes || 0,
    r.status || "active"
  ]);
  return _json({ status: "created", id: r.id });
}

function _update(sheet, id, changes) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      const rowNum = i + 1;
      if (changes.content !== undefined) sheet.getRange(rowNum, 3).setValue(changes.content);
      if (changes.category !== undefined) sheet.getRange(rowNum, 4).setValue(changes.category);
      if (changes.likes !== undefined) sheet.getRange(rowNum, 5).setValue(changes.likes);
      if (changes.status !== undefined) sheet.getRange(rowNum, 6).setValue(changes.status);
      return _json({ status: "updated", id: id });
    }
  }
  return _json({ error: "id not found", id: id });
}

function _delete(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return _json({ status: "deleted", id: id });
    }
  }
  return _json({ error: "id not found", id: id });
}

// ───────── Helpers ─────────

function _getSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  // 如果 sheet 空（連 header 都冇），自動建立 header row
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SHEET_HEADERS);
    sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
