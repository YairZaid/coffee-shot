import type { Bean } from "@/lib/api";

export function beanLabel(bean: Bean, beans: Bean[]): string {
  const collides = beans.some((b) => b.id !== bean.id && b.name === bean.name);
  return collides ? `${bean.name} · ${bean.roaster}` : bean.name;
}
