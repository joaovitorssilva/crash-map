import type { FC } from "react";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export const Section: FC<SectionProps> = ({ title, children }) => (
  <div className="border-b border-app-border">
    <div className="px-3 pt-[10px] pb-1.5 text-[9px] font-bold tracking-[0.15em] text-app-text-muted">
      {title}
    </div>
    {children}
  </div>
);
