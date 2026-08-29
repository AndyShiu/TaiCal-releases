/* 從 GitHub 取得最新版本，填入頁面。
 *
 * HTML 裡已經寫了一個版本號作為預設值，這裡只在成功取得時覆蓋它——
 * GitHub API 對未認證的請求有速率限制（每小時 60 次），
 * 失敗時顯示寫死的版本仍然合理，只是可能落後一版。
 */
(() => {
  'use strict';

  const API = 'https://api.github.com/repos/AndyShiu/TaiCal-releases/releases/latest';
  const targets = document.querySelectorAll('[data-latest-version]');
  if (targets.length === 0) return;

  fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
    .then(res => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
    .then(data => {
      // tag 形如 v1.0，去掉前綴才是版本號
      const version = (data.tag_name || '').replace(/^v/, '');
      if (!version) return;

      // 找 dmg 而不是 zip：頁面上的下載連結指向 dmg，
      // 顯示的大小要跟使用者實際會下載的檔案一致。
      const size = (data.assets || []).find(a => a.name.endsWith('.dmg'));
      const mb = size ? (size.size / 1024 / 1024).toFixed(1) : null;

      targets.forEach(el => {
        el.textContent = version;
        // 檔案大小也一併更新，省得每次發版都要手動改文案
        const sizeEl = el.closest('.meta')?.querySelector('[data-download-size]');
        if (sizeEl && mb) sizeEl.textContent = mb;
      });
    })
    .catch(() => {
      /* 取不到就維持 HTML 裡的預設值，不顯示錯誤——
         版本號對下載這件事不是必要資訊，沒必要為此打擾訪客。 */
    });
})();
