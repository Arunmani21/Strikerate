# Strikerate — Architecture Audit Report
Generated: 2026-10-12  |  Auditor: Antigravity (read-only scan)

---

## 1. REPO MAP

### 1.1 Folder tree (3 levels)
```
strikerate/
├── .env                        # Root env (not used by app directly)
├── .gitignore
├── docker-compose.yml          # Postgres + API + web
├── client/
│   ├── android/                # Capacitor-generated Android project
│   ├── assets/                 # Capacitor icon assets
│   ├── brand/                  # Brand images
│   ├── public/
│   ├── scripts/                # generate-icons.mjs
│   ├── src/
│   │   ├── api/                # Per-domain axios wrappers
│   │   ├── components/
│   │   │   ├── domain/scoring/ # BallToken, BatsmenStrip, WicketDialog …
│   │   │   └── ui/             # AppBar, Button, BottomTabBar …
│   │   ├── hooks/              # useCanScore, useMatchSocket
│   │   ├── layouts/            # AppShell, Screen
│   │   ├── lib/                # api.ts, socket.ts, scoring.ts, queryKeys.ts …
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, VerifyEmail, GoogleCallback
│   │   │   ├── home/
│   │   │   ├── matches/        # MatchDetail, Toss, Playing11, InningsSetup, SuperOver …
│   │   │   ├── players/        # PlayerCareer, PlayerMatches
│   │   │   ├── profile/        # Profile, ProfileEdit, Settings
│   │   │   ├── scoring/        # LiveMatch, ScoringConsole, Scorecard, OverSummary …
│   │   │   └── teams/          # Teams, TeamCreate, TeamDetail, TeamEdit, TeamHistory …
│   │   ├── routes/             # routes.tsx, guards.tsx
│   │   ├── stores/             # auth.store.ts, toast.store.ts
│   │   └── types/
│   ├── capacitor.config.ts
│   ├── vite.config.ts
│   ├── .env                    # VITE_API_URL=http://localhost:3000
│   └── .env.android            # VITE_API_URL=http://192.168.1.4:3000
└── server/
    ├── src/
    │   ├── app.module.ts
    │   ├── main.ts
    │   ├── common/
    │   │   ├── controllers/    # health.controller.ts
    │   │   ├── decorators/     # public.decorator.ts
    │   │   ├── filters/        # http-exception.filter.ts
    │   │   └── interceptors/   # response.interceptor.ts
    │   ├── config/             # app.config.ts, database.config.ts, swagger.config.ts
    │   ├── gateway/            # cricket.gateway.ts, gateway.module.ts
    │   └── modules/
    │       ├── auth/           # JWT, OTP, Google OAuth
    │       ├── availability/
    │       ├── innings/
    │       ├── match/          # match, match-request, toss, super-over, match-status
    │       ├── player/         # player, guest-player, availability
    │       ├── playing11/
    │       ├── scoring/        # ball, scoring, scorer-permission, scorer-transfer, retire-hurt
    │       ├── stats/          # player-career-stats, player-match-performance, team-match-history
    │       ├── team/
    │       └── user/
    ├── Dockerfile
    └── docker-compose.yml      # Standalone server + postgres
```

### 1.2 package.json — scripts & key versions

**client** (`client/package.json`)

| Script | Command |
|--------|---------|
| dev | vite |
| build | tsc --noEmit && vite build |
| android:build | tsc && vite build --mode android && cap sync android |
| android:apk | cd android && gradlew.bat assembleDebug |
| icons | node scripts/generate-icons.mjs && cap sync android |

| Dependency | Version |
|-----------|---------|
| react | ^19.1.1 |
| react-router | ^7.9.0 |
| @tanstack/react-query | ^5.90.0 |
| socket.io-client | ^4.8.1 |
| zustand | ^5.0.8 |
| axios | ^1.12.0 |
| @capacitor/core | ^8.5.2 |
| @capacitor/android | ^8.5.2 |
| tailwindcss | ^4.1.13 (dev) |
| vite | ^7.1.0 (dev) |

**server** (`server/package.json`)

| Script | Command |
|--------|---------|
| start:dev | nest start --watch |
| start:prod | node dist/main |
| build | nest build |
| test | jest |

| Dependency | Version |
|-----------|---------|
| @nestjs/common | ^10.0.0 |
| typeorm | ^0.3.17 |
| @nestjs/typeorm | ^10.0.0 |
| socket.io | ^4.7.0 |
| @nestjs/jwt | ^10.1.0 |
| passport-jwt | ^4.0.1 |
| @nestjs/throttler | ^6.7.1 |
| helmet | ^8.3.0 |
| bcrypt | ^5.1.0 |
| google-auth-library | ^11.1.0 |

### 1.3 Docker / docker-compose files
- `strikerate/docker-compose.yml` — three services: `postgres` (16-alpine), `api` (port 3001→3000), `web` (nginx port 8080). Hardcoded default DB password visible in compose file. `GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL` are optional; left empty disables OAuth.
- `server/docker-compose.yml` — standalone server-only compose.
- `client/Dockerfile` — multi-stage nginx build. `VITE_API_URL` passed as build arg.
- `server/Dockerfile` — node:20-alpine two-stage build.

### 1.4 Capacitor config (`client/capacitor.config.ts` lines 1–15)
```ts
const config: CapacitorConfig = {
  appId: 'com.strikerate.app',
  appName: 'Strikerate',
  webDir: 'dist',
  android: {
    allowMixedContent: true,  // ⚠️ allows HTTP on HTTPS webview — dev-only flag
  },
};
```
**Installed Capacitor plugins:** `@capacitor/core`, `@capacitor/android` only.  
No `@capacitor/google-auth`, `@capacitor/storage`, `@capacitor/status-bar`, or `@capacitor/keyboard` installed.

**Android folder status:** Present (`client/android/`); generated by Capacitor CLI. AndroidManifest.xml not viewed (binary project), but `allowMixedContent: true` in config maps to `android:usesCleartextTraffic="true"` in the manifest.

---

## 2. BACKEND

### 2a. Modules, Controllers, Endpoints, Guards

**AuthModule** (`server/src/modules/auth/`)
| Method | Path | Guard | Notes |
|--------|------|-------|-------|
| POST | /auth/register | Public + Throttle(5/60s) | Creates user + OTP |
| POST | /auth/login | Public + Throttle(5/60s) | JWT response |
| GET | /auth/google | Public + Throttle(10/60s) | Redirect to Google |
| GET | /auth/google/callback | Public + Throttle(10/60s) | Token in fragment |
| POST | /auth/google/mobile | Public + Throttle(10/60s) | idToken verification |
| GET | /auth/me | JwtAuthGuard | Fetch own profile |
| POST | /auth/verify-email | Public + Throttle(10/60s) | OTP verification |
| POST | /auth/resend-otp | Public + Throttle(3/60s) | Resend OTP |

Also: `OtpController` for OTP management.

**MatchModule** (`server/src/modules/match/`)
| Method | Path | Guard |
|--------|------|-------|
| GET | /matches/live | JwtAuthGuard |
| GET | /matches/:id | JwtAuthGuard |
| POST | /matches/:id/toss | JwtAuthGuard |
| PATCH | /matches/:id/status | JwtAuthGuard |
| GET | /teams/:teamId/matches | JwtAuthGuard |
| POST | /matches (via match-request accept) | JwtAuthGuard |
| GET/POST | /teams/:id/match-requests | JwtAuthGuard |
| POST | /matches/:id/super-over | JwtAuthGuard |

**InningsModule** (`server/src/modules/innings/`)
| Method | Path | Guard |
|--------|------|-------|
| POST | /innings/match/:matchId/start | JwtAuthGuard |
| PATCH | /innings/:id/set-batsmen | JwtAuthGuard |
| PATCH | /innings/:id/set-bowler | JwtAuthGuard |
| GET | /innings/:id | JwtAuthGuard |
| GET | /innings/match/:matchId | JwtAuthGuard |

**ScoringModule** (`server/src/modules/scoring/`)
| Method | Path | Guard |
|--------|------|-------|
| POST | /scoring/ball | JwtAuthGuard |
| GET | /scoring/scorecard/:matchId | JwtAuthGuard |
| GET | /scoring/over-summary/:inningsId | JwtAuthGuard |
| POST | /scoring/retire-hurt/:inningsId | JwtAuthGuard |
| POST/GET/PATCH | /scoring/scorer-transfer/* | JwtAuthGuard |

**PlayerModule, TeamModule, StatsModule, UserModule, AvailabilityModule, Playing11Module** — standard CRUD behind JwtAuthGuard.

**GatewayModule** (`server/src/gateway/`) — WebSocket gateway, no HTTP endpoints.

**HealthController** (`server/src/common/controllers/`) — `GET /health` (public).

### 2b. TypeORM Entities

**Ball** (`server/src/modules/scoring/ball.entity.ts` — full):
```
@Entity('balls')
@Index(['inningsId']), @Index(['matchId']), @Index(['batsmanId']), @Index(['bowlerId'])
Fields: id(uuid), overNumber(int), ballNumber(int), runs(int,default 0),
  extraRuns(int,default 0), isWide(bool), isNoBall(bool), isBye(bool),
  isLegBye(bool), isWicket(bool), wicketType(enum DismissalType|null),
  inningsId(FK→innings), matchId(FK→matches), batsmanId, bowlerId,
  dismissedPlayerId(null), commentary(null), createdAt(timestamp)
DismissalType enum: bowled, caught, lbw, runout, stumped,
  caught_and_bowled, hit_wicket, retired_hurt
```
No `isFreeHit` column, no `isNoBallWicket` column, no idempotency key.

**Innings** (`server/src/modules/innings/innings.entity.ts` — full):
```
@Entity('innings')
@Index(['matchId']), @Index(['battingTeamId']), @Index(['bowlingTeamId'])
Fields: id(uuid), inningsNumber(int), totalRuns(int,0), totalWickets(int,0),
  totalBalls(int,0), currentOver(int,0), isCompleted(bool,false),
  matchId(FK→matches), battingTeamId, bowlingTeamId,
  strikerId(nullable), nonStrikerId(nullable), currentBowlerId(nullable)
Relations: OneToMany→balls
```
No `previousBowlerId` column (consecutive-over checks are impossible server-side).

**Match** (`server/src/modules/match/match.entity.ts` — full):
```
@Entity('matches')
@Index(['status']), @Index(['teamAId']), @Index(['teamBId']), @Index(['matchRequestId'])
Fields: id(uuid), totalOvers(int), venue(null), matchDate(date),
  matchTime(time), tossWinnerId(null), tossChoice(enum TossDecision|null),
  status(enum MatchStatus, default 'scheduled'), currentInnings(int,1),
  target(int,0), result(null), winningTeamId(null), marginOfVictory(null),
  marginType(null), statusChangedAt(null), statusChangedBy(null),
  abandonmentReason(null), abandonmentDetails(null), weatherConditions(null),
  oversBowled(null), totalOversBowled(null), teamAId, teamBId, createdBy,
  matchRequestId(null), createdAt(timestamp)
Relations: OneToMany→innings, balls, playing11, performances, teamHistory, superOvers
MatchStatus enum: scheduled, postponed, cancelled, toss_done, live,
  innings_break, rain_delayed, bad_light_delayed, umpire_decision_pending,
  completed, tied, draw, abandoned, no_result
```

**Player** (`server/src/modules/player/player.entity.ts` — full):
```
@Entity('players')
@Unique(['name','teamId'])
@Index(['teamId']), @Index(['userId'])
Fields: id(uuid), name, jerseyNumber(null), userId(null),
  battingRuns(int,0), battingBalls(int,0), battingFours(int,0),
  battingSixes(int,0), battingStrikeRate(decimal 5,2 default 0),
  bowlingBalls(int,0), bowlingRuns(int,0), bowlingWickets(int,0),
  bowlingEconomy(decimal 5,2 default 0), bowlingOvers(decimal 5,2 default 0),
  isOut(bool,false), teamId(FK→teams)
Relations: OneToMany→availabilities, playing11, matchPerformances, careerStats
```
**⚠️ CRITICAL:** Stats columns (battingRuns, isOut, etc.) are lifetime aggregates on the Player row. They are **never reset** between matches. `isOut` accumulates across matches (always true after first dismissal).

**Playing11** (`server/src/modules/playing11/playing11.entity.ts` — full):
```
@Entity('playing11')
@Index(['matchId']), @Index(['teamId']), @Index(['playerId'])
Fields: id(uuid), matchId(FK→matches), teamId(FK→teams),
  playerId(null, FK→players), isGuest(bool,false),
  guestPlayerId(null, FK→guest_players), selectedBy, createdAt
No unique constraint on (matchId,teamId,playerId) — ⚠️ duplicate entries possible
```

**Other entities:**  `ScorerPermission`, `SuperOver`, `MatchRequest`, `TeamAvailability`, `GuestPlayer`, `PlayerAvailability`, `PlayerMatchPerformance`, `PlayerCareerStats`, `TeamMatchHistory`, `User`, `UserProfile`, `OTP`, `TeamMember`.

### 2c. Player Row Lifecycle

**Creation** (`server/src/modules/player/player.service.ts`, line 62–69):
```ts
const player = playerRepository.create({
  teamId,
  name: dto.name.trim(),
  jerseyNumber: dto.jerseyNumber,
  userId: dto.userId,
});
const savedPlayer = await playerRepository.save(player);
```
A `Player` row is a **permanent team roster entry**, reused across all matches the team plays. It is **not** per-match.

**Stats reset:** **NEVER reset.** The scoring service (`scoring.service.ts`, lines 139–158) mutates `batsman.battingRuns`, `batsman.battingBalls`, etc. directly on the Player row for every ball. `batsman.isOut = true` is also written to the Player row and never cleared. This means:
- After a player is dismissed in any match, `player.isOut` is permanently true.
- `battingRuns` is a lifetime running total, **not** per-match. The `PlayerMatchPerformance` table is the intended per-match store, but `scoring.service.ts` does not write to it — only `retire-hurt.service.ts` does.

### 2d. Key Code — Full Pastes

**BallInputDto** (`server/src/modules/scoring/dto/ball-input.dto.ts`):
```ts
export class BallInputDto {
  @IsUUID('4')  inningsId: string;
  @IsUUID('4')  batsmanId: string;
  @IsUUID('4')  bowlerId: string;
  @IsInt() @Min(0) @Max(6)  runs: number;
  @IsOptional() @IsInt() @Min(0) @Max(10)  extraRuns?: number;
  @IsOptional() @IsBoolean()  isWide?: boolean;
  @IsOptional() @IsBoolean()  isNoBall?: boolean;
  @IsOptional() @IsBoolean()  isBye?: boolean;
  @IsOptional() @IsBoolean()  isLegBye?: boolean;
  @IsOptional() @IsBoolean()  isWicket?: boolean;
  @IsOptional() @IsEnum(DismissalType)  wicketType?: DismissalType;
  @IsOptional() @IsUUID('4')  dismissedPlayerId?: string;
  @IsOptional()  commentary?: string;
}
```

**Scoring controller** — see `server/src/modules/scoring/scoring.controller.ts`:  
Endpoints: `POST /scoring/ball` (JwtAuthGuard), `GET /scoring/scorecard/:matchId`, `GET /scoring/over-summary/:inningsId`.

**CricketGateway** — see `server/src/gateway/cricket.gateway.ts`:
- `@WebSocketGateway({ cors: { origin: '*', credentials: true }, namespace: '/' })`
- `handleConnection` — logs only, no JWT check.
- `handleJoinMatch` — joins socket room `match_<id>`, **no JWT or permission check**.
- Emit methods: `emitBallUpdated`, `emitWicket`, `emitOverComplete`, `emitInningsEnd`, `emitMatchResult`, `emitMatchStarted`, `emitTossResult`, `emitPlaying11Updated`, `emitError`.

**Innings service** — see `server/src/modules/innings/innings.service.ts`:  
`startInnings`: validates status, checks playing-11 count === 11, creates row, sets match.status = LIVE.  
`setBatsmen`: validates team membership, no duplicate striker/non-striker, saves to innings.  
`setBowler`: validates bowling team membership, saves `currentBowlerId`. No consecutive-over or quota check.  
`retire hurt` — lives in `RetireHurtService` (`server/src/modules/scoring/retire-hurt.service.ts`): marks `PlayerMatchPerformance.isRetiredHurt = true`. Does **not** clear `innings.strikerId/nonStrikerId`.

### 2e. Socket.IO Auth & CORS

- **Connection-time auth:** NONE. `handleConnection` only logs `client.id`.
- **join-match auth:** NONE. Any unauthenticated socket can join any match room and receive live scoring events.
- **HTTP CORS** (`main.ts` line 14): `origin: true` (mirrors request origin), all methods allowed.
- **WS CORS** (`cricket.gateway.ts` line 25): `origin: '*'`, credentials: true.

### 2f. Auth — JWT, Google OAuth, Token Storage

**JWT creation** (`auth.service.ts`, line 213–219):
```ts
const payload = { userId: user.id, email: user.email, name: user.name };
const access_token = this.jwtService.sign(payload);
```
Expiry: `JWT_EXPIRES_IN` env var (default `24h` in docker-compose).  
Algorithm: HS256 (passport-jwt default).

**JWT validation** (`jwt.strategy.ts`): Extracts bearer token, verifies signature, then **makes a DB round-trip** (`findOne({ where: { id: userId, email } })`) on every authenticated request — no caching.

**Google OAuth web flow:**
1. `GET /auth/google` → sets `g_state` HttpOnly cookie, redirects to Google.
2. Google redirects to `GET /auth/google/callback` → validates state cookie, exchanges code, calls `loginWithGoogleProfile`.
3. Issues JWT, redirects to `{FRONTEND_URL}/auth/google/callback#token=<jwt>`.
4. `GoogleCallbackPage.tsx` reads fragment, calls `/auth/me`, stores in Zustand.

**Google OAuth mobile flow:**
- `POST /auth/google/mobile` with `{ idToken }` from native plugin.
- No Capacitor Google Auth plugin is installed — the mobile endpoint exists but **there is no client code that calls it**.

**Token storage on client:**  
`useAuthStore` uses Zustand `persist` middleware with default `localStorage` storage (`auth.store.ts` line 27: `name: 'strikerate-auth'`).  
No Capacitor Preferences / SecureStorage plugin used.

### 2g. TypeORM Config

- **`synchronize: true`** — hardcoded in `database.config.ts` line 15, with comment "Set to false in production". This auto-alters the DB schema on every boot. **⚠️ Production risk.**
- **Migrations:** NOT FOUND. No `migrations/` folder, no `migration:run` script in package.json.
- **Seed scripts:** NOT FOUND.

### 2h. Tournament Module / Undo-Ball Endpoint

- **Tournament module:** NOT FOUND.
- **Undo / edit ball endpoint:** NOT FOUND. There is no `DELETE /scoring/ball/:id` or `PATCH /scoring/ball/:id` endpoint anywhere in the codebase.

### 2i. Validation, Rate Limiting, Helmet, Logging

- **Validation:** Global `ValidationPipe` (`main.ts` lines 33–42) with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- **Rate limiting:** `ThrottlerModule` global guard (300 req/60s). Per-route overrides on auth endpoints (5–10 req/60s).
- **Helmet:** `helmet({ contentSecurityPolicy: false })` applied globally.
- **CSP:** Explicitly disabled for Swagger UI compatibility.
- **Logging:** `console.log` only (no structured logger / Winston / Pino).
- **Global exception filter:** `HttpExceptionFilter` (`common/filters/`) — standardises error envelope.
- **Response interceptor:** `ResponseInterceptor` (`common/interceptors/`) — wraps all responses.

---

## 3. FRONTEND

### 3a. Route Table

Routes defined in `client/src/routes/routes.tsx`.

| Path | Component | Guard | AppShell |
|------|-----------|-------|----------|
| /auth/google/callback | GoogleCallbackPage | None | No |
| /login | LoginPage | PublicOnly | No |
| /register | RegisterPage | PublicOnly | No |
| /verify-email | VerifyEmailPage | PublicOnly | No |
| / | HomePage | RequireAuth | **Yes** |
| /matches | MatchesPage | RequireAuth | **Yes** |
| /teams | TeamsPage | RequireAuth | **Yes** |
| /score | ScoreCenterPage | RequireAuth | **Yes** |
| /profile | ProfilePage | RequireAuth | **Yes** |
| /teams/new | TeamCreatePage | RequireAuth | **Yes** |
| /teams/:id | TeamDetailPage | RequireAuth | **Yes** |
| /teams/:id/edit | TeamEditPage | RequireAuth | **Yes** |
| /profile/edit | ProfileEditPage | RequireAuth | No |
| /settings | SettingsPage | RequireAuth | No |
| /matches/:id | MatchDetailPage | RequireAuth | No |
| /matches/:id/live | LiveMatchPage | RequireAuth | No |
| /matches/:id/score | ScoringConsolePage | RequireAuth | No |
| /matches/:id/scorecard | ScorecardPage | RequireAuth | No |
| /matches/:id/over-summary/:inningsId | OverSummaryPage | RequireAuth | No |
| /matches/:id/scorer-transfer | ScorerTransferPage | RequireAuth | No |
| /matches/:id/toss | TossPage | RequireAuth | No |
| /matches/:id/playing11/:teamId | Playing11Page | RequireAuth | No |
| /matches/:id/innings-setup | InningsSetupPage | RequireAuth | No |
| /matches/:id/super-over | SuperOverPage | RequireAuth | No |
| /matches/:id/super-over/:superOverId/score | SuperOverScoringPage | RequireAuth | No |
| /players/:playerId | PlayerCareerPage | RequireAuth | No |
| /players/:playerId/matches | PlayerMatchesPage | RequireAuth | No |
| /teams/:id/history | TeamHistoryPage | RequireAuth | No |
| /match-requests | MatchRequestsPage | RequireAuth | No |
| /teams/:id/request | MatchRequestCreatePage | RequireAuth | No |
| /teams/:id/availability | TeamAvailabilityPage | RequireAuth | No |
| * | NotFoundPage | None | No |

**BottomTabBar tabs** (`client/src/components/ui/BottomTabBar.tsx`):  
Home (`/`), Matches (`/matches`), Teams (`/teams`), Score (`/score`), Profile (`/profile`).

**Routes not reachable from BottomTabBar directly** (require navigation from another page):  
`/match-requests`, `/teams/:id/availability`, `/players/:playerId`, `/players/:playerId/matches`, `/teams/:id/history`, `/settings`, `/matches/:id/super-over*`, all `/matches/:id/*` sub-routes. These are reachable through contextual nav links from MatchDetail/TeamDetail pages — not dead, but not discoverable from tabs alone.

### 3b. Lib and Store Pastes

**`client/src/lib/socket.ts`** (full):
```ts
import { io, type Socket } from "socket.io-client";
let socket: Socket | null = null;
export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL ?? "http://localhost:3000", {
      autoConnect: false,
      withCredentials: false,
    });
  }
  return socket;
}
```
Single shared socket. No JWT. No reconnection config.

**`client/src/lib/api.ts`** (condensed — see file for full):  
- Axios instance with `baseURL = VITE_API_URL`, `timeout: 15000`.
- Request interceptor: reads `token` from Zustand store, sets `Authorization: Bearer <token>`.
- Response interceptor: on `401` (non-auth URLs), calls `useAuthStore.getState().clear()` then redirects to `/login` via `window.location.replace`.

**`client/src/stores/auth.store.ts`** (full):
```ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null, user: null, hasHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      clear: () => set({ token: null, user: null }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "strikerate-auth",  // ← localStorage key
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
```
Token stored in **`localStorage`** under key `strikerate-auth`.

**`onNewBatsman`** (`ScoringConsolePage.tsx` lines 233–244):
```ts
const onNewBatsman = async (p: { id: string }) => {
  if (!inn || !batsmanNeed) return;
  const striker = batsmanNeed.strikerIsNew ? p.id : batsmanNeed.survivor;
  const nonStriker = batsmanNeed.strikerIsNew ? batsmanNeed.survivor : p.id;
  try {
    await inningsApi.setBatsmen(inn.id, striker, nonStriker);
    setBatsmanNeed(null);
    invalidateAll();
  } catch (e) {
    toast.error(errorMessage(e));
  }
};
```

**`onOpeningPick`** (`ScoringConsolePage.tsx` lines 246–261):
```ts
const onOpeningPick = async (p: { id: string }) => {
  if (!inn) return;
  if (needStriker && !pickStriker) {
    setPickStriker(p.id);   // first pick stored locally
    return;
  }
  const striker = needStriker ? pickStriker! : inn.strikerId!;
  try {
    await inningsApi.setBatsmen(inn.id, striker, p.id);
    setPickStriker(null);
    invalidateAll();
    toast.success("Batters set");
  } catch (e) {
    toast.error(errorMessage(e));
  }
};
```

**`lib/scoring.ts`** — 282-line client-side aggregation library. Reconstructs batting/bowling scorecard from `balls[]`. Notes stored-`overNumber` is unreliable; recalculates from legal-ball count instead.

### 3c. Per-page summary (API calls, query keys, socket hooks)

| Page | API Calls | Query Keys | Socket |
|------|-----------|-----------|--------|
| HomePage | matchesApi.live, matchesApi.byStatus | matchesByStatus, match | — |
| MatchesPage | matchesApi.byStatus | matchesByStatus | — |
| MatchDetailPage | matchesApi.get, inningsApi.byMatch, playing11Api.get | match, inningsByMatch, playing11 | — |
| TossPage | matchesApi.toss (mutation) | match | — |
| Playing11Page | playing11Api.get/set | playing11 | — |
| InningsSetupPage | inningsApi.start (mutation) | inningsByMatch, match | — |
| LiveMatchPage | matchesApi.get, inningsApi.byMatch, playing11Api.get×2, scoringApi.scorecard | match, inningsByMatch, playing11, scorecard | **useMatchSocket** |
| ScoringConsolePage | matchesApi.get, inningsApi.byMatch, playing11Api.get×2, scoringApi.scorecard, scoringApi.recordBall (mutation) | match, inningsByMatch, playing11, scorecard, canScore | — |
| ScorecardPage | matchesApi.get, inningsApi.byMatch, scoringApi.scorecard, playing11Api.get×2 | match, inningsByMatch, scorecard, playing11 | — |
| OverSummaryPage | scoringApi.overSummary, playing11Api.get | overSummary, playing11 | — |
| ScorerTransferPage | scorerTransferApi.* | scorers, transferHistory, pendingTransfers | — |
| ScoreCenterPage | matchesApi.live, pendingTransferApi | matchesByStatus, pendingTransfers, canScore | — |
| SuperOverScoringPage | superOverApi.*, scoringApi.* | superOvers | — |
| PlayerCareerPage | statsApi.career | playerCareer | — |
| TeamDetailPage | teamsApi.get, teamsApi.members, playerApi.list | team, teamMembers, teamPlayers | — |

### 3d. useMatchSocket usage and manual invalidation

**Pages calling `useMatchSocket`:** `LiveMatchPage` only.  
`useMatchSocket` invalidates: `scorecard`, `inningsByMatch`, `match`, `matchesByStatus('live')`, `matchesByStatus('completed')`.

**`ScoringConsolePage`** does **not** use `useMatchSocket`. It calls `invalidateAll()` (scorecard + inningsByMatch + match) after every successful `POST /scoring/ball`. This means the scorer's view stays in sync via REST polling; non-scorer live views update via socket.

### 3e. Capacitor Details

| Item | Value |
|------|-------|
| capacitor.config appId | com.strikerate.app |
| webDir | dist |
| allowMixedContent | true (⚠️ dev-only flag, not removed) |
| Installed plugins | @capacitor/core, @capacitor/android only |
| AndroidManifest perms | NOT directly viewed; usesCleartextTraffic likely enabled |
| .env.android vars | `VITE_API_URL` |
| API base URL selection | `VITE_API_URL` env var at build time; default `http://localhost:3000` |
| Hardware back button | NOT HANDLED — no `App.addListener('backButton', …)` found |
| Safe-area insets | `pb-safe` CSS class used in `BottomTabBar.tsx` (Capacitor safe-area plugin assumed via CSS vars) |

### 3f. Lazy loading, Error Boundary, 404

- **React.lazy / Suspense:** NOT FOUND. All page components are imported directly (`import { LoginPage } from …`). No code splitting.
- **Error boundary:** NOT FOUND. No `<ErrorBoundary>` component in tree.
- **404 route:** Present — `<Route path="*" element={<NotFoundPage />} />` at `routes.tsx` line 90.

---

## 4. END-TO-END FLOWS

### 4.1 Full match flow

1. **Create Team** → `POST /teams` (TeamModule). Team captain is the creating user.
2. **Challenge / Match Request** → `POST /teams/:id/request` → creates `MatchRequest` row. Opponent captain accepts → `MatchRequest` transitions to accepted → `Match` row created with status `scheduled`. ⚠️ No check that both teams have ≥11 players at this stage.
3. **Toss** → `POST /matches/:id/toss` (TossController) → sets `tossWinnerId`, `tossChoice`, status → `toss_done`.
4. **Playing XI** → `POST /matches/:id/playing11/:teamId` → `Playing11Module`. Exactly 11 players enforced in `startInnings` (`innings.service.ts` line 84), but **not** at XI submission time — a team can submit 9 players and the error only surfaces at innings start. ⚠️ No unique constraint on `(matchId, teamId, playerId)` in `Playing11` entity, so duplicates are possible.
5. **Start Innings** → `POST /innings/match/:matchId/start` → validates status, checks both XIs = 11, creates `Innings` row, sets match status → `live`.
6. **Set Opening Batters** → `PATCH /innings/:id/set-batsmen` → sets `strikerId`, `nonStrikerId`.
7. **Set Bowler** → `PATCH /innings/:id/set-bowler` → sets `currentBowlerId`.
8. **Record Ball** → `POST /scoring/ball` (inside a DB transaction):
   - Validates `inningsId`, `innings.isCompleted`, match status, scorer permission, batsman/bowler team membership.
   - ⚠️ Does NOT check `dto.batsmanId === innings.strikerId`.
   - ⚠️ Does NOT check `dto.bowlerId === innings.currentBowlerId`.
   - Updates player stats on Player row (cross-match contamination).
   - Handles strike rotation and over increment.
   - Checks win condition only at innings completion (see §5).
9. **Wicket** → `record({ isWicket: true, wicketType })` → server sets `batsman.isOut = true`, `innings.totalWickets++`. UI sets `batsmanNeed` state → `PlayerPickerSheet` opens. ⚠️ If user dismisses the sheet without picking (onClose sets `setBatsmanNeed(null)`), scoring can continue with the dismissed batter still set as striker.
10. **Over End** → `isOverComplete = true` when `currentBallsInOver === 5 && !isExtra`. Server auto-increments `innings.currentOver`, swaps striker. UI sets `bowlerNeed = true` → `PlayerPickerSheet` for bowler opens.
11. **Innings End** → `innings.isCompleted = true` when `totalWickets >= maxWickets || totalOversBowled >= maxOvers`. If innings 1: sets `match.status = INNINGS_BREAK`, `match.target`. If innings 2: determines winner (see §5).
12. **Match End** → Server sets `match.status = COMPLETED / TIED`, `winningTeamId`, `result`. `emitMatchResult` fires. UI navigates away on `res.matchCompleted === true`.

### 4.2 Scorer Transfer flow

1. Current scorer (captain/VC or permission holder) → `POST /scoring/scorer-transfer/transfer` with `transferToUserId`, optional `revokeCurrentPermissions`.
2. Creates `ScorerPermission` row with `transferStatus: PENDING`, `isActive: false`, `canScore: false`.
3. Target user sees pending transfer in `GET /scoring/scorer-transfer/pending`.
4. Target accepts → `POST /scoring/scorer-transfer/:id/accept` with `activateImmediately: true` → sets `canScore: true`, `isActive: true`.
5. ⚠️ If `revokeCurrentPermissions: false`, **both** users can score simultaneously (no exclusive lock).
6. Target is restricted to team members of either match team — correct check in `scorer-transfer.service.ts` line 72.

### 4.3 Google Login on Mobile

1. Client has no Capacitor Google Auth plugin installed.
2. The server has `POST /auth/google/mobile` endpoint (`auth.controller.ts` line 264).
3. The mobile endpoint expects an `idToken` from a native Google Sign-In plugin.
4. **There is no client-side code that calls this endpoint.** The web redirect flow (`/auth/google`) would fail in the WebView because the redirect URI would need to be an HTTPS URL registered in Google Cloud Console.
5. **Result:** Google login is **not functional on Android** in the current build.

---

## 5. FINDINGS

### CRITICAL (Severity 1)

**F1 — Player stats stored on the wrong row (cross-match contamination)**  
`scoring.service.ts` lines 139–158: `batsman.battingRuns +=`, `batsman.isOut = true` etc. are written directly to the `Player` entity row. This row is shared across all matches. After a player is dismissed once, `player.isOut` is `true` forever. Batting stats accumulate across matches, making the Player row useless for scorecard display. `PlayerMatchPerformance` exists but is not written by the scoring service.  
Files: `scoring.service.ts`, `player.entity.ts`.

**F2 — No batsmanId/bowlerId cross-check against innings state**  
`scoring.service.ts` lines 87–106: Only checks that batsman is from batting team and bowler from bowling team. It does NOT check `dto.batsmanId === innings.strikerId` or `dto.bowlerId === innings.currentBowlerId`. Any player from the correct team can be submitted as the batsman/bowler, silently corrupting the ball record.  
Files: `scoring.service.ts`.

**F3 — Target not checked mid-over (2nd innings)**  
`scoring.service.ts` line 236: The win condition `innings.totalRuns >= targetRuns` is only evaluated inside `if (innings.isCompleted)`. If the chasing team reaches the target mid-over (e.g. scores a six off ball 3), the innings is NOT marked complete and the match does NOT end until the innings completes by wickets or overs. The chasing team is forced to bat out the full innings even after winning.  
Files: `scoring.service.ts` line 214–280.

**F4 — synchronize: true hardcoded**  
`database.config.ts` line 15: TypeORM will auto-alter the production database schema on every server boot. Any column rename or table change will silently mutate or lose data.  
Files: `database.config.ts`.

### HIGH (Severity 2)

**F5 — No idempotency on ball recording**  
`POST /scoring/ball` has no idempotency key, unique constraint, or optimistic locking. A double-tap or network retry will record two identical balls and corrupt the score. There is a DB transaction (`queryRunner`) but it only prevents partial writes within one call, not duplicate calls.  
Files: `scoring.service.ts`, `ball.entity.ts`.

**F6 — Socket gateway has no authentication**  
Any unauthenticated WebSocket client can call `join-match` and receive live scoring events for any match. There is no JWT check on connection or on room join.  
Files: `cricket.gateway.ts`, `socket.ts`.

**F7 — Invalid dismissal types not blocked (no-ball wicket)**  
`BallInputDto` accepts any combination of `isNoBall: true` + `isWicket: true` + `wicketType: 'bowled'`. Cricket law: on a no-ball, bowled/lbw/stumped/hit-wicket are not valid dismissals. The server does not block this combination.  
Files: `scoring.service.ts`, `ball-input.dto.ts`.

**F8 — Free hit not tracked**  
There is no `isFreeHit` column on `Ball` or `Innings`. After a no-ball, the next delivery is a free hit (batsman can only be run out). The system cannot enforce or display this rule.  
Files: `ball.entity.ts`, `scoring.service.ts`.

**F9 — UI bug: closing new-batter sheet after a wicket loses the wicket state**  
`ScoringConsolePage.tsx` line 473: `onClose={() => setBatsmanNeed(null)}` on the `PlayerPickerSheet`. If the scorer dismisses the sheet without selecting a replacement batter, `batsmanNeed` is cleared but `innings.strikerId` still points to the dismissed batter. The next ball will be recorded as delivered to a dismissed player. No re-prompt.  
Files: `ScoringConsolePage.tsx` lines 468–475.

**F10 — Bowler over quota only UI-enforced, not server-enforced**  
`ScoringConsolePage.tsx` lines 295–307: UI calculates `maxOvers = Math.ceil(match.totalOvers / 5)` and marks quota-full bowlers as `disabled`. Server's `setBowler` endpoint does no quota or consecutive-over check. Any API call bypasses it.  
Files: `innings.service.ts` `setBowler`, `ScoringConsolePage.tsx`.

**F11 — No consecutive-over enforcement**  
No `previousBowlerId` column in `Innings`. Neither `setBowler` nor `deliverBall` checks if the new bowler bowled the last over.  
Files: `innings.entity.ts`, `innings.service.ts`.

### MEDIUM (Severity 3)

**F12 — N+1 queries in scoring service**  
After every ball, `emitOverComplete` fetches all balls for the over (`ballRepository.find` line 408). `emitMatchResult` fetches all innings and teams (lines 465–472). `emitBallUpdated` re-reads striker/non-striker (lines 317–325). These extra reads happen outside of the main transaction on the default datasource.  
Files: `scoring.service.ts` lines 317–496.

**F13 — JWT DB round-trip on every authenticated request**  
`jwt.strategy.ts` line 26: `findOne({ where: { id: userId, email } })` runs on every request with no caching. Under load this is a bottleneck.  
Files: `jwt.strategy.ts`.

**F14 — Playing11 has no unique constraint (duplicate XI entries)**  
`Playing11` entity has no `@Unique(['matchId','teamId','playerId'])`. The same player can be submitted twice to the same team's XI, inflating `teamAPlaying11` count in `startInnings` checks.  
Files: `playing11.entity.ts`.

**F15 — Player deletable while in a live match**  
`player.service.ts` line 103: TODO comment acknowledges missing check. A player can be removed from the team roster even while batting in a live match.  
Files: `player.service.ts` lines 99–104.

**F16 — Token in URL fragment (Google OAuth)**  
`auth.controller.ts` line 240: JWT is passed in the URL fragment `#token=<jwt>`. The fragment is read by `GoogleCallbackPage.tsx` immediately and the store is set. Although fragments are not sent to servers, they can appear in browser history and may be captured by browser extensions.  
Files: `auth.controller.ts`, `GoogleCallbackPage.tsx`.

**F17 — No React.lazy / code splitting**  
All 30+ pages are imported synchronously. Initial bundle size will be large, increasing TTI on mobile networks.  
Files: `routes.tsx`.

**F18 — No error boundary**  
A JS error in any page component will crash the entire app with a blank screen. No `componentDidCatch` / `ErrorBoundary` wrapper exists.  
Files: `main.tsx`, `App.tsx`.

**F19 — allowMixedContent left on**  
`capacitor.config.ts` line 11: `allowMixedContent: true` is marked "dev-only: remove once backend is HTTPS" but is committed as-is. The Android WebView will allow HTTP traffic, reducing security.  
Files: `capacitor.config.ts`.

**F20 — CSP disabled globally**  
`main.ts` line 22: `helmet({ contentSecurityPolicy: false })`. A XSS on the API's Swagger UI page has no mitigation.  
Files: `main.ts`.

**F21 — Duplicate scorer permissions possible**  
If `transferScorer` is called with `revokeCurrentPermissions: false`, sender retains scoring rights. Multiple active scorers can simultaneously record balls with no coordination, causing race conditions.  
Files: `scorer-transfer.service.ts`.

### LOW (Severity 4)

**F22 — No structured logging.** `console.log` throughout; no request IDs, log levels, or structured output.

**F23 — DB password visible in docker-compose.** Default `DB_PASSWORD: Arunme211` hardcoded in `docker-compose.yml` line 15.

**F24 — `isBye`/`isLegBye` + `isWide` combination not validated.** The DTO allows both simultaneously; server comment says "byes go here only when combined with wide/no-ball" but neither DTO nor service validates the constraint formally.

**F25 — No hardware back button handler on Android.** Capacitor's default back-button will exit the app instead of navigating back in the React Router stack. No `App.addListener('backButton', …)` found.

**F26 — `bowlingOvers` column on Player never written.** `player.entity.ts` line 76: `bowlingOvers` decimal column exists but `scoring.service.ts` only increments `bowlingBalls`. The column is dead.

---

## 6. PENDING WORK vs. MY GOALS

### 6.1 AWS Deployment

| | Status |
|---|---|
| **Exists** | `Dockerfile` for both client (nginx) and server (node). Root `docker-compose.yml` for local testing. `TRUST_PROXY` env var handled in `main.ts` line 28. |
| **Missing** | No Terraform / CDK / CloudFormation. No ECS task definitions or ECR push scripts. No RDS migration plan (synchronize must be disabled). No Secrets Manager integration. No ALB health-check config (though `/health` endpoint exists). No SSL/TLS termination config. |
| **Files to change** | `server/src/config/database.config.ts` (disable synchronize), add migrations, `client/Dockerfile` (set prod `VITE_API_URL`), new infra folder. |

### 6.2 AdMob

| | Status |
|---|---|
| **Exists** | Nothing — no AdMob plugin, no ad placement code. |
| **Missing** | `@capacitor-community/admob` plugin install, AndroidManifest `meta-data` for App ID, ad unit IDs in env, ad-display components, testing with test ad IDs. |
| **Files to change** | `client/package.json`, `client/capacitor.config.ts`, `client/android/app/src/main/AndroidManifest.xml`, new `src/lib/admob.ts`, page components where ads appear. |

### 6.3 Route / UI / Button-Placement Fixes

| | Status |
|---|---|
| **Exists** | Working router with 31 routes and a 404 page. BottomTabBar with 5 tabs. |
| **Missing** | Several major pages (match-requests, team history, player career, settings) are not discoverable from BottomTabBar. No back-button handler on Android. No hardware keyboard avoidance. Scoring console has no undo button. |
| **Files to change** | `routes.tsx`, `BottomTabBar.tsx`, `AppShell.tsx`, `ScoringConsolePage.tsx`, possibly new nav structure. |

### 6.4 Better UX

| | Status |
|---|---|
| **Exists** | Toast notifications, loading spinners, empty-state pages, `PlayerPickerSheet` modal. |
| **Missing** | Error boundary for crash recovery, back-button handling, skeleton loaders, confirmation dialog before navigating away during live scoring, in-app notification when a scorer transfer is pending (no push notifications), re-prompt when new-batter sheet is closed without a selection, free-hit indicator. |
| **Files to change** | `main.tsx` (ErrorBoundary), `ScoringConsolePage.tsx`, `useMatchSocket.ts` (trigger re-prompt on wicket events), new components. |

### 6.5 Code and Performance Optimization

| | Status |
|---|---|
| **Exists** | React Query cache, DB transaction on ball recording, indexes on key FK columns. |
| **Missing** | React.lazy for routes (F17). JWT validation DB round-trip caching (F13). `PlayerMatchPerformance` as the authoritative per-match stats store (F1). Unique constraint on Playing11 (F14). Index on `scoring.overNumber` for over-summary queries. `synchronize: false` + migrations (F4). Idempotency key on ball recording (F5). |
| **Files to change** | `routes.tsx`, `jwt.strategy.ts`, `scoring.service.ts`, `database.config.ts`, `playing11.entity.ts`, `ball.entity.ts`, new migrations folder. |

### 6.6 AI Performance Analysis

| | Status |
|---|---|
| **Exists** | `PlayerMatchPerformance` and `PlayerCareerStats` entities exist and are the right foundation. `PlayerCareerPage`, `PlayerMatchesPage` query the stats API. `StatsModule` is present. |
| **Missing** | The scoring service does **not populate `PlayerMatchPerformance`** (only `RetireHurtService` touches it). No ML model integration, no prediction endpoints, no `analysis` module, no batch job to compute career stats from ball-by-ball data. `PlayerCareerStats` aggregation logic not visible. |
| **Files to change** | `scoring.service.ts` (write to `PlayerMatchPerformance` after each ball), `stats/` module (add AI/analysis service), new API endpoints, new client pages/components. |

---

## 7. QUESTIONS FOR ME

1. **Player stats reset:** The `Player.battingRuns / isOut` fields accumulate across matches. Is this intentional (career display), or should the scorecard read from `PlayerMatchPerformance`? The current design means the live scorecard in `ScoringConsolePage` shows career totals, not match totals.

2. **Target check:** Should the match end the moment the 2nd-innings team reaches the target (e.g. after a four mid-over), or only when the innings completes? Currently it only ends at innings completion.

3. **Google login on mobile:** Is there a plan to install a Capacitor Google Auth plugin, or should mobile users use the web redirect flow? The current `POST /auth/google/mobile` endpoint is unused.

4. **Bowler quota formula:** The UI uses `Math.ceil(totalOvers / 5)` as max overs per bowler. Is this the intended rule for all match formats (T10, T20, ODI)?

5. **Undo ball:** Is this a planned feature? If so, what should happen to player stats and innings totals when a ball is deleted?

6. **Scorer transfer race:** Should only one scorer be active at a time? Currently two can score simultaneously if `revokeCurrentPermissions: false`.

7. **Playing XI guest players:** `Playing11` has both `playerId` and `guestPlayerId`. Does the scoring service handle guest players (it only queries `Player`, not `GuestPlayer`)?

8. **Safe-area CSS (`pb-safe`):** This relies on a CSS variable set by a Capacitor plugin or the PWA manifest. Is `@capacitor/status-bar` or an equivalent plugin expected to be installed?

9. **`synchronize: true` in production:** Was this intentional for rapid prototyping? Switching it off will require writing migration files for every schema change going forward.

10. **Tournament module:** Is there a planned bracket/points-table feature? Nothing exists — how prioritised is this vs. the other items above?
