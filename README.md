# 官網

**https://taical.andyshiu.com** 的原始碼。

純靜態網站，沒有建置步驟。本機預覽：在這個資料夾執行 `python3 -m http.server`，打開 http://localhost:8000 。
部署：`./scripts/publish_website.sh`（推到 `AndyShiu/TaiCal-releases` 的 gh-pages 分支）。

```
web/
├── index.html      單頁內容（Mac＋iPhone＋iPad）
├── privacy.html    隱私權政策（App Store 必填網址）
├── styles.css      樣式，深淺色以 CSS 變數切換；privacy.html 也借用這裡的配色
├── site.js         App Store 狀態、深淺色切換、主視覺縮放、下載點擊統計
├── CNAME           自訂網域
└── assets/         App 圖示、分享圖；v2/ 是改版用的截圖（WebP）
```

## 設計來源

v2（2026-09）由 Claude Design 產出，交付資料與原型在
[`../docs/claude-design-website-v2/handoff/`](../docs/claude-design-website-v2/handoff/)，
規格以那裡的 README 為準。上一版（只有 Mac）的簡報見 `../docs/DESIGN-BRIEF-website.md`。

## App Store 上架後要改的地方

1. `site.js` 開頭的 `SITE`：`appStore` 改成 `'live'`，`appStoreUrl` 填 App Store 連結
2. 把 Apple 官方「Download on the App Store」徽章 SVG 放到 `assets/v2/app-store-badge.svg`
   （從 Apple Marketing Resources 下載，不可改色或比例）
3. `index.html` 的 `<head>` 可加上 `<meta name="apple-itunes-app" content="app-id=6816707196">`，
   iPhone 的 Safari 會在頁面頂端顯示 App Store 下載橫幅

「即將推出」與「已上架」兩種狀態都寫在 HTML 裡，用 `data-appstore` 與 `.if-soon`／`.if-live` 切換，改設定就好，不用動版面。

## 其他

- 下載按鈕帶 `data-track`，由 `site.js` 送進 Google Analytics：Mac 下載沿用舊的 `download` 事件（報表可以跟改版前接起來），App Store 相關的是 `appstore_click`
- Mac 發版時 `scripts/release.sh` 會改 `index.html` 結構化資料裡的 `softwareVersion`
- 手機、平板打開時 App Store 按鈕排在前面：寬度 < 760 由 CSS 處理，寬螢幕的 iPad 由 `<head>` 裡的小段程式加上 `app-first`
