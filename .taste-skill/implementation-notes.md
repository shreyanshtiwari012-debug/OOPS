# Fraudora consumer checker
Style: True-black flat, seed 1642603878. Selected for quick reading of evidence in the existing dark brand. No redraws. Retained Jakarta Sans and the existing brand's indigo family only on the mark and risk indicator; neutral dark surfaces replace navy chrome.
Screen question: Does this pasted message show scam warning signs?
Inventory: message text, embedded links, rule labels, point weights, 0–100 score, backend bands 0–29 / 30–59 / 60–100, sender verification, OTP requests, KYC pressure, scan history, forensic report, Indian currency examples.
Idea: Fraudora's weighted evidence becomes a compact message-to-verdict workspace. Signature: score meter with evidence points immediately underneath. Primary action: analyze the pasted message.
Dataset: three explicitly labeled, invented message examples; reserved .example links are not real destinations. No invented business metrics, testimonials, or detection accuracy.
Checks: production build and source taste lint pass. Existing project lint warnings remain in legacy components. Browser inspector attempted but blocked by absence of Chrome/Edge/Chromium. Screenshots and visual scores are therefore unavailable; no visual critique claimed. Responsive layouts implemented for desktop, tablet and mobile but require real-browser confirmation.
No photographic assets required for this app screen. Existing history, rules and forensic detail remain accessible.

## Playwright verification
Installed @playwright/test and Chromium under /tmp/fraudora-playwright. Added a repeatable 12-case suite across 1440, 768 and 390px. All cases passed on the production build. Tests intercept API calls: deployed API availability and accuracy are outside these checks. Source taste lint: 0 FAIL, 0 WARN. Browser inspector: 0 FAIL, 1 WARN (54px vertical breathing room in the centered empty analysis state, retained to balance the editor; populated reports use natural heights). Fixed mobile hidden-label semantics, text sizes, and tablet stacking.

ROUND 3
Seen in one second: a dark Fraudora message checker with a clear editor and one Analyze message action.
Idea (one sentence): weighted scam evidence becomes a message-to-verdict workspace.
Live thing: paste and analyze text; real API adapter plus explicitly labeled offline preview.
Layout words by section: checker=editor/evidence split, stacked on tablet/phone / guide=range comparison / close=sender verification advice.
Scores: design 7 · usability 8 · creativity 6 · content 8 → overall 7.2
Caps applied: app-screen rules; no page photography or motion floor. Concept is a known checker pattern, so creativity remains 6.
Top three problems (most visible first), each with screenshot and fix:
1. Initial desktop text was too small; increased labels and supporting text, visible in after/desktop-fold.jpg.
2. Tablet result pane was too narrow; switched to a single column below 900px, visible in after/tablet-fold.jpg.
3. Expanded desktop report stretched the editor below its content; gave populated reports natural panel heights, checked by desktop-high-risk.png.
Remaining limitation: empty-state desktop panel retains 54px breathing room; mobile results are below the input and scroll into view after analysis. Legacy report, history, and rule panels retain their existing visual design.
