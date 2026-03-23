import { useState } from 'react';

const faqs = [
  {
    q: 'Is EduBridge really free?',
    a: 'Yes! EduBridge is completely free for both tutors and learners. We believe education should be accessible to all.',
  },
  {
    q: 'Who can be a tutor?',
    a: 'College students, high school upperclassmen, and anyone with expertise in a subject can volunteer as a tutor.',
  },
  {
    q: 'How do I find a tutor?',
    a: 'Simply sign up as a learner, search for your subject, and browse recommended tutors. Send a match request to start a session.',
  },
  {
    q: 'What subjects are available?',
    a: 'We cover a wide range: Math, Science, English, History, Programming, Test Prep, and more.',
  },
  {
    q: 'How does the scheduling work?',
    a: 'Tutors set their availability; you can request a time slot that works for both of you. Our smart scheduler helps find the best times.',
  },
  {
    q: 'Are sessions one-on-one or group?',
    a: 'Currently, all sessions are one-on-one to provide personalized attention.',
  },
  {
    q: 'How long are tutoring sessions?',
    a: 'Sessions typically last 30-60 minutes, but you can arrange longer sessions with your tutor.',
  },
  {
    q: 'What technology do I need?',
    a: 'You need a computer or tablet with a webcam, microphone, and stable internet connection.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full text-left p-4 font-semibold flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <span>{faq.q}</span>
              <span className="text-sm">{openIndex === idx ? '▲' : '▼'}</span>
            </button>
            {openIndex === idx && (
              <div className="p-4 pt-0 text-gray-600 dark:text-gray-300 border-t dark:border-gray-700">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
