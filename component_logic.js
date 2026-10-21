
class Component extends DCLogic {
  state = { age: 'pending', gateNo: false, leaving: false, vw: typeof window !== 'undefined' ? window.innerWidth : 1440 };
  rootRef = React.createRef();
  componentDidMount() {
    let ok = null; try { ok = localStorage.getItem('gd_age_ok'); } catch (e) {}
    this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.fine = matchMedia('(pointer: fine)').matches;
    this.setState({ age: ok === '1' ? 'ok' : 'ask' });
    this.mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, tx: 0, ty: 0 };
    this.cur = { x: innerWidth / 2, y: innerHeight / 2 };
    this.onResize = () => { this.setState({ vw: innerWidth }); clearTimeout(this._rt); this._rt = setTimeout(() => this.measure(), 80); };
    this.onMove = e => this.handleMove(e);
    this.onOver = e => { const h = e.target.closest && e.target.closest('a,button,input,[data-magnetic],[data-hover]'); this.setHover(!!h); };
    addEventListener('resize', this.onResize);
    addEventListener('pointermove', this.onMove, { passive: true });
    document.addEventListener('pointerover', this.onOver);
    if (this.fine) document.documentElement.classList.add('gd-cursor');
    this.t0 = performance.now();
    this.mountHooks = this.mountHooks || [];
    setTimeout(() => { this.measure(); this.mountHooks.forEach(f => f.call(this)); }, 60);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this.measure());
    this.raf = requestAnimationFrame(this.loop);
  }
  componentDidUpdate() { document.documentElement.style.overflow = this.state.age === 'ok' ? '' : 'hidden'; }
  componentWillUnmount() {
    cancelAnimationFrame(this.raf);
    removeEventListener('resize', this.onResize); removeEventListener('pointermove', this.onMove);
    document.removeEventListener('pointerover', this.onOver);
    document.documentElement.classList.remove('gd-cursor'); document.documentElement.style.overflow = '';
    (this.unmountHooks || []).forEach(f => f.call(this));
  }
  q(s) { return this.rootRef.current ? Array.from(this.rootRef.current.querySelectorAll(s)) : []; }
  measure() {
    const hero = this.q('[data-hero]')[0], cans = this.q('[data-cans]')[0], h1 = hero && hero.querySelector('h1');
    if (hero && cans && h1) {
      const imgs = Array.from(cans.querySelectorAll('img'));
      imgs.forEach(im => { if (!im._h0) im._h0 = im.style.height; im.style.height = im._h0; });
      const hb = h1.getBoundingClientRect().bottom + 28, c0 = cans.getBoundingClientRect();
      let ratio = Math.min(1, (c0.bottom - hb) / c0.height, (innerWidth - 24) / c0.width);
      if (ratio < 1) imgs.forEach(im => { im.style.height = `calc(${im._h0} * ${Math.max(0.3, ratio).toFixed(4)})`; });
    }
    if (hero && cans) {
      const hr = hero.getBoundingClientRect(), cr = cans.getBoundingClientRect();
      const canH = cr.height;
      this.hero = { h: hr.height, cx: cr.left - hr.left + cr.width / 2, cy: cr.top - hr.top + canH * 0.5, rx: Math.max(cr.width / 2 + Math.min(180, innerWidth * .12), innerWidth * 0.4), ry: canH * 0.8 };
    }
    this.orbit = this.q('[data-orbit]').map((el, i, a) => { el._a = (i / a.length) * Math.PI * 2; el._r = 0.9 + ((i * 37) % 10) / 50; el._spin = ((i % 3) - 1) || 0.6; return el; });
    this.rays = this.q('[data-rays]')[0]; this.ring = this.q('[data-ring]')[0];
    this.pars = this.q('[data-par]').map(el => { el._d = parseFloat(el.getAttribute('data-par')); return el; });
    this.stripes = this.q('[data-stripe]');
    this.mags = this.q('[data-magnetic]');
    this.nav = this.q('[data-nav]')[0];
    this.ringEl = this.q('[data-cursor-ring]')[0]; this.dotEl = this.q('[data-cursor-dot]')[0];
    (this.measureHooks || []).forEach(f => f.call(this));
    if (this.reduce) this.tickHero(0, true);
  }
  handleMove(e) {
    const m = this.mouse; m.x = e.clientX; m.y = e.clientY;
    m.tx = (e.clientX / innerWidth - 0.5) * 2; m.ty = (e.clientY / innerHeight - 0.5) * 2;
    if (this.fine && this.ringEl && !this._shown) { this._shown = true; this.ringEl.style.opacity = 1; this.dotEl.style.opacity = 1; }
    if (this.reduce || !this.mags) return;
    this.mags.forEach(el => {
      const o = el._m || { x: 0, y: 0 }; const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - o.x, cy = r.top + r.height / 2 - o.y;
      const dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy), lim = Math.max(r.width, r.height) * 0.5 + 50;
      const n = d < lim ? { x: dx * 0.28, y: dy * 0.35 } : { x: 0, y: 0 };
      if (n.x !== o.x || n.y !== o.y) { el._m = n; el.style.transition = 'transform .35s cubic-bezier(.2,.8,.2,1)'; el.style.transform = `translate(${n.x}px,${n.y}px)`; }
    });
  }
  setHover(h) {
    if (!this.ringEl || this._hov === h) return; this._hov = h;
    const s = this.ringEl.style;
    if (h) { s.width = s.height = '64px'; s.margin = '-32px 0 0 -32px'; s.background = 'rgba(252,186,36,.45)'; }
    else { s.width = s.height = '38px'; s.margin = '-19px 0 0 -19px'; s.background = 'transparent'; }
  }
  loop = now => {
    const t = (now - this.t0) / 1000, m = this.mouse;
    m.nx += (m.tx - m.nx) * 0.06; m.ny += (m.ty - m.ny) * 0.06;
    if (this.fine && this.ringEl) {
      this.cur.x += (m.x - this.cur.x) * 0.2; this.cur.y += (m.y - this.cur.y) * 0.2;
      this.ringEl.style.transform = `translate3d(${this.cur.x}px,${this.cur.y}px,0)`;
      this.dotEl.style.transform = `translate3d(${m.x}px,${m.y}px,0)`;
    }
    if (this.nav) { const s = scrollY > 40; if (s !== this._navS) { this._navS = s; this.nav.style.background = s ? 'rgba(255,252,232,.82)' : 'transparent'; this.nav.style.backdropFilter = s ? 'blur(14px)' : 'none'; this.nav.style.boxShadow = s ? '0 1px 0 rgba(76,52,39,.08)' : 'none'; } }
    if (!this.reduce) this.tickHero(t);
    (this.tickHooks || []).forEach(f => f.call(this, t));
    this.raf = requestAnimationFrame(this.loop);
  };
  tickHero(t, force) {
    const h = this.hero; if (!h || (!force && scrollY > h.h)) return;
    const m = this.mouse, sp = scrollY / h.h;
    (this.orbit || []).forEach((el, i) => {
      const a = el._a + t * 0.11, s = Math.sin(a), c = Math.cos(a), dp = (s + 1) / 2;
      const x = h.cx + c * h.rx * el._r + m.nx * (10 + 34 * dp);
      const y = h.cy + s * h.ry * el._r + Math.sin(t * 0.9 + i) * 8 + m.ny * (6 + 18 * dp) - sp * 220 * (0.4 + dp);
      el.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${0.55 + 0.6 * dp}) rotate(${(t * el._spin * 28 + i * 47) % 360}deg)`;
      el.style.zIndex = s > 0.05 ? 7 : 2; el.style.opacity = 0.5 + 0.5 * dp;
    });
    if (this.rays) this.rays.style.transform = `rotate(${t * 3.5}deg)`;
    if (this.ring) this.ring.style.transform = `rotate(${t * 9}deg)`;
    (this.pars || []).forEach(el => { el.style.transform = `translate3d(${m.nx * el._d}px,${m.ny * el._d * 0.6 + sp * el._d * 6}px,0)`; });
    (this.stripes || []).forEach((el, i) => { el.style.transform = `translateX(${Math.sin(t * 0.5 + i * 1.3) * 26}px)`; });
  }
  fruit(type, s, key) {
    const e = React.createElement, base = { position: 'relative', flex: 'none' };
    const sh = '0 14px 22px rgba(76,52,39,.22)';
    const citrus = (pulp, line, rind, pith) => e('div', { key, style: { ...base, width: s, height: s, borderRadius: '50%', background: `radial-gradient(circle, ${line} 0 7%, transparent 8%), repeating-conic-gradient(${line} 0deg 3.5deg, ${pulp} 3.5deg 36deg)`, boxShadow: `0 0 0 ${s * .05}px ${pith}, 0 0 0 ${s * .1}px ${rind}, ${sh}` } });
    switch (type) {
      case 'lemon': return citrus('#F9D53E', '#FFF6CF', '#EDBB1C', '#FFF1B8');
      case 'lime': return citrus('#A9D45F', '#F0F8DA', '#4F9134', '#E4F2C4');
      case 'melon': return e('div', { key, style: { ...base, width: s, height: s / 2, borderRadius: `0 0 ${s}px ${s}px`, background: `radial-gradient(circle at 50% 0, #F2566B 0 ${s * .4}px, #FFF0DA ${s * .4}px ${s * .44}px, #4E9A45 ${s * .44}px ${s * .5}px)`, boxShadow: sh } },
        [[.32, .14], [.5, .24], [.66, .14], [.42, .06], [.58, .06]].map(([x, y], j) => e('i', { key: j, style: { position: 'absolute', left: x * s, top: y * s, width: s * .035, height: s * .06, borderRadius: '50%', background: '#3a2418' } })));
      case 'pine': return e('div', { key, style: { ...base, width: s * .8, height: s * .8, borderRadius: '22% 22% 44% 44%', background: 'repeating-linear-gradient(45deg, rgba(204,141,39,.35) 0 2px, transparent 2px 11px), repeating-linear-gradient(-45deg, rgba(204,141,39,.35) 0 2px, transparent 2px 11px), linear-gradient(#FFEC9A, #F7C531)', boxShadow: `inset 0 -${s * .08}px 0 #E0A52A, ${sh}` } });
      case 'peach': return e('div', { key, style: { ...base, width: s, height: s * .55, borderRadius: `0 0 ${s / 2}px ${s / 2}px / 0 0 ${s * .55}px ${s * .55}px`, background: 'linear-gradient(#FFD27A, #F5953A)', borderBottom: `${s * .09}px solid #D9433F`, boxShadow: sh } });
      case 'mango': return e('div', { key, style: { ...base, width: s * .72, height: s * .72, borderRadius: '30%', background: 'radial-gradient(circle at 30% 28%, #FFE59A, #FFB21C 58%, #EE8714)', boxShadow: sh } });
      case 'leaf': return e('div', { key, style: { ...base, width: s * .9, height: s * .42, borderRadius: '0 100% 0 100%', background: 'linear-gradient(135deg, #8BCF72, #3E8A3A)', boxShadow: '0 8px 14px rgba(76,52,39,.18)' } },
        e('i', { style: { position: 'absolute', left: '8%', right: '8%', top: '50%', height: 1.5, background: 'rgba(255,255,255,.55)', transform: 'rotate(22deg)' } }));
      default: return e('div', { key, style: { ...base, width: s * .4, height: s * .4, borderRadius: '50%', background: 'radial-gradient(circle at 34% 30%, rgba(255,255,255,.95) 0 14%, rgba(255,240,190,.55) 34%, rgba(237,173,37,.3) 70%, rgba(204,141,39,.55))', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.5), 0 6px 10px rgba(204,141,39,.25)' } });
    }
  }
  mapRef = React.createRef();
  mountHooks = [function () { this.initMap(); this.initReveal(); }];
  tickHooks = [function (t) { this.tickMarquee(t); this.tickFlavors(t); this.tickStory(t); }];
  measureHooks = [function () { this.measureFlavors(); this.st = { stack: this.q('[data-story-stack]')[0], layers: this.q('[data-depth]').map(el => { el._d = +el.dataset.depth; return el; }), badge: this.q('[data-spin-badge]')[0] }; this.initTilt(); }];
  initTilt() {
    if (this.reduce || !this.fine) return;
    this.q('[data-tilt]').forEach(el => {
      if (el._tilt) return; el._tilt = 1; const base = el.style.transform;
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; el.style.transform = `${base} rotateY(${x * 16}deg) rotateX(${-y * 12}deg) translateZ(30px)`; });
      el.addEventListener('pointerleave', () => { el.style.transform = base; });
    });
  }
  tickStory(t) {
    const s = this.st; if (!s || !s.stack) return;
    const r = s.stack.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    s.layers.forEach(el => { el.style.transform = this.reduce ? 'none' : `translate3d(${this.mouse.nx * el._d * 40}px,${c * el._d * -420}px,0)`; });
    if (s.badge && !this.reduce) s.badge.style.transform = `rotate(${-10 + Math.sin(t * 0.6) * 8}deg)`;
  }
  FBG = ['#F6C3C5', '#FBE38A', '#D3E8BF', '#F9CFA6'];
  BURST = [['melon', 'melon', 'leaf', 'drop', 'melon', 'drop', 'leaf', 'melon', 'drop', 'melon', 'drop'], ['pine', 'pine', 'drop', 'leaf', 'pine', 'drop', 'pine', 'drop', 'pine', 'leaf', 'drop'], ['lemon', 'lime', 'leaf', 'drop', 'lime', 'lemon', 'drop', 'lime', 'lemon', 'drop', 'leaf'], ['peach', 'mango', 'drop', 'peach', 'mango', 'leaf', 'peach', 'drop', 'mango', 'peach', 'drop']];
  measureFlavors() {
    const sec = this.q('[data-flavors]')[0]; if (!sec) return;
    const sticky = this.q('[data-fbg]')[0], stage = this.q('[data-tt-stage]')[0], wrap = this.q('[data-ftext-wrap]')[0];
    const cans = this.q('[data-tt]'), narrow = innerWidth < 900;
    stage.style.perspective = '1400px';
    stage.style.left = narrow ? '50%' : '62%'; stage.style.top = narrow ? '38%' : '50%';
    cans.forEach(c => c.style.height = narrow ? 'min(44vh,400px)' : 'min(64vh,600px)');
    Object.assign(wrap.style, narrow ? { left: '18px', right: '18px', width: 'auto', top: 'auto', bottom: '84px', transform: 'none', height: '250px' } : { left: 'clamp(18px,5vw,80px)', right: 'auto', width: 'min(420px,34vw)', top: '50%', bottom: 'auto', transform: 'translateY(-50%)', height: '420px' });
    const sr = sticky.getBoundingClientRect(), st = stage.getBoundingClientRect();
    const canW = (cans[0].getBoundingClientRect().width || 200);
    this.fl = { sec, sticky, stage, cans, canW, cx: st.left - sr.left, cy: st.top - sr.top, words: this.q('[data-fword]'), texts: this.q('[data-ftext]'), dots: this.q('[data-fdot]'), photo: this.q('[data-fphoto]')[0], burst: this.q('[data-burst]').map(el => { el._k = +el.dataset.burst; el._a = +el.dataset.a; el._d = +el.dataset.d; el._s = +el.dataset.s; return el; }), narrow };
  }
  mix(a, b, t) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; }
  tickFlavors(t) {
    const f = this.fl; if (!f) return;
    const r = f.sec.getBoundingClientRect(); if (r.bottom < -50 || r.top > innerHeight + 50) return;
    const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const prog = cl(-r.top / (r.height - innerHeight)), raw = prog * 3, i = Math.min(2, Math.floor(raw)), fr = raw - i;
    const e0 = cl((fr - 0.2) / 0.6), target = prog >= 1 ? 3 : i + e0 * e0 * (3 - 2 * e0);
    this._fp = this._fp == null || this.reduce ? target : this._fp + (target - this._fp) * 0.14;
    const p = this._fp, m = this.mouse, k = Math.min(2, Math.floor(p));
    f.sticky.style.background = this.mix(this.FBG[k], this.FBG[k + 1], p - k);
    const R = f.canW * (f.narrow ? 1.6 : 2.1);
    f.cans.forEach((c, j) => {
      const d = j - p, a = d * 0.95, x = Math.sin(a) * R, z = (Math.cos(a) - 1) * R * 1.25;
      c.style.transform = `translate(-50%,-50%) translate3d(${x}px,0,${z}px)`;
      c.style.zIndex = Math.round(100 - Math.abs(d) * 10); c.style.opacity = cl(1.3 - Math.abs(d) * 0.55);
    });
    f.words.forEach((w, j) => { const d = j - p; w.style.opacity = cl(1 - Math.abs(d) * 1.4); w.style.transform = `translateX(${d * 40}vw)`; });
    f.texts.forEach((x, j) => { const d = j - p; x.style.opacity = cl(1 - Math.abs(d) * 2.2); x.style.transform = `translateY(${d * 70}px)`; x.style.pointerEvents = Math.abs(d) < 0.5 ? 'auto' : 'none'; });
    const act = Math.round(p); f.dots.forEach((d, j) => { d.style.background = j === act ? '#4C3427' : 'transparent'; d.style.transform = j === act ? 'scale(1.25)' : 'none'; });
    if (f.photo) f.photo.style.transform = `translate3d(${(p - 1.5) * -24 + m.nx * -14}px,${m.ny * -10}px,0) scale(1.06)`;
    f.burst.forEach(el => {
      const l = cl(1 - Math.abs(p - el._k) * 1.25);
      if (l <= 0) { if (el._vis !== 0) { el.style.opacity = 0; el._vis = 0; } return; }
      el._vis = 1;
      const e = 1 - Math.pow(1 - l, 3), dist = el._d * (f.narrow ? 0.55 : 1) * (0.2 + 0.8 * e);
      const x = f.cx + Math.cos(el._a) * dist + m.nx * 30 * el._s, y = f.cy + Math.sin(el._a) * dist * 0.78 + m.ny * 20 * el._s + (this.reduce ? 0 : Math.sin(t + el._a * 3) * 6);
      el.style.opacity = l;
      el.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${(0.35 + 0.65 * e) * el._s}) rotate(${el._a * 90 + (1 - e) * 220 + (this.reduce ? 0 : t * 12)}deg)`;
    });
  }
  goFlavor(n) { const s = this.fl && this.fl.sec; if (!s) return; const top = s.getBoundingClientRect().top + scrollY; scrollTo({ top: top + ((n + 0.05) / 3) * (s.offsetHeight - innerHeight), behavior: this.reduce ? 'auto' : 'smooth' }); }
  unmountHooks = [function () { if (this.map) this.map.remove(); if (this.io) this.io.disconnect(); }];
  STORES = [
    ['L Street Package Store', '612 E Broadway', 'South Boston', 42.3355, -71.0365, 'Package store · All 4 flavors'],
    ['Castle Island Provisions', '801 E 1st St', 'South Boston', 42.3378, -71.0255, 'Market · Singles + 4-packs'],
    ['Seaport Spirits Co.', '300 Summer St', 'Boston', 42.3500, -71.0480, 'Liquor store · All 4 flavors'],
    ['Savin Hill Wine & Spirits', '1 Savin Hill Ave', 'Dorchester', 42.3110, -71.0490, 'Package store · 4-packs'],
    ['Marina Bay Market', '333 Victory Rd', 'Quincy', 42.2950, -71.0300, 'Market · Cold singles'],
    ['Wollaston Beach Liquors', '470 Quincy Shore Dr', 'Quincy', 42.2690, -71.0170, 'Liquor store · All 4 flavors'],
    ['Weymouth Landing Spirits', '70 Washington St', 'Weymouth', 42.2210, -70.9690, 'Package store · 4-packs'],
    ['Hingham Harbor Wine', '10 North St', 'Hingham', 42.2440, -70.8890, 'Wine & spirits · All 4 flavors'],
    ['Nantasket Package', '150 Nantasket Ave', 'Hull', 42.2730, -70.8500, 'Package store · Cold singles'],
    ['Cohasset Village Spirits', '25 Elm St', 'Cohasset', 42.2410, -70.8030, 'Liquor store · 4-packs'],
    ['Scituate Harbor Liquors', '100 Front St', 'Scituate', 42.1980, -70.7230, 'Package store · All 4 flavors'],
    ['Green Harbor Market', '200 Dyke Rd', 'Marshfield', 42.0880, -70.6540, 'Market · Singles + 4-packs'],
    ['Duxbury Beach Provisions', '400 Gurnet Rd', 'Duxbury', 42.0450, -70.6670, 'Market · Cold singles'],
    ['Plymouth Waterfront Spirits', '50 Water St', 'Plymouth', 41.9570, -70.6620, 'Liquor store · All 4 flavors'],
  ].map(([name, addr, town, lat, lng, kind], id) => ({ id, name, addr, town, lat, lng, kind }));
  ZIPS = { '02127': [42.335, -71.04], '02210': [42.348, -71.04], '02125': [42.316, -71.058], '02122': [42.29, -71.05], '02169': [42.25, -71.0], '02170': [42.267, -71.02], '02171': [42.288, -71.025], '02186': [42.25, -71.08], '02184': [42.21, -71.0], '02188': [42.21, -70.96], '02189': [42.21, -70.93], '02190': [42.17, -70.95], '02191': [42.24, -70.94], '02043': [42.22, -70.89], '02045': [42.29, -70.87], '02025': [42.24, -70.81], '02066': [42.19, -70.75], '02061': [42.16, -70.82], '02050': [42.1, -70.7], '02332': [42.04, -70.7], '02360': [41.9, -70.6], '02116': [42.35, -71.075], '02118': [42.34, -71.07], '02111': [42.35, -71.06], '02110': [42.357, -71.053] };
  dist(a, b) { const R = 3958.8, r = x => x * Math.PI / 180, dl = r(b[0] - a[0]), dn = r(b[1] - a[1]); const h = Math.sin(dl / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
  initMap(tries = 0) {
    const L = window.L, el = this.mapRef.current;
    if (!L || !el) { if (tries < 80) setTimeout(() => this.initMap(tries + 1), 150); return; }
    const map = this.map = L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([42.17, -70.88], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, subdomains: 'abc', referrerPolicy: 'origin', attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    map.getPane('tilePane').style.filter = 'sepia(.32) saturate(1.15) hue-rotate(-6deg) brightness(1.02)';
    map.on('click', () => map.scrollWheelZoom.enable()); map.on('mouseout', () => map.scrollWheelZoom.disable());
    this.markers = this.STORES.map(s => {
      const icon = L.divIcon({ className: '', iconSize: [34, 44], iconAnchor: [17, 42], popupAnchor: [0, -38], html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#FCBA24;border:3px solid #4C3427;box-shadow:0 6px 12px rgba(76,52,39,.35);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font:800 13px/1 'Bricolage Grotesque',sans-serif;color:#4C3427">${s.id + 1}</span></div>` });
      return L.marker([s.lat, s.lng], { icon }).addTo(map).bindPopup(`<div style="font:800 15px/1.2 'Bricolage Grotesque',sans-serif;margin-bottom:4px">${s.name}</div><div style="font:500 13px/1.4 Figtree,sans-serif">${s.addr}, ${s.town}, MA</div>`).on('click', () => this.setState({ active: s.id }));
    });
    map.fitBounds(L.latLngBounds(this.STORES.map(s => [s.lat, s.lng])), { padding: [40, 40] });
  }
  selectStore(s) {
    this.setState({ active: s.id });
    if (this.map) { this.map.flyTo([s.lat, s.lng], 14, { duration: this.reduce ? 0 : 1.1 }); setTimeout(() => this.markers[s.id].openPopup(), this.reduce ? 0 : 1100); }
  }
  initReveal() {
    const els = this.q('[data-reveal]'), counts = this.q('[data-count]');
    if (this.reduce || !('IntersectionObserver' in window)) return;
    els.forEach(el => { const r = el.getBoundingClientRect(); if (r.top > innerHeight) { el.style.opacity = 0; el.style.transform = 'translateY(40px)'; el.style.transition = 'opacity .9s ease, transform 1.1s cubic-bezier(.2,.8,.2,1)'; } });
    counts.forEach(el => { el.textContent = (+el.dataset.from).toFixed(+el.dataset.dec); });
    this.io = new IntersectionObserver(ents => ents.forEach(en => {
      if (!en.isIntersecting) return; const el = en.target; this.io.unobserve(el);
      if (el.dataset.count != null) { const from = +el.dataset.from, to = +el.dataset.count, dec = +el.dataset.dec, t0 = performance.now(); const step = n => { const p = Math.min(1, (n - t0) / 1600), e = 1 - Math.pow(1 - p, 3); el.textContent = (from + (to - from) * e).toFixed(dec); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
      else { el.style.opacity = 1; el.style.transform = 'none'; }
    }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.concat(counts).forEach(el => this.io.observe(el));
  }
  tickMarquee() {
    const m = this.marq || (this.marq = this.q('[data-marquee]')[0]); if (!m || this.reduce) return;
    const v = scrollY - (this._lastY ?? scrollY); this._lastY = scrollY;
    this._mv = (this._mv || 0) * 0.9 + Math.min(40, Math.abs(v)) * 0.1;
    this._mx = ((this._mx || 0) - (0.7 + this._mv * 0.6)) % (m.scrollWidth / 2);
    m.style.transform = `translate3d(${this._mx}px,0,0)`;
  }
  storeVals() {
    const origin = this.state.origin, active = this.state.active;
    let list = this.STORES.map(s => ({ ...s, d: origin ? this.dist(origin, [s.lat, s.lng]) : null }));
    if (origin) list.sort((a, b) => a.d - b.d);
    return list.map(s => ({
      num: s.id + 1, name: s.name, addr: s.addr, town: s.town + ', MA', kind: s.kind,
      dist: s.d != null ? s.d.toFixed(1) + ' mi' : '',
      dir: `https://www.openstreetmap.org/directions?to=${s.lat}%2C${s.lng}`,
      bg: active === s.id ? '#FFE7A0' : '#FFF6D6', border: active === s.id ? '#4C3427' : 'rgba(76,52,39,.12)',
      select: () => this.selectStore(s),
    }));
  }
  renderVals() {
    if (!this._orbit) {
      const types = ['lemon', 'melon', 'drop', 'pine', 'leaf', 'peach', 'lime', 'drop', 'mango', 'melon', 'drop', 'lemon', 'pine', 'drop'];
      const sizes = [92, 120, 50, 86, 70, 104, 88, 40, 80, 96, 56, 74, 78, 44];
      this._orbit = types.map((t, i) => React.createElement('div', { key: i, 'data-orbit': '', style: { position: 'absolute', left: 0, top: 0, willChange: 'transform', opacity: 0 } }, this.fruit(t, sizes[i])));
    }
    if (!this._burst) {
      const sz = [130, 104, 66, 46, 118, 40, 72, 96, 52, 112, 44];
      this._burst = [];
      this.BURST.forEach((list, k) => list.forEach((tp, j) => {
        const a = (j / list.length) * Math.PI * 2 + k * 0.7 + ((j * 13) % 7) * 0.05;
        this._burst.push(React.createElement('div', { key: k + '-' + j, 'data-burst': k, 'data-a': a.toFixed(3), 'data-d': 300 + ((j * 53) % 5) * 60, 'data-s': (0.75 + ((j * 7) % 5) * 0.12).toFixed(2), style: { position: 'absolute', left: 0, top: 0, opacity: 0, willChange: 'transform,opacity' } }, this.fruit(tp, sz[j])));
      }));
    }
    const ok = this.state.age === 'ok';
    return {
      rootRef: this.rootRef,
      mapRef: this.mapRef,
      stores: this.storeVals(),
      storeCount: this.STORES.length + ' retailers',
      zip: this.state.zip || '',
      zipNote: this.state.zipNote || 'Showing all South Boston + South Shore spots',
      onZipInput: e => this.setState({ zip: e.target.value.replace(/\D/g, '').slice(0, 5) }),
      onZip: e => {
        e.preventDefault(); const z = this.state.zip || '', o = this.ZIPS[z];
        if (o) { this.setState({ origin: o, zipNote: 'Closest to ' + z }); if (this.map) this.map.flyTo(o, 11, { duration: this.reduce ? 0 : 1 }); }
        else if (z.length === 5) this.setState({ origin: [42.3355, -71.0365], zipNote: z + ' isn’t on our route yet. Sorted from South Boston.' });
        else this.setState({ zipNote: 'Enter a 5-digit ZIP' });
      },
      orbitFruit: this._orbit,
      burstFruit: this._burst,
      goFlavor0: () => this.goFlavor(0), goFlavor1: () => this.goFlavor(1), goFlavor2: () => this.goFlavor(2), goFlavor3: () => this.goFlavor(3),
      showGate: this.state.age === 'ask' || this.state.leaving,
      gateOpacity: this.state.leaving ? 0 : 1,
      gateNo: this.state.gateNo,
      wide: this.state.vw >= 980,
      canOp: ok && !this.state.leaving ? 1 : 0,
      canY: ok && !this.state.leaving ? '0px' : '40px',
      ageYes: () => { try { localStorage.setItem('gd_age_ok', '1'); } catch (e) {} this.setState({ age: 'ok', leaving: true }); setTimeout(() => { this.setState({ leaving: false }); this.measure(); }, 900); },
      ageNo: () => this.setState({ gateNo: true }),
    };
  }
}
