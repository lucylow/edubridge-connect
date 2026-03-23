import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Mock API call
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setName('');
      setEmail('');
      setMessage('');
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Have questions or feedback? We'd love to hear from you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border dark:border-gray-700 rounded-lg p-2 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border dark:border-gray-700 rounded-lg p-2 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full border dark:border-gray-700 rounded-lg p-2 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-primary text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-primary-dark transition"
        >
          {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      <div className="mt-12 pt-12 border-t dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Other Ways to Reach Us</h2>
        <div className="space-y-3">
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:support@edubridge.org" className="text-primary hover:underline">
              support@edubridge.org
            </a>
          </p>
          <p>
            <strong>Community Discord:</strong>{' '}
            <a href="#" className="text-primary hover:underline">
              Join our server
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
