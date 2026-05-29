# Sterling Tax Expert — UK Payroll, Tax & Compliance Platform

A lightweight, frontend-only UK payroll/tax/compliance platform: 25 HMRC-aligned
calculators for the **2026/27 tax year**, a full statutory deadlines hub with
one-click calendar exports, plain-English insights, and a private admin/CMS.

No build step. No backend. No database. Open it and it runs.

---

## Quick start

**Option A — VS Code (recommended)**
1. Open this folder in VS Code.
2. Install the **Live Server** extension (Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server**.

**Option B — any static server**
```bash
# Python
python3 -m http.server 8080
# or Node
npx serve .
```
Then open `http://localhost:8080`.

> Use a local server rather than opening `index.html` via `file://` — the app
> loads several JS modules and some browsers restrict `file://` script loading.

---

## Project structure

```
sterling-tax-expert/
├── index.html              # Shell: head, nav, home page, page containers, script order
├── css/
│   └── styles.css          # All styles (premium fintech theme) + enhancements
├── js/
│   ├── config.js           # ← EDIT THIS: EmailJS keys, contact email, hero video
│   ├── 00-core.js          # Shared helpers + shims for the removed public-account system
│   ├── 01-data.js          # window.TAX (all rates/thresholds), TOOLS, DEADLINES, content
│   ├── 02-shell.js         # SPA router, nav, toast, loader, contact form (EmailJS)
│   ├── 03-calc-engine.js   # Calculator framework (inputs, render, charts)
│   ├── 04-calc-payroll.js  # PAYE, employer NI, net-to-gross, SSP, SMP, holiday, redundancy…
│   ├── 05-calc-compliance.js  # Min wage, auto-enrol, CIS, corp tax, VAT, dividends…
│   ├── 06-calc-extra.js    # Employee NI, gross-to-net, SPP, SAP, ShPP, marginal relief
│   ├── 07-admin-cms.js     # Private admin: auth, articles, media, SEO, settings
│   ├── 07b-admin-tax-config.js  # Admin "Tax configuration" — editable rates (future tax years)
│   └── 08-pages.js         # Home/services/tools/insights/deadlines/about/contact + footer
└── assets/                 # Optional self-hosted hero video lives here
```

Scripts load in numbered order (dependencies first). Keep that order if you add
`<script>` tags.

---

## Configuration (`js/config.js`)

### 1. Contact form email (EmailJS)

The contact form sends **real email** via [EmailJS](https://www.emailjs.com)
(free tier, no backend). To go live:

1. Create a free EmailJS account.
2. **Add an email service** (e.g. connect the Sterling Gmail inbox) → copy the **Service ID**.
3. **Create a template** using these variables:
   `{{from_name}}`, `{{reply_to}}`, `{{phone}}`, `{{service}}`, `{{message}}`.
   Set the template's *To* field to `{{to_email}}` (or hard-code the Sterling inbox).
   Copy the **Template ID**.
4. Copy your **Public Key** (Account → API Keys).
5. Paste all three into `js/config.js`.

```js
emailjs: {
  publicKey:  'xxxxxxxxxxxxx',
  serviceId:  'service_xxxxx',
  templateId: 'template_xxxxx',
},
```

Until these are filled in, the form **falls back to opening the visitor's email
app** pre-addressed to the Sterling inbox — so it's never a dead end. The form
has validation, loading/success states, and honeypot spam protection built in.

### 2. Hero background video (optional)

Set `heroVideo` to an MP4 URL (self-host in `assets/` or use a CDN):

```js
heroVideo: 'assets/hero.mp4',
```

Leave it blank to use the premium navy gradient background only. The video is
muted, looped, lazy-loaded, has a dark overlay for text readability, and is
automatically disabled for users who prefer reduced motion.

### 3. Contact inbox

`contactEmail` sets where enquiries are delivered (default
`sterlingtaxexpert@gmail.com`).

---

## Admin / CMS (private)

The admin system is **not linked anywhere on the public site**. Reach it directly:

```
http://your-site/#admin      (or click nowhere — type the hash)
```

In a deep-linkable host, `#admin` opens the login. Default demo credentials:

```
Username: Admin
Password: 123456789
```

> **Change these before deploying.** Edit `ADMIN_USER` / `ADMIN_PASS` at the top
> of `js/07-admin-cms.js`. For a production firm, put the admin behind real
> server-side auth (HTTPS-only session cookie, hashed password, rate limiting).
> This frontend gate is convenience-level only.

The admin includes: dashboard, article management (create/edit/draft/schedule/
publish), media library, categories, SEO defaults, account settings, and a
**Tax configuration** tab where staff can override any rate/threshold in
`window.TAX` (persisted to `localStorage`) — useful for in-year Budget changes
or rolling forward to a new tax year without a code release.

---

## Deploying

It's a static site — deploy the folder anywhere:

- **Netlify / Vercel / Cloudflare Pages:** drag-and-drop the folder, or connect
  the repo. No build command; publish directory is the project root.
- **GitHub Pages:** push to a repo, enable Pages on the branch root.
- **Any web host:** upload the files via FTP.

---

## What's HMRC-accurate (2026/27)

All statutory figures reflect the rules **in force from 6 April 2026**, including
the Employment Rights Act 2025 reforms:

| Area | Value |
|---|---|
| SSP | £123.25/wk **or 80% of AWE** (whichever lower); **paid from day 1** (no waiting days); **no LEL** eligibility test |
| SMP / SPP / SAP / ShPP | £194.32/wk (or 90% AWE if lower for weeks 7+) |
| Lower Earnings Limit (SMP/SPP qual.) | £129/wk |
| Statutory redundancy weekly cap | £751 |
| Class 2 NI | £3.65/wk, SPT £7,105 |
| Employer NI | 15% over £5,000; Employment Allowance £10,500 |
| Income tax / NI / CT / VAT / dividends | 2026/27 thresholds |

The **SMP calculator** takes the baby due date and derives the Expected Week of
Childbirth, qualifying week, and earliest leave date, and checks both the
26-week continuous-service and LEL conditions. The **SSP calculator** applies
the day-one, no-LEL, 80%-AWE-capped 2026/27 rules.

Rates are centralised in `js/01-data.js` (`window.TAX`) and overridable from the
admin Tax-configuration tab, so future tax-year updates are a data change, not a
code rewrite.

---

## Notes

- Calculations run entirely in the browser; nothing a visitor types leaves their device.
- The deadlines hub exports to Google Calendar, Outlook, Apple Calendar / `.ics`
  (with 7-day and 1-day reminders), per deadline or per category
  (PAYE, RTI, VAT, CIS, Self Assessment, Corp tax, Pension).
- The public site has **no accounts, pricing, sign-in, or newsletter** — it's a
  free public toolkit plus a contact route to the firm.
