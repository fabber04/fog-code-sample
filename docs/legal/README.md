# Legal & data protection (Zimbabwe)

In-app pages:

- **Terms and Conditions** — `#/terms`
- **Privacy Policy** — `#/privacy`

Editable organisation details: `src/constants/legalConfig.js`

**Contact email (support, legal, privacy):** `familyofgreatness@gmail.com` (`contactEmail` in `legalConfig.js`).

## Before going live — compliance checklist

These items support compliance with the **Cyber and Data Protection Act [Chapter 12:07]** and **SI 155 of 2024** (licensing of data controllers and DPO appointment). This is operational guidance, not legal advice.

| Task | Why |
|------|-----|
| Set `contactEmail` to `familyofgreatness@gmail.com` in `legalConfig.js` | Section 15 disclosures — online-only is fine |
| Add `address` only if you later get a registered office | Optional for digital-only ministries |
| Add `potrazRegistration` when/if you obtain a licence | SI 155 of 2024 — required at certain thresholds |
| Add separate `dpoEmail` when you appoint a formal DPO | Until then, `contactEmail` handles privacy requests |
| Have a Zimbabwe lawyer review Terms & Privacy | Ensure wording matches your exact operations |
| Submit a **Code of Conduct** to POTRAZ for approval if required (Section 30) | Act requirement for controllers |
| Document **processor agreements** with Firebase, Railway, Cloudflare, etc. | Section 13 / 17 — processor safeguards |
| Define internal **breach response** (notify POTRAZ within 24 hours where required) | SI 155 / Act |
| Keep records of **consent** (registration checkbox + timestamp if stored) | Section 10 |

## What the app implements

- Public Terms and Privacy pages linked from registration
- Explicit consent checkbox at sign-up (including under-18 guardian statement)
- Privacy Policy covering purposes, rights, processors, breaches, and children
- Central config for data-controller contact details

## Updating legal text

Edit `src/pages/TermsAndConditions.js` and `src/pages/PrivacyPolicy.js`, then bump `lastUpdated` in `legalConfig.js`.
