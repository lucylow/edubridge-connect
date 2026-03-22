import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Brain, Calendar, Video, FileText, Users, BarChart3 } from "lucide-react";

const features = [
  { icon: Brain, title: "AI-Powered Matching", desc: "Smart algorithm ranks tutors by subject relevance, availability, and reputation — no endless searching." },
  { icon: Calendar, title: "Integrated Scheduling", desc: "Set availability in 30-min blocks, request sessions without back-and-forth. Automatic timezone detection." },
  { icon: Video, title: "Secure Video + Chat", desc: "Built-in video rooms and real-time text chat, plus file sharing for worksheets & resources." },
  { icon: FileText, title: "AI Lesson Plan Generator", desc: "One click → custom micro-lesson plans, practice problems, and session summaries for each learner." },
  { icon: Users, title: "Community Driven", desc: "Local instances managed by teachers or non-profits, ensuring safe and trusted connections." },
  { icon: BarChart3, title: "Progress Analytics", desc: "Track session hours, grades improvement, and reputation — for tutors, learners, and mentors." },
];

const Features = () => {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="features" className="container py-20" ref={ref}>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Built for meaningful impact</h2>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
        Everything you need to learn, teach, and grow — for free.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div
            key={f.title}
            className={`bg-card rounded-3xl p-7 border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.08] transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: visible ? `${i * 80}ms` : "0ms" }}
          >
            <f.icon className="h-9 w-9 text-primary mb-5" />
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
