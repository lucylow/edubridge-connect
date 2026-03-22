import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const Navbar = () => (
  <nav className="container flex items-center justify-between py-5 flex-wrap gap-5">
    <a href="#" className="flex items-center gap-2 text-2xl font-extrabold text-gradient tracking-tight">
      <BookOpen className="h-7 w-7 text-primary" />
      EduBridge
    </a>
    <div className="flex items-center gap-8">
      <a href="#problem" className="hidden sm:inline text-muted-foreground font-medium hover:text-primary transition-colors">Problem</a>
      <a href="#features" className="hidden sm:inline text-muted-foreground font-medium hover:text-primary transition-colors">Features</a>
      <a href="#demo" className="hidden md:inline text-muted-foreground font-medium hover:text-primary transition-colors">Demo</a>
      <a href="#how" className="hidden md:inline text-muted-foreground font-medium hover:text-primary transition-colors">How it works</a>
      <Button variant="outline-primary" size="sm">Join waitlist</Button>
    </div>
  </nav>
);

export default Navbar;
