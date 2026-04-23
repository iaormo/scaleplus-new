/* ============================================
   TRUE COST CALCULATOR
   Philippine Peso, session-only, no tracking.
   ============================================ */

(function () {
  'use strict';

  const PHP = (n) => {
    if (!isFinite(n)) n = 0;
    return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const num = (id) => {
    const el = document.getElementById(id);
    const v = parseFloat(el?.value);
    return isFinite(v) ? v : 0;
  };
  const str = (id) => (document.getElementById(id)?.value || '').trim();

  // ---------- Navbar scroll ----------
  const nav = document.getElementById('navbar');
  const setScrolled = () => nav?.classList.toggle('scrolled', window.scrollY > 20);
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  // ---------- Mobile nav ----------
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // ---------- Liquid card glow ----------
  document.querySelectorAll('.liquid-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
    });
  });

  // ---------- Stepper ----------
  const panels = Array.from(document.querySelectorAll('.cc-panel'));
  const steps = Array.from(document.querySelectorAll('.cc-step'));

  function goTo(step) {
    step = Math.max(1, Math.min(4, Number(step) || 1));
    panels.forEach((p) => {
      const match = Number(p.dataset.panel) === step;
      p.hidden = !match;
      p.classList.toggle('is-active', match);
    });
    steps.forEach((s) => {
      const n = Number(s.dataset.step);
      s.classList.toggle('is-active', n === step);
      s.classList.toggle('is-done', n < step);
      s.setAttribute('aria-selected', String(n === step));
    });
    if (step === 4) compute();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.addEventListener('click', (e) => {
    const next = e.target.closest('[data-next]');
    const prev = e.target.closest('[data-prev]');
    const step = e.target.closest('.cc-step');
    if (next) return goTo(next.dataset.next);
    if (prev) return goTo(prev.dataset.prev);
    if (step) return goTo(step.dataset.step);
  });

  // ---------- Ingredient rows ----------
  const rowsEl = document.getElementById('ingredientRows');
  const miniEl = document.getElementById('ingredientsMini');

  function rowTemplate(values = {}) {
    const el = document.createElement('div');
    el.className = 'cc-row';
    el.innerHTML = `
      <input type="text" class="ing-name" placeholder="Ingredient (e.g. flour)" value="${values.name || ''}">
      <input type="number" class="ing-qty" inputmode="decimal" min="0" step="any" placeholder="Qty" value="${values.qty ?? ''}">
      <input type="text" class="ing-unit" placeholder="Unit (g, ml, pc)" value="${values.unit || ''}">
      <input type="number" class="ing-cost" inputmode="decimal" min="0" step="any" placeholder="₱ cost" value="${values.cost ?? ''}">
      <button class="cc-row-remove" type="button" aria-label="Remove ingredient">×</button>
    `;
    el.querySelector('.cc-row-remove').addEventListener('click', () => {
      el.remove();
      updateIngredientsMini();
    });
    el.querySelectorAll('input').forEach((i) => i.addEventListener('input', updateIngredientsMini));
    return el;
  }

  function addRow(values) { rowsEl.appendChild(rowTemplate(values)); updateIngredientsMini(); }

  function sumIngredients() {
    return Array.from(rowsEl.querySelectorAll('.cc-row')).reduce((sum, row) => {
      const c = parseFloat(row.querySelector('.ing-cost').value);
      return sum + (isFinite(c) ? c : 0);
    }, 0);
  }

  function updateIngredientsMini() {
    miniEl.innerHTML = `Ingredients per unit: <strong>${PHP(sumIngredients())}</strong>`;
  }

  document.getElementById('addIngredient').addEventListener('click', () => addRow());
  // Start with 3 blank rows
  addRow(); addRow(); addRow();

  // ---------- Core computation ----------
  function computeCosts() {
    const price = num('sellingPrice');
    const volume = Math.max(1, num('monthlyVolume'));

    const ingredients = sumIngredients();
    const utilities = num('utilities') / volume;
    const rent = num('rent') / volume;
    const labor = num('laborHours') * num('hourlyRate');
    const packaging = num('packaging');
    const platformPct = num('platformPct') / 100;
    const platform = price * platformPct;
    const spoilage = ingredients * (num('spoilagePct') / 100);
    const otherFees = num('otherFees');

    const breakdown = [
      { key: 'ingredients', label: 'Ingredients / materials', value: ingredients, color: '#a855f7' },
      { key: 'utilities',   label: 'Utilities (per unit)',    value: utilities,   color: '#c084fc' },
      { key: 'rent',        label: 'Rent (per unit)',         value: rent,        color: '#e879f9' },
      { key: 'labor',       label: 'Your labor',              value: labor,       color: '#7c3aed' },
      { key: 'packaging',   label: 'Packaging',               value: packaging,   color: '#22c55e' },
      { key: 'platform',    label: 'Delivery platform fee',   value: platform,    color: '#f59e0b' },
      { key: 'spoilage',    label: 'Spoilage / wastage',      value: spoilage,    color: '#ef4444' },
      { key: 'otherFees',   label: 'Other fees',              value: otherFees,   color: '#3b82f6' },
    ];

    const trueCost = breakdown.reduce((s, b) => s + b.value, 0);
    const profit = price - trueCost;
    const margin = price > 0 ? (profit / price) * 100 : 0;

    return { price, volume, breakdown, trueCost, profit, margin };
  }

  function suggestedPrice(trueCost, targetMarginPct) {
    const m = Math.max(0, Math.min(99, targetMarginPct)) / 100;
    if (m >= 1) return Infinity;
    return trueCost / (1 - m);
  }

  // ---------- Render results ----------
  function compute() {
    const r = computeCosts();
    document.getElementById('statTrueCost').textContent = PHP(r.trueCost);
    document.getElementById('statPrice').textContent = PHP(r.price);
    document.getElementById('statProfit').textContent = PHP(r.profit);
    document.getElementById('statMargin').textContent = `${r.margin.toFixed(1)}%`;

    document.querySelector('.cc-stat--profit').classList.toggle('is-negative', r.profit < 0);

    // Callout
    const productName = str('productName') || 'this product';
    const assumedMargin = 50; // what people often assume
    const assumedProfit = r.price * (assumedMargin / 100);
    const callout = document.getElementById('ccCalloutText');

    if (r.price <= 0) {
      callout.innerHTML = `Add a selling price in <strong>Step 1</strong> and we'll show you the full picture.`;
    } else if (r.profit < 0) {
      callout.innerHTML = `You're selling <strong>${productName}</strong> at a loss of <strong>${PHP(-r.profit)}</strong> per unit. Every sale costs you money — raise the price or cut costs before you take another order.`;
    } else if (r.margin < 10) {
      callout.innerHTML = `You're only keeping <strong>${PHP(r.profit)}</strong> per <strong>${productName}</strong> — a razor-thin <strong>${r.margin.toFixed(1)}%</strong> margin. One bad month wipes it out.`;
    } else {
      callout.innerHTML = `Most owners assume they're making around <strong>${PHP(assumedProfit)}</strong> per <strong>${productName}</strong>. You're actually making <strong>${PHP(r.profit)}</strong> — a real margin of <strong>${r.margin.toFixed(1)}%</strong>.`;
    }

    // Bar + legend
    const bar = document.getElementById('ccBar');
    const legend = document.getElementById('ccLegend');
    bar.innerHTML = '';
    legend.innerHTML = '';

    const total = r.trueCost || 1;
    r.breakdown
      .filter((b) => b.value > 0)
      .sort((a, b) => b.value - a.value)
      .forEach((b) => {
        const pct = (b.value / total) * 100;
        const seg = document.createElement('div');
        seg.className = 'cc-bar-seg';
        seg.style.flex = `${pct} 1 0`;
        seg.style.background = b.color;
        seg.title = `${b.label}: ${PHP(b.value)} (${pct.toFixed(1)}%)`;
        bar.appendChild(seg);

        const li = document.createElement('li');
        li.className = 'cc-legend-item';
        li.innerHTML = `
          <span class="cc-legend-swatch" style="background:${b.color}"></span>
          <span class="cc-legend-label">${b.label}</span>
          <span class="cc-legend-value">${PHP(b.value)} · ${pct.toFixed(1)}%</span>
        `;
        legend.appendChild(li);
      });

    updateSuggested(r.trueCost);
  }

  function updateSuggested(trueCost) {
    const target = num('targetMargin');
    const p = suggestedPrice(trueCost, target);
    const el = document.getElementById('statSuggestedPrice');
    el.textContent = isFinite(p) ? PHP(p) : '—';
  }

  document.getElementById('targetMargin').addEventListener('input', () => {
    const r = computeCosts();
    updateSuggested(r.trueCost);
  });

  // ---------- Save / restore in session ----------
  const SAVE_KEY = 'scaleplus_cost_calc_products';
  const savedWrap = document.getElementById('ccSaved');
  const savedChips = document.getElementById('ccSavedChips');

  function loadSaved() {
    try { return JSON.parse(sessionStorage.getItem(SAVE_KEY) || '[]'); } catch { return []; }
  }
  function writeSaved(list) {
    sessionStorage.setItem(SAVE_KEY, JSON.stringify(list));
    renderSaved();
  }

  function snapshot() {
    return {
      productName: str('productName'),
      sellingPrice: num('sellingPrice'),
      monthlyVolume: num('monthlyVolume'),
      ingredients: Array.from(rowsEl.querySelectorAll('.cc-row')).map((row) => ({
        name: row.querySelector('.ing-name').value,
        qty: row.querySelector('.ing-qty').value,
        unit: row.querySelector('.ing-unit').value,
        cost: row.querySelector('.ing-cost').value,
      })),
      utilities: num('utilities'),
      rent: num('rent'),
      laborHours: num('laborHours'),
      hourlyRate: num('hourlyRate'),
      platformPct: num('platformPct'),
      packaging: num('packaging'),
      spoilagePct: num('spoilagePct'),
      otherFees: num('otherFees'),
    };
  }

  function restore(data) {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
    set('productName', data.productName);
    set('sellingPrice', data.sellingPrice);
    set('monthlyVolume', data.monthlyVolume);
    rowsEl.innerHTML = '';
    (data.ingredients || []).forEach((ing) => addRow(ing));
    if (!rowsEl.children.length) { addRow(); addRow(); addRow(); }
    ['utilities','rent','laborHours','hourlyRate','platformPct','packaging','spoilagePct','otherFees'].forEach((k) => set(k, data[k]));
    updateIngredientsMini();
  }

  function renderSaved() {
    const list = loadSaved();
    savedChips.innerHTML = '';
    if (!list.length) { savedWrap.hidden = true; return; }
    savedWrap.hidden = false;
    list.forEach((item, i) => {
      const chip = document.createElement('div');
      chip.className = 'cc-saved-chip';
      const label = item.productName || `Product ${i + 1}`;
      chip.innerHTML = `<span>${label}</span><button aria-label="Remove ${label}">×</button>`;
      chip.querySelector('span').addEventListener('click', () => { restore(item); goTo(1); });
      chip.querySelector('button').addEventListener('click', (e) => {
        e.stopPropagation();
        const updated = loadSaved().filter((_, idx) => idx !== i);
        writeSaved(updated);
      });
      savedChips.appendChild(chip);
    });
  }

  document.getElementById('saveProductBtn').addEventListener('click', () => {
    const list = loadSaved();
    list.push(snapshot());
    writeSaved(list);
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    if (!confirm('Clear all inputs and start over? (Saved products will stay.)')) return;
    document.querySelectorAll('#costPanel input, .cc-panel input').forEach((i) => (i.value = ''));
    rowsEl.innerHTML = '';
    addRow(); addRow(); addRow();
    document.getElementById('targetMargin').value = 40;
    goTo(1);
  });

  document.getElementById('printBtn').addEventListener('click', () => {
    compute();
    setTimeout(() => window.print(), 100);
  });

  // ---------- PDF export ----------
  function buildPdfNode() {
    const r = computeCosts();
    const productName = str('productName') || 'Your Product';
    const target = num('targetMargin');
    const suggested = suggestedPrice(r.trueCost, target);
    const today = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

    const rows = r.breakdown
      .filter((b) => b.value > 0)
      .sort((a, b) => b.value - a.value)
      .map((b) => {
        const pct = r.trueCost > 0 ? (b.value / r.trueCost) * 100 : 0;
        return `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eee;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${b.color};margin-right:10px;vertical-align:middle;"></span>
              ${b.label}
            </td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;font-family:'JetBrains Mono',monospace;color:#111;">${PHP(b.value)}</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;font-family:'JetBrains Mono',monospace;color:#666;width:70px;">${pct.toFixed(1)}%</td>
          </tr>`;
      })
      .join('');

    const barSegments = r.breakdown
      .filter((b) => b.value > 0)
      .sort((a, b) => b.value - a.value)
      .map((b) => {
        const pct = r.trueCost > 0 ? (b.value / r.trueCost) * 100 : 0;
        return `<div style="background:${b.color};width:${pct}%;height:100%;"></div>`;
      })
      .join('');

    const verdict = r.price <= 0
      ? 'Add a selling price to see the full picture.'
      : r.profit < 0
        ? `You're selling at a loss of ${PHP(-r.profit)} per unit. Every sale costs you money.`
        : r.margin < 10
          ? `You're only keeping ${PHP(r.profit)} per unit — a razor-thin ${r.margin.toFixed(1)}% margin.`
          : `You're making ${PHP(r.profit)} per unit at a real margin of ${r.margin.toFixed(1)}%.`;

    const profitColor = r.profit < 0 ? '#ef4444' : '#7c3aed';

    const node = document.createElement('div');
    node.style.cssText = 'width:780px;padding:48px;background:#ffffff;color:#111;font-family:Inter,sans-serif;font-size:14px;line-height:1.5;';
    node.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #7c3aed;padding-bottom:20px;margin-bottom:28px;">
        <div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:2px;color:#7c3aed;text-transform:uppercase;margin-bottom:6px;">ScaleTools · True Cost Calculator</div>
          <div style="font-size:26px;font-weight:800;color:#050505;letter-spacing:-0.5px;">${productName}</div>
          <div style="font-size:12px;color:#888;margin-top:4px;">Cost analysis · ${today}</div>
        </div>
        <div style="font-size:11px;color:#888;text-align:right;">
          scaleplus.io<br>Free tool · No signup
        </div>
      </div>

      <div style="background:#f7f0ff;border:1px solid #c084fc;border-radius:10px;padding:18px 22px;margin-bottom:28px;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:#7c3aed;text-transform:uppercase;margin-bottom:6px;">The honest truth</div>
        <div style="font-size:15px;font-weight:500;color:#050505;">${verdict}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        <tr>
          <td style="width:25%;padding:14px;background:#fafafa;border-radius:8px 0 0 8px;border:1px solid #eee;">
            <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin-bottom:6px;">True cost / unit</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:800;color:#050505;">${PHP(r.trueCost)}</div>
          </td>
          <td style="width:25%;padding:14px;background:#fafafa;border-top:1px solid #eee;border-bottom:1px solid #eee;">
            <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin-bottom:6px;">Selling price</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:800;color:#050505;">${PHP(r.price)}</div>
          </td>
          <td style="width:25%;padding:14px;background:#fafafa;border-top:1px solid #eee;border-bottom:1px solid #eee;">
            <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin-bottom:6px;">Profit / unit</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:800;color:${profitColor};">${PHP(r.profit)}</div>
          </td>
          <td style="width:25%;padding:14px;background:#fafafa;border-radius:0 8px 8px 0;border:1px solid #eee;">
            <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin-bottom:6px;">Real margin</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:800;color:${profitColor};">${r.margin.toFixed(1)}%</div>
          </td>
        </tr>
      </table>

      <h3 style="font-size:14px;font-weight:700;color:#050505;margin:0 0 12px 0;letter-spacing:-0.3px;">Where every peso goes</h3>
      <div style="display:flex;height:28px;border-radius:6px;overflow:hidden;background:#f4f4f4;border:1px solid #eee;margin-bottom:18px;">${barSegments}</div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">${rows}</table>

      <div style="background:#fafafa;border:1px solid #eee;border-radius:10px;padding:18px 22px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:13px;font-weight:600;color:#050505;margin-bottom:2px;">Suggested price at ${target}% target margin</div>
          <div style="font-size:11px;color:#888;">The fair price to actually hit your target, covering every real cost.</div>
        </div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:800;color:#7c3aed;">${isFinite(suggested) ? PHP(suggested) : '—'}</div>
      </div>

      <div style="border-top:1px solid #eee;padding-top:16px;font-size:10px;color:#888;text-align:center;">
        Generated by ScalePlus ScaleTools · scaleplus.io/scaletools · Free, no signup. Numbers stay on your device.
      </div>
    `;
    return { node, productName };
  }

  document.getElementById('exportPdfBtn').addEventListener('click', () => {
    if (typeof window.html2pdf !== 'function') {
      alert('PDF library is still loading. Please try again in a second.');
      return;
    }
    const btn = document.getElementById('exportPdfBtn');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Building PDF…';

    const { node, productName } = buildPdfNode();
    // Render off-screen but still laid out
    node.style.position = 'fixed';
    node.style.left = '-10000px';
    node.style.top = '0';
    document.body.appendChild(node);

    const safe = (productName || 'cost-analysis').replace(/[^\w\-]+/g, '-').toLowerCase();
    const filename = `${safe}-cost-analysis.pdf`;

    window.html2pdf()
      .set({
        margin: [12, 12, 12, 12],
        filename,
        image: { type: 'jpeg', quality: 0.96 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css'] }
      })
      .from(node)
      .save()
      .then(() => {
        node.remove();
        btn.disabled = false;
        btn.innerHTML = original;
      })
      .catch((err) => {
        console.error('PDF export failed:', err);
        node.remove();
        btn.disabled = false;
        btn.innerHTML = original;
        alert('Sorry — PDF export failed. Try the Print Summary button and save as PDF from the print dialog.');
      });
  });

  renderSaved();
})();
