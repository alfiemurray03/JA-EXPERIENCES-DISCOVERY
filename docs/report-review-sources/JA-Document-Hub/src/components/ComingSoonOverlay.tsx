/**
 * ComingSoonOverlay — wraps any page with a blurred "Coming Soon" banner.
 * Set `enabled={true}` to show the overlay; `false` to render children normally.
 */
import { Clock } from 'lucide-react';

interface Props {
  enabled?: boolean;
  title?: string;
  message?: string;
  children: React.ReactNode;
}

export default function ComingSoonOverlay({
  enabled = true,
  title = 'Coming Soon',
  message = 'This section is under development and will be available shortly.',
  children,
}: Props) {
  if (!enabled) return <>{children}</>;

  return (
    <div className="relative min-h-[60vh]">
      {/* Blurred background content */}
      <div className="pointer-events-none select-none blur-sm opacity-40 overflow-hidden max-h-[60vh]">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-background/95 border border-border rounded-2xl shadow-xl px-10 py-10 flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            In Development
          </span>
        </div>
      </div>
    </div>
  );
}
