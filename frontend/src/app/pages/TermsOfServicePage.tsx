import { Link } from 'react-router';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#F7F7FA] px-4 py-12 text-[#1A1A1A]">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="w-full max-w-4xl rounded-xl border bg-white p-8" style={{ borderColor: '#DEDEDE' }}>
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.2em]" style={{ color: '#2C2C6E' }}>
            Terms of Service
          </p>
          <h1 className="mb-3" style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>
            PeerGuide Terms of Service
          </h1>
          <p className="text-[13px] leading-6 text-[#5F5E5A]">
            These Terms of Service govern access to and use of PeerGuide. By using the platform, users agree to comply with
            these terms and use the service responsibly.
          </p>
        </div>

        <div className="w-full max-w-4xl rounded-xl border bg-white p-8" style={{ borderColor: '#DEDEDE' }}>
          <section className="space-y-6">
            <div>
              <h2 className="mb-2 text-[15px] font-medium text-[#1A1A1A]">Acceptable use</h2>
              <p className="text-[13px] leading-6 text-[#5F5E5A]">
                Users may not post content that is false, defamatory, deliberately misleading, or intended to harm the reputation
                of individuals or institutions. Users who register as peer advisors warrant that their stated institutional
                attendance is accurate and that their responses reflect genuine experience. Violation of acceptable use may result
                in account suspension or content removal following admin review.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-[15px] font-medium text-[#1A1A1A]">Intellectual property</h2>
              <p className="text-[13px] leading-6 text-[#5F5E5A]">
                User-generated content (questions and responses) remains the intellectual property of the user who posted it. By
                posting on PeerGuide, users grant the platform a non-exclusive licence to display and store that content for the
                purpose of providing the guidance service. The platform does not claim ownership of user content and will remove
                content from public display upon account deletion.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-[15px] font-medium text-[#1A1A1A]">Limitation of liability</h2>
              <p className="text-[13px] leading-6 text-[#5F5E5A]">
                PeerGuide provides a peer-generated guidance service. The platform does not verify the accuracy of all peer
                responses beyond the advisor identity verification process and the community moderation system. Users are advised to
                treat peer responses as one source of information among several and to verify critical details with the institutions
                concerned. The platform operator is not liable for decisions made by users based on peer responses.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-[15px] font-medium text-[#1A1A1A]">Platform access and availability</h2>
              <p className="text-[13px] leading-6 text-[#5F5E5A]">
                PeerGuide is provided on a free-to-use basis during the current pilot phase. The platform operator reserves the
                right to modify, suspend, or discontinue any part of the service with reasonable notice. The operator does not
                guarantee uninterrupted availability but will endeavour to maintain service continuity and to communicate planned
                outages in advance.
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
