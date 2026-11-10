import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  light?: boolean;
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionHref,
  light = false,
}: SectionTitleProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="avec-section-title">
        {eyebrow ? (
          <span
            className={`mb-1 block text-xs font-bold uppercase tracking-widest ${
              light ? "text-[#fcaf3d]" : "text-[#f7941d]"
            }`}
          >
            {eyebrow}
          </span>
        ) : null}
        <h2
          className={`heading-font text-2xl font-extrabold uppercase tracking-tight sm:text-3xl ${
            light ? "text-white" : "text-[#243e4f]"
          }`}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            className={`mt-1 max-w-2xl text-sm sm:text-base ${
              light ? "text-slate-300" : "text-[#5a6672]"
            }`}
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
            light
              ? "border-[#fcaf3d] text-[#fcaf3d] hover:bg-[#fcaf3d] hover:text-[#182b38]"
              : "border-[#243e4f]/20 text-[#243e4f] hover:border-[#f7941d] hover:bg-[#f7941d] hover:text-white"
          }`}
        >
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

