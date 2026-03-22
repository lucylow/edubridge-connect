import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Sparkles } from "lucide-react";

const subjects = ["Algebra I", "AP Biology", "English Essay", "Python Basics"];

const tutorData: Record<string, { name: string; score: string; detail: string }[]> = {
  "Algebra I": [
    { name: "Priya M.", score: "96%", detail: "Math major, 3 yrs tutoring" },
    { name: "James T.", score: "91%", detail: "Engineering student, 50+ sessions" },
  ],
  "AP Biology": [
    { name: "Lena K.", score: "94%", detail: "Pre-med, specializes in AP Bio" },
    { name: "Carlos R.", score: "88%", detail: "Biology TA, weekend availability" },
  ],
  "English Essay": [
    { name: "Aisha W.", score: "97%", detail: "English Lit major, published writer" },
    { name: "David L.", score: "90%", detail: "Journalism student, essay coaching" },
  ],
  "Python Basics": [
    { name: "Maria S.", score: "95%", detail: "CS sophomore, teaches beginners" },
    { name: "Kevin H.", score: "89%", detail: "Self-taught dev, patient mentor" },
  ],
};

const InteractiveDemo = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const { ref, visible } = useScrollReveal();

  return (
    <section id="demo" className="container py-20" ref={ref}>
      <h2 className={`text-3xl md:text-4xl font-bold text-center mb-3 transition-all duration-600 ${visible ? "opacity-100" : "opacity-0"}`}>
        <Sparkles className="inline h-7 w-7 text-primary mr-2 -mt-1" />
        See our matching engine in action
      </h2>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-10">
        Choose a subject and watch how EduBridge recommends the best-fit tutors.
      </p>

      <div className={`bg-accent rounded-[2.5rem] p-6 md:p-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: selector */}
          <div className="flex-1 bg-card rounded-3xl p-6">
            <h4 className="font-bold mb-1">🎓 I'm a learner, I need help with...</h4>
            <div className="flex flex-wrap gap-3 my-5">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelected(s)}
                  className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 ${
                    selected === s
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="bg-accent rounded-2xl p-5 min-h-[120px]">
              {!selected ? (
                <p className="text-sm text-muted-foreground">💡 Click a subject to see top tutor matches...</p>
              ) : (
                <div className="space-y-3">
                  {tutorData[selected].map((t) => (
                    <div key={t.name} className="bg-card border-l-4 border-primary rounded-2xl p-4 animate-fade-up">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm">{t.name}</span>
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{t.score} match</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">🔬 Based on relevance (60%), availability (30%), reputation (10%)</p>
          </div>

          {/* Right: explanation */}
          <div className="flex-1 bg-card rounded-3xl p-6">
            <h4 className="font-bold mb-3">🧠 Why it's special</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Our algorithm goes beyond simple keyword search: it ranks tutors using dynamic scoring. In the real platform, tutors update their available slots and get matched to learners that truly need their expertise.
            </p>
            <div className="bg-accent rounded-2xl p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-1">📐 Ranking formula:</p>
              <code className="text-xs text-foreground font-mono">
                Score = (Subject Match × 0.6) + (Availability × 0.3) + (Rating × 0.1)
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
