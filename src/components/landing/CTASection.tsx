import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="container py-10" ref={ref}>
      <div className={`bg-cta text-cta-foreground rounded-[2.5rem] px-8 py-16 md:px-16 text-center transition-all duration-700 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"}`}>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to bridge the gap?</h2>
        <p className="text-cta-foreground/80 max-w-lg mx-auto mb-8">
          Join thousands of students making education accessible, one session at a time. It's 100% free.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="hero" size="lg">Become a tutor →</Button>
          <Button variant="hero-secondary" size="lg" className="border-white/20 text-cta-foreground hover:bg-white/10 hover:border-white/30">
            Find a tutor →
          </Button>
        </div>
        <p className="text-xs text-cta-foreground/50 mt-6">🔒 No credit card required, just your passion to learn or teach.</p>
      </div>
    </section>
  );
};

export default CTASection;
