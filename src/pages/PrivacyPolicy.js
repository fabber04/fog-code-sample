import React from 'react';
import { Link } from 'react-router-dom';
import LegalDocumentLayout from '../components/legal/LegalDocumentLayout';
import LegalControllerDetails, { PrivacyEmailLink } from '../components/legal/LegalControllerDetails';
import { LEGAL } from '../constants/legalConfig';

const Section = ({ title, children }) => (
  <section>
    <h2 className="mb-3 text-base font-semibold text-slate-900 sm:text-lg">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

const PrivacyPolicy = () => (
  <LegalDocumentLayout title="Privacy Policy">
    <Section title="1. Who we are">
      <p>
        This Privacy Policy explains how {LEGAL.legalEntity} (&quot;FOG&quot;, &quot;we&quot;,
        &quot;us&quot;) collects, uses, stores, and protects personal information when you use the{' '}
        {LEGAL.appName} application and website (the &quot;Service&quot;).
      </p>
      <p>
        FOG is the <strong>data controller</strong> for personal information processed through the
        Service, as defined in the Cyber and Data Protection Act [Chapter 12:07] (&quot;the
        Act&quot;).
      </p>
      <LegalControllerDetails />
      <p>
        This Policy satisfies disclosure requirements under Sections 15 and 16 of the Act when we
        collect information directly from you. It should be read together with our{' '}
        <Link to="/terms" className="font-medium text-[#2563eb] hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </Section>

    <Section title="2. Information we collect">
      <p>Depending on how you use the Service, we may process:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Account data:</strong> name, email address, password (stored in hashed or
          encrypted form by our authentication provider), phone number (optional), grade/level,
          role, and profile preferences.
        </li>
        <li>
          <strong>Usage data:</strong> podcast plays, bookmarks, notification read status, and
          similar in-app activity needed to run features.
        </li>
        <li>
          <strong>Prayer and community submissions:</strong> text you submit in prayer requests or
          similar forms; these may be visible only to authorised ministry administrators.
        </li>
        <li>
          <strong>Technical data:</strong> device/browser type, IP address, timestamps, and diagnostic
          logs for security and performance.
        </li>
        <li>
          <strong>Local storage:</strong> limited data stored on your device (for example onboarding
          completion or profile customisations) to improve your experience.
        </li>
      </ul>
      <p>We do not intentionally collect genetic, biometric, or health records unless you voluntarily include such information in free-text fields — please avoid doing so.</p>
    </Section>

    <Section title="3. Purposes of processing">
      <p>We process personal information only for specified, explicit, and legitimate purposes, including to:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>create and manage your account and authenticate you;</li>
        <li>deliver podcasts, devotionals, events, library content, and notifications;</li>
        <li>facilitate prayer requests and ministry support you request;</li>
        <li>operate admin tools for authorised FOG staff;</li>
        <li>maintain security, prevent abuse, and comply with legal obligations;</li>
        <li>improve the Service through aggregated or anonymised analytics where possible.</li>
      </ul>
      <p>
        We do not use your information for purposes incompatible with those above without informing
        you and, where required, obtaining fresh consent.
      </p>
    </Section>

    <Section title="4. Legal basis and consent">
      <p>
        Under Section 10 of the Act, we process non-sensitive personal information based on your
        consent when you register and accept our Terms and this Policy. Consent must be freely given,
        specific, and informed. You may withdraw consent at any time by contacting{' '}
        <PrivacyEmailLink /> , without charge, though we may need to retain certain data where the
        law allows.
      </p>
      <p>
        We may also process data without consent where the Act permits, for example to comply with
        legal obligations, protect vital interests, or prevent or investigate offences.
      </p>
      <p>
        <strong>Sensitive data:</strong> Spiritual or religious information in prayer requests may be
        treated as sensitive. Where written consent is required under Sections 11–12 of the Act, your
        explicit acceptance at registration and when submitting such content constitutes that consent.
      </p>
      <p>
        <strong>Children:</strong> If you are under 18, a parent, guardian, or other competent person
        must consent on your behalf before account creation, as required by the Act.
      </p>
    </Section>

    <Section title="5. Data processors and international transfers">
      <p>
        We use trusted service providers who process data on our instructions, including providers
        for:
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>authentication and user profiles (Google Firebase);</li>
        <li>application hosting and databases (cloud infrastructure such as Railway);</li>
        <li>media storage and delivery (for example Cloudflare R2);</li>
        <li>email or SMS alerts where configured (for example SendGrid, Twilio).</li>
      </ul>
      <p>
        These processors may store or process data outside Zimbabwe. We require contractual and
        technical safeguards consistent with Section 13 and Section 17 of the Act. By using the
        Service, you acknowledge that cross-border processing may occur for these operational
        purposes.
      </p>
    </Section>

    <Section title="6. Security">
      <p>
        We implement appropriate technical and organisational measures to protect personal
        information against unauthorised access, loss, alteration, or destruction, having regard to
        the nature of the data and the risks to you. Measures include access controls, encryption in
        transit, role-based admin access, and secure hosting practices.
      </p>
      <p>
        No method of transmission or storage is completely secure. Please use a strong password and
        notify us promptly if you suspect unauthorised access to your account.
      </p>
    </Section>

    <Section title="7. Retention">
      <p>
        We retain personal information only for as long as necessary for the purposes collected, or
        as required by law. When data is no longer needed, we delete or anonymise it within a
        reasonable period. Account data is generally kept while your account is active and for a
        limited period thereafter for backup, dispute resolution, or legal compliance.
      </p>
    </Section>

    <Section title="8. Your rights (Section 14 of the Act)">
      <p>As a data subject, you have the right to:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>be informed of the use to which your personal information is put;</li>
        <li>access personal information we hold about you;</li>
        <li>object to processing of all or part of your personal information;</li>
        <li>request correction of false or misleading personal information; and</li>
        <li>request deletion of false or misleading data about you.</li>
      </ul>
      <p>
        Submit requests to <PrivacyEmailLink />. We may need to verify your identity. You may also complain to {LEGAL.dataProtectionAuthority}.
      </p>
    </Section>

    <Section title="9. Data breaches">
      <p>
        If a personal data breach occurs, we will take immediate steps to contain it and assess the
        risk. Where required under the Act and Statutory Instrument 155 of 2024, we will notify{' '}
        {LEGAL.dataProtectionAuthority} within twenty-four (24) hours of becoming aware of the
        breach, and we will inform affected data subjects without undue delay when the breach is
        likely to affect their rights and freedoms.
      </p>
    </Section>

    <Section title="10. Cookies and local device storage">
      <p>
        The Service uses browser local storage and similar technologies for session management,
        preferences, and performance. You can clear local storage through your browser settings,
        though some features may not work correctly afterward.
      </p>
    </Section>

    <Section title="11. Changes to this Policy">
      <p>
        We may update this Privacy Policy to reflect legal or operational changes. The &quot;Last
        updated&quot; date at the top will change accordingly. Material updates may be communicated
        through the app or by email where appropriate.
      </p>
    </Section>

    <Section title="12. Contact">
      <p>
        Privacy and data rights: <PrivacyEmailLink />
        <br />
        General enquiries:{' '}
        <a
          href={`mailto:${LEGAL.contactEmail}`}
          className="font-medium text-[#2563eb] hover:underline"
        >
          {LEGAL.contactEmail}
        </a>
      </p>
    </Section>
  </LegalDocumentLayout>
);

export default PrivacyPolicy;
