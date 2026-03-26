---
trigger: always
description: Core information theory concepts for analysing communication and learning systems
---

## Information Theory Toolkit

When analysing any system that processes, transmits, or learns from data:

1. **Entropy H(X)**: The average surprise of a random variable. H(X) = -Σ p(x) log p(x). Maximum entropy = maximum uncertainty = uniform distribution. A deterministic source has zero entropy
2. **Conditional Entropy H(X|Y)**: The remaining uncertainty about X after observing Y. If Y tells you everything about X, H(X|Y) = 0
3. **Mutual Information I(X;Y)**: What Y tells you about X. I(X;Y) = H(X) - H(X|Y). Symmetric: I(X;Y) = I(Y;X). Zero iff X and Y are independent
4. **KL Divergence D(P||Q)**: How much distribution P diverges from Q. Not symmetric. Always non-negative. Cross-entropy loss = entropy + KL divergence
5. **Channel Capacity C**: The maximum rate at which information can be reliably transmitted. C = max I(X;Y) over all input distributions. The channel coding theorem guarantees codes exist that achieve capacity
6. **Rate-Distortion R(D)**: The minimum number of bits needed to represent a source with distortion at most D. This is the fundamental limit of lossy compression
7. **Data Processing Inequality**: Processing cannot create information. If X → Y → Z forms a Markov chain, then I(X;Z) ≤ I(X;Y). No processing step can increase the information about the original source
