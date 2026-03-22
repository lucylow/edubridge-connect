import { useScrollReveal } from "@/hooks/useScrollReveal";
import { AlertTriangle, Lightbulb } from "lucide-react";

const ProblemSolution = () => {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="problem" className="container py-20" ref={ref}>
      <div className={`flex flex-col md:flex-row gap-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <div className="flex-1 bg-card rounded-3xl p-8 shadow-lg shadow-foreground/[0.03] border border-border hover:-translate-y-1 transition-transform duration-300">
          <AlertTriangle className="h-9 w-9 text-amber-500 mb-5" />
          <h3 className="text-xl font-bold mb-3">The problem</h3>
          <p className="text-muted-foreground mb-5">
            Private tutoring costs $30–$80/hour, leaving millions of students without support. Rural areas lack specialized educators, and existing free resources are passive. Meanwhile, passionate college students lack a structured platform to mentor.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>📊 1 in 5 students lacks academic support</li>
            <li>📊 70% of volunteer efforts fail due to mismatched pairing</li>
          </ul>
        </div>

        <div className="flex-1 bg-card rounded-3xl p-8 shadow-lg shadow-foreground/[0.03] border border-border hover:-translate-y-1 transition-transform duration-300">
          <Lightbulb className="h-9 w-9 text-primary mb-5" />
          <h3 className="text-xl font-bold mb-3">Our solution</h3>
          <p className="text-muted-foreground mb-5">
            EduBridge provides a decentralized, zero-cost ecosystem: smart matching, integrated scheduling, and a safe communication hub. We empower communities to build their own tutoring networks, with AI tools to enhance sessions.
          </p>
          <p className="text-sm text-primary font-semibold">✅ Impact-driven &nbsp; ✅ Beginner friendly &nbsp; ✅ Fully free</p>
          <div className="mt-4 bg-secondary rounded-2xl px-4 py-3 text-center">
            <span className="text-2xl font-extrabold text-primary">$0</span>
            <span className="text-sm text-muted-foreground ml-2">for learners & tutors</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
