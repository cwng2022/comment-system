# Week 4 Setup 指引：將資料存入 Google Sheet

> 呢份 guide 教你點樣由 **Week 3 嘅 localStorage 版**，升級到 **Week 4 連接 Google Sheet 後端**。
> 你要 follow 嘅步驟大概 10 分鐘搞掂。

---

## 完成後你會有乜

1. 一個你自己嘅 Google Sheet（你可以**睇到每一條記錄**）
2. 一條 Apps Script Web App URL（你個後端嘅「地址」）
3. `index.html` 嘅 `saveData` 同 `handleLike` 會**自動將資料寫入 Sheet**
4. 任何人打開你個 GitHub Pages URL 輸入資料 → 你喺 Sheet 即刻見到

---

## Step 1 — 建立 Google Sheet（2 分鐘）

1. 去 https://sheets.new （會開一個新 Sheet）
2. Sheet 名改成：**「班級吐槽牆 DB」**（或你鍾意嘅名）
3. 第 1 行填入 header（**逐格填入，順序必須係咁**）：

   | A | B | C | D | E | F |
   |---|---|---|---|---|---|
   | id | createdAt | content | category | likes | status |

   > ⚠️ 大細楷要吻合。
   > 如果嫌手動慢，可以 skip（Apps Script 第一次 POST 會自動建立 header）。

---

## Step 2 — 打開 Apps Script 並貼入 code（3 分鐘）

1. 喺 Sheet 頂部 menu：**擴充功能** → **Apps Script**
2. 會打開一個新 tab，默認已經有一個 `Code.gs` 檔案
3. **刪掉 default 嘅 `function myFunction() { }`**（整個清空）
4. 打開呢個 repo 入面嘅 [`apps-script.gs`](./apps-script.gs)，**全部複製**
5. 貼入 Apps Script 編輯器
6. 儲存：`Cmd+S`（Mac）或 `Ctrl+S`（Windows）
7. 改 project 名（頂部）：例如「班級吐槽牆 Backend」

---

## Step 3 — 部署做 Web App（3 分鐘）

1. Apps Script 編輯器右上角 click **「部署」** → **「新增部署」**
2. **類型**（左上角齒輪）：選 **「網頁應用程式」**
3. 設定：
   - **說明**：Week 4 backend（可空）
   - **執行身分**：**「我」**（以你嘅 Google 帳號執行 → 可以寫入你嘅 Sheet）
   - **誰可以存取**：**「任何人」**（即使未登入都可 POST）
4. Click **「部署」**
5. **首次部署會要求授權**：
   - Click「授權存取權」→ 揀你個 Google 帳號
   - 可能會出現「Google 未驗證這個應用程式」警告 → 點「進階」→ 點「前往『[你嘅 project 名]』(不安全)」→ 「允許」
   - 呢個係因為你自己寫嘅 script，Google 冇 review 過，但實際上安全
6. 部署成功之後，會彈出一個框顯示：
   ```
   網頁應用程式 URL：
   https://script.google.com/macros/s/AKfycb.../exec
   ```
7. **複製呢條 URL**（保留備用）

> 💡 Test 一次：將 URL 貼入瀏覽器 address bar 打開（GET 請求），應該會見到 `{"records":[]}` 嘅 JSON。

---

## Step 4 — 將 URL 填入 index.html（1 分鐘）

1. 打開 [`index.html`](./index.html)
2. 搵第 97 行左右：
   ```js
   const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_URL_HERE";
   ```
3. 將 `PASTE_YOUR_APPS_SCRIPT_URL_HERE` 換成你 Step 3 copy 到嘅 URL：
   ```js
   const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
4. 儲存檔案

---

## Step 5 — Push 去 GitHub（1 分鐘）

Terminal（或 VSCode 嘅 Source Control）：

```bash
git add index.html
git commit -m "week4: connect to Apps Script backend"
git push
```

GitHub Pages 會喺 30-60 秒內自動重新 deploy。

---

## Step 6 — 測試成個 pipeline（2 分鐘）

1. 打開你嘅 GitHub Pages URL：
   https://cwng2022.github.io/comment-system/
2. Click「我要吐槽」→ 輸入一條 → 發布
3. **切換去你嘅 Google Sheet tab** → 應該即時見到新 row
4. 按 thumbs-up 👍 一條 → Sheet 嘅 `likes` 欄應該 +1

如果 ✅ work，恭喜——你已經有一個真後端系統。

---

## 🐛 Troubleshooting

### 問題：Sheet 冇資料入，但頁面表面正常

**檢查 console**：
- 開 browser DevTools（F12）→ Console
- 睇有冇紅色 error
- 如果見到 `[Week 4] Sheet sync failed`，問題喺 fetch

**最常見原因**：
1. **APPS_SCRIPT_URL 貼錯**：check `index.html` 嗰條 URL 同 Apps Script 部署框嗰條一樣
2. **部署時「誰可以存取」冇揀「任何人」**：返 Apps Script → 管理部署 → 編輯 → 改返「任何人」→ 重新部署
3. **Apps Script code 未儲存**：返 Apps Script 編輯器 Ctrl+S，再「管理部署」→ 「新版本」

### 問題：瀏覽器 console 有 CORS error

- 確認 `index.html` 嘅 fetch call 用緊 `Content-Type: text/plain`（**唔係** `application/json`）
- `application/json` 會觸發 CORS preflight request，Apps Script 預設唔識處理
- 本 repo 已經用咗 `text/plain`，body 照樣傳 JSON string，Apps Script 用 `JSON.parse(e.postData.contents)` parse

### 問題：改咗 Apps Script code 但唔生效

- Apps Script 改完一定要**重新部署**先生效
- 「管理部署」→ 原本嗰個部署右邊嘅鉛筆 → 版本選「新版本」→ 部署
- **同一條 Web App URL** 會繼續 work，唔使改 `index.html`

### 問題：thumbs-up 按咗 Sheet 冇變

- 確認 Sheet 入面嗰 row 有 `id`（A 欄）—— update 係靠 id 搵 row
- 如果你係由 `[]` 空 Sheet 開始測試，舊 localStorage 入面嘅記錄冇 `id` 對應嘅 Sheet row，所以 update 會失敗

---

## 下一步（Week 5 預告）

Week 4 我哋得 CREATE + UPDATE（前端落資料入 Sheet）。

**Week 5 會補**：
- GET（頁面 load 時由 Sheet 讀取 records，真 cross-device 同步）
- Gemini API proxy（將 AI API key 放喺 Apps Script 後端，唔畀前端暴露）

---

## CRUD 概念 cheatsheet（Week 4 新學）

| 操作 | 全名 | HTTP 等價 | 本 system 點做 |
|:---:|:---:|:---:|------|
| **C**REATE | 新增 | POST | 發表吐槽 → `action: "create"` |
| **R**EAD | 讀取 | GET | 頁面 load → `doGet()` |
| **U**PDATE | 更新 | PUT/PATCH | 按 👍 → `action: "update"` |
| **D**ELETE | 刪除 | DELETE | （本系統未用）→ `action: "delete"` |

呢四個字 = 後端世界 99% 嘅 operation。記住 = 打通任督二脈。
