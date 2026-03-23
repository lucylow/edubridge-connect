export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose dark:prose-invert max-w-none space-y-6">
        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-2xl font-bold mt-8">1. Information We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Name, email address, and profile information</li>
          <li>Educational background and subjects of expertise</li>
          <li>Session history and feedback</li>
          <li>Communications with other users and our support team</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Provide, maintain, and improve our services</li>
          <li>Match tutors with learners based on subjects and availability</li>
          <li>Send you technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Monitor and analyze trends and usage</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">3. Information Sharing</h2>
        <p>
          We do not sell your personal information. We may share your information only in the
          following circumstances:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>With other users to facilitate tutoring sessions</li>
          <li>With service providers who assist in operating our platform</li>
          <li>To comply with legal obligations</li>
          <li>To protect the rights and safety of our users</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal
          information against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2 className="text-2xl font-bold mt-8">5. Session Recording</h2>
        <p>
          Sessions may be recorded for quality assurance and safety purposes. Both parties will be
          notified before any recording begins. Recordings are stored securely and are only
          accessible to authorized personnel.
        </p>

        <h2 className="text-2xl font-bold mt-8">6. Children's Privacy</h2>
        <p>
          Our service is designed for K-12 learners. We take special care to protect the privacy of
          minors. Parents or guardians must provide consent for users under 13 years of age.
        </p>

        <h2 className="text-2xl font-bold mt-8">7. Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Access and update your personal information</li>
          <li>Delete your account and associated data</li>
          <li>Opt-out of marketing communications</li>
          <li>Request a copy of your data</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">8. Cookies and Tracking</h2>
        <p>
          We use cookies and similar tracking technologies to improve your experience. You can
          control cookies through your browser settings.
        </p>

        <h2 className="text-2xl font-bold mt-8">9. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any significant
          changes by email or through a prominent notice on our platform.
        </p>

        <h2 className="text-2xl font-bold mt-8">10. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:privacy@edubridge.org" className="text-primary hover:underline">
            privacy@edubridge.org
          </a>
          .
        </p>
      </div>
    </div>
  );
}
