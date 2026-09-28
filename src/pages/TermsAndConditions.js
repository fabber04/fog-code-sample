import React from 'react';
import { Link } from 'react-router-dom';
import LegalDocumentLayout from '../components/legal/LegalDocumentLayout';
import { PrivacyEmailLink } from '../components/legal/LegalControllerDetails';
import { LEGAL, hasPhysicalAddress, hasPotrazRegistration } from '../constants/legalConfig';

const TermsSection = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-4">
    <h2 className="mb-3 text-base font-semibold text-slate-900 sm:text-lg">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

const SubSection = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-slate-800 sm:text-base">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const TermsAndConditions = () => (
  <LegalDocumentLayout title="Terms of Service">
    <div className="space-y-8">
      <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm sm:p-5">
        <p>
          Welcome, and thank you for your interest in {LEGAL.legalEntity} (&quot;Community
          Owner,&quot; &quot;FOG,&quot; &quot;we,&quot; or &quot;us&quot;) and our online community
          platform, along with any mobile or other downloadable applications that we make available
          to enable access to the same (collectively, the &quot;Community&quot; or
          &quot;Platform&quot;). These Terms of Service are a legally binding contract between you
          and Community Owner regarding your use of the Community.
        </p>
        <p className="font-semibold uppercase tracking-wide text-slate-900">
          Please read the following terms carefully.
        </p>
        <p>
          By accepting these Terms, either by ticking &quot;I agree&quot; at registration, or by
          otherwise accessing or using the Community, you agree that you have read and understood,
          and, as a condition to your use of and access to the Community, you agree to be bound by
          the following terms and conditions, including Community Owner&apos;s{' '}
          <Link to="/privacy" className="font-medium text-[#2563eb] hover:underline">
            Privacy Policy
          </Link>{' '}
          (collectively, these &quot;Terms&quot;) and the Additional Community Terms attached as{' '}
          <a href="#exhibit-a" className="font-medium text-[#2563eb] hover:underline">
            Exhibit A
          </a>{' '}
          (the &quot;Additional Terms&quot;) either (a) on behalf of yourself as an individual, or
          (b) if you are accessing the Community on behalf of an entity, organisation, or community
          group, on behalf of such entity, organisation or group for which you act, and you
          represent that you have the authority to bind such entity, organisation or group to this
          agreement. If you are not eligible, or do not agree to the Terms, then you do not have our
          permission to use the Community. Your use of the Community, and Community Owner&apos;s
          provision of the Community to you, constitutes an agreement by Community Owner and by you
          to be bound by these Terms.
        </p>
        <p className="text-slate-800">
          <strong>Dispute resolution notice.</strong> Except for certain kinds of disputes described
          in Section 15 (Dispute Resolution), you agree that disputes arising under these Terms
          will be resolved in accordance with the laws of Zimbabwe and the courts specified in
          Section 16.3 (Governing Law). To the fullest extent permitted by law, you agree not to
          bring or participate in any class, collective, or representative proceeding against
          Community Owner.
        </p>
      </div>

      <TermsSection id="s1" title="1. Eligibility">
        <p>
          You must be at least eighteen (18) years old to join the Community on your own, or have
          the consent of a parent, guardian, or other competent person as required under the Cyber
          and Data Protection Act [Chapter 12:07] (&quot;the Act&quot;). By agreeing to these Terms,
          you represent and warrant to us that: (a) you are at least eighteen (18) years old, or you
          are under eighteen (18) and have obtained verifiable consent from a parent, guardian, or
          other competent person to join the Community; (b) you have not previously been suspended
          or removed from the Community; and (c) your registration and your use of the Community is
          in compliance with any and all applicable laws and regulations of Zimbabwe and any other
          jurisdiction that applies to you.
        </p>
      </TermsSection>

      <TermsSection id="s2" title="2. Accounts and Registration">
        <p>
          To access most features of the Community, you must register for an account. When you
          register for an account, you may be required to provide us with some information about
          yourself, such as your name, email address, phone number, grade or level, or other contact
          information. You agree that the information you provide to us is accurate, complete, and
          not misleading, and that you will keep it accurate and up to date at all times.
        </p>
        <p>
          When you register, you will be asked to create a password (or authenticate through a
          third-party identity provider). You are solely responsible for maintaining the
          confidentiality of your account and password, and you accept responsibility for all
          activities that occur under your account. If you believe that your account is no longer
          secure, then you should immediately notify us at <PrivacyEmailLink /> or by using the mechanisms made available by Community Owner in the Community.
        </p>
      </TermsSection>

      <TermsSection id="s3" title="3. Licenses">
        <SubSection title="3.1. Limited License">
          <p>
            Subject to your complete and ongoing compliance with these Terms, Community Owner grants
            you, solely for your personal, non-commercial use, a limited, non-exclusive,
            non-transferable, non-sublicensable, revocable license to: (a) install and use any
            mobile or other downloadable application provided to you by Community Owner and
            associated with the Community on a mobile device that you own or control; and (b) access
            and use the Community, including podcasts, devotionals, events, library content, Genius
            Academy resources, prayer requests, notifications, and related ministry features.
          </p>
        </SubSection>
        <SubSection title="3.2. License Restrictions">
          <p>
            Except and solely to the extent such a restriction is impermissible under applicable
            law, you may not: (a) reproduce, distribute, publicly display, publicly perform, or
            create derivative works of the software powering the Community; (b) make modifications
            to the software powering the Community; or (c) interfere with or circumvent any feature
            of the Community, including any security or access control mechanism. If you are
            prohibited under applicable law from using the Community, then you may not use it.
          </p>
        </SubSection>
        <SubSection title="3.3. Feedback">
          <p>
            We respect and appreciate the thoughts and comments from our users. If you choose to
            provide input and suggestions regarding existing functionalities, problems with or
            proposed modifications or improvements to the Community (&quot;Submissions&quot;), then
            you hereby grant Community Owner and its Technology Providers (defined in Section 16.1
            below) an unrestricted, perpetual, irrevocable, non-exclusive, fully-paid, royalty-free
            right and license to exploit the Submissions in any manner and for any purpose,
            including to improve the Community and create other products and services. We will have
            no obligation to provide you with attribution for any Submissions you provide to us.
          </p>
        </SubSection>
      </TermsSection>

      <TermsSection id="s4" title="4. Ownership; Proprietary Rights">
        <p>
          The Community is managed by Community Owner using platforms and services made available by
          Technology Providers. The visual interfaces, graphics, design, compilation, information,
          data, computer code (including source code or object code), products, software, services,
          podcasts, devotionals, and all other elements of the Community provided by Community
          Owner or Technology Providers (&quot;Materials&quot;) are protected by intellectual
          property and other laws. All Materials included in the Community are the property of
          Community Owner or its third-party licensors (including Technology Providers). Except as
          expressly authorized by Community Owner, you may not make use of the Materials. There are
          no implied licenses in these Terms and Community Owner and Technology Providers reserve
          all rights to the Materials not granted expressly in these Terms.
        </p>
      </TermsSection>

      <TermsSection id="s5" title="5. Third-Party Terms">
        <SubSection title="5.1. Third-Party Services">
          <p>
            Community Owner may provide tools through the Community that enable integration with
            third-party platforms, add-ons, services, or products not provided by Community Owner
            (&quot;Third-Party Services&quot;), including authentication (such as Firebase),
            hosting, media delivery (such as Cloudflare R2), email, or SMS providers. If you direct
            us to transmit data to, or receive data from, a Third-Party Service on your behalf
            (including by enabling the applicable integration or signing in through a third party),
            then you authorize us and Technology Providers to collect, access, use, derive,
            disclose, generate, transfer, transmit, store, host, or otherwise process
            (&quot;Process&quot;) any such data, including User Content (defined in Section 6.1
            below), in connection with the applicable integration, in a manner consistent with the
            functionality of the Community requested by you and the permissions granted to Community
            Owner by the relevant integration.
          </p>
          <p>
            You acknowledge and agree that your use of a Third-Party Service is subject to your
            agreement with the relevant provider of such Third-Party Service, and that Community
            Owner and Technology Providers are not a party to such agreement. Community Owner and
            Technology Providers do not control and have no liability for Third-Party Services,
            including their security, functionality, operation, availability, or interoperability
            with the Community or how the Third-Party Services or their providers use User Content.
            All data received from Third-Party Services on behalf of you as described herein will
            be deemed User Content under these Terms.
          </p>
        </SubSection>
        <SubSection title="5.2. Third-Party Software">
          <p>
            The Community may include or incorporate third-party software components that are
            generally available free of charge under licenses granting recipients broad rights to
            copy, modify, and distribute those components (&quot;Third-Party Components&quot;).
            Although the Community is provided to you subject to these Terms, nothing in these
            Terms prevents, restricts, or is intended to prevent or restrict you from obtaining
            Third-Party Components under the applicable third-party licenses or to limit your use
            of Third-Party Components under those third-party licenses.
          </p>
        </SubSection>
      </TermsSection>

      <TermsSection id="s6" title="6. User Conduct">
        <SubSection title="6.1. User Content Generally">
          <p>
            Certain features of the Community may permit users to submit, upload, publish, broadcast,
            or otherwise transmit (&quot;Post&quot;) content to the Community, including prayer
            requests, messages, reviews, comments, profile information, images, folders, data,
            text, and any other works of authorship or other works (&quot;User Content&quot;). You
            retain any copyright and other proprietary rights that you may hold in the User Content
            that you Post to the Community, subject to the licenses granted in these Terms.
          </p>
        </SubSection>
        <SubSection title="6.2. Limited License Grant to Community Owner">
          <p>
            By Posting User Content to or via the Community, you grant Community Owner and
            Technology Providers a worldwide, non-exclusive, royalty-free, fully paid right and
            license (with the right to sublicense through multiple tiers) to host, store, transfer,
            publicly display, publicly perform (including by means of a digital audio transmission),
            communicate to the public, reproduce, modify for the purpose of formatting for display,
            create derivative works as authorized in these Terms, and distribute your User Content,
            in whole or in part, in any media formats and through any media channels, in each
            instance whether now known or hereafter developed, solely for the purpose of operating,
            providing, and improving the Community and fulfilling ministry purposes you request
            (such as confidential prayer support by authorised administrators). You agree to pay all
            monies owing to any person or entity resulting from Posting your User Content and from
            Community Owner&apos;s or Technology Providers&apos; exercise of the license set forth
            in this Section.
          </p>
        </SubSection>
        <SubSection title="6.3. You Must Have Rights to the Content You Post; User Content Representations and Warranties">
          <p>
            You must not Post User Content if you are not the owner of or are not fully authorized
            to grant rights in all of the elements of that User Content. Community Owner disclaims
            any and all liability in connection with User Content. You are solely responsible for
            your User Content and the consequences of providing User Content via the Community. By
            providing User Content via the Community, you affirm, represent, and warrant to us that:
          </p>
          <ul className="list-[lower-alpha] space-y-2 pl-6">
            <li>
              you are the creator and owner of the User Content, or have the necessary licenses,
              rights, consents, and permissions to authorize Community Owner and users of the
              Community to use and distribute your User Content as necessary to exercise the
              licenses granted by you in this Section, in the manner contemplated by Community
              Owner, Technology Providers, the Community, and these Terms;
            </li>
            <li>
              your User Content, and the Posting or other use of your User Content as contemplated
              by these Terms, does not and will not: (i) infringe, violate, misappropriate, or
              otherwise breach any third-party right, including any copyright, trademark, patent,
              trade secret, moral right, privacy right, right of publicity, or any other
              intellectual property, contract, or proprietary right; (ii) slander, defame, libel, or
              invade the right of privacy, publicity or other property rights of any other person;
              or (iii) cause Community Owner or Technology Providers to violate any law or
              regulation or require Community Owner or Technology Providers to obtain any further
              licenses from or pay any royalties, fees, compensation or other amounts or provide any
              attribution to any third parties; and
            </li>
            <li>
              your User Content could not be deemed by a reasonable person to be objectionable,
              profane, indecent, pornographic, harassing, threatening, embarrassing, hateful, or
              otherwise inappropriate for a faith-based community platform.
            </li>
          </ul>
        </SubSection>
        <SubSection title="6.4. User Content Disclaimer">
          <p>
            Community Owner and Technology Providers are under no obligation to edit or control User
            Content that you or other users Post and will not be in any way responsible or liable
            for User Content. Community Owner or Technology Providers may, however, at any time and
            without prior notice, screen, remove, edit, or block any User Content that in our sole
            judgment violates these Terms, is alleged to violate the rights of third parties, or is
            otherwise objectionable. You understand that, when using the Community, you will be
            exposed to User Content from a variety of sources and acknowledge that User Content may
            be inaccurate, offensive, indecent, or objectionable. You agree to waive, and do waive,
            any legal or equitable right or remedy you have or may have against Community Owner or
            Technology Providers with respect to User Content. If notified by a user or content
            owner that User Content allegedly does not conform to these Terms, Community Owner may
            investigate the allegation and determine whether to remove the User Content, which
            Community Owner and Technology Providers reserve the right to do at any time, without
            notice, and for any reason. For clarity, Community Owner does not permit infringing
            activities on the Community.
          </p>
        </SubSection>
        <SubSection title="6.5. Monitoring Content">
          <p>
            Community Owner and Technology Providers do not control and do not have any obligation to
            monitor: (a) User Content; (b) any content made available by third parties; or (c) the
            use of the Community by its users. You acknowledge and agree that Community Owner and
            Technology Providers reserve the right to, and may from time to time, monitor any and
            all information transmitted or received through the Community for operational, security,
            and legal compliance purposes. If at any time Community Owner or Technology Providers
            choose to monitor the content, then Community Owner and Technology Providers still
            assume no responsibility or liability for content or any loss or damage incurred as a
            result of the use of content. During monitoring, information may be examined, recorded,
            copied, and used in accordance with Community Owner&apos;s Privacy Policy. Community
            Owner and Technology Providers may block, filter, mute, remove or disable access to any
            User Content uploaded to or transmitted through the Community without any liability to
            the user who Posted such User Content to the Community or to any other users of the
            Community.
          </p>
        </SubSection>
        <SubSection title="6.6. Child Safety and Exploitation">
          <p>
            Community Owner and Technology Providers prohibit any sexual content or suggestive
            content, and predatory or inappropriate behaviour involving minors (i.e. users under
            eighteen (18) years old) or someone who appears to be a minor. This includes sharing,
            offering, or asking for child exploitation content, including child sexual abuse material
            (CSAM). If you are unsure about a piece of content involving a minor, do not share it.
            To report sexual, suggestive, or inappropriate behaviour involving minors, contact us
            at <PrivacyEmailLink /> . When child sexual exploitation content is identified, the violative content is removed
            as soon as possible and the related account is banned. If Community Owner and
            Technology Providers confirm the presence of CSAM, we take the steps required by law to
            preserve and refer the relevant content to appropriate authorities in Zimbabwe and, where
            applicable, international partner organisations.
          </p>
        </SubSection>
      </TermsSection>

      <TermsSection id="s7" title="7. Communications">
        <SubSection title="7.1. Push Notifications">
          <p>
            When you install our app on your mobile device or enable notifications in your browser,
            you may agree to receive push notifications. You can turn off notifications by visiting
            your mobile device&apos;s &quot;settings&quot; page or the notification settings in the
            Community.
          </p>
        </SubSection>
        <SubSection title="7.2. In-App Notifications">
          <p>
            We may send you in-app notifications concerning events, devotionals, podcasts, prayer
            updates, and other Community activity. You can manage notification preferences where
            available in the Community.
          </p>
        </SubSection>
        <SubSection title="7.3. Email">
          <p>
            We may send you emails concerning our products and services, ministry updates, and
            administrative messages. You may opt out of promotional emails by following the
            unsubscribe instructions in the promotional email itself. Even if you opt out of
            receiving promotional messages from us, you will continue to receive administrative
            messages from us relating to your account and the Community.
          </p>
        </SubSection>
      </TermsSection>

      <TermsSection id="s8" title="8. Prohibited Conduct">
        <p className="font-semibold uppercase text-slate-800">
          By using the Community, you agree not to:
        </p>
        <ul className="list-decimal space-y-2 pl-6">
          <li>use the Community for any illegal purpose or in violation of any applicable law;</li>
          <li>
            harass, threaten, demean, embarrass, bully, or otherwise harm any other user of the
            Community;
          </li>
          <li>
            violate, encourage others to violate, or provide instructions on how to violate, any right
            of a third party, including by infringing or misappropriating any third-party
            intellectual property right;
          </li>
          <li>
            access, search, or otherwise use any portion of the Community through the use of any
            engine, software, tool, agent, device, or mechanism (including spiders, robots,
            crawlers, and data mining tools) other than the software or search agents provided by
            Community Owner or Technology Providers;
          </li>
          <li>
            interfere with security-related features of the Community, including by: (a) disabling
            or circumventing features that prevent or limit use, printing or copying of any content;
            or (b) reverse engineering or otherwise attempting to discover the source code of any
            portion of the Community except to the extent that the activity is expressly permitted
            by applicable law;
          </li>
          <li>
            interfere with the operation of the Community or any user&apos;s enjoyment of the
            Community, including by: (a) uploading or otherwise disseminating any virus, adware,
            spyware, worm, or other malicious code; (b) making any unsolicited offer or advertisement
            to another user of the Community; (c) collecting personal information about another user
            or third party without consent contrary to the Act; or (d) interfering with or
            disrupting any network, equipment, or server connected to or used to provide the
            Community;
          </li>
          <li>
            perform any fraudulent activity including impersonating any person or entity, claiming a
            false affiliation or identity, accessing any other Community account without permission,
            or falsifying your age or date of birth;
          </li>
          <li>
            sell or otherwise transfer the access granted under these Terms or any Materials or any
            right or ability to view, access, or use any Materials; or
          </li>
          <li>
            attempt to do any of the acts described in this Section 8 or assist or permit any person
            in engaging in any of the acts described in this Section 8.
          </li>
        </ul>
        <p>
          You further agree not to use the Community in any manner that violates the Cyber and Data
          Protection Act [Chapter 12:07], including unauthorised access to computer systems, unlawful
          interception of data, or processing of personal information without a lawful basis.
        </p>
      </TermsSection>

      <TermsSection id="s9" title="9. Intellectual Property Rights Protection">
        <SubSection title="9.1. Respect of Third Party Rights">
          <p>
            Community Owner respects the intellectual property rights of others, takes the protection
            of intellectual property rights seriously, and asks users of the Community to do the
            same. Infringing activity will not be tolerated on or through the Community.
          </p>
        </SubSection>
        <SubSection title="9.2. Infringement Notification">
          <p>
            If you believe that content on the Community infringes your copyright or other
            intellectual property rights, please notify us in writing at{' '}
            <a href={`mailto:${LEGAL.contactEmail}`} className="font-medium text-[#2563eb] hover:underline">
              {LEGAL.contactEmail}
            </a>{' '}
            with sufficient detail to identify the work, the allegedly infringing material, and your
            contact information. We will investigate and, where appropriate, remove or disable access
            to the reported content in accordance with applicable law.
          </p>
        </SubSection>
      </TermsSection>

      <TermsSection id="s10" title="10. Modification of Terms">
        <p>
          We may, from time to time, change these Terms. Please check these Terms periodically for
          changes. Revisions will be effective immediately except that, for existing users, material
          revisions will be effective thirty (30) days after posting or notice to you of the
          revisions unless otherwise stated. We may require that you accept modified Terms in order
          to continue to use the Community. If you do not agree to the modified Terms, then you
          should remove your User Content and discontinue your use of the Community. If you continue
          to use the Community after the effective date of revised Terms, your continued use
          constitutes acceptance unless the Act or other applicable law requires explicit renewed
          consent for specific processing activities.
        </p>
      </TermsSection>

      <TermsSection id="s11" title="11. Term, Termination, and Modification of the Community">
        <SubSection title="11.1. Term">
          <p>
            These Terms are effective beginning when you accept the Terms or first download,
            install, access, or use the Community, and ending when terminated as described in Section
            11.2.
          </p>
        </SubSection>
        <SubSection title="11.2. Termination">
          <p>
            If you violate any provision of these Terms, then your authorization to access the
            Community and these Terms automatically terminate. In addition, Community Owner may, at
            its sole discretion, terminate these Terms or your account on the Community, or suspend
            or terminate your access to the Community, at any time for any reason or no reason, with
            or without notice, and without any liability to you arising from such termination. You
            may terminate your account at any time by contacting <PrivacyEmailLink /> or by using any account-deletion mechanism made available in the Community.
          </p>
        </SubSection>
        <SubSection title="11.3. Effect of Termination">
          <p>
            Upon termination of these Terms: (a) your license rights will terminate and you must
            immediately cease all use of the Community; (b) you will no longer be authorized to
            access your account or the Community; (c) you must pay Community Owner any unpaid amount
            that was due prior to termination; and (d) all payment obligations accrued prior to
            termination and Sections 3.3, 4, 11.3, 12, 13, 14, 15, and 16 will survive. You are
            solely responsible for retaining copies of any User Content you Post to the Community
            since upon termination of your account, you may lose access rights to any User Content
            you Posted to the Community. If your account has been terminated for a breach of these
            Terms, then you are prohibited from creating a new account on the Community using a
            different name, email address or other forms of account verification.
          </p>
        </SubSection>
        <SubSection title="11.4. Modification of the Community">
          <p>
            Community Owner reserves the right to modify or discontinue all or any portion of the
            Community at any time (including by limiting or discontinuing certain features of the
            Community), temporarily or permanently, without notice to you. Community Owner will
            have no liability for any change to the Community or any suspension or termination of
            your access to or use of the Community. You should retain copies of any User Content you
            Post to the Community so that you have permanent copies in the event the Community is
            modified in such a way that you lose access to User Content you Posted to the Community.
          </p>
        </SubSection>
      </TermsSection>

      <TermsSection id="s12" title="12. Indemnity">
        <p>
          To the fullest extent permitted by law, you are responsible for your use of the Community,
          and you will defend and indemnify Community Owner, its affiliates, and their respective
          shareholders, directors, managers, members, officers, employees, volunteers, consultants,
          and agents (together, the &quot;Specified Entities&quot;) from and against every claim
          brought by a third party, and any related liability, damage, loss, and expense, including
          attorneys&apos; fees and costs, arising out of or connected with: (1) your unauthorized
          use of, or misuse of, the Community; (2) your violation of any portion of these Terms,
          any representation, warranty, or agreement referenced in these Terms, or any applicable
          law or regulation; (3) your violation of any third-party right, including any intellectual
          property right or publicity, confidentiality, other property, or privacy right; or (4) any
          dispute or issue between you and any third party. We reserve the right, at our own expense,
          to assume the exclusive defense and control of any matter otherwise subject to
          indemnification by you (without limiting your indemnification obligations with respect to
          that matter), and in that case, you agree to cooperate with our defense of those claims.
        </p>
      </TermsSection>

      <TermsSection id="s13" title="13. Disclaimers; No Warranties by Community Owner">
        <SubSection title="13.1.">
          <p className="uppercase text-slate-800">
            The Community and all Materials and content available through the Community are provided
            &quot;as is&quot; and on an &quot;as available&quot; basis. Community Owner and
            Technology Providers disclaim all warranties of any kind, whether express or implied,
            relating to the Community and all Materials and content available through the Community,
            including: (a) any implied warranty of merchantability, fitness for a particular purpose,
            title, quiet enjoyment, or non-infringement; and (b) any warranty arising out of course
            of dealing, usage, or trade. Community Owner and Technology Providers do not warrant
            that the Community or any portion of the Community, or any Materials or content offered
            through the Community, will be uninterrupted, secure, or free of errors, viruses, or
            other harmful components, and Community Owner does not warrant that any of those issues
            will be corrected.
          </p>
        </SubSection>
        <SubSection title="13.2.">
          <p>
            No advice or information, whether oral or written, obtained by you from the Community,
            Specified Entities, or Technology Providers, or any Materials or content available through
            the Community will create any warranty regarding any of the Specified Entities or the
            Community that is not expressly stated in these Terms. Spiritual, educational, and
            counselling-related content is for encouragement and community support and does not
            replace professional medical, psychological, legal, or financial advice. We are not
            responsible for any damage that may result from the Community and your dealing with any
            other Community user. You understand and agree that you use any portion of the Community
            at your own discretion and risk, and that we are not responsible for any damage to your
            property (including your computer system or mobile device used in connection with the
            Community) or any loss of data, including User Content.
          </p>
        </SubSection>
        <SubSection title="13.3.">
          <p>
            The limitations, exclusions and disclaimers in this Section 13 apply to the fullest
            extent permitted by law. Community Owner does not disclaim any warranty or other right
            that Community Owner is prohibited from disclaiming under applicable law.
          </p>
        </SubSection>
      </TermsSection>

      <TermsSection id="s14" title="14. Limitation of Liability">
        <SubSection title="14.1.">
          <p className="uppercase text-slate-800">
            To the fullest extent permitted by law, in no event will the Specified Entities be
            liable to you for any indirect, incidental, special, consequential or punitive damages
            (including damages for loss of profits, goodwill, or any other intangible loss) arising
            out of or relating to your access to or use of, or your inability to access or use, the
            Community or any Materials or content on the Community, whether based on warranty,
            contract, tort (including negligence), statute, or any other legal theory, and whether
            or not any Specified Entity or Technology Provider has been informed of the possibility
            of damage.
          </p>
        </SubSection>
        <SubSection title="14.2.">
          <p>
            To the fullest extent permitted by law, the aggregate liability of the Specified Entities
            to you for all claims arising out of or relating to the use of or any inability to use
            any portion of the Community or otherwise under these Terms, whether in contract, tort,
            or otherwise, is limited to the greater of: (a) the amount you have paid to Community
            Owner for access to and use of the Community in the twelve (12) months prior to the
            event or circumstance giving rise to the claim; and (b) one hundred United States
            dollars (US$100) or the equivalent in the lawful currency of Zimbabwe at the time of
            the claim, if the Community is provided free of charge.
          </p>
        </SubSection>
        <SubSection title="14.3.">
          <p>
            Each provision of these Terms that provides for a limitation of liability, disclaimer of
            warranties, or exclusion of damages is intended to and does allocate the risks between
            the parties under these Terms. This allocation is an essential element of the basis of
            the bargain between the parties. Each of these provisions is severable and independent of
            all other provisions of these Terms. The limitations in this Section 14 will apply even
            if any limited remedy fails of its essential purpose.
          </p>
        </SubSection>
      </TermsSection>

      <TermsSection id="s15" title="15. Dispute Resolution">
        <SubSection title="15.1. Generally">
          <p>
            You and Community Owner agree to attempt in good faith to resolve any dispute arising
            out of or relating to these Terms or the Community through informal negotiation by
            contacting{' '}
            <a href={`mailto:${LEGAL.contactEmail}`} className="font-medium text-[#2563eb] hover:underline">
              {LEGAL.contactEmail}
            </a>{' '}
            before commencing formal proceedings. If the dispute is not resolved within thirty (30)
            days, either party may pursue remedies permitted under Section 16.3.
          </p>
        </SubSection>
        <SubSection title="15.2. No Class Actions">
          <p className="uppercase text-slate-800">
            You and Community Owner agree that each may bring claims against the other only in your
            or its individual capacity and not as a plaintiff or class member in any purported
            class or representative proceeding. To the fullest extent permitted by law, no arbitrator
            or court may consolidate more than one person&apos;s claims or preside over any form of
            a representative or class proceeding.
          </p>
        </SubSection>
        <SubSection title="15.3. Data Protection Complaints">
          <p>
            Nothing in this Section limits your right to lodge a complaint with{' '}
            {LEGAL.dataProtectionAuthority} regarding the processing of your personal information
            under the Act.
          </p>
        </SubSection>
      </TermsSection>

      <TermsSection id="s16" title="16. Miscellaneous">
        <SubSection title="16.1. Technology Providers">
          <p>
            The Community is powered by technology platforms and infrastructure provided by third
            parties such as cloud hosting, authentication, media delivery, and notification
            providers (&quot;Technology Providers&quot;). You acknowledge that Technology Providers
            process data on our instructions as data processors under the Act, under written or
            contractual arrangements requiring appropriate security measures.
          </p>
        </SubSection>
        <SubSection title="16.2. General Terms">
          <p>
            These Terms, including the Privacy Policy and any other agreements expressly
            incorporated by reference into these Terms, are the entire and exclusive understanding
            and agreement between you and Community Owner regarding your use of the Community. The
            failure to require performance of any provision will not affect our right to require
            performance at any time after that, nor will a waiver by us of any breach or default of
            these Terms, or any provision of these Terms, be a waiver of any subsequent breach or
            default or a waiver of the provision itself. Use of section headers in these Terms is for
            convenience only and will not have any impact on the interpretation of any provision.
            Throughout these Terms the use of the word &quot;including&quot; means &quot;including
            but not limited to.&quot; If any part of these Terms is held to be invalid or
            unenforceable, then the unenforceable part will be given effect to the greatest extent
            possible, and the remaining parts will remain in full force and effect.
          </p>
        </SubSection>
        <SubSection title="16.3. Governing Law">
          <p>
            These Terms are governed by the laws of the Republic of Zimbabwe, including the Cyber
            and Data Protection Act [Chapter 12:07] and Statutory Instrument 155 of 2024, without
            regard to conflict of law principles. You and Community Owner submit to the exclusive
            jurisdiction of the courts of Zimbabwe for resolution of any lawsuit or court proceeding
            permitted under these Terms, unless mandatory consumer or data-protection remedies
            require otherwise.
          </p>
        </SubSection>
        <SubSection title="16.4. Privacy Policy">
          <p>
            You understand and agree to the processing of your personal data in connection with the
            Community in accordance with Community Owner&apos;s{' '}
            <Link to="/privacy" className="font-medium text-[#2563eb] hover:underline">
              Privacy Policy
            </Link>
            , which is hereby incorporated by reference into these Terms. Community Owner is the
            data controller; for privacy and data-protection requests, contact{' '}
            <PrivacyEmailLink />
            {hasPotrazRegistration()
              ? `. Our POTRAZ registration reference is ${LEGAL.potrazRegistration}.`
              : '. We will publish our POTRAZ registration reference here if and when we obtain a licence required by law.'}
          </p>
        </SubSection>
        <SubSection title="16.5. Precedence">
          <p>
            In the event of a conflict between the Additional Terms in Exhibit A and these Terms,
            these Terms will control except where the Additional Terms expressly state otherwise for a
            specific feature or programme.
          </p>
        </SubSection>
        <SubSection title="16.6. Consent to Electronic Communications">
          <p>
            By using the Community, you consent to receiving certain electronic communications from
            us as further described in our Privacy Policy. You agree that any notices, agreements,
            disclosures, or other communications that we send to you electronically will satisfy any
            legal communication requirements, including that those communications be in writing,
            where permitted under Zimbabwean law.
          </p>
        </SubSection>
        <SubSection title="16.7. Contact">
          <p>
            Community Owner: {LEGAL.legalEntity}
            <br />
            {hasPhysicalAddress() ? (
              <>
                Address: {LEGAL.address}
                <br />
              </>
            ) : (
              <>
                Online-based ministry operating from {LEGAL.country}
                <br />
              </>
            )}
            Email:{' '}
            <a href={`mailto:${LEGAL.contactEmail}`} className="font-medium text-[#2563eb] hover:underline">
              {LEGAL.contactEmail}
            </a>
            <br />
            Website:{' '}
            <a href={LEGAL.website} className="font-medium text-[#2563eb] hover:underline">
              {LEGAL.website}
            </a>
          </p>
        </SubSection>
      </TermsSection>

      <TermsSection id="s17" title="17. Notice Regarding Mobile Applications">
        <p>
          This Section 17 only applies to the extent you are using our mobile application on a
          device distributed through an app store (such as Apple App Store or Google Play). You
          acknowledge that these Terms are between you and Community Owner only, not with the app
          store operator, and the app store operator is not responsible for the Community or the
          content of it. The app store operator has no obligation to furnish any maintenance and
          support services with respect to the Community. To the maximum extent permitted by
          applicable law, the app store operator has no warranty obligation with respect to the
          Community and is not responsible for addressing any claims by you or any third party
          relating to the Community or your possession and/or use of the Community. You agree to
          comply with any applicable third-party terms when using the Community.
        </p>
      </TermsSection>

      <TermsSection id="exhibit-a" title="Exhibit A: Additional Terms">
        <p>
          By registering for or continuing to use the {LEGAL.appName} Community, you confirm that you
          have read and agreed to:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link to="/terms" className="font-medium text-[#2563eb] hover:underline">
              Terms of Service
            </Link>
          </li>
          <li>
            <Link to="/privacy" className="font-medium text-[#2563eb] hover:underline">
              Privacy Policy
            </Link>
          </li>
        </ul>
        <p>
          Additional programme-specific terms (for example paid events, camps, or merchandise) may
          be presented at the point of purchase or registration for those programmes and will apply
          in addition to these Terms to the extent specified.
        </p>
      </TermsSection>
    </div>
  </LegalDocumentLayout>
);

export default TermsAndConditions;
