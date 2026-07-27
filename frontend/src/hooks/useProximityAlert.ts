import { useEffect, useRef } from "react";
import { MemberData } from "@/types";
import { haversineKm } from "@/utils/distance";
import { showToast } from "./useToast";

const THRESHOLDS = [
  { max: 0.05, label: "less than 50m" },
  { max: 0.1, label: "less than 100m" },
  { max: 0.2, label: "about 200m" },
  { max: 0.5, label: "about 500m" },
  { max: 1, label: "about 1km" },
];

const COOLDOWN_MS = 30_000;

function formatDistanceMsg(distanceKm: number): string {
  const threshold = THRESHOLDS.find((t) => distanceKm <= t.max);
  if (threshold) return threshold.label;
  return `${distanceKm.toFixed(1)}km`;
}

export function useProximityAlert(members: MemberData[], myId: string | null) {
  const cooldowns = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!myId) return;
    const me = members.find((m) => m.id === myId);
    if (!me?.location) return;

    const now = Date.now();

    for (const other of members) {
      if (other.id === myId || !other.location) continue;

      const distKm = haversineKm(
        me.location.lat,
        me.location.lng,
        other.location.lat,
        other.location.lng,
      );

      if (distKm > 1) continue;

      const cooldownKey = `${myId}-${other.id}`;
      const lastNotified = cooldowns.current.get(cooldownKey);
      if (lastNotified && now - lastNotified < COOLDOWN_MS) continue;

      cooldowns.current.set(cooldownKey, now);
      showToast(
        `${other.display_name} is ${formatDistanceMsg(distKm)} away`,
        distKm < 0.1 ? "warning" : "info",
      );
    }
  }, [members, myId]);
}
