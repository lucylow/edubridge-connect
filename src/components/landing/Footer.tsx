import { BookOpen } from "lucide-react";

const Footer = () => (
  <footer className="container border-t border-border py-12 text-center">
    <div className="flex items-center justify-center gap-2 text-lg font-bold text-gradient mb-2">
      <BookOpen className="h-5 w-5 text-primary" />
      EduBridge
    </div>
    <p className="text-sm text-muted-foreground mb-4">Decentralized · Free · Community-led tutoring for K-12</p>
    <p className="text-xs text-muted-foreground/70">© 2025 EduBridge — Democratizing Education, One Connection at a Time.</p>
  </footer>
);

export default Footer;
