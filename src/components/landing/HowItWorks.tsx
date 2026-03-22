import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
  { n: "1", title: "Sign up", desc: 'Choose "Learner" or "Tutor" and build your profile.' },
  { n: "2", title: "Smart match", desc: "AI suggests best-fit tutors/learners based on skills & schedule." },
  { n: "3", title: "Schedule", desc: "Request a session, confirm in one click. Auto calendar sync." },
  { n: "4", title: "Connect & learn", desc: "Video + whiteboard + AI lesson tools. Leave feedback after." },
];

const HowItWorks = () => {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="how" className="container py-20" ref={ref}>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Simple, seamless workflow</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className={`bg-card rounded-3xl p-7 text-center w-56 border border-border shadow-sm transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: visible ? `${i * 100}ms` : "0ms" }}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-extrabold text-xl flex items-center justify-center mx-auto mb-5">
              {s.n}
            </div>
            <h4 className="font-bold mb-2">{s.title}</h4>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
