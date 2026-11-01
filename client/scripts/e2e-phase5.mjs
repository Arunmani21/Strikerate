/* Phase 5 E2E: drive match to tie -> super over 1 tie -> super over 2 winner -> stats.
   Run: node scripts/e2e-phase5.mjs  (server must be on :3000) */
const BASE = process.env.BASE || 'http://localhost:3000';
const MATCH = process.env.MATCH_ID || '468075ea-cf89-4dfa-a3af-c45be20a5ccf';

const results = [];
const ok = (name, cond, detail) => {
  results.push({ name, pass: !!cond });
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
};

async function req(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(
      Array.isArray(data.message) ? data.message.join(' · ') : (data.message || res.statusText),
    );
    e.status = res.status;
    e.path = `${method} ${path} body=${JSON.stringify(body)}`;
    throw e;
  }
  return data.data;
}
async function tryReq(method, path, body, token) {
  try {
    return { res: await req(method, path, body, token) };
  } catch (e) {
    return { err: e };
  }
}

async function main() {
  const a = await req('POST', '/auth/login', {
    email: 'smoke.test.sr@example.com',
    password: 'Striker!x7qZm',
  });
  const T = a.access_token;

  const match = await req('GET', `/matches/${MATCH}`, undefined, T);
  const smoke = match.teamAId;
  const rival = match.teamBId;
  const xiS = await req('GET', `/matches/${MATCH}/playing11/${smoke}`, undefined, T);
  const xiR = await req('GET', `/matches/${MATCH}/playing11/${rival}`, undefined, T);
  const idOf = (list, name) => list.find((p) => p.name === name)?.id;
  const rahul = idOf(xiS, 'Rahul S');
  const smokeP2 = idOf(xiS, 'Smoke Player 2');
  const smokeP3 = idOf(xiS, 'Smoke Player 3');
  const rP = (n) => idOf(xiR, `Rival Player ${n}`);
  console.log(`XI: smoke ${xiS.length}, rival ${xiR.length}`);

  /* ---- Phase A: innings 1 all out (skip if already past) ---- */
  let m = await req('GET', `/matches/${MATCH}`, undefined, T);
  let cur = (await req('GET', `/innings/match/${MATCH}`, undefined, T)).find(
    (i) => !i.isCompleted,
  );

  if (cur && cur.inningsNumber === 1) {
    const outOrder = [4, 5, 6, 7, 8, 9, 10, 11, 1]; // Rival P3 stays not out
    let outIdx = 0;
    for (;;) {
      cur = (await req('GET', `/innings/match/${MATCH}`, undefined, T)).find(
        (i) => !i.isCompleted,
      );
      if (!cur || cur.inningsNumber !== 1 || cur.totalWickets >= 10) break;
      const overNo = Math.floor(cur.totalBalls / 6); // 1 = over 2, 2 = over 3
      const bowler = overNo % 2 === 1 ? smokeP2 : rahul;
      const batsman = idOf(xiR, `Rival Player ${outOrder[outIdx++ % outOrder.length]}`);
      await req('POST', '/scoring/ball', {
        inningsId: cur.id,
        batsmanId: batsman,
        bowlerId: bowler,
        runs: 0,
        isWicket: true,
        wicketType: 'bowled',
      }, T);
    }
    m = await req('GET', `/matches/${MATCH}`, undefined, T);
    ok('A1 innings1 all out -> innings_break', m.status === 'innings_break', `status=${m.status}`);
    ok('A2 target = 15', m.target === 15, `target=${m.target}`);
  } else {
    console.log('Phase A skipped — innings 1 already complete');
  }

  /* ---- Phase B: innings 2, Smoke ties at 15 all out ---- */
  if (m.status === 'tied' || m.status === 'completed') {
    console.log(`Phase B skipped — match already ${m.status}`);
  } else {
    let inn2 = (await req('GET', `/innings/match/${MATCH}`, undefined, T)).find(
      (i) => !i.isCompleted,
    );
    if (!inn2) {
      inn2 = await req('POST', `/innings/match/${MATCH}/start`, {
        battingTeamId: smoke,
        bowlingTeamId: rival,
        inningsNumber: 2,
      }, T);
    }
    await req('PATCH', `/innings/${inn2.id}/set-batsmen`, {
      strikerId: smokeP2,
      nonStrikerId: smokeP3,
    }, T);
    await req('PATCH', `/innings/${inn2.id}/set-bowler`, { bowlerId: rP(1) }, T);
    const sId = (n) => idOf(xiS, n === 1 ? 'Rahul S' : `Smoke Player ${n}`);
    for (;;) {
      inn2 = (await req('GET', `/innings/match/${MATCH}`, undefined, T)).find(
        (i) => !i.isCompleted,
      );
      if (!inn2 || inn2.totalWickets >= 10) break;
      const stillChasing = inn2.totalRuns < 15;
      const body = {
        inningsId: inn2.id,
        batsmanId: stillChasing
          ? (inn2.totalBalls % 2 === 0 ? smokeP2 : smokeP3)
          : sId(4 + (inn2.totalWickets % 8)),
        bowlerId: rP((inn2.totalBalls % 5) + 1),
        runs: stillChasing ? 3 : 0,
      };
      if (!stillChasing) {
        body.isWicket = true;
        body.wicketType = 'bowled';
      }
      await req('POST', '/scoring/ball', body, T);
    }
    m = await req('GET', `/matches/${MATCH}`, undefined, T);
    ok('B1 15 all out -> tied', m.status === 'tied', `status=${m.status}`);
    ok('B2 result mentions tied', /tied/i.test(m.result || ''), m.result);
  }

  /* ---- Phase C: super over 1 -> ties again ---- */
  const existingSOs = await req('GET', `/matches/${MATCH}/super-overs`, undefined, T);
  if (m.status === 'completed' && existingSOs.length > 0) {
    console.log('Phases C/D skipped — super overs already decided the match');
  } else {
  const so1 = (await req('POST', `/matches/${MATCH}/super-overs`, {
    type: 'standard',
    tossWinnerTeamId: smoke,
    tossChoice: 'bat',
  }, T)).superOver;
  ok('C1 SO1 created standard #1', so1.superOverNumber === 1 && so1.type === 'standard', so1.type);
  const so1b = (await req('POST', `/matches/${MATCH}/super-overs/${so1.id}/begin`, {}, T)).superOver;
  console.log(`SO1 battingFirst=${so1b.teamABattingFirst ? 'smoke' : 'rival'}`);
  for (const r of [3, 3, 0, 0, 0, 0]) {
    await req('POST', `/matches/${MATCH}/super-overs/${so1.id}/ball`, {
      superOverId: so1.id, batsmanId: smokeP2, bowlerId: rP(1), runs: r,
    }, T);
  }
  const soSeq = [3, 3, 0, 0, 0, 0];
  for (let i = 0; i < soSeq.length; i++) {
    const r = soSeq[i];
    if (i === soSeq.length - 1) {
      const { err } = await tryReq('POST', `/matches/${MATCH}/super-overs/${so1.id}/ball`, {
        superOverId: so1.id, batsmanId: rP(1), bowlerId: smokeP2, runs: r,
      }, T);
      ok('C2 SO1 ends level -> 400 still tied', !!err && err.status === 400 && /still tied/i.test(err.message || ''), err ? err.message : 'unexpected success');
    } else {
      await req('POST', `/matches/${MATCH}/super-overs/${so1.id}/ball`, {
        superOverId: so1.id, batsmanId: rP(1), bowlerId: smokeP2, runs: r,
      }, T);
    }
  }
  const tieRes = await req('POST', `/matches/${MATCH}/tie`, {}, T);
  m = await req('GET', `/matches/${MATCH}`, undefined, T);
  ok('C3 manual tie -> tied', m.status === 'tied', tieRes.message);

  /* ---- Phase D: super over 2 -> Rival wins ---- */
  const so2 = (await req('POST', `/matches/${MATCH}/super-overs`, {
    type: 'tie_breaker',
    tossWinnerTeamId: smoke,
    tossChoice: 'bat',
  }, T)).superOver;
  ok('D1 SO2 created tie_breaker #2', so2.superOverNumber === 2 && so2.type === 'tie_breaker', so2.type);
  await req('POST', `/matches/${MATCH}/super-overs/${so2.id}/begin`, {}, T);
  for (const r of [4, 3, 3, 0, 0, 0]) {
    await req('POST', `/matches/${MATCH}/super-overs/${so2.id}/ball`, {
      superOverId: so2.id, batsmanId: smokeP2, bowlerId: rP(1), runs: r,
    }, T);
  }
  for (const r of [4, 4, 3, 0, 0, 0]) {
    const { res } = await tryReq('POST', `/matches/${MATCH}/super-overs/${so2.id}/ball`, {
      superOverId: so2.id, batsmanId: rP(1), bowlerId: smokeP2, runs: r,
    }, T);
    if (res && res.superOver && res.superOver.status === 'completed') break;
  }
  m = await req('GET', `/matches/${MATCH}`, undefined, T);
  ok('D2 SO2 winner -> match completed, rival wins', m.status === 'completed' && m.winningTeamId === rival, `status=${m.status}`);
  ok('D3 result = super over win', m.result === 'Match won in super over' && m.marginType === 'super over', m.result);
  }

  /* ---- Phase E: stats ---- */
  await req('PATCH', `/stats/match/${MATCH}/calculate`, {}, T);
  const perfs = await req('GET', `/stats/match/${MATCH}/performances`, undefined, T);
  ok('E1 performances calculated', perfs.length === 22, `${perfs.length} rows`);
  await req('PATCH', `/stats/match/${MATCH}/calculate`, {}, T);
  const perfs2 = await req('GET', `/stats/match/${MATCH}/performances`, undefined, T);
  const sum1 = perfs.reduce((s, p) => s + p.runsScored, 0);
  const sum2 = perfs2.reduce((s, p) => s + p.runsScored, 0);
  const card = await req('GET', `/scoring/scorecard/${MATCH}`, undefined, T);
  const offBat = card.innings
    .flatMap((i) => i.balls)
    .filter((b) => !b.isWide && !b.isBye && !b.isLegBye)
    .reduce((s, b) => s + b.runs, 0);
  ok('E2 calculate idempotent + matches ball events', sum1 === sum2 && sum1 === offBat,
    `perf runs ${sum1} -> ${sum2}, off-bat ball runs ${offBat}`);

  const top = [...perfs2].sort((x, y) => y.runsScored - x.runsScored)[0];
  await req('PATCH', `/stats/match/${MATCH}/player-of-match/${top.player.id}`, {}, T);
  const perfs3 = await req('GET', `/stats/match/${MATCH}/performances`, undefined, T);
  const potm = perfs3.find((p) => p.isPlayerOfMatch);
  ok('E3 POTM set', potm && potm.player.id === top.player.id, `${potm?.player.name} ${potm?.runsScored}r`);

  const career = await req('GET', `/stats/player/${top.player.id}/career`, undefined, T);
  console.log(`career ${top.player.name}: M=${career.totalMatches} R=${career.totalRuns} HS=${career.highestScore} avg=${career.careerBattingAvg} sr=${career.careerStrikeRate} wk=${career.totalWickets}`);
  ok('E4 career sane', career.totalMatches >= 1 && Number(career.totalRuns) === top.runsScored, `runs=${career.totalRuns}`);

  const pmatches = await req('GET', `/stats/player/${top.player.id}/matches`, undefined, T);
  ok('E5 player matches row', pmatches.length >= 1 && pmatches.some((r) => r.match.id === MATCH), `${pmatches.length} rows`);

  const histS = await req('GET', `/stats/team/${smoke}/history`, undefined, T);
  const histR = await req('GET', `/stats/team/${rival}/history`, undefined, T);
  const rowS = histS.find((h) => h.matchId === MATCH);
  const rowR = histR.find((h) => h.matchId === MATCH);
  ok('E6 history smoke=lost rival=won', rowS?.result === 'lost' && rowR?.result === 'won', `smoke=${rowS?.result} rival=${rowR?.result}`);

  const soList = await req('GET', `/matches/${MATCH}/super-overs`, undefined, T);
  console.log('super overs:', soList.map((s) =>
    `#${s.superOverNumber} ${s.status} ${s.teamARuns}/${s.teamAWickets} v ${s.teamBRuns}/${s.teamBWickets}${s.wonByTeamId ? ' won=' + (s.wonByTeamId === smoke ? 'smoke' : 'rival') : ''}`,
  ).join(' | '));

  const fails = results.filter((r) => !r.pass);
  console.log(`\n==== ${results.length - fails.length}/${results.length} passed ====${fails.length ? '\nFAILURES:\n' + fails.map((f) => `- ${f.name}`).join('\n') : ''}`);
  if (fails.length) process.exit(1);
}

main().catch((e) => {
  console.error('SCRIPT FAIL:', e.status || '', e.message);
  if (e.path) console.error('AT:', e.path);
  process.exit(1);
});
