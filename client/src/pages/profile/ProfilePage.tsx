import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import {
  ChevronRight,
  Copy,
  Pencil,
  Settings2,
  UserRound,
} from "lucide-react";

import { authApi } from "../../api/auth.api";
import { qk } from "../../lib/queryKeys";
import { useAuthStore } from "../../stores/auth.store";
import { toast } from "../../stores/toast.store";
import { AppBar } from "../../components/ui/AppBar";
import { Card } from "../../components/ui/Card";
import { Chip } from "../../components/ui/Chip";
import { PageError } from "../../components/ui/PageError";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import {
  BATTING_STYLE_LABELS,
  BOWLING_STYLE_LABELS,
  PROFILE_ROLE_LABELS,
} from "../../lib/constants";
import { initials } from "../../lib/format";

function Row({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-elevated"
    >
      <Icon className="size-4 shrink-0 text-text-dim" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="size-4 text-text-faint" />
    </button>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const { data: user, isPending, isError, error, refetch } = useQuery({
    queryKey: qk.me,
    queryFn: authApi.me,
  });

  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);

  const copyId = useMutation({
    mutationFn: async () => {
      await navigator.clipboard.writeText(user!.id);
    },
    onSuccess: () => toast.success("User ID copied"),
    onError: () => toast.error("Couldn't copy ID"),
  });

  if (isPending) return <FullScreenSpinner />;
  if (isError || !user)
    return (
      <div className="mx-auto max-w-[480px]">
        <AppBar title="Profile" />
        <PageError error={error} onRetry={refetch} />
      </div>
    );

  const profile = user.profile;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <AppBar
        title="Profile"
        right={
          <Link
            to="/settings"
            aria-label="Settings"
            className="flex size-11 items-center justify-center rounded-full text-text-dim active:bg-elevated"
          >
            <Settings2 className="size-5" />
          </Link>
        }
      />

      <main className="flex-1 space-y-4 px-4 py-4 pb-28">
        <Card className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-xl font-bold text-accent">
            {initials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-display text-xl font-bold">{user.name}</h2>
              <Chip tone={user.emailVerified ? "accent" : "warn"}>
                {user.emailVerified ? "Verified" : "Unverified"}
              </Chip>
            </div>
            <p className="mt-0.5 truncate text-sm text-text-dim">{user.email}</p>
          </div>
        </Card>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-faint">
            Cricket profile
          </h3>
          {profile ? (
            <Card className="space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">Role</p>
                  <p className="mt-0.5 text-sm font-semibold">
                    {profile.role ? PROFILE_ROLE_LABELS[profile.role] : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">Experience</p>
                  <p className="mt-0.5 text-sm font-semibold tnum">
                    {profile.experienceYears != null ? `${profile.experienceYears} yrs` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">Batting</p>
                  <p className="mt-0.5 text-sm font-semibold">
                    {profile.battingStyle ? BATTING_STYLE_LABELS[profile.battingStyle] : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">Bowling</p>
                  <p className="mt-0.5 text-sm font-semibold">
                    {profile.bowlingStyle ? BOWLING_STYLE_LABELS[profile.bowlingStyle] : "—"}
                  </p>
                </div>
              </div>
              {profile.bio && (
                <div className="border-t border-line-soft pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">Bio</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-text-dim">{profile.bio}</p>
                </div>
              )}
            </Card>
          ) : (
            <Card className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-elevated text-text-faint">
                <UserRound className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">No cricket profile yet</p>
                <p className="text-xs text-text-dim">Add your role and styles</p>
              </div>
              <button
                onClick={() => navigate("/profile/edit")}
                className="flex h-9 items-center rounded-sm bg-accent px-3 text-sm font-semibold text-on-accent active:bg-accent-strong"
              >
                Add
              </button>
            </Card>
          )}
        </section>

        <Card className="space-y-0 p-0">
          <Row icon={Pencil} label="Edit profile" onClick={() => navigate("/profile/edit")} />
          <div className="border-t border-line-soft" />
          <Row
            icon={Copy}
            label="Copy user ID"
            onClick={() => copyId.mutate()}
          />
          <div className="border-t border-line-soft" />
          <Row icon={Settings2} label="Settings" onClick={() => navigate("/settings")} />
        </Card>
      </main>
    </div>
  );
}
