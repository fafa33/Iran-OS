# Reviewer Primer

## Read This Before Reviewing Iran-OS

Iran-OS is not a DeFi protocol, DAO, governance token system, central bank simulator, or yield-maximization platform.

Iran-OS is a sovereign resilience infrastructure designed to minimize constitutional failure, monetary abuse, authority capture, treasury misuse, oracle dependency, and continuity breakdown during crisis conditions.

Many design decisions that may appear unusual from a conventional blockchain perspective are intentional constitutional security properties.

---

# Review Order

Reviews should follow this order:

1. Constitutional Doctrine
2. Sovereign Architecture
3. Protocol Specifications
4. Smart Contracts
5. Tests

Reviewing contracts without understanding doctrine will likely produce incorrect conclusions.

---

# Core Design Assumptions

## Kernel Immutability

Kernel immutability is a security feature.

The Kernel represents constitutional foundations and is intentionally protected from upgrade mechanisms.

Recommendations to make the Kernel upgradeable should be considered carefully and are generally incompatible with project objectives.

---

## Oracle Non-Sovereignty

Oracles provide information.

Oracles do not create authority.

Oracle signals must never:

- modify constitutional state
- create governance authority
- authorize treasury actions
- authorize reserve changes
- perform final freeze decisions

Oracle data is evidence, not sovereignty.

---

## Human Constitutional Judgment

Automation assists constitutional processes.

Automation does not replace constitutional judgment.

Final constitutional actions must not be delegated entirely to automated systems.

---

## Fixed Constitutional Thresholds

Certain thresholds are constitutional safeguards rather than operational parameters.

Examples include:

- reserve protection ratios
- constitutional approval thresholds
- emergency timeout protections
- treasury integrity limits

Recommendations to convert constitutional safeguards into configurable parameters should be evaluated as constitutional risks.

---

## Monetary Discipline

Iran-OS prioritizes stability and continuity over flexibility.

The monetary framework exists to protect citizen purchasing power and prevent monetary abuse.

Flexibility is not automatically considered an improvement.

---

# Common Review Errors

The following recommendations are frequently incorrect within the Iran-OS design model:

❌ Make the Kernel upgradeable

❌ Give oracles emergency authority

❌ Allow dynamic reserve ratios

❌ Convert constitutional thresholds into configuration values

❌ Fully automate final freeze decisions

❌ Prioritize efficiency over constitutional resilience

❌ Treat treasury controls as ordinary DeFi governance

---

# What Reviewers Should Focus On

Reviewers are encouraged to focus on:

- authority isolation
- privilege escalation paths
- oracle influence boundaries
- treasury mutation integrity
- reserve protection enforcement
- trigger neutrality
- replay resistance
- state immutability guarantees
- continuity during failure scenarios
- constitutional invariant preservation

---

# Review Rule

Before proposing any architectural change, verify that the recommendation does not weaken constitutional invariants, monetary discipline, sovereignty boundaries, treasury integrity, or continuity guarantees.

A recommendation that improves flexibility while weakening constitutional resilience should be treated as a potential regression.