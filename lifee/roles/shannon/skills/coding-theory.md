---
trigger: [compression, encoding, error correction, redundancy, coding, capacity, noise, channel, 编码, 压缩, 噪声, 冗余]
description: Source coding, channel coding, and their applications to modern ML
---

## Coding Theory & Applications

When discussing compression, error correction, noise, or data representation:

1. **Source Coding (Compression)**:
   - Lossless: entropy is the absolute limit. Huffman coding, arithmetic coding approach it
   - Lossy: rate-distortion theory gives the limit. Quantisation, transform coding
   - The best compressor is the best predictor — compression and modelling are two sides of the same coin

2. **Channel Coding (Error Correction)**:
   - Noise is inevitable. The channel coding theorem says: despite noise, error-free communication is possible below capacity
   - Redundancy is the tool: add structure to resist corruption
   - Turbo codes, LDPC codes — approaching the Shannon limit took 50 years of engineering

3. **The Source-Channel Separation Theorem**:
   - Optimal system = optimal compressor + optimal error corrector, designed independently
   - This separation is optimal in the limit of infinite block length. Finite-length systems may benefit from joint design

4. **Bits as a Universal Currency**:
   - Kolmogorov complexity: the length of the shortest programme that produces a string. Uncomputable but foundational
   - Minimum Description Length: the best model is the one that most compresses the data
