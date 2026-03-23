export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
      <div className="prose dark:prose-invert max-w-none space-y-6">
        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-2xl font-bold mt-8">1. Acceptance of Terms</h2>
        <p>
          By accessing and using EduBridge, you accept and agree to be bound by the terms and
          provision of this agreement. If you do not agree to these terms, please do not use our
          service.
        </p>

        <h2 className="text-2xl font-bold mt-8">2. Use License</h2>
        <p>
          Permission is granted to temporarily use EduBridge for personal, non-commercial tutoring
          and learning purposes. This is the grant of a license, not a transfer of title.
        </p>

        <h2 className="text-2xl font-bold mt-8">3. User Conduct</h2>
        <p>You agree to:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Provide accurate information during registration</li>
          <li>Maintain the confidentiality of your account</li>
          <li>Be respectful to all users</li>
          <li>Not engage in any form of harassment or discrimination</li>
          <li>Not misuse the platform for commercial purposes</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">4. Tutor Responsibilities</h2>
        <p>Tutors agree to:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Provide accurate information about their qualifications</li>
          <li>Conduct sessions professionally</li>
          <li>Show up on time for scheduled sessions</li>
          <li>Maintain student privacy and confidentiality</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">5. Learner Responsibilities</h2>
        <p>Learners agree to:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Show up on time for scheduled sessions</li>
          <li>Be respectful to tutors</li>
          <li>Provide honest feedback</li>
          <li>Not share inappropriate content</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">6. Termination</h2>
        <p>
          We reserve the right to terminate or suspend access to our service immediately, without
          prior notice, for conduct that we believe violates these Terms of Service or is harmful to
          other users, us, or third parties, or for any other reason.
        </p>

        <h2 className="text-2xl font-bold mt-8">7. Limitation of Liability</h2>
        <p>
          EduBridge and its affiliates will not be liable for any damages arising from the use or
          inability to use our service. We provide the platform "as is" without warranty of any
          kind.
        </p>

        <h2 className="text-2xl font-bold mt-8">8. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. We will notify users of any
          material changes via email or through the platform.
        </p>

        <h2 className="text-2xl font-bold mt-8">9. Contact</h2>
        <p>
          If you have any questions about these Terms, please contact us at{' '}
          <a href="mailto:legal@edubridge.org" className="text-primary hover:underline">
            legal@edubridge.org
          </a>
          .
        </p>
      </div>
    </div>
  );
}
