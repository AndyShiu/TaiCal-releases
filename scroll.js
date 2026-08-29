/* 滾動時的呈現效果。
 *
 * 兩件事：
 *   1. 區塊進入畫面時淡入並微幅上移
 *   2. 捲到外觀區塊時，示範用的小工具在五組配色之間輪播
 *
 * 全部是漸進增強——JS 未執行或使用者偏好減少動態時，
 * 頁面仍完整可讀，只是沒有動畫。
 */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia &&
                       window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 進場淡入 ---------- */

  const revealTargets = document.querySelectorAll(
    '.feature, .card, .step, .lunar-band, .wallpaper-band, .closing h2'
  );

  if (reduceMotion || !('IntersectionObserver' in window)) {
    // 不做動畫時直接標記為已顯示，避免內容停在初始的透明狀態
    revealTargets.forEach(el => el.classList.add('is-revealed'));
  } else {
    revealTargets.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        // 只播一次，之後不必再觀察
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(el => revealObserver.observe(el));
  }

  /* ---------- 配色輪播 ---------- */

  const showcase = document.getElementById('palette-showcase');
  const calendar = document.getElementById('showcase-cal');
  const frame = document.getElementById('showcase-frame');
  const labels = Array.from(document.querySelectorAll('.showcase-label'));

  if (!showcase || !calendar || !frame || labels.length === 0) return;

  const PALETTE_ORDER = labels.map(el => el.dataset.palette);
  let index = 0;
  let timer = null;

  /** 套用某一組配色：換色票、換外框樣式、標示對應的名稱。 */
  function apply(i) {
    index = (i + PALETTE_ORDER.length) % PALETTE_ORDER.length;
    const name = PALETTE_ORDER[index];

    if (window.taical) window.taical.setPalette(calendar, name);

    // 外框的底色與圓角由 class 決定，與配色預設集的示意共用同一套樣式
    frame.className = 'widget widget-sm showcase-frame showcase-' + name;
    labels.forEach((el, i2) => el.classList.toggle('is-active', i2 === index));
  }

  function start() {
    if (timer || reduceMotion) return;
    timer = setInterval(() => apply(index + 1), 2200);
  }

  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  apply(0);

  // 只在區塊出現在畫面上時輪播——捲離之後繼續跑只是白費效能
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.35 }).observe(showcase);
  } else {
    start();
  }

  // 使用者自己點名稱時，停止輪播並切到該組——手動操作優先於自動播放
  labels.forEach((el, i) => {
    el.addEventListener('click', () => {
      stop();
      apply(i);
    });
  });

  // 分頁切到背景時暫停，回來再繼續
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : (showcase.getBoundingClientRect().top < window.innerHeight && start());
  });
})();

/* ---------- 背景圖輪播 ----------
 *
 * 獨立成一個 IIFE，因為上面那段在找不到配色示意區時會提早 return，
 * 兩者不該互相牽連。
 */
(function () {
  const demo = document.getElementById('wallpaper-demo');
  const dots = document.getElementById('wallpaper-dots');
  if (!demo || !dots) return;

  // 每個小工具各有一組照片，同一個索引要一起換
  const groups = Array.from(demo.querySelectorAll('.widget-photos'))
    .map(g => Array.from(g.querySelectorAll('.widget-photo')));
  const buttons = Array.from(dots.querySelectorAll('button'));
  const count = groups.length ? groups[0].length : 0;
  if (count < 2) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer = null;

  function show(i) {
    index = (i + count) % count;
    groups.forEach(photos =>
      photos.forEach((el, n) => el.classList.toggle('is-active', n === index)));
    buttons.forEach((el, n) => el.classList.toggle('is-active', n === index));
  }

  function start() {
    if (timer || reduceMotion) return;
    timer = setInterval(() => show(index + 1), 4200);
  }

  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  show(0);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.3 }).observe(demo);
  } else {
    start();
  }

  // 手動點過之後就停下來，不要跟使用者搶
  buttons.forEach((el, i) => el.addEventListener('click', () => { stop(); show(i); }));

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : (demo.getBoundingClientRect().top < window.innerHeight && start());
  });
})();

/* ---------- 固定導覽列的分隔線 ----------
 *
 * 頁面停在最上面時不畫線，捲下去之後才畫。用哨兵元素判斷，
 * 比監聽 scroll 事件省事，也不必節流。
 */
(function () {
  const bar = document.querySelector('.nav-bar');
  const sentinel = document.querySelector('.nav-sentinel');
  if (!bar || !sentinel || !('IntersectionObserver' in window)) return;

  new IntersectionObserver(entries => {
    bar.classList.toggle('is-stuck', !entries[0].isIntersecting);
  }, { threshold: 0 }).observe(sentinel);
})();
