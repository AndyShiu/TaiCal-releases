# 官網

**https://taical.andyshiu.com** 的原始碼。

純靜態網站，沒有建置步驟——直接開 `index.html` 即可預覽。

```
web/
├── index.html      單頁內容
├── styles.css      樣式，深淺色以 CSS 變數切換
├── calendar.js     產生示意用的月曆格線
├── scroll.js       進場動畫與配色輪播
├── CNAME           自訂網域
└── assets/         App 圖示
```

## 設計來源

由 Claude Design 產出（專案檔 `TaiCal 官網.dc.html`），採用主方案
「日曆紙」——磚紅配米白，帶撕頁日曆的紙感，沿用 App 圖示的品牌色。

設計簡報見 [`../docs/DESIGN-BRIEF-website.md`](../docs/DESIGN-BRIEF-website.md)。

## 滾動效果

`scroll.js` 做兩件事，都是漸進增強——JS 未執行時頁面完整可讀，只是沒有動畫：

- **進場淡入**：區塊進入畫面時淡入並微幅上移，以 `IntersectionObserver` 觸發，只播一次
- **配色輪播**：捲到外觀區塊時，示範用的小工具在五組配色之間輪播；
  使用者點名稱可手動切換並停止自動播放

尊重 `prefers-reduced-motion`：偏好減少動態時不套用任何轉場，
區塊直接標記為已顯示，不會停在初始的透明狀態。

輪播只在區塊出現於畫面時運行，分頁切到背景也會暫停。

## 月曆格線為什麼用 JS 產生

頁面上有七處月曆示意（主視覺兩個、農曆區一個、配色預設集五個），
每個都是 40 格。寫死會是上千行重複的 HTML，改一個顏色要動七處。
`calendar.js` 以六組色票產生，改配色只需改色票。

它是純粹的裝飾——JS 未執行時頁面的文字與下載連結完全不受影響。

## 預覽

```bash
open web/index.html
```

或起一個本機伺服器：

```bash
python3 -m http.server 8000 --directory web
```

## 深淺色

**預設淺色**，不跟隨系統——網站的視覺主體是帶紙感的淺色設計，
深色是使用者主動選擇的選項。導覽列有切換按鈕，選擇記在 `localStorage`。

實作上有三個地方需要配合：

- `<html data-theme>` 控制配色，深色的變數定義在 `[data-theme="dark"]`
- `<head>` 內有一小段行內 script，在樣式套用前就讀取已儲存的選擇，
  避免載入時先閃一下淺色再跳深色
- 月曆格線的顏色由 `calendar.js` 給，切換後必須重新產生，
  否則背景變深了、格線文字卻還是深棕色

## 部署

網站放在 `AndyShiu/TaiCal-releases` 的 **`gh-pages` 分支**，
與 `main` 上的安裝檔、假日資料分開。

更新網站時，把 `web/` 的內容推上該分支：

```bash
./scripts/publish_website.sh
```

`gh-pages` 是孤立分支（orphan），不含 `main` 的歷史——
它的內容與安裝檔無關，混在一起只會讓兩邊的紀錄互相干擾。

### 自訂網域

網站使用 `taical.andyshiu.com`，網域在 Cloudflare 管理。

**DNS 設定**（Cloudflare 面板）

| 欄位 | 值 |
|---|---|
| Type | `CNAME` |
| Name | `taical` |
| Target | `andyshiu.github.io` |
| Proxy status | **DNS only**（灰色雲） |

> **Proxy 必須關閉。** 維持 Proxied（橘色雲）的話，GitHub 無法完成網域驗證，
> HTTPS 憑證會申請失敗；或是形成 Cloudflare 與 GitHub 雙層 CDN，
> 產生重新導向迴圈。

Target 是 `andyshiu.github.io`，不含 repo 名稱、不含 `https://`。

**GitHub 設定**

repo Settings → Pages → Custom domain 填 `taical.andyshiu.com`，
驗證通過後勾選 **Enforce HTTPS**（憑證由 GitHub 自動申請，免費）。

憑證簽發通常幾分鐘內完成，偶爾需要等到一小時。

**`CNAME` 檔案**

`web/CNAME` 的內容就是網域本身。GitHub Pages 靠它記住自訂網域——
少了這個檔案，每次部署都會把 Settings 裡的設定重置掉。
