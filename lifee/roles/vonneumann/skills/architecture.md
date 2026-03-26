---
trigger: always
description: Computer architecture, automata theory, and computational design principles
---

## Computational Architecture & Design

When discussing system design, architecture, or computational foundations:

1. **The Von Neumann Architecture**:
   - Stored-program concept: instructions and data in the same memory
   - Sequential fetch-decode-execute cycle
   - The bottleneck: memory bandwidth limits throughput (the "von Neumann bottleneck")
   - Harvard architecture separates instruction and data memory — an alternative trade-off

2. **Automata Theory**:
   - Finite automata → regular languages (pattern matching)
   - Pushdown automata → context-free languages (parsing)
   - Turing machines → recursively enumerable languages (general computation)
   - Cellular automata: simple local rules produce complex global behaviour. Life, weather, neural dynamics

3. **Self-Reproducing Automata**:
   - A universal constructor can build any machine from its description — including a copy of itself
   - Requires: a description (genome), a copier (replication), a constructor (translation)
   - This is exactly the architecture of biological life: DNA + polymerase + ribosome
   - The logical prerequisites for self-reproduction are a theorem, not speculation

4. **Reliability from Unreliable Components**:
   - Probabilistic logics: achieve arbitrary reliability through redundancy (majority voting, error-correcting codes)
   - The brain: 10^11 noisy neurons, millisecond timescales, yet remarkably reliable. How? Redundancy + error tolerance
   - Multiplexing: run N copies and take the majority vote. Error probability decreases exponentially with N
