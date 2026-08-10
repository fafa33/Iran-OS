# Iran-OS Licensing Transition Checklist

This checklist governs the transition away from the repository's historical MIT license toward a source-available model that preserves source transparency while reserving commercial, institutional, and governmental deployment rights.

## Gate A — Copyright ownership

- [x] Confirm human contributor history and copyright ownership for project-authored source files. Repository owner confirms no human contributor other than the copyright holder for project-authored material.
- [x] Identify third-party material/dependencies separately from project-authored source; third-party boundaries are recorded in `THIRD_PARTY_NOTICES.md` and per-file/import notices remain authoritative.
- [x] Define explicit inbound contribution terms for future contributors in `CONTRIBUTION-LICENSE.md`.

## Gate B — Third-party licensing

- [x] Inventory direct production and development dependency families from package manifests/lockfiles.
- [x] Confirm that project relicensing does not attempt to override dependency licenses.
- [x] Preserve required third-party copyright/license notices as a repository rule.
- [x] Require a current exact-release dependency-license inventory before production/institutional/commercial distribution.

## Gate C — Historical-license boundary

- [x] Record the licensing branch point: `3fd324cffb9f6096189cf3e8e1c4f2cd44838961`.
- [x] Record the actual final MIT `main` baseline before transition: `0c0553e1ae6d500881dabef6379697406c88df97`.
- [x] Record the first source-available repository boundary in `LICENSING-BOUNDARY.md` as the PR #130 merge result / subsequent release derived from it.
- [x] Preserve an explicit statement that the new license is prospective and does not purport to retroactively revoke rights granted with historical MIT copies.

## Gate D — Replacement-license requirements

The replacement license is implemented in `LICENSE-SOURCE-AVAILABLE.md`. The repository owner has reviewed and expressly adopted the source-available policy for this project. Independent qualified software/IP legal review remains recommended, especially before commercial/institutional licensing or enforcement, but is not represented as having occurred.

- [x] Source remains publicly viewable.
- [x] Personal study, research, security review, and non-commercial evaluation are permitted.
- [x] Commercial use requires separate written permission.
- [x] Paid resale, sublicensing, hosted/managed service use, and paid derivative offerings require separate written permission.
- [x] Production deployment by companies requires separate written permission.
- [x] Government, public-authority, intergovernmental, and institutional deployment requires separate written permission.
- [x] National/public-sector adaptations require separate written permission.
- [x] Project name, marks, and official-implementation claims are not automatically licensed.
- [x] Third-party components remain under their own licenses.
- [x] Warranty/liability disclaimer is included.
- [x] Termination/remedy language for violations is included.
- [x] Repository owner adoption decision recorded; no claim is made that qualified external legal review has occurred.

## Gate E — Repository consistency

- [x] Replace root `LICENSE` atomically with the source-available license on the transition branch.
- [x] Update README license/status wording.
- [x] Add `THIRD_PARTY_NOTICES.md`.
- [x] Add explicit future contribution terms and link them from contribution guidance.
- [x] Update root/app package metadata and root lockfile metadata.
- [x] Include the operative license inside the `app` package so packaged artifacts do not reference a license outside their package root.
- [x] Update canonical/public documentation where OSI-style `open source` wording would be inaccurate.
- [x] Update public outreach templates and conduct documentation to the `publicly auditable, source-available, open-participation` terminology.
- [x] Migrate operative project-owned SPDX headers from `MIT` to `LicenseRef-IranOS-Source-Available-1.0`.
- [x] Run automated consistency checks for the defined project-owned source surfaces.
- [x] Run the full project test suite as a no-functional-regression gate.

## Gate F — Release boundary

- [x] Owner approval for adoption of the source-available license has been given.
- [ ] Merge PR #130 after normal repository checks and all review conversations are resolved.
- [ ] Tag or otherwise record the first source-available release after merge.
- [ ] State the effective license clearly in that release's notes.

## Verification evidence

The one-shot transition workflow completed successfully on 2026-08-10. It applied the migration, passed consistency checks, ran the full `npm test` suite, committed the atomic transition, and removed itself. The resulting transition commit was `5b34b06e0fd4ba3b2798d6636954629b9037eee3`; subsequent branch synchronization and review-finding fixes preserve the zero-functional-change scope and are revalidated by normal CI/Slither checks.

## Rule

Do not merge a partial or internally contradictory license transition. No claim is made that external qualified legal review has occurred; such review remains recommended for future commercial/institutional licensing and enforcement strategy.
