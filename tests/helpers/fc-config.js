// Konfiguracja fast-check z env (nightly: PROP_SEED, FC_NUM_RUNS). M1-audytor-generalny-038.
// PROP_SEED nieliczbowe (np. „random”) → ziarno z zegara, wypisywane, żeby porażkę dało się powtórzyć.
function resolveFastCheckConfig(env, now = Date.now) {
  const parsed = Number(env.PROP_SEED);
  const seed = env.PROP_SEED !== undefined && env.PROP_SEED !== '' && Number.isFinite(parsed) ? parsed : now();
  const config = { seed };
  const runs = Number(env.FC_NUM_RUNS);
  if (env.FC_NUM_RUNS !== undefined && Number.isInteger(runs) && runs > 0) config.numRuns = runs;
  return config;
}

module.exports = { resolveFastCheckConfig };
