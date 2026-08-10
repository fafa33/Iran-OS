# Iran-OS Source-Available Licensing Options

## Project objective

Iran-OS wants to keep source visibility for transparency, research, security review, and non-commercial evaluation while preventing unlicensed commercial exploitation and unlicensed institutional/government production deployment.

That objective is not compatible with an OSI-style open-source license, because open-source licenses permit commercial use.

## Options reviewed

### MIT

Not suitable for the target policy. MIT permits use, copying, modification, distribution, sublicensing, and sale, subject primarily to preserving the copyright/license notice.

### GPL / AGPL

Not sufficient for the target policy. Copyleft can require source-sharing in specified circumstances, but it does not generally prohibit commercial use or government deployment.

### PolyForm Noncommercial

Closer to the desired commercial restriction, but unsuitable as-is for Iran-OS because its permitted-purpose definition includes use by government institutions and several classes of noncommercial organizations. Iran-OS wants governmental/institutional production deployment to require a separate written license.

### PolyForm Strict

Also unsuitable as-is for the same governmental-use reason and because it is intentionally much more restrictive about modification/distribution than the project intends for research and contribution workflows.

### PolyForm Shield / Perimeter

Focused on noncompetition rather than the simpler Iran-OS rule that commercial and institutional production use require written permission. Not selected.

### Business Source License / Fair-source variants

Potentially useful when a project wants production-use restrictions that convert to an open-source license after a defined period. Iran-OS has not decided that future automatic conversion is desirable, so this model is not selected by default.

## Recommended direction

Use a purpose-built Iran-OS Source-Available License, professionally reviewed before adoption, with a separate Commercial / Institutional License path.

The operative license should clearly distinguish:

1. permitted source visibility, study, research, security review, and non-commercial evaluation;
2. permitted contribution and derivative-work activity for non-commercial purposes;
3. prohibited commercial exploitation without written permission;
4. prohibited production deployment by companies, governments, public bodies, intergovernmental organizations, or institutions without written permission;
5. prohibited paid resale, sublicensing, managed-service, consulting-deliverable, and revenue-generating derivative use without written permission;
6. preservation of third-party licenses;
7. no automatic trademark/project-identity license;
8. warranty/liability limits and license-termination/remedy provisions;
9. a clear historical boundary preserving permissions already granted with earlier MIT copies.

## Status

No replacement license is adopted by this document. The root `LICENSE` remains authoritative until a replacement license is reviewed and committed as part of a complete licensing-transition change.
