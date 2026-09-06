"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { StatusBadge, type StatusBadgeKind } from "@/components/StatusBadge";

interface InfoHelpProps {
  title: string;
  description: string;
  /** Quem preenche esse dado: a Fernanda, o sistema (automático) ou é uma meta */
  filledBy?: StatusBadgeKind;
  example?: string;
  /** Tamanho do botão "?" — "sm" para uso dentro de textos/linhas compactas */
  size?: "sm" | "md";
  className?: string;
}

export function InfoHelp({
  title,
  description,
  filledBy,
  example,
  size = "sm",
  className,
}: InfoHelpProps) {
  const [open, setOpen] = useState(false);
  const dialogId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Saiba mais sobre: ${title}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full border border-ink/20 text-ink/60 transition-colors hover:border-sage hover:text-sage",
          size === "sm" ? "h-5 w-5 text-[11px]" : "h-6 w-6 text-xs",
          className
        )}
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          role="presentation"
        >
          <button
            aria-label="Fechar explicação"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
          <div
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
            className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-6 pb-8 shadow-cardHover sheet-in sm:rounded-3xl sm:pb-6"
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-mist sm:hidden" />
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3
                id={`${dialogId}-title`}
                className="text-lg font-semibold text-ink"
              >
                {title}
              </h3>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-ink/60 hover:text-ink"
              >
                ✕
              </button>
            </div>
            {filledBy && (
              <div className="mb-3">
                <StatusBadge kind={filledBy} />
              </div>
            )}
            <p className="text-[15px] leading-relaxed text-ink/80">
              {description}
            </p>
            {example && (
              <p className="mt-3 rounded-2xl bg-cream p-3 text-sm text-ink/70">
                <span className="font-medium text-ink">Exemplo: </span>
                {example}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
