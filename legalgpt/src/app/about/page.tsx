export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About LegalGPT
          </h1>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              LegalGPT is an AI-powered platform designed to make legal help affordable, fast, and accessible—built for people who hesitate to consult a lawyer due to high fees or lack of clarity.  
            </p>

            {/* What We Solve */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                What Problem We Solve
              </h2>
              <p>
                Most individuals avoid legal help because it feels expensive, slow, or intimidating. LegalGPT fixes this by offering instant, AI-driven support for:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Understanding legal notices</li>
                <li>Drafting replies to notices or emails</li>
                <li>Analysing contracts and agreements</li>
                <li>Getting actionable legal guidance—anytime</li>
              </ul>
            </div>

            {/* X-for-Y Positioning */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Our Approach: X for Y
              </h2>
              <p>
                LegalGPT is <strong>“Your personal AI lawyer for everyday legal problems.”</strong>  
                We focus on users who need clarity—not courtrooms.  
                Fast, simple, and opinionated towards action.
              </p>
            </div>

            {/* Why Choose LegalGPT */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Why Choose LegalGPT
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Cost-effective:</strong> Save money on overpriced legal consultations</li>
                <li><strong>Instant:</strong> Get replies, notice drafts, and document reviews in seconds</li>
                <li><strong>Accurate:</strong> AI trained to cite relevant laws, sections, and legal principles</li>
                <li><strong>Private:</strong> All uploads remain confidential and encrypted</li>
              </ul>
            </div>

            {/* How It Works */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                How It Works
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Upload your document or legal notice</li>
                <li>AI analyses it with relevant sections, acts, and legal reasoning</li>
                <li>Receive a clear summary + suggested reply/draft</li>
                <li>Optional: Connect with a human lawyer for final review</li>
              </ul>
            </div>

            {/* Monetization */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Monetisation & Retention
              </h2>
              <p>
                Users pay for premium actions such as in-depth contract reviews,
                notice drafting, or unlimited queries. Retention is boosted through
                stored documents, ongoing case threads, and personalised legal alerts.
              </p>
            </div>

            {/* Metric */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Our Core Metric
              </h2>
              <p>
                <strong>Time-to-Resolution (TTR):</strong> The time it takes for a user to get complete legal clarity on their issue.
              </p>
            </div>

            {/* Disclaimer */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6">
              <p className="text-sm text-gray-600">
                <strong>Disclaimer:</strong> LegalGPT provides AI-generated legal information and drafts. It does not replace licensed legal counsel for court-related or highly sensitive matters.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
