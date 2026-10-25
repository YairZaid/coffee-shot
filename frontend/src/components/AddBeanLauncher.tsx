"use client";

import { useState } from "react";
import { AddBeanModal } from "@/components/AddBeanModal";

export function AddBeanLauncher({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      {open ? <AddBeanModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}
