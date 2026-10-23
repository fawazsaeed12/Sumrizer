export interface SampleLecture {
  id: string;
  title: string;
  subject: string;
  topic: string;
  notes: string;
}

export const SAMPLE_LECTURES: SampleLecture[] = [
  {
    id: "cs-distributed-systems",
    title: "CS 420: Raft Consensus & Distributed State Machines",
    subject: "Computer Science",
    topic: "Raft Consensus Algorithm",
    notes: `• Problem in distributed systems: Nodes can crash, network partitions happen (split-brain). How do multiple machines agree on values?
• Paxos is theoretically optimal but notoriously hard to understand and implement in real software.
• Raft was designed by Ongaro & Ousterhout (Stanford) specifically for *understandability*.
• Raft decomposes consensus into 3 independent subproblems:
  1. Leader Election (randomized election timeouts, 150-300ms, avoids split votes).
  2. Log Replication (Leader accepts client proposals, appends entry, sends AppendEntries RPC to followers).
  3. Safety invariants (Election Safety: at most one leader per term; Leader Append-Only: leader never overwrites or truncates its log).
• Quorum rule: Majority (N/2 + 1) must acknowledge an entry before it is committed to the state machine.
• What happens during network partition? The minority partition can elect a phantom leader, but cannot achieve quorum so can't commit writes. When partition heals, the term numbers reconcile.
• ⚠️ Exam note: Prof emphasized the Leader Completeness property: If a log entry is committed in a given term, it will be present in the logs of leaders for all higher-numbered terms.`,
  },
  {
    id: "bio-cellular-respiration",
    title: "BIO 210: Cellular Respiration & Chemiosmosis",
    subject: "Molecular Biology",
    topic: "Chemiosmotic ATP Synthesis & Electron Transport",
    notes: `• Aerobic respiration extracts energy from glucose: C6H12O6 + 6O2 -> 6CO2 + 6H2O + ~30-32 ATP.
• 4 main stages: Glycolysis (cytosol, 2 ATP net + 2 NADH), Pyruvate oxidation (mitochondrial matrix), Citric Acid / Krebs Cycle, and Oxidative Phosphorylation.
• Peter Mitchell's Chemiosmotic Hypothesis (Nobel Prize 1978): Energy coupling via electrochemical proton gradient across inner mitochondrial membrane.
• Electron Transport Chain (ETC): Complexes I, II, III, IV pump H+ ions from matrix into intermembrane space.
• Final electron acceptor is molecular O2, reduced to H2O. Without oxygen, ETC backs up and halts ATP synthesis.
• ATP Synthase is a rotary molecular motor! F0 subunit embedded in membrane acts as proton channel, causing rotation; F1 subunit in matrix catalyzes ADP + Pi -> ATP through conformational changes (Open, Loose, Tight states).
• Uncouplers like DNP (dinitrophenol) poke holes in the membrane: dissipates proton gradient without ATP synthesis, energy lost purely as heat (thermogenesis).
• ⚠️ Exam question hint: Why does 1 NADH yield ~2.5 ATP while 1 FADH2 yields only ~1.5 ATP? (FADH2 enters at Complex II, skipping Complex I proton pumping).`,
  },
  {
    id: "econ-game-theory",
    title: "ECON 305: Game Theory & Strategic Equilibrium",
    subject: "Economics",
    topic: "Nash Equilibrium & Mechanism Design",
    notes: `• Game theory analyzes strategic interactions between rational decision-makers.
• Core ingredients of a game: Players, Strategy sets, and Payoff matrices.
• Dominant strategy: A strategy that yields strictly higher payoff regardless of what opponents choose.
• Classic Prisoner's Dilemma: Both players have dominant strategy to defect/confess, leading to (Defect, Defect) equilibrium even though (Cooperate, Cooperate) is Pareto optimal. Real world examples: arms races, price wars, OPEC oil quotas.
• Nash Equilibrium definition: A strategy profile where NO player can strictly improve their payoff by unilaterally deviating.
• Pure vs. Mixed Strategies: Matching Pennies has no pure strategy Nash equilibrium, but has a unique mixed equilibrium (50/50 randomization).
• John Nash theorem (1950): Every finite game with finite players and finite strategies has at least one Nash equilibrium in mixed strategies.
• Mechanism design / Reverse Game Theory: Instead of predicting outcomes given rules, design rules/incentives so selfish actors achieve socially optimal outcomes (e.g., Vickrey second-price sealed-bid auctions encourage truthful bidding).`,
  },
  {
    id: "physics-quantum",
    title: "PHYS 330: Wave-Particle Duality & Quantum Tunneling",
    subject: "Modern Physics",
    topic: "Quantum Tunneling & Semiconductor Physics",
    notes: `• Classical mechanics vs Quantum mechanics: In classical physics, a particle cannot cross a potential energy barrier higher than its kinetic energy (E < V0).
• Wavefunction ψ(x) governed by Schrödinger equation: -ħ²/(2m) d²ψ/dx² + V(x)ψ = Eψ.
• Inside the barrier where V > E, the wavenumber k becomes imaginary, yielding an exponentially decaying evanescent wave: ψ(x) ~ e^(-αx), where α = sqrt(2m(V0 - E))/ħ.
• If the barrier is thin enough (few nanometers), the wavefunction does not decay to zero before reaching the other side! A finite probability amplitude exits the barrier.
• Tunneling transmission coefficient T ≈ 16(E/V0)(1 - E/V0) e^(-2αL). Exponential sensitivity to barrier width L!
• Real-world applications:
  1. Scanning Tunneling Microscopy (STM): picometer atomic resolution by measuring quantum tunneling current as a tip hovers above a surface.
  2. Flash memory & modern semiconductor transistors: gate dielectric leakage current is a fundamental physical limit due to tunneling.
  3. Nuclear alpha decay in heavy radioactive isotopes.`,
  },
];
