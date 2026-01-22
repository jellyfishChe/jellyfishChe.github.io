// Logistic model utilities
// dp/dt = r * p * (1 - p / K)

/**
 * logistic derivative dp/dt
 * @param {number} p - population
 * @param {number} r - growth rate
 * @param {number} K - carrying capacity
 * @returns {number}
 */
function logisticDerivative(p, r, K) {
	return r * p * (1 - p / K);
}

function rk4Step(p, dt, r, K) {
	const k1 = logisticDerivative(p, r, K);
	const k2 = logisticDerivative(p + 0.5 * dt * k1, r, K);
	const k3 = logisticDerivative(p + 0.5 * dt * k2, r, K);
	const k4 = logisticDerivative(p + dt * k3, r, K);
	return p + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
}

function simulate(params, stepper) {
	const { p0 = 1, r = 0.1, K = 100, tMax = 100, dt = 0.1 } = params;
	const result = [];
	let p = p0;
	let t = 0;
	result.push({ t, p });
	const steps = Math.max(1, Math.floor(tMax / dt));
	for (let i = 0; i < steps; i++) {
		p = stepper(p, dt, r, K);
		t += dt;
		result.push({ t, p });
	}
	return result;
}

function simulateRK4(params) {
	return simulate(params, rk4Step);
}

// expose for browser use
if (typeof window !== 'undefined') {
	window.logistic = window.logistic || {};
	window.logistic.logisticDerivative = logisticDerivative;
	window.logistic.simulateRK4 = simulateRK4;
}

// export for module environments
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		logisticDerivative,
		simulateRK4,
	};
}