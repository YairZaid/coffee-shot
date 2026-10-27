import { formatWhen } from "@/lib/format";
import { beanLabel } from "@/lib/beans";
import type { Bean, Shot } from "@/lib/api";

export function ShotRow({
  shot,
  bean,
  beans,
}: {
  shot: Shot;
  bean: Bean | undefined;
  beans: Bean[];
}) {
  return (
    <div className="flex min-h-16 items-center gap-3 border-t border-border px-4 py-3.5 first:border-t-0">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14.5px] font-semibold">
          {bean ? beanLabel(bean, beans) : "Unknown coffee"}
        </div>
        <div className="mt-0.5 text-xs text-text-muted">
          {formatWhen(shot.created_at)}
        </div>
      </div>
      <div className="text-right font-mono tabular-nums">
        <div className="text-[13.5px] font-semibold">
          {shot.dose.toFixed(1)} g &rarr; {shot.shot_yield.toFixed(1)} g
        </div>
        <div className="mt-0.5 text-xs text-text-muted">
          1:{shot.ratio.toFixed(1)} &middot; {shot.duration.toFixed(1)} s
        </div>
      </div>
      <div className="flex h-7 min-w-[46px] items-center justify-center rounded-full bg-soft font-mono text-[12.5px] font-medium">
        {shot.rating}/5
      </div>
    </div>
  );
}
