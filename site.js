/* 官網 v2 的少量互動：App Store 狀態、深淺色切換、主視覺縮放、下載點擊統計。 */
(function () {
  'use strict';

  /* ===== App Store 上架後只要改這裡 =====
   * appStore:    'soon'（即將推出）| 'live'（已上架）
   * appStoreUrl: App Store 連結，例如 https://apps.apple.com/tw/app/id6816707196
   * 改成 live 前，記得把 Apple 官方徽章放到 assets/v2/app-store-badge.svg。 */
  var SITE = {
    appStore: 'soon',
    appStoreUrl: ''
  };

  var root = document.documentElement;
  root.dataset.appstore = SITE.appStore;
  if (SITE.appStore === 'live' && SITE.appStoreUrl) {
    document.querySelectorAll('[data-appstore-link]').forEach(function (a) { a.href = SITE.appStoreUrl; });
  }

  /* ----- 深淺色：預設跟隨系統，按了就記住 ----- */
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = root.dataset.theme ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('taical-theme', next); } catch (e) { /* 存不了就只切這一次 */ }
    });
  }

  /* ----- 主視覺與示意圖：寬度不夠時等比縮小 -----
   * 舞台是固定尺寸的構圖（桌機 1120×590、手機 360×400），用 zoom 縮放，
   * 版面高度也跟著縮，不會留下 transform 造成的空白。 */
  function fit() {
    var w = document.documentElement.clientWidth;
    var gutter = Math.min(64, Math.max(20, w * 0.045));
    var avail = Math.max(280, w - gutter * 2);
    var narrow = w < 760;
    var stageW = narrow ? 360 : 1120;
    root.style.setProperty('--k', Math.min(1, avail / stageW).toFixed(4));
    root.style.setProperty('--kv', Math.min(1, (avail - (narrow ? 32 : 0)) / 560).toFixed(4));
  }
  fit();
  window.addEventListener('resize', fit);

  /* ----- 捲動動畫 -----
   * 系統開了「減少動態效果」就完全不做，內容直接顯示。
   * 動畫只靠 CSS 的 transition，這裡只負責標記「進入畫面了」與排出先後順序。 */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    root.classList.add('anim');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.12 });

    /* 一組元素依序出現：每個間隔 step 毫秒 */
    function reveal(list, step, start) {
      Array.prototype.forEach.call(list, function (el, i) {
        el.setAttribute('data-reveal', '');
        el.style.setProperty('--d', ((start || 0) + i * (step || 90)) + 'ms');
        io.observe(el);
      });
    }
    function all(sel) { return document.querySelectorAll(sel); }

    reveal(all('.specs > span'), 120);
    all('.feature-text').forEach(function (t) { reveal(t.children, 90); });
    all('.dots, .steps-dark').forEach(function (l) { reveal(l.children, 110, 250); });
    all('.legend').forEach(function (l) {
      // 圖例是兩欄 grid，一列兩個元素，同一列用同一個延遲
      Array.prototype.forEach.call(l.children, function (el, i) {
        el.setAttribute('data-reveal', '');
        el.style.setProperty('--d', (300 + Math.floor(i / 2) * 110) + 'ms');
        io.observe(el);
      });
    });
    reveal(all('.presets .preset'), 80, 200);
    reveal(all('.feature-art > .phone, .feature-art > .scale-vis'), 0, 100);
    reveal(all('.leave-intro > *'), 90);
    reveal(all('.leave-card'), 0);
    reveal(all('.break-card'), 120);
    reveal(all('.section h2.center'), 0);
    reveal(all('.compare > div'), 25);
    reveal(all('.install-card'), 140);
    all('.steps-num').forEach(function (l) { reveal(l.children, 90, 200); });
    reveal(all('.privacy h2, .privacy-sub'), 100);
    reveal(all('.privacy-cols > div'), 140, 150);
    reveal(all('.privacy-link, .final-body h2'), 0);

    /* 照片小工具、日期條、1～4 編號：交給 CSS 做細節，這裡只觀察容器 */
    all('.photo-art').forEach(function (el) { io.observe(el); });
    all('.strip').forEach(function (strip) {
      var big = strip.classList.contains('strip-big');
      Array.prototype.forEach.call(strip.children, function (c, i) {
        c.style.setProperty('--d', ((big ? 250 : 150) + i * (big ? 70 : 60)) + 'ms');
      });
      io.observe(strip);
    });
    all('.demo-widget').forEach(function (w) {
      w.querySelectorAll('.badge').forEach(function (b) {
        var n = parseInt(b.textContent, 10) || 1;
        b.style.setProperty('--d', (400 + (n - 1) * 220) + 'ms');
      });
      io.observe(w);
    });

    /* 主視覺：三台裝置依序出現，捲動時各自以不同速度往上移，做出前後的距離感 */
    var speeds = { mac: 0.05, ipad: 0.1, iphone: 0.16 };
    var devs = [];
    all('.stage').forEach(function (stage) {
      stage.querySelectorAll('.dev').forEach(function (d) {
        var kind = d.classList.contains('iphone') ? 'iphone' : d.classList.contains('ipad') ? 'ipad' : 'mac';
        d.style.setProperty('--d', { mac: 0, ipad: 160, iphone: 320 }[kind] + 'ms');
        devs.push({ el: d, speed: speeds[kind] });
      });
      // 等兩個畫格再加，確保瀏覽器先畫出起點，過場才會播
      requestAnimationFrame(function () { requestAnimationFrame(function () { stage.classList.add('is-in'); }); });
    });
    var ticking = false;
    function parallax() {
      ticking = false;
      var y = Math.min(window.scrollY, 900);
      devs.forEach(function (d) { d.el.style.setProperty('--py', (-y * d.speed).toFixed(1) + 'px'); });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
    }, { passive: true });
  }

  /* ----- 下載點擊送進 Google Analytics -----
   * Mac 下載沿用舊版的 download 事件（報表可以跟改版前接起來），
   * App Store 相關的另外用 appstore_click。 */
  function send(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
  }
  document.querySelectorAll('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () {
      var id = el.dataset.track;
      if (id.indexOf('download_mac_') === 0) {
        send('download', { location: id.replace('download_mac_', '') });
      } else {
        send('appstore_click', { location: id, state: SITE.appStore });
      }
    });
  });
})();
