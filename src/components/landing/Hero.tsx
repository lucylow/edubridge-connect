import { Button } from "@/components/ui/button";
import { Clock, Star } from "lucide-react";

const Hero = () => (
  <section className="container py-12 md:py-20">
    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
      <div className="flex-[1.2] animate-fade-up">
        <h1 className="text-gradient text-4xl sm:text-5xl md:text-[3.2rem] font-extrabold leading-[1.15] mb-5">
          Democratizing education,<br className="hidden sm:block" /> one connection at a time.
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-xl">
          EduBridge connects student tutors with K-12 learners in underserved communities — free, skill-based, and community-driven.
        </p>
        <div className="flex flex-wrap gap-4 mb-10">
          <Button variant="hero" size="lg">Start your journey</Button>
          <Button variant="hero-secondary" size="lg">Watch demo →</Button>
        </div>
        <div className="flex gap-10">
          {[
            { n: "240+", label: "Active tutors" },
            { n: "1.2k+", label: "Sessions completed" },
            { n: "100%", label: "Free access" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl md:text-3xl font-extrabold text-primary">{s.n}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full max-w-md opacity-0 animate-fade-up [animation-delay:200ms]">
        <div className="bg-surface-warm rounded-[2.5rem] p-6 shadow-xl shadow-primary/5">
          <div className="bg-card rounded-3xl p-5 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-bold text-sm">Sarah, 11th grade tutor</div>
                <div className="text-xs text-muted-foreground">⭐ 4.9 rating</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3 italic">
              "I've helped 6 learners improve math grades. EduBridge makes matching effortless."
            </p>
            <div className="flex items-center gap-2 text-xs text-primary font-medium">
              <Clock className="h-3.5 w-3.5" />
              Next session: tomorrow 4:30 PM
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
