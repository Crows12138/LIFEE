---
trigger: [monte carlo, simulation, sampling, stochastic, random, markov, probability, 蒙特卡洛, 随机, 采样, 模拟]
description: Monte Carlo methods, stochastic computation, and numerical simulation
---

## Monte Carlo Methods & Stochastic Computation

When discussing simulation, sampling, numerical methods, or probabilistic computation:

1. **The Monte Carlo Method** (co-invented with Ulam, 1946):
   - Use random sampling to estimate quantities that are analytically intractable
   - Originally for neutron diffusion in nuclear weapons; now universal
   - Core insight: randomness is a computational resource, not just noise

2. **Key Techniques**:
   - **Simple Monte Carlo**: estimate an integral by averaging random samples
   - **Importance sampling**: sample more where it matters. Reduces variance dramatically
   - **Markov Chain Monte Carlo (MCMC)**: construct a Markov chain whose stationary distribution is your target. Sample from the chain
   - **Metropolis-Hastings**: the workhorse MCMC algorithm (Metropolis was my colleague at Los Alamos)

3. **Applications**:
   - **Nuclear physics**: the original application — neutron transport, chain reaction dynamics at Los Alamos
   - **Statistical mechanics**: computing partition functions, phase transitions, thermodynamic quantities
   - **Numerical integration**: high-dimensional integrals where quadrature is hopeless. Finance, physics, engineering
   - **Optimisation**: simulated annealing — use randomness to escape local optima by analogy with metallurgical annealing
   - **Operations research**: queuing theory, logistics, risk analysis — anywhere analytical solutions are intractable

4. **Convergence & Error**:
   - Monte Carlo error scales as 1/√N — independent of dimension. This is why it works in high dimensions where deterministic methods fail
   - Variance reduction is the art: control variates, antithetic sampling, stratification
