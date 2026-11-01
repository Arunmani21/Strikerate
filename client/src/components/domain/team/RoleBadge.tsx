import { Crown, Shield, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TeamRole } from "../../../types/enums";
import { TEAM_ROLE_LABELS } from "../../../lib/constants";
import { Chip, type ChipTone } from "../../ui/Chip";

const roleMeta: Record<TeamRole, { tone: ChipTone; icon: LucideIcon | null }> = {
  captain: { tone: "accent", icon: Crown },
  vice_captain: { tone: "info", icon: Shield },
  scorer: { tone: "gold", icon: Star },
  player: { tone: "dim", icon: null },
};

export function RoleBadge({ role }: { role: TeamRole }) {
  const { tone, icon: Icon } = roleMeta[role];
  return (
    <Chip tone={tone}>
      {Icon && <Icon className="size-3" />}
      {TEAM_ROLE_LABELS[role]}
    </Chip>
  );
}
