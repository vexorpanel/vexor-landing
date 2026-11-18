/* v9.js · «La bandeja» · Vexor · 15-nov-2026
   Qué hace: convierte la página en una app de correo: vistas (carpetas) con hash, llegada de los correos con contador,
             lector a pantalla completa con arrastre lateral, móvil 3D del panel de lectura (PC), comparador y diálogos legales.
   Entra: el HTML de index.html (sin datos externos). Sale: nada fuera del navegador (solo guarda vexor_consent en localStorage).
   Se prueba: design/prueba_v9.py contra index.html (PC y móvil, con y sin movimiento reducido).
   Sin dependencias. Sin bucles permanentes: requestAnimationFrame solo mientras hay algo que mover. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PC = matchMedia('(min-width: 960px)');
  const VIEWS = ['bandeja', 'flujos', 'cifras', 'planes', 'preguntas'];
  const views = Object.fromEntries(VIEWS.map(v => [v, document.getElementById('v-' + v)]));
  const tabs = $$('.tab');
  const mails = $$('.mail');
  let current = 'bandeja', countedBig = false, swept = false;

  /* ---------------- vistas (carpetas) ---------------- */
  function show(name, dir) {
    if (!views[name]) name = 'bandeja';
    if (name !== current) {
      const from = VIEWS.indexOf(current), to = VIEWS.indexOf(name);
      views[current].hidden = true;
      views[current].classList.remove('is-active', 'enter-r', 'enter-l');
      const v = views[name];
      v.hidden = false; v.classList.add('is-active'); v.scrollTop = 0;
      if (!RM) { v.classList.remove('enter-r', 'enter-l', 'stagger'); void v.offsetWidth; v.classList.add((dir ?? (to > from ? 1 : -1)) > 0 ? 'enter-r' : 'enter-l', 'stagger'); }
      current = name;
    }
    document.body.dataset.view = name;
    const tabName = name === 'antes-despues' && !PC.matches ? 'bandeja' : name;
    tabs.forEach(t => t.dataset.view === tabName ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current'));
    if (name === 'cifras' && !countedBig) { countedBig = true; countUp($('.big-n .vis'), 900); }
    if (name === 'antes-despues') sweep();
  }
  function route(push) {
    const h = decodeURIComponent(location.hash.slice(1));
    const m = /^email-(\d+)$/.exec(h);
    if (m) { show('bandeja'); openReader(Math.min(mails.length, Math.max(1, +m[1])) - 1, false); return; }
    if (reader.open) closeReader(false);
    show(VIEWS.includes(h) ? h : 'bandeja');
  }
  function go(name, dir) {
    if (reader.open) closeReader(false);
    if (location.hash.slice(1) !== name) history.pushState(null, '', '#' + name);
    show(name, dir);
  }
  addEventListener('popstate', () => route());
  addEventListener('hashchange', () => route());

  document.addEventListener('click', e => {
    const dlg = e.target.closest('[data-dialog]');
    if (dlg) { e.preventDefault(); const d = document.getElementById(dlg.dataset.dialog); $$('dialog[open]').forEach(x => x.close()); d.showModal(); return; }
    const close = e.target.closest('[data-close]');
    if (close) { close.closest('dialog').close(); return; }
    const consent = e.target.closest('[data-consent]');
    if (consent) { try { localStorage.setItem('vexor_consent', consent.dataset.consent); } catch (_) {} consent.closest('dialog').close(); return; }
    const peek = e.target.closest('.peek');
    if (peek) { if (stripMoved) return; openReader(+peek.dataset.i, true); return; }
    const side = e.target.closest('.side-item');
    if (side) { reader.i = +side.dataset.i; place(true); reader.track.children[reader.i].scrollTop = 0; history.replaceState(null, '', '#email-' + (reader.i + 1)); return; }
    const mail = e.target.closest('.mail');
    if (mail) { e.preventDefault(); if (dragMoved) return; openReader(+mail.dataset.i, true); return; }
    const a = e.target.closest('a[href^="#"]');
    if (a) { const name = a.hash.slice(1); if (VIEWS.includes(name)) { e.preventDefault(); go(name); } }
  });
  $$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

  /* ---------------- contador ---------------- */
  const FINAL = 3.7, START = 2.6;   // cifra de Carlos: +3,7 M$ en dolares, generados este año (17-nov)
  const fmt = n => '+' + n.toFixed(1).replace('.', ',') + ' M$';
  const meters = $$('.meter-n .vis, .rail-meter .meter-n');
  function setMeters(v) { const t = fmt(v); meters.forEach(m => { m.textContent = t; }); }
  function countUp(el, ms) {
    if (!el || RM) { if (el) el.textContent = fmt(FINAL); return; }
    const t0 = performance.now();
    (function step(t) {
      const p = Math.max(0, Math.min(1, (t - t0) / ms));
      el.textContent = fmt(START + (FINAL - START) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(FINAL);
    })(t0);
  }

  /* ---------------- llegada de los correos: todo sale de frame(t) ----------------
     t en milisegundos desde el arranque. Cada correo i entra en T0 + i*STEP; el contador sube de START a FINAL
     entre el primer y el último correo. Como depende solo de t, la secuencia es siempre la misma. */
  const list = $('#list'), unread = $('#unread');
  const T0 = 350, STEP = 190, END = T0 + STEP * (mails.length - 1) + 420;
  let read = new Set();
  function setUnread() { const n = mails.length - read.size; unread.textContent = n; unread.dataset.n = n; }
  function frame(t) {
    let shown = 0;
    mails.forEach((m, i) => { const on = t >= T0 + i * STEP; if (on) { shown++; if (!m.classList.contains('in')) { m.classList.add('in', 'flash'); } } });
    const p = Math.max(0, Math.min(1, (t - T0) / (END - T0 - 200)));
    setMeters(START + (FINAL - START) * (1 - Math.pow(1 - p, 2.2)));
    return t >= END;
  }
  function arrive() {
    if (RM) { setMeters(FINAL); return; }
    list.classList.add('arriving');
    const t0 = performance.now();
    (function tick(now) {
      const done = frame(now - t0);
      if (!done) requestAnimationFrame(tick);
      else { setMeters(FINAL); list.classList.remove('arriving'); mails.forEach(m => m.classList.remove('in')); setTimeout(() => mails.forEach(m => m.classList.remove('flash')), 1100); }
    })(t0);
  }

  /* ---------------- lector ---------------- */
  const reader = { el: $('#reader'), track: $('#reader-track'), title: $('#reader-title'), count: $('#reader-count'), open: false, i: 0, built: false, opener: null };
  function buildReader() {
    if (reader.built) return; reader.built = true;
    mails.forEach((m, i) => {
      const p = document.createElement('div'); p.className = 'reader-panel'; p.tabIndex = -1;
      const img = document.createElement('img');
      img.alt = $('img', m).alt; img.width = 600; img.height = +m.dataset.h; img.decoding = 'async'; img.dataset.src = m.dataset.full; img.draggable = false;
      p.appendChild(img); reader.track.appendChild(p);
      $('#reader-dots').appendChild(document.createElement('i'));
      const b = document.createElement('button'); b.type = 'button'; b.className = 'side-item'; b.dataset.i = i; b.setAttribute('aria-label', m.dataset.cap);
      const t = document.createElement('img'); t.src = $('img', m).getAttribute('src'); t.alt = ''; t.width = 300; t.height = 420; t.loading = 'lazy';
      const n = document.createElement('span'); n.textContent = m.dataset.from; b.append(t, n); $('#reader-side').appendChild(b);
    });
  }
  function loadPanel(i) { const img = reader.track.children[i]?.firstChild; if (img && !img.src) img.src = img.dataset.src; }
  function place(animate) {
    reader.track.style.transition = animate && !RM ? 'transform .46s cubic-bezier(.22,.8,.2,1)' : 'none';
    reader.track.style.transform = `translate3d(${-reader.i * 100}%,0,0)`;
    const m = mails[reader.i];
    reader.title.textContent = m.dataset.cap;
    reader.count.textContent = `${String(reader.i + 1).padStart(2, '0')} / ${mails.length}`;
    [reader.i - 1, reader.i, reader.i + 1].forEach(loadPanel);
    $$('#reader-dots i').forEach((d, k) => d.classList.toggle('on', k === reader.i));
    $$('.side-item').forEach((b, k) => { b.classList.toggle('on', k === reader.i); if (k === reader.i && PC.matches) b.scrollIntoView({ block: 'nearest' }); });
    read.add(reader.i); m.classList.add('is-read'); setUnread();
    selectRow(reader.i);
  }
  function openReader(i, push) {
    buildReader();
    reader.i = i; reader.opener = mails[i];
    if (!reader.open) { reader.open = true; reader.el.hidden = false; reader.el.classList.remove('is-open'); void reader.el.offsetWidth; if (!RM) reader.el.classList.add('is-open'); $('#app').inert = true; }
    place(false);
    reader.track.children[i].scrollTop = 0;
    if (push && location.hash !== '#email-' + (i + 1)) history.pushState(null, '', '#email-' + (i + 1));
    $('#reader-back').focus({ preventScroll: true });
  }
  function closeReader(push) {
    if (!reader.open) return;
    reader.open = false; reader.el.hidden = true; $('#app').inert = false;
    if (push) history.pushState(null, '', '#bandeja');
    reader.opener?.focus({ preventScroll: true });
  }
  function step(d) {
    const n = Math.max(0, Math.min(mails.length - 1, reader.i + d));
    if (n === reader.i) { place(true); return; }
    reader.i = n; place(true); reader.track.children[n].scrollTop = 0;
    history.replaceState(null, '', '#email-' + (n + 1));
  }
  $('#reader-back').addEventListener('click', () => closeReader(true));
  $('#reader-prev').addEventListener('click', () => step(-1));
  $('#reader-next').addEventListener('click', () => step(1));

  /* arrastre lateral del lector: sigue al dedo (o al ratón) y encaja */
  let drag = null, dragMoved = false;
  reader.track.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button !== 0) return; drag = { x: e.clientX, y: e.clientY, dx: 0, lock: null, id: e.pointerId, w: reader.track.clientWidth }; });
  reader.track.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.lock) { if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return; drag.lock = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'x' : 'y'; if (drag.lock === 'x') { try { reader.track.setPointerCapture(drag.id); } catch (_) {} } }
    if (drag.lock !== 'x') return;
    e.preventDefault();
    const edge = (reader.i === 0 && dx > 0) || (reader.i === mails.length - 1 && dx < 0);
    drag.dx = edge ? dx * 0.3 : dx;
    reader.track.style.transition = 'none';
    reader.track.style.transform = `translate3d(calc(${-reader.i * 100}% + ${drag.dx}px),0,0)`;
    [reader.i - 1, reader.i + 1].forEach(loadPanel);
  });
  const endDrag = e => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (d.lock === 'x') { if (Math.abs(d.dx) > Math.min(90, d.w * 0.18)) step(d.dx < 0 ? 1 : -1); else place(true); }
  };
  reader.track.addEventListener('pointerup', endDrag);
  reader.track.addEventListener('pointercancel', endDrag);
  reader.track.addEventListener('dragstart', e => e.preventDefault());
  /* el arrastre vertical del propio panel es scroll nativo (touch-action: pan-y) */

  /* ---------------- teclado ---------------- */
  document.addEventListener('keydown', e => {
    if ($('dialog[open]')) return;
    if (reader.open) {
      if (e.key === 'Escape') { e.preventDefault(); closeReader(true); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'Tab') { /* foco atrapado en la barra del lector */
        const f = $$('.reader-bar button', reader.el).filter(b => b.offsetParent); const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (e.target.matches('input, textarea, [role="tab"], summary')) return;
    if (e.key === 'Escape' && current !== 'bandeja') { e.preventDefault(); go('bandeja'); }
  });

  /* ---------------- deslizar de lado para cambiar de pestaña (táctil) ---------------- */
  const SWIPE = ['bandeja', 'flujos', 'cifras', 'planes', 'preguntas'];
  let sw = null;
  const mainEl = $('main');
  mainEl.addEventListener('touchstart', e => { const t = e.touches[0]; sw = e.target.closest('.ba, .ba-r, input, .strip') ? null : { x: t.clientX, y: t.clientY }; }, { passive: true });
  mainEl.addEventListener('touchend', e => {
    if (!sw || reader.open) return; const t = e.changedTouches[0], dx = t.clientX - sw.x, dy = t.clientY - sw.y; sw = null;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    const i = SWIPE.indexOf(current === 'antes-despues' ? 'bandeja' : current), n = i + (dx < 0 ? 1 : -1);
    if (current === 'antes-despues') { go('bandeja', -1); return; }
    if (n >= 0 && n < SWIPE.length) go(SWIPE[n], dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ---------------- panel de lectura (PC): el móvil enseña el correo señalado y se inclina con el ratón ---------------- */
  const stage = $('#stage'), tilt = $('#tilt'), stageImg = $('#stage-img'), stageCap = $('#stage-cap');
  let sel = 0;
  function selectRow(i) {
    if (i === sel && stageImg.dataset.i === String(i)) return; sel = i;
    mails.forEach((m, k) => m.classList.toggle('is-sel', k === i));
    if (!PC.matches) return;
    const m = mails[i]; stageImg.dataset.i = String(i);
    if (RM) { stageImg.src = m.dataset.full; stageCap.textContent = m.dataset.cap; return; }
    stageImg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' }).finished.then(() => {
      stageImg.src = m.dataset.full; stageImg.height = +m.dataset.h; stageCap.textContent = m.dataset.cap;
      stageImg.style.animation = 'none'; void stageImg.offsetWidth; stageImg.style.animation = '';
      const fade = () => stageImg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, fill: 'forwards' });
      stageImg.complete ? fade() : stageImg.addEventListener('load', fade, { once: true });
    });
  }
  mails.forEach((m, i) => { m.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') selectRow(i); }); m.addEventListener('focus', () => selectRow(i)); });
  if (stage && !RM) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => { cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12; tilt.style.transition = 'none'; tilt.style.transform = `rotateY(${cx * 38}deg) rotateX(${-cy * 22}deg) translate3d(${cx * 70}px,${cy * 40}px,0)`; stage.style.setProperty('--gx', (50 + cx * 90) + '%'); stage.style.setProperty('--gy', (40 + cy * 80) + '%'); raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0; };
    stage.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const r = stage.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5; if (!raf) raf = requestAnimationFrame(loop); });
    stage.addEventListener('pointerleave', () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }

  /* ---------------- comparador ---------------- */
  $$('.ba-r').forEach(input => {
    const ba = input.closest('.ba-panel').querySelector('.ba');
    const set = v => { input.value = v; ba.style.setProperty('--p', v); input.setAttribute('aria-valuetext', `${v} % versión anterior`); };
    input.addEventListener('input', () => set(input.value)); input.addEventListener('change', () => set(input.value));
    /* también se arrastra sobre la propia imagen */
    let on = false; const at = e => { const r = ba.getBoundingClientRect(); set(Math.round(Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)))); };
    ba.addEventListener('pointerdown', e => { on = true; try { ba.setPointerCapture(e.pointerId); } catch (_) {} at(e); });
    ba.addEventListener('pointermove', e => { if (on) at(e); });
    ['pointerup', 'pointercancel'].forEach(n => ba.addEventListener(n, () => { on = false; }));
    ba.style.touchAction = 'pan-y';
    ba.addEventListener('dragstart', e => e.preventDefault()); $$('img', ba).forEach(i => { i.draggable = false; });
  });
  const baTabs = $$('.ba-tab');
  function baTab(t) { baTabs.forEach(b => { const on = b === t; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; document.getElementById(b.getAttribute('aria-controls')).hidden = !on; }); }
  baTabs.forEach((t, i) => { t.addEventListener('click', () => baTab(t)); t.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = baTabs[(i + (e.key === 'ArrowRight' ? 1 : baTabs.length - 1)) % baTabs.length]; baTab(n); n.focus(); } }); });

  /* preguntas: acordeón exclusivo también donde <details name> no está soportado */
  $$('.faq details').forEach(d => d.addEventListener('toggle', () => { if (d.open) $$('.faq details[open]').forEach(o => { if (o !== d) o.open = false; }); }));

  /* tira de la portada: si se ha arrastrado, el toque no abre el lector */
  let stripMoved = false; const strip = $('#strip');
  if (strip) { let sx = 0; strip.addEventListener('pointerdown', () => { sx = strip.scrollLeft; stripMoved = false; }); strip.addEventListener('scroll', () => { if (Math.abs(strip.scrollLeft - sx) > 8) stripMoved = true; }, { passive: true }); strip.addEventListener('pointerup', () => setTimeout(() => { stripMoved = false; }, 60)); }

  /* comparador: un barrido la primera vez que se entra, para enseñar que se arrastra */
  function sweep() {
    if (swept || RM) return; swept = true;
    const input = $('.ba-panel:not([hidden]) .ba-r'); if (!input) return; const ba = input.closest('.ba-panel').querySelector('.ba');
    const t0 = performance.now(), D = 1700;
    (function f(t) { const p = Math.min(1, (t - t0) / D); const v = Math.round(40 + 34 * Math.sin(p * Math.PI * 2) * (1 - p * .25)); input.value = v; ba.style.setProperty('--p', v); if (p < 1) requestAnimationFrame(f); else { input.value = 40; ba.style.setProperty('--p', 40); } })(t0);
  }

  /* móvil: el botón de la cabecera aparece al bajar por la bandeja (arriba ya está el botón grande) */
  const vb = views.bandeja; vb.addEventListener('scroll', () => { if (vb.scrollTop > 260) document.body.dataset.scrolled = '1'; else delete document.body.dataset.scrolled; }, { passive: true });

  /* preguntas: la primera llega abierta */
  const firstFaq = $('.faq details'); if (firstFaq) firstFaq.open = true;

  /* ---------------- arranque ---------------- */
  setUnread();
  mails[0].classList.add('is-sel'); stageImg.dataset.i = '0';
  route();
  if (current === 'bandeja' && !reader.open) arrive(); else setMeters(FINAL);
  /* precarga suave de los tres primeros correos del lector cuando el navegador queda libre */
  (window.requestIdleCallback || (f => setTimeout(f, 900)))(() => { buildReader(); [0, 1, 2].forEach(loadPanel); });
})();
