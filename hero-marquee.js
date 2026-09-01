/* 首屏背景的小工具牆。
 *
 * 多個直欄斜向排列，每欄塞滿套用不同配色與照片背景的小工具，
 * 奇偶欄反向無限滾動——一眼看完所有造型，比任何文字都直接。
 *
 * DOM 由這裡產生而不是寫死在 HTML：每欄的內容要重複兩份才能無縫循環，
 * 手寫會是幾百行重複標記。月曆格線交給 calendar.js 的既有機制
 * （data-calendar 屬性 + __taicalRenderCalendars），配色與這裡永遠一致。
 *
 * 純裝飾：aria-hidden、pointer-events: none，JS 不執行時 hero 就是原樣。
 */
(() => {
  'use strict';

  const hero = document.querySelector('.hero');
  if (!hero) return;


  // 一排中、一排小，嚴格交替；每欄只用同一種尺寸，欄寬才整齊。
  //
  // 一排中、一排小，嚴格交替；每欄只用同一種尺寸，欄寬才整齊。
  // 照片與配色由下面的洗牌發牌決定，每次載入都不同。
  const COLUMNS = [
    { dir: 'up',   dur: 30, size: 'md' },
    { dir: 'down', dur: 24, size: 'sm' },
    { dir: 'up',   dur: 33, size: 'md' },
    { dir: 'down', dur: 21, size: 'sm' },
    { dir: 'up',   dur: 26, size: 'md' },
    { dir: 'down', dur: 27, size: 'sm' },
    { dir: 'up',   dur: 31, size: 'md' },
    { dir: 'down', dur: 23, size: 'sm' }
  ];
  const TILES_PER_COLUMN = 5;

  // 洗牌發牌：整副抽完才重洗。比每次亂數更好——
  // 保證每張照片、每個顏色都會出現，又不會短時間內重複。
  function shuffled(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function makeDeck(list) {
    let deck = [];
    return () => {
      if (!deck.length) deck = shuffled(list);
      return deck.pop();
    };
  }

  // Pixabay 免費圖（縮小過的網頁版）。pos 是 cover 裁切的取景位置，
  // 對準每張圖的主體，磚不論比例都不會把主角裁掉。
  const PHOTOS = {
    cat:      { file: 'assets/pict/cat.jpg',      pos: '30% 28%' },
    dog:      { file: 'assets/pict/dog.jpg',      pos: '70% 45%' },
    fuji:     { file: 'assets/pict/fuji.jpg',     pos: '50% 45%' },
    torii:    { file: 'assets/pict/torii.jpg',    pos: '55% 45%' },
    city:     { file: 'assets/pict/city.jpg',     pos: '50% 50%' },
    umbrella: { file: 'assets/pict/umbrella.jpg', pos: '40% 35%' },
    child:    { file: 'assets/pict/child.jpg',    pos: '68% 28%' },
    waters:   { file: 'assets/pict/waters.jpg',   pos: '30% 55%' },
    scuba:    { file: 'assets/pict/scuba.jpg',    pos: '32% 32%' },
    bmw:      { file: 'assets/pict/bmw.jpg',      pos: '45% 55%' },
    porsche:  { file: 'assets/pict/porsche.jpg',  pos: '60% 50%' },
    dessert:  { file: 'assets/pict/dessert.jpg',  pos: '50% 50%' },
    hands:    { file: 'assets/pict/hands.jpg',    pos: '50% 35%' },
    hands2:   { file: 'assets/pict/hands2.jpg',   pos: '35% 30%' },
    family:   { file: 'assets/pict/family.jpg',   pos: '25% 40%' },
    sunset:   { file: 'assets/pict/sunset.jpg',   pos: '50% 40%' }
  };

  // 逐磚輪替的配色變體（名稱對應 calendar.js 的色票）。
  // 只有照片不同還是會看膩：圈圈與文字的顏色也要跟著換。
  const VARIANTS = [
    { name: 'photoRed',    accent: '#C0563F' },
    { name: 'photoBlue',   accent: '#0A66E8' },
    { name: 'photoGreen',  accent: '#2E7D4F' },
    { name: 'photoPurple', accent: '#7A4FBF' },
    { name: 'photoOrange', accent: '#D97E29' },
    { name: 'photoTeal',   accent: '#0F8B8D' }
  ];

  // 中型右側清單的幾組內容，讓相鄰的中型不要一模一樣
  const SIDES = [
    [['9/25', '中秋節'], ['9/28', '教師節']],
    [['10:00', '週會'], ['14:30', '牙醫']],
    [['9/7', '白露'], ['全天', '爸生日']]
  ];
  let sideIndex = 0;

  function tileHTML(tile) {
    const isMd = tile.size === 'md';
    const cell = isMd ? 18 : 17;
    const font = isMd ? 10 : 9.5;
    const variant = drawVariant();
    const photo = PHOTOS[drawPhoto()];

    const photoLayer =
      '<div class="mq-photo-bg" style="background-image:url(\'' + photo.file +
      '\'); background-position:' + photo.pos + '"></div>';

    const head =
      '<div class="widget-head"><span class="arrow">‹</span>' +
      '<span class="month" style="color:' + variant.accent + '">2026年9月</span>' +
      (isMd ? '<span class="today" style="color:' + variant.accent + '">今天</span>' : '') +
      '<span class="arrow">›</span></div>';

    const grid = '<div data-calendar="' + variant.name +
      '" data-cell-height="' + cell + '" data-font-size="' + font + '"></div>';

    let inner;
    if (isMd) {
      const side = SIDES[sideIndex++ % SIDES.length];
      inner =
        '<div class="widget-main">' + head + grid + '</div>' +
        '<div class="widget-side"><div class="widget-side-title" style="color:' + variant.accent + '">2026年9月</div>' +
        '<div class="widget-side-list">' +
        side.map(([d, n]) => '<div><span class="date" style="color:' + variant.accent + '">' + d + '</span> <span class="name">' + n + '</span></div>').join('') +
        '</div></div>';
    } else {
      inner = head + grid;
    }

    return '<div class="mq-tile widget widget-' + tile.size + ' mq-photo">' +
      photoLayer + '<div class="mq-content">' + inner + '</div></div>';
  }

  const wall = document.createElement('div');
  wall.className = 'hero-marquee';
  wall.setAttribute('aria-hidden', 'true');
  const drawPhoto = makeDeck(Object.keys(PHOTOS));
  const drawVariant = makeDeck(VARIANTS);

  wall.innerHTML = COLUMNS.map(col => {
    let tiles = '';
    for (let i = 0; i < TILES_PER_COLUMN; i++) tiles += tileHTML({ size: col.size });
    // 同一份內容排兩次，位移到 -50% 時剛好接回起點，循環才無縫
    return '<div class="mq-col is-' + col.size + (col.dir === 'down' ? ' is-down' : '') +
      '" style="--mq-dur:' + col.dur + 's"><div class="mq-track">' + tiles + tiles + '</div></div>';
  }).join('');

  const veil = document.createElement('div');
  veil.className = 'hero-veil';
  veil.setAttribute('aria-hidden', 'true');

  // 漸隱遮罩要套在這層「不旋轉」的容器上：套在旋轉的牆上，
  // 遮罩帶會跟著斜掉，一端淡出漂亮、另一端卻切出硬邊。
  const clip = document.createElement('div');
  clip.className = 'hero-marquee-clip';
  clip.setAttribute('aria-hidden', 'true');
  clip.appendChild(wall);

  hero.prepend(veil);
  hero.prepend(clip);

  // 預先把所有照片抓進快取：磚是滾動中才進畫面的，
  // 等到那時才載圖，磚會先空白一陣子再突然浮現。
  Object.values(PHOTOS).forEach(photo => { new Image().src = photo.file; });


  // 展示台的兩個示範小工具：背景照片快速輪播，
  // 一眼看完「放自己照片」的效果。兩層交替淡入淡出，換圖沒有空窗。
  document.querySelectorAll('.stage .widget').forEach(widget => {
    const drawStagePhoto = makeDeck(Object.keys(PHOTOS));
    const drawStageVariant = makeDeck(VARIANTS);
    widget.classList.add('stage-rotates');
    const layers = [0, 1].map(() => {
      const layer = document.createElement('div');
      layer.className = 'stage-photo';
      widget.prepend(layer);
      return layer;
    });
    let front = 0;
    const step = () => {
      const photo = PHOTOS[drawStagePhoto()];
      // 圈圈與文字的顏色跟著照片一起換，展示「主題色可自訂」
      const variant = drawStageVariant();
      const layer = layers[front];
      front = 1 - front;
      layer.style.backgroundImage = "url('" + photo.file + "')";
      layer.style.backgroundPosition = photo.pos;
      layer.classList.add('is-on');
      layers[front].classList.remove('is-on');

      const grid = widget.querySelector('[data-calendar]');
      if (grid && window.taical) window.taical.setPalette(grid, variant.name);
      widget.querySelectorAll('.widget-head .month, .widget-head .today, ' +
        '.widget-side-title, .widget-side-list .date')
        .forEach(el => { el.style.color = variant.accent; });
    };
    step();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInterval(step, 2200);
    }
  });

  // 這支腳本排在 calendar.js 之後載入，重新渲染一次讓新插入的格線長出來
  if (window.__taicalRenderCalendars) window.__taicalRenderCalendars();
})();
