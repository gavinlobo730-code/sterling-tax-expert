/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Core utilities & compatibility shims
   ───────────────────────────────────────────────────────────
   Loaded first. Two jobs:

   1. Shared helpers (escapeHTML / escapeAttr) used across modules.
      (These previously lived inside the CMS module; promoted here
      so calculators and pages can rely on them regardless of load
      order.)

   2. Compatibility shims for the PUBLIC freemium account system,
      which has been removed entirely. A handful of call-sites in
      the shell and calculator engine still reference these names;
      rather than hunt every one down, we provide safe no-ops so the
      public site never exposes sign-in / pricing / premium, and the
      removed routes resolve to the home page.

   NOTE: the ADMIN system (/admin) is completely separate and fully
   functional — it has its own auth in 07-admin-cms.js and its own
   tax-configuration tooling in 07b-admin-tax-config.js. Nothing
   here touches the admin.
   ─────────────────────────────────────────────────────────── */

// ── Shared string helpers ──────────────────────────────────
function escapeHTML(s){
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function escapeAttr(s){ return escapeHTML(s); }

// ── Removed public-account system: safe no-ops ─────────────
// The public site has no user accounts, sign-in, pricing or premium.
// These shims keep legacy call-sites inert.
function currentUser(){ return null; }
function updateAccountWidget(){ /* no public account widget */ }
function saveCalculation(){ /* premium feature removed */ }
function userSignout(){ /* no public sessions */ }

// Any attempt to reach a removed public route lands on home.
function mountPricing(){ if (typeof navigate === 'function') navigate('home', null, { skipHistory: true }); }
function mountSignup(){  if (typeof navigate === 'function') navigate('home', null, { skipHistory: true }); }
function mountSignin(){  if (typeof navigate === 'function') navigate('home', null, { skipHistory: true }); }
function mountAccount(){ if (typeof navigate === 'function') navigate('home', null, { skipHistory: true }); }
