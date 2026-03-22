import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Quote } from "lucide-react";

const Testimonial = () => {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="container py-16" ref={ref}>
      <div className={`max-w-2xl mx-auto text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <Quote className="h-8 w-8 text-primary/40 mx-auto mb-4" />
        <blockquote className="text-lg md:text-xl italic text-foreground/80 mb-4 leading-relaxed">
          "EduBridge gave me the confidence to teach coding to middle schoolers who had never written a line of code. Seeing their progress is priceless."
        </blockquote>
        <p className="text-sm font-semibold text-muted-foreground">— Maria, Computer Science tutor</p>
      </div>
    </section>
  );
};

export default Testimonial;
