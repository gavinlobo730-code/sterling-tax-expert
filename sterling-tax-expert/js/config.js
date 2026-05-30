/* ═══════════════════════════════════════════════════════════
   Sterling Tax Expert — Site configuration
   ───────────────────────────────────────────────────────────
   Edit this one file to wire up live email delivery and the hero
   video. No build step required — just save and reload.

   ── EMAIL (contact form) ──────────────────────────────────
   The contact form sends real email via EmailJS (free tier,
   no backend). To enable:
     1. Create a free account at https://www.emailjs.com
     2. Add an email service (e.g. connect the Sterling Gmail
        inbox) → copy its Service ID.
     3. Create an email template with these variables:
          {{from_name}} {{reply_to}} {{phone}} {{service}} {{message}}
        Set the template's "To email" to {{to_email}} (or hard-code
        the Sterling inbox). Copy the Template ID.
     4. Copy your Public Key (Account → API Keys).
     5. Paste all three below.

   Until these are filled in, the form falls back to opening the
   visitor's email app pre-addressed to the Sterling inbox, so it
   is never a dead end.

   ── HERO VIDEO ────────────────────────────────────────────
   Point heroVideo at an MP4 (self-hosted in /assets or a CDN).
   Leave it blank to use the premium navy gradient background only.
   ─────────────────────────────────────────────────────────── */

window.STERLING_CONFIG = {
  // Where enquiries are delivered:
  contactEmail: 'sterlingtaxexpert@gmail.com',

  emailjs: {
    publicKey:  'Wiy-AGwPgs8KChEsB',
    serviceId:  'service_tp0kt6d',
    templateId: 'template_61wheps',
  },

  // Optional fullscreen hero background video (MP4). Blank = gradient only.
  // Example (self-hosted): 'assets/hero.mp4'
  heroVideo: '',

  // Base URL of the Cloudflare Worker. Do NOT include a trailing /api.
  // The contact form appends /api/enquiry to this value.
  // Change to 'http://localhost:8787' for local development.
  cmsApiBase: 'https://sterling-tax.co.uk',
};
