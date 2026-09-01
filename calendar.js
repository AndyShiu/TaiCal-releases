/* 產生頁面上的月曆示意。
 *
 * 頁面共有七處月曆（主視覺兩個、農曆區一個、配色預設集五個），每個 40 格。
 * 寫死會是上千行重複的 HTML，且改一個顏色要動七處，因此以色票產生。
 *
 * 這是純粹的裝飾：JS 未執行時，頁面的文字內容與下載連結完全不受影響。
 */
(() => {
  'use strict';

  // 六組配色，對應 App 內建的預設集
  const PALETTES = {
    ricePaper: { txt: '#6B5844', mut: '#CDBFA4', hol: '#C03A2B', dot: '#C03A2B',
                 acc: '#C0563F', onAcc: '#FFF9EE', lunar: '#B3A184' },
    system:    { txt: '#3A3A3C', mut: '#C7C7CC', hol: '#D0342C', dot: '#0A66E8',
                 acc: '#0A66E8', onAcc: '#FFFFFF', lunar: '#8E8E93' },
    graphite:  { txt: '#E6E0D6', mut: '#6C665E', hol: '#F2937D', dot: '#E8B48A',
                 acc: '#E8B48A', onAcc: '#2A2724', lunar: '#8F887E' },
    frosted:   { txt: '#FFFFFF', mut: 'rgba(255,255,255,.45)', hol: '#FFB3A6',
                 dot: '#FFFFFF', acc: 'rgba(255,255,255,.92)', onAcc: '#3B4C60',
                 lunar: 'rgba(255,255,255,.6)' },
    minimal:   { txt: '#1C1C1E', mut: '#D6D6DA', hol: '#C03A2B', dot: '#1C1C1E',
                 acc: '#1C1C1E', onAcc: '#FFFFFF', lunar: '#A0A0A6' },
    darkPaper: { txt: '#E8E2D6', mut: '#5E5850', hol: '#F2937D', dot: '#E8B48A',
                 acc: '#C0563F', onAcc: '#FFF3E8', lunar: '#8A8278' },
    // 背景圖示意用：與 system 相同，只是 mut 加深。淡灰疊在照片上會糊掉。
    onPhoto:   { txt: '#2E2E30', mut: '#8B8B90', hol: '#C42B22', dot: '#0A66E8',
                 acc: '#0A66E8', onAcc: '#FFFFFF', lunar: '#7A7A80' },
    // 照片上用的強調色變體：首屏的牆與展示台輪播逐磚換色，
    // 展示「主題色可自訂」。文字都是可讀的深色系，只換色相。
    photoRed:    { txt: '#4A3B33', mut: '#A89A8C', hol: '#C42B22', dot: '#C0563F',
                   acc: '#C0563F', onAcc: '#FFF9EE', lunar: '#A89A8C' },
    photoBlue:   { txt: '#2E3A48', mut: '#93A0AE', hol: '#C42B22', dot: '#0A66E8',
                   acc: '#0A66E8', onAcc: '#FFFFFF', lunar: '#93A0AE' },
    photoGreen:  { txt: '#2F3E33', mut: '#92A396', hol: '#C42B22', dot: '#2E7D4F',
                   acc: '#2E7D4F', onAcc: '#FFFFFF', lunar: '#92A396' },
    photoPurple: { txt: '#3A3344', mut: '#9D95AB', hol: '#C42B22', dot: '#7A4FBF',
                   acc: '#7A4FBF', onAcc: '#FFFFFF', lunar: '#9D95AB' },
    photoOrange: { txt: '#44382C', mut: '#AC9C88', hol: '#C42B22', dot: '#D97E29',
                   acc: '#D97E29', onAcc: '#FFFFFF', lunar: '#AC9C88' },
    photoTeal:   { txt: '#2C3E40', mut: '#8FA3A5', hol: '#C42B22', dot: '#0F8B8D',
                   acc: '#0F8B8D', onAcc: '#FFFFFF', lunar: '#8FA3A5' }
  };

  // 示意的月份：2026 年 9 月。挑這個月是因為它同時有中秋與教師節兩個假日，
  // 一眼就能看出「假日會標紅字」這件事。
  const TODAY = 16;
  const HOLIDAYS = [25, 28];
  const EVENT_DAYS = [3, 7, 23, 28];

  // 2026 年 9 月各日對應的農曆
  const LUNAR = [
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
    '八月', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十'
  ];

  /** 月曆的 40 個格子：前補 8/30–31，1–30 日，後補 10/1–3。 */
  function buildCells() {
    const cells = [];
    cells.push({ day: 30, adjacent: true, lunar: '十九' });
    cells.push({ day: 31, adjacent: true, lunar: '二十' });

    for (let day = 1; day <= 30; day++) {
      cells.push({
        day,
        adjacent: false,
        lunar: LUNAR[day - 1],
        isToday: day === TODAY,
        isHoliday: HOLIDAYS.includes(day),
        hasEvent: EVENT_DAYS.includes(day)
      });
    }

    ['廿一', '廿二', '廿三'].forEach((lunar, i) => {
      cells.push({ day: i + 1, adjacent: true, lunar });
    });
    return cells;
  }

  /**
   * 產生一份月曆格線。
   * @param {string} paletteName 色票名稱
   * @param {{height:number, fontSize:number, lunar?:boolean}} options
   */
  function renderGrid(paletteName, options) {
    const p = PALETTES[paletteName] || PALETTES.ricePaper;
    const showLunar = !!options.lunar;
    const grid = document.createElement('div');
    grid.className = 'cal-grid';

    for (const cell of buildCells()) {
      const el = document.createElement('div');
      el.className = 'cal-cell';
      el.style.height = options.height + 'px';
      el.style.fontSize = options.fontSize + 'px';

      // 顏色的優先順序與 App 內一致：溢出日淡化 → 今天 → 假日 → 一般
      el.style.color = cell.adjacent ? p.mut
        : cell.isToday ? p.onAcc
        : cell.isHoliday ? p.hol
        : p.txt;

      if (cell.isToday) {
        el.style.background = p.acc;
        el.style.borderRadius = '8px';
      } else if (!cell.adjacent && cell.day === options.selected) {
        // 被點選的日期用描邊，與「今天」的實心圓區分
        el.style.boxShadow = 'inset 0 0 0 1.5px ' + p.acc;
        el.style.borderRadius = '8px';
      }

      const num = document.createElement('span');
      num.textContent = cell.day;
      el.appendChild(num);

      if (showLunar) {
        const lunar = document.createElement('span');
        lunar.className = 'cal-lunar';
        lunar.style.fontSize = Math.max(7, options.fontSize - 5) + 'px';
        // 農曆初一顯示月份，該格用假日色強調，與 App 的呈現一致
        lunar.style.color = cell.adjacent ? p.mut
          : cell.isHoliday || cell.lunar === '八月' ? p.hol
          : p.lunar;
        lunar.textContent = cell.lunar;
        el.appendChild(lunar);
      }

      if (cell.hasEvent) {
        const dot = document.createElement('span');
        dot.className = 'cal-dot';
        dot.style.background = p.dot;
        el.appendChild(dot);
      }

      grid.appendChild(el);
    }
    return grid;
  }

  /** 星期列。 */
  function renderWeekdays(paletteName, fontSize) {
    const p = PALETTES[paletteName] || PALETTES.ricePaper;
    const row = document.createElement('div');
    row.className = 'cal-grid cal-weekdays';

    for (const label of ['日', '一', '二', '三', '四', '五', '六']) {
      const el = document.createElement('span');
      el.textContent = label;
      el.style.fontSize = fontSize + 'px';
      el.style.color = p.mut;
      row.appendChild(el);
    }
    return row;
  }

  /* 深色模式下，跟著 CSS 的小工具底色換用深色色票。
   *
   * 小工具示意的底色由 CSS 變數控制（淺色 #F8F1DF、深色 #232120），
   * 而格線的文字色是這裡給的。兩者不一起換的話，深色模式下會是
   * 深棕文字疊在深色底上，幾乎看不見。
   *
   * 只有「米紙」需要這樣處理——它是小工具示意用的配色。
   * 配色預設集那五個各自有固定的底色，不隨模式改變。
   */
  function resolvePalette(name) {
    const isDark = document.documentElement.dataset.theme === 'dark';
    return (name === 'ricePaper' && isDark) ? 'darkPaper' : name;
  }

  /** 依容器目前的 data 屬性重新產生它的月曆。 */
  function renderHost(host) {
    const palette = resolvePalette(host.dataset.calendar);
    const height = parseFloat(host.dataset.cellHeight || '26');
    const fontSize = parseFloat(host.dataset.fontSize || '13');
    const lunar = host.dataset.lunar === 'true';
    const selected = parseInt(host.dataset.selected || '', 10) || 0;

    host.replaceChildren();
    if (host.dataset.weekdays !== 'false') {
      host.appendChild(renderWeekdays(palette, Math.max(8, fontSize - 4)));
    }
    host.appendChild(renderGrid(palette, { height, fontSize, lunar, selected }));
  }

  /** 重新產生頁面上所有的月曆。切換深淺色時需要重跑。 */
  function renderAll() {
    document.querySelectorAll('[data-calendar]').forEach(renderHost);
  }

  renderAll();

  // 供深淺色切換與滾動效果呼叫
  window.taical = {
    renderAll,
    renderHost,
    /** 換掉某個容器的配色並立即重繪。 */
    setPalette(host, name) {
      host.dataset.calendar = name;
      renderHost(host);
    }
  };
  // 相容既有的切換按鈕
  window.__taicalRenderCalendars = renderAll;
})();
