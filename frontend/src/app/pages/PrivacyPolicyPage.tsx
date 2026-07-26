import { Link } from 'react-router';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#F7F7FA] px-4 py-12 text-[#1A1A1A]">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="w-full max-w-4xl rounded-xl border bg-white p-8" style={{ borderColor: '#DEDEDE' }}>
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.2em]" style={{ color: '#2C2C6E' }}>
            Privacy Policy
          </p>
          <h1 className="mb-3" style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>
            PeerGuide Privacy Policy
          </h1>
          <p className="text-[13px] leading-6 text-[#5F5E5A]">
            This Privacy Policy explains how PeerGuide collects, uses, stores, and protects personal data. We are committed to
            handling personal information transparently, securely, and in line with applicable data protection principles.
          </p>
        </div>

        <div className="w-full max-w-4xl rounded-xl border bg-white p-8" style={{ borderColor: '#DEDEDE' }}>
          <section className="space-y-6">
            <div>
              <h2 className="mb-2 text-[15px] font-medium text-[#1A1A1A]">Data collected and purpose</h2>
              <p className="text-[13px] leading-6 text-[#5F5E5A]">
                PeerGuide collects the following categories of data: full name and email address for account identification; hashed
                passwords for authentication; role and profile information for matching and personalisation; for advisors,
                institutional history and optionally an identity document for verification. All data is collected for the specific
                purpose of providing the peer guidance service. Data collected for one purpose is not repurposed for another.
                This clause operationalises the purpose limitation principle required by RISA&apos;s (2025) guidelines and the East
                African regional data protection framework.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-[15px] font-medium text-[#1A1A1A]">Data storage and security</h2>
              <p className="text-[13px] leading-6 text-[#5F5E5A]">
                All user data is stored on Railway-hosted PostgreSQL infrastructure with encrypted connections. Passwords are hashed
                using bcrypt before storage. Identity documents are restricted to administrator access only. All client-server
                communication is encrypted via HTTPS. JWT tokens expire and are invalidated on logout. This clause documents the
                security measures implemented under the privacy by design obligation and provides users with the transparency required
                under GDPR Article 13 regarding information to be provided at the point of data collection.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-[15px] font-medium text-[#1A1A1A]">Third-party services</h2>
              <p className="text-[13px] leading-6 text-[#5F5E5A]">
                PeerGuide shares limited data with third-party services as follows: response body text (with no identifying
                information) is sent to the HuggingFace Inference API for sentiment classification; email addresses are processed by
                the Resend email delivery service for transactional communications. No user data is sold, shared with advertisers,
                or provided to data brokers. This clause ensures users understand which external processors handle their data,
                consistent with GDPR Article 28 requirements for processor transparency.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-[15px] font-medium text-[#1A1A1A]">User rights</h2>
              <p className="text-[13px] leading-6 text-[#5F5E5A]">
                Users have the right to access their personal data held by the platform, to correct inaccurate data, and to request
                deletion of their account and all associated personal data at any time through the profile settings page. Account
                deletion is permanent and irreversible. This clause operationalises the rights of access, rectification, and erasure
                established under GDPR (Articles 15, 16, 17) and the accountability principles of the EAC regional data protection
                framework.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-[15px] font-medium text-[#1A1A1A]">Automated decision-making</h2>
              <p className="text-[13px] leading-6 text-[#5F5E5A]">
                PeerGuide uses automated sentiment classification to label peer responses. This classification affects how responses
                are displayed and filtered but does not determine whether a response is published, hidden, or deleted — those
                decisions are made by human administrators. Users may flag automated classifications they believe are inaccurate, and
                admin review will be triggered. This clause is required under GDPR Article 22, which grants individuals rights in
                relation to automated decision-making, and is ethically necessary to ensure the ML classifier does not function as an
                unaccountable arbiter of content quality.
              </p>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-[12px] text-[#5F5E5A]" style={{ borderColor: '#DEDEDE' }}>
          <span>Last updated: July 2026</span>
          <Link to="/" className="font-medium hover:underline" style={{ color: '#2C2C6E' }}>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
