/* 把下載按鈕的點擊送進 Google Analytics。
 *
 * GA 的「加強型評估」本來就會記錄外連點擊，但所有外部連結都混在同一個
 * click 事件裡——下載按鈕、GitHub 連結、releases 連結分不開，得靠
 * link_url 自己拆。送一個具名事件，在報表上就是獨立的一列。
 *
 * 這個數字也比 GitHub 的下載計數乾淨：它只算真人點擊，不會把 Sparkle
 * 的背景檢查、CDN 預取或指令列的抓取算進去。
 */
(function () {
  'use strict';

  /** 送出事件。GA 沒載入（被擋掉或還沒好）時安靜跳過，不影響連結本身。 */
  function send(name, params) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', name, params);
  }

  /** 目前頁面顯示的版本號，讓事件能對應到是哪一版的下載。 */
  function currentVersion() {
    const el = document.querySelector('[data-latest-version]');
    return el ? el.textContent.trim() : 'unknown';
  }

  document.querySelectorAll('[data-download]').forEach(function (el) {
    el.addEventListener('click', function () {
      send('download', {
        location: el.dataset.download,   // nav / hero / footer
        app_version: currentVersion()
      });
    });
  });

  // 前往 releases 頁面跟直接下載是兩回事：那裡的人多半在找特定版本或
  // zip，混在同一個事件裡會讓下載數虛胖。
  document.querySelectorAll('[data-releases]').forEach(function (el) {
    el.addEventListener('click', function () {
      send('view_releases', { location: el.dataset.releases });
    });
  });
})();
