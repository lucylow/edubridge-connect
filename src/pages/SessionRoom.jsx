import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserSessions } from '../services/api';
import VideoCall from '../components/VideoCall';
import ChatWindow from '../components/ChatWindow';

export default function SessionRoom() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [lessonPlan, setLessonPlan] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      if (!user?.id) return;
      try {
        const sessions = await getUserSessions(user.id);
        const found = sessions.find(s => s.id === sessionId);
        setSession(found);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId, user?.id]);

  const generateLessonPlan = async () => {
    setGeneratingPlan(true);
    // Mock AI call – replace with actual OpenAI API
    setTimeout(() => {
      setLessonPlan(`Lesson Plan: ${session?.subject || 'General Session'}

1. Introduction and Goal Setting (5 min)
   - Review student's current understanding
   - Set specific learning objectives for today

2. Core Concepts (15 min)
   - Explain key principles with examples
   - Interactive problem-solving
   - Address questions and misconceptions

3. Practice and Application (15 min)
   - Guided practice problems
   - Student works through examples
   - Provide real-time feedback

4. Review and Next Steps (5 min)
   - Summarize key takeaways
   - Assign practice problems
   - Schedule follow-up if needed`);
      setGeneratingPlan(false);
    }, 1500);
  };

  if (loading) return <div className="text-center py-10">Loading session...</div>;
  if (!session) return (
    <div className="text-center py-10">
      <p className="text-red-600">Session not found</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Session Room</h1>
        <p className="text-gray-600">{session.subject || 'General Session'} - {new Date(session.scheduledStart).toLocaleString()}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <VideoCall sessionId={sessionId} />

          <div className="mt-4 border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-3">AI Lesson Plan Generator</h3>
            <button
              onClick={generateLessonPlan}
              disabled={generatingPlan}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition disabled:opacity-50"
            >
              {generatingPlan ? 'Generating...' : '🤖 Generate AI Lesson Plan'}
            </button>

            {lessonPlan && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">AI-Generated Lesson Plan</h4>
                <pre className="text-sm whitespace-pre-wrap text-gray-700">{lessonPlan}</pre>
              </div>
            )}
          </div>

          <div className="mt-4 border rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-900 mb-2">Session Controls</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm">
                📋 Share Screen
              </button>
              <button className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm">
                ✏️ Whiteboard
              </button>
              <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                End Session
              </button>
            </div>
          </div>
        </div>

        <div>
          <ChatWindow sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}
