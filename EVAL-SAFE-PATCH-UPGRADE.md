# 🛡️ Safe `eval()` Remediation Upgrade

NEXUS now supports a conservative automatic remediation for the common test pattern `eval(input)`.

## What changed

- 🔎 Security AI still detects dynamic code execution as **HIGH** severity.
- 🔧 Fixer AI can generate a guarded patch when the `eval()` argument is a simple identifier.
- 🧮 The patch replaces `eval(identifier)` with a strict arithmetic-only parser.
- 🚫 The parser rejects identifiers, property access, function calls, strings, and other non-arithmetic expressions.
- 🧪 Sandbox re-scans the proposed file and blocks the workflow if the dynamic-execution finding remains.
- 👤 Human approval is still required before any GitHub write.
- 🌿 Only after approval can NEXUS create a branch, commit, and PR.

## Example

Input:

```js
export function executeUserInput(input) {
  return eval(input);
}
```

Proposed remediation:

```js
function nexusSafeEvaluate(expression) {
  // strict numeric arithmetic parser
  // ...
}

export function executeUserInput(input) {
  return nexusSafeEvaluate(input);
}
```

The exact generated patch is shown in the Autopilot **Before / After** panel.

## Important safety boundary

This is deliberately **not** a generic `eval()` replacement. If NEXUS cannot prove that the argument can be routed through the constrained arithmetic parser, it leaves the finding in manual remediation instead of guessing.
