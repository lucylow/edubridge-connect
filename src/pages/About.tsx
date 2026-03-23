export default function About() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">About EduBridge</h1>
      <div className="prose dark:prose-invert max-w-none space-y-6">
        <p className="text-lg">
          EduBridge is a non-profit platform dedicated to democratizing education by connecting
          volunteer student tutors with K-12 learners from underserved communities. Our mission is
          to make quality academic support accessible to everyone, regardless of their economic
          background.
        </p>

        <h2 className="text-2xl font-bold mt-8">Our Story</h2>
        <p>
          Founded in 2024 by a group of passionate students and educators, EduBridge started as a
          small initiative to help local students struggling with math. Today, we've grown into a
          global community of thousands of tutors and learners, all working together to bridge the
          educational gap.
        </p>

        <h2 className="text-2xl font-bold mt-8">Our Values</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Accessibility:</strong> Free for all learners and tutors.
          </li>
          <li>
            <strong>Community:</strong> Building connections that last.
          </li>
          <li>
            <strong>Empowerment:</strong> Giving every student the tools to succeed.
          </li>
          <li>
            <strong>Quality:</strong> Providing effective, personalized learning experiences.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">Our Impact</h2>
        <div className="grid md:grid-cols-3 gap-6 my-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-primary">10,000+</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">Active Students</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-green-600">5,000+</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">Volunteer Tutors</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-purple-600">50,000+</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">Sessions Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
