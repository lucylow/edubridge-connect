import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Hero section with call to action */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-secondary">Democratizing education, one connection at a time.</h1>
        <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">EduBridge connects student tutors with K-12 learners for free.</p>
        <div className="mt-8 space-x-4">
          <Link to="/register" className="bg-primary text-white px-6 py-3 rounded-full inline-block hover:bg-primary-dark transition">Join as Tutor</Link>
          <Link to="/register" className="border border-primary text-primary px-6 py-3 rounded-full inline-block hover:bg-primary hover:text-white transition">Join as Learner</Link>
        </div>
      </section>

      {/* Problem / Solution Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">The Problem</h2>
            <p className="text-gray-600 text-lg">Many K-12 students lack access to affordable, quality tutoring. At the same time, talented student tutors have limited opportunities to gain experience and give back to their communities.</p>
          </div>
          <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Solution</h2>
            <p className="text-gray-600 text-lg">EduBridge is a free platform that matches student tutors with K-12 learners using smart algorithms, providing tools for scheduling, video calls, and AI-powered lesson planning.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <h2 className="text-4xl font-bold text-center mb-12 text-secondary">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Smart Matching</h3>
            <p className="text-gray-600">AI-powered algorithm matches learners with the best tutors based on subject, grade level, and availability.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">📹</div>
            <h3 className="text-xl font-bold mb-2">Video Sessions</h3>
            <p className="text-gray-600">Integrated video calling for seamless online tutoring sessions.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">AI Lesson Plans</h3>
            <p className="text-gray-600">Generate customized lesson plans instantly using advanced AI technology.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-xl text-gray-600 mb-8">Join thousands of students already learning and teaching on EduBridge.</p>
        <Link to="/register" className="bg-primary text-white px-8 py-4 rounded-full text-lg inline-block hover:bg-primary-dark transition">Sign Up Now</Link>
      </section>
    </div>
  );
}
