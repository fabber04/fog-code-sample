import React from 'react';
import {
  LEGAL,
  privacyContactEmail,
  hasPhysicalAddress,
  hasPotrazRegistration,
  hasSeparateDpoEmail,
} from '../../constants/legalConfig';

/** Controller contact block for Privacy Policy / Terms (online-only aware). */
export default function LegalControllerDetails() {
  const privacyEmail = privacyContactEmail();

  return (
    <ul className="list-none space-y-1 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
      <li>
        <strong>Controller:</strong> {LEGAL.legalEntity}
      </li>
      <li>
        <strong>Operating from:</strong> {LEGAL.country}
        {LEGAL.isOnlineOnly ? ' (online-based; no public physical office)' : ''}
      </li>
      {hasPhysicalAddress() && (
        <li>
          <strong>Address:</strong> {LEGAL.address}
        </li>
      )}
      <li>
        <strong>Website:</strong>{' '}
        <a href={LEGAL.website} className="text-[#2563eb] hover:underline">
          {LEGAL.website}
        </a>
      </li>
      <li>
        <strong>Contact:</strong>{' '}
        <a href={`mailto:${LEGAL.contactEmail}`} className="text-[#2563eb] hover:underline">
          {LEGAL.contactEmail}
        </a>
      </li>
      {hasSeparateDpoEmail() ? (
        <li>
          <strong>Data protection contact:</strong>{' '}
          <a href={`mailto:${privacyEmail}`} className="text-[#2563eb] hover:underline">
            {privacyEmail}
          </a>
        </li>
      ) : (
        <li>
          <strong>Privacy &amp; data requests:</strong>{' '}
          <a href={`mailto:${privacyEmail}`} className="text-[#2563eb] hover:underline">
            {privacyEmail}
          </a>
        </li>
      )}
      {hasPotrazRegistration() ? (
        <li>
          <strong>POTRAZ registration:</strong> {LEGAL.potrazRegistration}
        </li>
      ) : (
        <li className="text-slate-600">
          <strong>POTRAZ registration:</strong> Not yet registered — we will update this policy when
          a licence is obtained if required by law.
        </li>
      )}
      <li>
        <strong>Regulator:</strong> {LEGAL.dataProtectionAuthority}
      </li>
    </ul>
  );
}

export function PrivacyEmailLink({ className = 'font-medium text-[#2563eb] hover:underline' }) {
  const email = privacyContactEmail();
  return (
    <a href={`mailto:${email}`} className={className}>
      {email}
    </a>
  );
}
