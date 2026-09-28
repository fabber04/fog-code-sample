/**
 * Legal / data-controller details shown in Terms & Privacy pages.
 *
 * FOG is online-based — you do not need a physical office or POTRAZ number in this
 * file until you have them. A working contact email and website are enough for
 * in-app disclosures under the Cyber and Data Protection Act (Section 15).
 */
export const LEGAL = {
  appName: 'Family of Greatness (FOG)',
  legalEntity: 'Family of Greatness Ministries',
  website: 'https://familyofgreatness.com',
  country: 'Zimbabwe',

  /** No public physical office — operations are digital-only. */
  isOnlineOnly: true,

  /** Primary contact for support, legal, and privacy/data requests. */
  contactEmail: 'familyofgreatness@gmail.com',

  /**
   * Optional separate privacy inbox. Leave null to use contactEmail for everything
   * (normal for a small online ministry until a formal DPO is appointed).
   */
  dpoEmail: null,

  /**
   * Optional street or registered address. Leave null if you operate online only.
   * Section 15 of the Act still allows electronic contact details as your primary identifier.
   */
  address: null,

  /**
   * POTRAZ data-controller licence/registration — only required once you cross the
   * thresholds in SI 155 of 2024 (e.g. processing 50+ people's data commercially).
   * Leave null until you have a number.
   */
  potrazRegistration: null,

  lastUpdated: '3 July 2026',
  governingLaw: 'Cyber and Data Protection Act [Chapter 12:07] and laws of Zimbabwe',
  dataProtectionAuthority: 'Postal and Telecommunications Regulatory Authority of Zimbabwe (POTRAZ)',
};

/** Email for privacy, access, and correction requests (falls back to main contact). */
export function privacyContactEmail() {
  return LEGAL.dpoEmail?.trim() || LEGAL.contactEmail;
}

export function hasPhysicalAddress() {
  return Boolean(LEGAL.address?.trim());
}

export function hasPotrazRegistration() {
  return Boolean(LEGAL.potrazRegistration?.trim());
}

export function hasSeparateDpoEmail() {
  const dpo = LEGAL.dpoEmail?.trim();
  return Boolean(dpo && dpo !== LEGAL.contactEmail);
}
