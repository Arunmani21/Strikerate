/* Rebuilds the Phase-5 E2E fixture from nothing: both users, teams, players,
   a 20-over match that ties 15-15, super over 1 tied 6-6 (abandoned),
   super over 2 won by Rival 11-10, stats calculated.
   The ball sequences mirror what scripts/e2e-phase5.mjs asserts.

   Run:   BASE=http://localhost:3001 node scripts/seed-e2e-fixture.mjs
   Then:  BASE=... MATCH_ID=<printed id> node scripts/e2e-phase5.mjs
   Re-runs create a fresh match (users are reused; team/match names repeat). */
import { execSync } from 'node:child_process';

const BASE = process.env.BASE || 'http://localhost:3000';
const DATE = process.env.MATCH_DATE || '2026-10-01';

async function req(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(
      Array.isArray(json.message) ? json.message.join(' · ') : (json.message || res.statusText),
    );
    e.status = res.status;
    e.path = `${method} ${path} body=${JSON.stringify(body)}`;
    throw e;
  }
  return json.data;
}

function readOtpFromDb(email) {
  const out = execSync(
    `docker exec strikerate_db psql -U postgres -d strikerate_db -t -A -c "SELECT otp FROM otps WHERE email='${email}' AND status='pending' ORDER BY \\"expires_at\\" DESC LIMIT 1"`,
    { encoding: 'utf8' },
  ).trim();
  if (!/^\d{6}$/.test(out)) throw new Error(`no pending OTP in DB for ${email}: "${out}"`);
  return out;
}

async function makeUser(name, email, password) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (res.status === 201) {
    const otp = readOtpFromDb(email);
    await req('POST', '/auth/verify-email', { email, otp });
    console.log(`registered + verified ${email}`);
  } else if (res.status === 409) {
    console.log(`${email} already registered`);
  } else {
    const j = await res.json().catch(() => ({}));
    throw new Error(`register ${email}: ${res.status} ${JSON.stringify(j.message || j)}`);
  }
  const login = await req('POST', '/auth/login', { email, password });
  return { token: login.access_token, id: login.user.id };
}

const step = (m) => console.log(`\n== ${m}`);

async function main() {
  step('users');
  const A = await makeUser('Smoke Captain', 'smoke.test.sr@example.com', 'Striker!x7qZm');
  const B = await makeUser('Rival Captain', 'b.smoke.sr@example.com', 'Rival!x7qZm9');

  step('teams + players');
  const ensureTeam = async (token, name) => {
    const mine = await req('GET', '/team/my-teams', undefined, token);
    const list = Array.isArray(mine) ? mine : mine.teams || [];
    return list.find((t) => t.name === name) || req('POST', '/team', { name }, token);
  };
  const smokeTeam = await ensureTeam(A.token, 'Smoke XI');
  const rivalTeam = await ensureTeam(B.token, 'Rival Kings');
  const ensurePlayers = async (token, teamId, names) => {
    const existing = await req('GET', `/team/${teamId}/player`, undefined, token);
    const list = Array.isArray(existing) ? existing : existing.players || [];
    return Promise.all(
      names.map((n) => list.find((p) => p.name === n.name) || req('POST', `/team/${teamId}/player`, n, token)),
    );
  };
  const smokePlayers = await ensurePlayers(A.token, smokeTeam.id, [
    { name: 'Rahul S', jerseyNumber: 7 },
    ...Array.from({ length: 10 }, (_, i) => ({ name: `Smoke Player ${i + 2}` })),
  ]);
  const rivalPlayers = await ensurePlayers(B.token, rivalTeam.id, Array.from({ length: 11 }, (_, i) => ({ name: `Rival Player ${i + 1}` })));
  const byName = (list, name) => {
    const p = list.find((p) => p.name === name);
    if (!p) throw new Error(`player ${name} missing`);
    return p;
  };

  step('match request -> confirm');
  const avail = (token, teamId) =>
    req('POST', `/team/${teamId}/availability`, { availableDate: DATE, availableFrom: '09:00', availableUntil: '18:00', venue: 'Seed Ground', preferredOvers: 20 }, token);
  await avail(A.token, smokeTeam.id);
  await avail(B.token, rivalTeam.id);
  const mr = await req(
    'POST',
    `/team/${smokeTeam.id}/match-request`,
    { opponentTeamId: rivalTeam.id, matchDate: DATE, matchTime: '10:00', venue: 'Seed Ground', preferredOvers: 20 },
    A.token,
  );
  await req('PATCH', `/match-request/${mr.id}/respond`, { status: 'confirmed' }, B.token);
  let matchId = mr.matchId;
  if (!matchId) {
    const upcoming = await req('GET', `/team/${smokeTeam.id}/matches/upcoming`, undefined, A.token);
    const list = Array.isArray(upcoming) ? upcoming : upcoming.matches || [];
    const m = list.find((x) => [x.teamAId, x.teamBId].includes(smokeTeam.id) && [x.teamAId, x.teamBId].includes(rivalTeam.id));
    if (!m) throw new Error(`confirmed match not found in upcoming: ${JSON.stringify(upcoming).slice(0, 300)}`);
    matchId = m.id;
  }
  console.log(`match ${matchId}`);

  step('toss (rival wins, bats) + playing XI');
  await req('PATCH', `/matches/${matchId}/toss`, { tossWinnerId: rivalTeam.id, tossChoice: 'bat' }, B.token);
  await req('POST', `/matches/${matchId}/playing11/${smokeTeam.id}`, { playerIds: smokePlayers.map((p) => p.id) }, A.token);
  await req('POST', `/matches/${matchId}/playing11/${rivalTeam.id}`, { playerIds: rivalPlayers.map((p) => p.id) }, B.token);

  const rahul = byName(smokePlayers, 'Rahul S').id;
  const smokeP2 = byName(smokePlayers, 'Smoke Player 2').id;
  const smokeP3 = byName(smokePlayers, 'Smoke Player 3').id;
  const sId = (n) => byName(smokePlayers, n === 1 ? 'Rahul S' : `Smoke Player ${n}`).id;
  const rP = (n) => byName(rivalPlayers, `Rival Player ${n}`).id;

  step('innings 1: Rival 15 all out (RP2 10 off bat, one wide)');
  const inn1 = await req(
    'POST',
    `/innings/match/${matchId}/start`,
    { battingTeamId: rivalTeam.id, bowlingTeamId: smokeTeam.id, inningsNumber: 1 },
    A.token,
  );
  await req('PATCH', `/innings/${inn1.id}/set-batsmen`, { strikerId: rP(2), nonStrikerId: rP(3) }, A.token);
  await req('PATCH', `/innings/${inn1.id}/set-bowler`, { bowlerId: rahul }, A.token);
  // [batsman, runs, flags]; bowler chosen per legal-ball over: over 1,3 rahul / 2 sp2
  const inn1Balls = [
    [rP(2), 4], [rP(2), 6], [rP(3), 2], [rP(1), 2], [rP(3), 0, 'wide'],
    [rP(4), 0, 'W'], [rP(5), 0, 'W'],
    [rP(6), 0, 'W'], [rP(7), 0, 'W'], [rP(8), 0, 'W'], [rP(9), 0, 'W'], [rP(10), 0, 'W'], [rP(11), 0, 'W'],
    [rP(1), 0, 'W'], [rP(2), 0, 'W'],
  ];
  let legal = 0;
  for (const [batsmanId, runs, flag] of inn1Balls) {
    const bowlerId = Math.floor(legal / 6) % 2 === 0 ? rahul : smokeP2;
    const body = { inningsId: inn1.id, batsmanId, bowlerId, runs };
    if (flag === 'wide') body.isWide = true;
    if (flag === 'W') { body.isWicket = true; body.wicketType = 'bowled'; }
    await req('POST', '/scoring/ball', body, A.token);
    if (flag !== 'wide') legal++;
  }
  let m = await req('GET', `/matches/${matchId}`, undefined, A.token);
  if (m.status !== 'innings_break') throw new Error(`after innings 1 expected innings_break, got ${m.status} (target=${m.target})`);
  console.log(`innings 1 done: status=${m.status} target=${m.target}`);

  step('innings 2: Smoke ties at 15 all out (same algorithm as e2e-phase5 Phase B)');
  const inn2 = await req(
    'POST',
    `/innings/match/${matchId}/start`,
    { battingTeamId: smokeTeam.id, bowlingTeamId: rivalTeam.id, inningsNumber: 2 },
    A.token,
  );
  await req('PATCH', `/innings/${inn2.id}/set-batsmen`, { strikerId: smokeP2, nonStrikerId: smokeP3 }, A.token);
  await req('PATCH', `/innings/${inn2.id}/set-bowler`, { bowlerId: rP(1) }, A.token);
  for (;;) {
    const cur = (await req('GET', `/innings/match/${matchId}`, undefined, A.token)).find((i) => !i.isCompleted);
    if (!cur || cur.totalWickets >= 10) break;
    const stillChasing = cur.totalRuns < 15;
    const body = {
      inningsId: cur.id,
      batsmanId: stillChasing ? (cur.totalBalls % 2 === 0 ? smokeP2 : smokeP3) : sId(4 + (cur.totalWickets % 8)),
      bowlerId: rP((cur.totalBalls % 5) + 1),
      runs: stillChasing ? 3 : 0,
    };
    if (!stillChasing) { body.isWicket = true; body.wicketType = 'bowled'; }
    await req('POST', '/scoring/ball', body, A.token);
  }
  m = await req('GET', `/matches/${matchId}`, undefined, A.token);
  if (m.status !== 'tied') throw new Error(`after innings 2 expected tied, got ${m.status} (result=${m.result})`);
  console.log(`innings 2 done: status=${m.status} result=${m.result}`);

  step('super over 1: 6-6 -> still tied');
  const so1 = (await req('POST', `/matches/${matchId}/super-overs`, { type: 'standard', tossWinnerTeamId: smokeTeam.id, tossChoice: 'bat' }, A.token)).superOver;
  await req('POST', `/matches/${matchId}/super-overs/${so1.id}/begin`, {}, A.token);
  for (const r of [3, 3, 0, 0, 0, 0]) {
    await req('POST', `/matches/${matchId}/super-overs/${so1.id}/ball`, { superOverId: so1.id, batsmanId: smokeP2, bowlerId: rP(1), runs: r }, A.token);
  }
  for (let i = 0; i < 6; i++) {
    try {
      await req('POST', `/matches/${matchId}/super-overs/${so1.id}/ball`, { superOverId: so1.id, batsmanId: rP(1), bowlerId: smokeP2, runs: i === 5 ? 0 : [3, 3, 0, 0, 0][i] }, A.token);
    } catch (e) {
      if (i === 5 && e.status === 400 && /still tied/i.test(e.message)) { console.log(`SO1 last ball correctly rejected: ${e.message}`); break; }
      throw e;
    }
  }
  await req('POST', `/matches/${matchId}/tie`, {}, A.token);
  m = await req('GET', `/matches/${matchId}`, undefined, A.token);
  console.log(`after SO1: status=${m.status}`);

  step('super over 2: Rival wins 11-10');
  const so2 = (await req('POST', `/matches/${matchId}/super-overs`, { type: 'tie_breaker', tossWinnerTeamId: smokeTeam.id, tossChoice: 'bat' }, A.token)).superOver;
  await req('POST', `/matches/${matchId}/super-overs/${so2.id}/begin`, {}, A.token);
  for (const r of [4, 3, 3, 0, 0, 0]) {
    await req('POST', `/matches/${matchId}/super-overs/${so2.id}/ball`, { superOverId: so2.id, batsmanId: smokeP2, bowlerId: rP(1), runs: r }, A.token);
  }
  for (const r of [4, 4, 3, 0, 0, 0]) {
    const res = await req('POST', `/matches/${matchId}/super-overs/${so2.id}/ball`, { superOverId: so2.id, batsmanId: rP(1), bowlerId: smokeP2, runs: r }, A.token);
    if (res?.superOver?.status === 'completed') break;
  }
  m = await req('GET', `/matches/${matchId}`, undefined, A.token);
  if (m.status !== 'completed' || m.winningTeamId !== rivalTeam.id) {
    throw new Error(`expected completed/rival win, got ${m.status} winner=${m.winningTeamId}`);
  }
  console.log(`match completed: winner=rival result="${m.result}"`);

  step('stats');
  await req('PATCH', `/stats/match/${matchId}/calculate`, {}, A.token);
  const perfs = await req('GET', `/stats/match/${matchId}/performances`, undefined, A.token);
  const top = [...perfs].sort((x, y) => y.runsScored - x.runsScored)[0];
  await req('PATCH', `/stats/match/${matchId}/player-of-match/${top.player.id}`, {}, A.token);
  console.log(`performances=${perfs.length} POTM=${top.player.name} ${top.runsScored}r`);

  console.log(`\n==== SEED OK ====\nMATCH_ID=${matchId}\nRun: BASE=${BASE} MATCH_ID=${matchId} node scripts/e2e-phase5.mjs`);
}

main().catch((e) => {
  console.error('SEED FAIL:', e.status || '', e.message);
  if (e.path) console.error('AT:', e.path);
  process.exit(1);
});
