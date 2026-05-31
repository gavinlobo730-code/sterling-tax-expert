/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Healthcare Calculators
   NHS Payroll & Pension Calculator (2026/27)
   ─────────────────────────────────────────────────────────── */

// scottishIncomeTaxOn() is defined in 04-calc-payroll.js (loads first).

// ── NHS pension tier lookup ────────────────────────────────
function nhsPensionTier(pensionablePay) {
  const tiers = window.TAX.NHS_PENSION_TIERS;
  for (let i = 0; i < tiers.length; i++) {
    if (pensionablePay <= tiers[i].to) return { tierIndex: i, rate: tiers[i].rate, to: tiers[i].to };
  }
  return { tierIndex: tiers.length - 1, rate: tiers[tiers.length - 1].rate, to: Infinity };
}

// ── Tab switching helper (rendered inline, no external deps) ─
function nhsTabHTML(tab1, tab2, tab3) {
  return `
    <div class="nhs-tabs">
      <button class="nhs-tab active" onclick="nhsShowTab(this,'nhs-t1')">Take-Home Pay</button>
      <button class="nhs-tab" onclick="nhsShowTab(this,'nhs-t2')">NHS Pension</button>
      <button class="nhs-tab" onclick="nhsShowTab(this,'nhs-t3')">AA Risk</button>
    </div>
    <div id="nhs-t1" class="nhs-panel">${tab1}</div>
    <div id="nhs-t2" class="nhs-panel" style="display:none">${tab2}</div>
    <div id="nhs-t3" class="nhs-panel" style="display:none">${tab3}</div>
  `;
}

// nhsShowTab is called by inline onclick — must be on window
window.nhsShowTab = function(btn, panelId) {
  btn.closest('.calc-results').querySelectorAll('.nhs-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  btn.closest('.calc-results').querySelectorAll('.nhs-panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById(panelId);
  if (panel) panel.style.display = '';
};

// ─────────────────────────────────────────────────────────
// NHS PAYROLL & PENSION CALCULATOR

// NHS payroll calculator merged into the Payslip Generator (04b-calc-payroll-master.js).
