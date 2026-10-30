/* 《三棱镜：爱恨对照录》 interactions */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- chapter theming via IntersectionObserver ---- */
  const chapters = $$('[data-ch]');
  const pills = $$('.hub-pill');
  const rail = $$('.progress-rail a');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.getAttribute('data-ch');
      document.body.setAttribute('data-chapter', id);
      pills.forEach((p) => p.classList.toggle('active', p.dataset.target === id));
      rail.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
  chapters.forEach((c) => io.observe(c));

  /* ---- verified-only toggle ---- */
  const vToggle = $('#verifiedOnly');
  if (vToggle) {
    vToggle.addEventListener('change', () => {
      document.body.classList.toggle('verified-only', vToggle.checked);
      try { localStorage.setItem('triptych-verified', vToggle.checked ? '1' : '0'); } catch (_) {}
    });
    try {
      if (localStorage.getItem('triptych-verified') === '1') {
        vToggle.checked = true;
        document.body.classList.add('verified-only');
      }
    } catch (_) {}
  }

  /* ---- short / long path ---- */
  $$('.path-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.path-toggle button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.body.classList.toggle('short-path', btn.dataset.path === 'short');
    });
  });

  /* ---- fade-in ---- */
  const fio = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  $$('.fade-in').forEach((el) => fio.observe(el));

  /* ---- temperature dial (Ch1) ---- */
  const dial = $('#tempDial');
  const readout = $('#tempReadout');
  const aaronDeg = $('#aaronDeg');
  const jiroDeg = $('#jiroDeg');
  function updateTemp(v) {
    // v 0..100 maps corridor mood; Aaron fixed winter motif, Jiro summer — dial blends scene
    const a = 41; // Fahrenheit motif
    const j = 95;
    const blend = Number(v);
    if (aaronDeg) aaronDeg.textContent = a + '°F';
    if (jiroDeg) jiroDeg.textContent = j + '°F';
    if (readout) {
      const c = Math.round(a + (j - a) * (blend / 100));
      const mood = blend < 30 ? '甬道偏冷 · 失联侧' : blend < 70 ? '温差拉大 · 观念差异' : '夏侧喧哗 · 他者在场';
      readout.textContent = `走廊体感合成 ${c}°F — ${mood}`;
    }
    const corridor = $('.ch1-corridor .vanishing');
    if (corridor) {
      const cold = 1 - blend / 100;
      corridor.style.filter = `saturate(${0.6 + blend / 200}) brightness(${0.75 + cold * 0.25})`;
    }
  }
  if (dial) {
    dial.addEventListener('input', () => updateTemp(dial.value));
    updateTemp(dial.value || 35);
  }

  /* ---- DENIED stamp click pulse ---- */
  $$('.denied-stamp').forEach((el) => {
    el.addEventListener('click', () => {
      el.animate([
        { transform: 'rotate(-2deg) scale(1)' },
        { transform: 'rotate(-6deg) scale(1.05)' },
        { transform: 'rotate(-2deg) scale(1)' }
      ], { duration: 400 });
    });
  });

  /* ---- 入戏/出戏 slider (Ch2) ---- */
  const roleQuotes = [
    { at: 0, text: '「假如我是同志的话，肯定我就是会特别爱他。」', who: '刘烨 · 早期访谈 · 谈角色情感 · 实录', tone: 'role' },
    { at: 25, text: '「不论性别的话，我当然会选择和蓝宇之间的感情。」', who: '胡军 · 早期访谈 · 谈角色 · 实录', tone: 'role' },
    { at: 50, text: '「我们之间没有大家想的那种情愫，都是很深厚的友谊，太太也不会介意。」', who: '胡军 · 2015《爸爸去哪儿3》发布会 · 实录', tone: 'life' },
    { at: 75, text: '「亲爱的烨子……师哥永远在你身边支持你！」', who: '胡军 · 2017 微博生日祝福 · 实录', tone: 'life' },
    { at: 100, text: '金马奖台：刘烨拉上师哥——这部片子与这个奖，属于两个人。', who: '2001 金马 · 仪式实录（媒体广泛报道）', tone: 'life' }
  ];
  const roleSlider = $('#roleSlider');
  const roleBox = $('#roleQuote');
  function setRole(v) {
    const n = Number(v);
    let best = roleQuotes[0];
    for (const q of roleQuotes) if (Math.abs(q.at - n) <= Math.abs(best.at - n)) best = q;
    if (roleBox) {
      roleBox.style.opacity = '0';
      setTimeout(() => {
        roleBox.innerHTML = best.text + '<span class="who">' + best.who + '</span>';
        roleBox.dataset.tone = best.tone;
        roleBox.style.opacity = '1';
      }, 180);
    }
  }
  if (roleSlider) {
    roleSlider.addEventListener('input', () => setRole(roleSlider.value));
    setRole(roleSlider.value || 0);
  }

  /* ---- rumor leaf lift ---- */
  $$('.rumor-leaf .frost').forEach((frost) => {
    frost.addEventListener('click', () => frost.parentElement.classList.add('lifted'));
    frost.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        frost.parentElement.classList.add('lifted');
      }
    });
  });

  /* ---- kintsugi reveal ---- */
  const kHero = $('#kintsugiHero');
  const kBtn = $('#kintsugiBtn');
  if (kBtn && kHero) {
    kBtn.addEventListener('click', () => {
      kHero.classList.add('revealed');
      kBtn.textContent = '裂缝已显形 · 金缮不抹去伤痕';
    });
  }

  /* ---- claim strikethrough toggle ---- */
  $$('.claim .toggle-strike').forEach((btn) => {
    btn.addEventListener('click', () => {
      const claim = btn.closest('.claim');
      claim.classList.toggle('struck');
      btn.textContent = claim.classList.contains('struck') ? '恢复显示' : '划掉传闻';
    });
  });

  /* ---- lightbox ---- */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCap');
  function openLb(src, cap) {
    if (!lb) return;
    lbImg.src = src;
    lbCap.textContent = cap || '';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
  }
  function closeLb() {
    if (!lb) return;
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
  }
  $$('[data-lightbox]').forEach((el) => {
    el.addEventListener('click', () => {
      const img = el.matches('img') ? el : el.querySelector('img');
      if (!img) return;
      const cap = el.getAttribute('data-cap') || (el.querySelector('figcaption') || {}).textContent || img.alt || '';
      openLb(img.src, cap);
    });
  });
  if (lb) {
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb-close')) closeLb(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });
  }

  /* ---- polls (localStorage) ---- */
  $$('.poll').forEach((poll) => {
    const key = 'triptych-poll-' + poll.dataset.poll;
    let data = {};
    try { data = JSON.parse(localStorage.getItem(key) || '{}'); } catch (_) {}
    const opts = $$('.poll-opt', poll);
    function render() {
      const total = opts.reduce((s, o) => s + (data[o.dataset.val] || 0), 0) || 1;
      opts.forEach((o) => {
        const n = data[o.dataset.val] || 0;
        const pct = Math.round((n / total) * 100);
        const bar = o.querySelector('.bar');
        const pctEl = o.querySelector('.pct');
        if (bar) bar.style.width = pct + '%';
        if (pctEl) pctEl.textContent = pct + '%';
      });
    }
    opts.forEach((o) => {
      o.addEventListener('click', () => {
        if (poll.dataset.locked) return;
        data[o.dataset.val] = (data[o.dataset.val] || 0) + 1;
        try { localStorage.setItem(key, JSON.stringify(data)); } catch (_) {}
        poll.dataset.locked = '1';
        render();
      });
    });
    render();
  });

  /* ---- compare room axis meters animate when visible ---- */
  const compare = $('#ch-compare');
  if (compare) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        $$('.axis-bar i', e.target).forEach((bar) => {
          bar.style.width = bar.dataset.w + '%';
        });
        cio.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    cio.observe(compare);
  }

  /* ---- parallax light ---- */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      $$('.parallax-layer').forEach((el) => {
        const speed = Number(el.dataset.speed || 0.15);
        el.style.transform = `translate3d(0, ${y * speed * 0.15}px, 0)`;
      });
      ticking = false;
    });
  }, { passive: true });

  /* ---- dual-track sync highlight ---- */
  $$('.t-item[data-sync]').forEach((item) => {
    item.addEventListener('mouseenter', () => {
      const key = item.dataset.sync;
      $$('.t-item[data-sync="' + key + '"]').forEach((x) => { x.style.background = 'rgba(107,140,174,.15)'; });
    });
    item.addEventListener('mouseleave', () => {
      $$('.t-item[data-sync]').forEach((x) => { x.style.background = ''; });
    });
  });

  /* ---- chapter swipe buttons ---- */
  $$('[data-go]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const t = $(btn.getAttribute('data-go') || btn.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  console.info('[三棱镜] ready — verified toggle, dials, darkroom, kintsugi, lightbox, polls');
})();
