import { Route, Routes } from "react-router";
import { RequireAuth, PublicOnly } from "./guards";
import { AppShell } from "../layouts/AppShell";

import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { VerifyEmailPage } from "../pages/auth/VerifyEmailPage";
import { GoogleCallbackPage } from "../pages/auth/GoogleCallbackPage";

import { HomePage } from "../pages/home/HomePage";
import { MatchesPage } from "../pages/matches/MatchesPage";
import { MatchDetailPage } from "../pages/matches/MatchDetailPage";
import { TossPage } from "../pages/matches/TossPage";
import { Playing11Page } from "../pages/matches/Playing11Page";
import { InningsSetupPage } from "../pages/matches/InningsSetupPage";
import { MatchRequestCreatePage } from "../pages/matches/MatchRequestCreatePage";
import { MatchRequestsPage } from "../pages/matches/MatchRequestsPage";
import { TeamAvailabilityPage } from "../pages/teams/TeamAvailabilityPage";
import { TeamsPage } from "../pages/teams/TeamsPage";
import { TeamCreatePage } from "../pages/teams/TeamCreatePage";
import { TeamDetailPage } from "../pages/teams/TeamDetailPage";
import { TeamEditPage } from "../pages/teams/TeamEditPage";
import { TeamHistoryPage } from "../pages/teams/TeamHistoryPage";
import { SuperOverPage } from "../pages/matches/SuperOverPage";
import { ScoreCenterPage } from "../pages/scoring/ScoreCenterPage";
import { ScoringConsolePage } from "../pages/scoring/ScoringConsolePage";
import { LiveMatchPage } from "../pages/scoring/LiveMatchPage";
import { ScorecardPage } from "../pages/scoring/ScorecardPage";
import { OverSummaryPage } from "../pages/scoring/OverSummaryPage";
import { ScorerTransferPage } from "../pages/scoring/ScorerTransferPage";
import { SuperOverScoringPage } from "../pages/scoring/SuperOverScoringPage";
import { PlayerCareerPage } from "../pages/players/PlayerCareerPage";
import { PlayerMatchesPage } from "../pages/players/PlayerMatchesPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { ProfileEditPage } from "../pages/profile/ProfileEditPage";
import { SettingsPage } from "../pages/profile/SettingsPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      {/* Handles the OAuth redirect itself — outside both guards so the
          auth-store update mid-flight can't race PublicOnly's redirect */}
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/new" element={<TeamCreatePage />} />
          <Route path="/teams/:id" element={<TeamDetailPage />} />
          <Route path="/teams/:id/edit" element={<TeamEditPage />} />
          <Route path="/score" element={<ScoreCenterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/matches/:id" element={<MatchDetailPage />} />
        <Route path="/matches/:id/live" element={<LiveMatchPage />} />
        <Route path="/matches/:id/score" element={<ScoringConsolePage />} />
        <Route path="/matches/:id/scorecard" element={<ScorecardPage />} />
        <Route
          path="/matches/:id/over-summary/:inningsId"
          element={<OverSummaryPage />}
        />
        <Route path="/matches/:id/scorer-transfer" element={<ScorerTransferPage />} />
        <Route path="/matches/:id/toss" element={<TossPage />} />
        <Route path="/matches/:id/playing11/:teamId" element={<Playing11Page />} />
        <Route path="/matches/:id/innings-setup" element={<InningsSetupPage />} />
        <Route path="/matches/:id/super-over" element={<SuperOverPage />} />
        <Route
          path="/matches/:id/super-over/:superOverId/score"
          element={<SuperOverScoringPage />}
        />
        <Route path="/players/:playerId" element={<PlayerCareerPage />} />
        <Route path="/players/:playerId/matches" element={<PlayerMatchesPage />} />
        <Route path="/teams/:id/history" element={<TeamHistoryPage />} />
        <Route path="/match-requests" element={<MatchRequestsPage />} />
        <Route path="/teams/:id/request" element={<MatchRequestCreatePage />} />
        <Route path="/teams/:id/availability" element={<TeamAvailabilityPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
