# Decision records

Why XAC is built the way it is, one decision per file, rejected alternatives included. New
decisions get the next number; superseded ones stay and gain a forward link.

1. [Enforcement without lifecycle hooks](0001-no-lifecycle-hooks.md)
2. [Memory writes are milestone-driven and never silent](0002-milestone-driven-memory-writes.md)
3. [Installer copies and parks conflicts, never overwrites](0003-installer-copies-and-parks-conflicts.md) — amended by 12
4. [Provenance comments allowed, narration banned](0004-provenance-comments-allowed-narration-banned.md)
5. [Tickets move through three horizon directories](0005-tickets-move-through-three-horizons.md)
6. [Design mocks are executable specs, not source](0006-design-mocks-are-specs-not-source.md)
7. [The product lives in template/, apart from the factory](0007-template-directory-separates-product-from-factory.md) — amended by 12
8. [Lifecycle is conversational, not mechanical](0008-lifecycle-is-conversational.md)
9. [Retrieval is a maintained index, not a search engine](0009-retrieval-is-a-maintained-index.md)
10. [Harness support is a contract with reference adapters](0010-harness-support-is-a-contract.md) — superseded by 12
11. [No global scope — XAC knows only what the repo knows](0011-no-global-scope.md)
12. [AGENTS.md is the entry point; XAC lives in memory-bank/_xac/](0012-agents-md-is-the-entry-point.md)

Records 8 through 11 come out of the study in
[`../plans/ai-memory-convergence.md`](../plans/ai-memory-convergence.md), which holds the
reasoning and the workstreams behind them. Record 12 revises that plan: it supersedes 10 and
amends 3 and 7.
