# Iran-OS Licensing Transition Checklist

This checklist governs the transition away from the repository's historical MIT license toward a source-available model that preserves source transparency while reserving commercial, institutional, and governmental deployment rights.

## Gate A — Copyright ownership

- [ ] Confirm human contributor history and copyright ownership for project-authored source files.
- [ ] Identify any files copied or adapted from third parties rather than merely imported as dependencies.
- [ ] Record any contributor agreement or separate licensing terms if they exist.

## Gate B — Third-party licensing

- [ ] Inventory direct production and development dependencies from package manifests/lockfiles.
- [ ] Confirm that project relicensing does not attempt to override dependency licenses.
- [ ] Preserve required copyright and license notices.
- [ ] Flag copyleft or source-redistribution obligations, if any.

## Gate C — Historical-license boundary

- [ ] Record the last commit/release distributed under the MIT License.
- [ ] Record the first commit/release distributed under the replacement source-available license.
- [ ] Preserve an explicit statement that the new license is prospective and does not purport to retroactively revoke rights granted with historical MIT copies.

## Gate D — Replacement-license requirements

The replacement license must be reviewed against these project requirements:

- [ ] Source remains publicly viewable.
- [ ] Personal study, research, security review, and non-commercial evaluation are permitted.
- [ ] Commercial use requires separate written permission.
- [ ] Paid resale, sublicensing, hosted/managed service use, and paid derivative offerings require separate written permission.
- [ ] Production deployment by companies requires separate written permission.
- [ ] Government, public-authority, intergovernmental, and institutional deployment requires separate written permission.
- [ ] National/public-sector adaptations require separate written permission.
- [ ] Project name, marks, and official-implementation claims are not automatically licensed.
- [ ] Third-party components remain under their own licenses.
- [ ] Warranty/liability disclaimer is included.
- [ ] Termination/remedy language for violations is included.
- [ ] Governing-law / dispute language is reviewed by qualified counsel before final adoption if included.

## Gate E — Repository consistency

- [ ] Replace root `LICENSE` only after Gates A–D are complete.
- [ ] Update README license/status section.
- [ ] Add or update NOTICE / THIRD_PARTY_NOTICES as required.
- [ ] Update contribution guidance so inbound contribution terms are explicit.
- [ ] Update package metadata license identifiers if present.
- [ ] Update documentation that calls the project "MIT licensed" or "open source" if that statement would become inaccurate.
- [ ] Run repository search for `MIT`, `MIT License`, and `open source` and review every hit for consistency.

## Gate F — Release boundary

- [ ] Merge the licensing-transition PR only after review.
- [ ] Tag or otherwise record the first source-available release.
- [ ] State the effective license clearly in the release notes.

## Rule

Do not merge a partial license transition that leaves contradictory licensing signals in the repository.
