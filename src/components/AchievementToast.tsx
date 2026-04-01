import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Trophy, Star, Award, Brain, Zap, Crown, Layers, Flame, TrendingUp, GraduationCap } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  trophy: Trophy, star: Star, award: Award, brain: Brain, zap: Zap,
  crown: Crown, layers: Layers, flame: Flame, "trending-up": TrendingUp,
  "graduation-cap": GraduationCap,
};

export function fireConfetti() {
  const end = Date.now() + 600;
  const colors = ["hsl(var(--primary))", "#FFD700", "#FF6B6B", "#4ECDC4"];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function showAchievementToast(title: string, description: string, icon: string, xpReward: number) {
  fireConfetti();

  const Icon = iconMap[icon] || Trophy;

  toast.custom(
    (id) => (
      <div className="bg-card border-2 border-primary/30 rounded-2xl p-4 shadow-xl max-w-sm w-full animate-scale-in">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-0.5">
              🎉 Achievement Unlocked!
            </p>
            <p className="font-bold text-sm text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            <p className="text-xs font-semibold text-primary mt-1">+{xpReward} XP</p>
          </div>
        </div>
      </div>
    ),
    { duration: 5000, position: "top-center" }
  );
}
