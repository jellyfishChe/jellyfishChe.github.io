// simple SIR model
// dS/dt = -beta * S * I / N
// dI/dt = beta * S * I / N - gamma * I
// dR/dt = gamma * I
/**
 * SIR model derivatives
 * @param {number} S - susceptible population
 * @param {number} I - infected population
 * @param {number} R - recovered population
 * @param {number} N - total population
 * @param {number} beta - infection rate
 * @param {number} gamma - recovery rate
 * @returns {object} - {dS, dI, dR}
 */

function sirDerivatives(S, I, R, N, beta, gamma) {
  return {
    dS: -beta * S * I / N,
    dI: beta * S * I / N - gamma * I,
    dR: gamma * I
  };
}
/**
 * single RK4 step for SIR model
 * @param {number} S - susceptible population
 * @param {number} I - infected population
 * @param {number} R - recovered population
 * @param {number} dt - time step
 * @param {number} N - total population
 * @param {number} beta - infection rate
 * @param {number} gamma - recovery rate
 * @returns {object} - {S, I, R}
 */
function rk4Step(S, I, R, dt, N, beta, gamma) {
  const k1 = sirDerivatives(S, I, R, N, beta, gamma);
  const k2 = sirDerivatives(
    S + 0.5 * dt * k1.dS,
    I + 0.5 * dt * k1.dI,
    R + 0.5 * dt * k1.dR,
    N, beta, gamma
  );
  const k3 = sirDerivatives(
    S + 0.5 * dt * k2.dS,
    I + 0.5 * dt * k2.dI,
    R + 0.5 * dt * k2.dR,
    N, beta, gamma
  );
  const k4 = sirDerivatives(
    S + dt * k3.dS,
    I + dt * k3.dI,
    R + dt * k3.dR,
    N, beta, gamma
  );
  return {
    S: S + (dt / 6) * (k1.dS + 2 * k2.dS + 2 * k3.dS + k4.dS),
    I: I + (dt / 6) * (k1.dI + 2 * k2.dI + 2 * k3.dI + k4.dI),
    R: R + (dt / 6) * (k1.dR + 2 * k2.dR + 2 * k3.dR + k4.dR)
  };
}

/**
 * simulate SIR model using RK4
 * params: {S0, I0, R0, N, beta, gamma, tMax, dt}
 * returns array of {t, S, I, R}
 */
function simulateSIR(params) {
  const {
    S0 = 999,
    I0 = 1,
    R0 = 0,
    N = S0 + I0 + R0,
    beta = 0.3,
    gamma = 0.1,
    tMax = 160,
    dt = 0.1
  } = params;
  const result = [];
  let S = S0;
  let I = I0;
  let R = R0;
  let t = 0;
  result.push({ t, S, I, R });
  const steps = Math.max(1, Math.floor(tMax / dt));
  for (let i = 0; i < steps; i++) {
    const next = rk4Step(S, I, R, dt, N, beta, gamma);
    S = next.S;
    I = next.I;
    R = next.R;
    t += dt;
    result.push({ t, S, I, R });
  }
  return result;
}

// expose for browser use
if (typeof window !== 'undefined') {
  window.sir = window.sir || {};
  window.sir.simulateSIR = simulateSIR;
}

// export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sirDerivatives,
    rk4Step,
    simulateSIR
  };
}
