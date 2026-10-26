"use client";

import { useState } from "react";
import { QuickLogModal } from "@/components/QuickLogModal";
import type { Bean } from "@/lib/api";

export function QuickLogLauncher({
  beans,
  label,
  className,
}: {
  beans: Bean[];
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      {open ? <QuickLogModal beans={beans} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
