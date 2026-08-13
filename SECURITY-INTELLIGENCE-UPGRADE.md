# 🛡️ NEXUS Security Intelligence Upgrade

This release upgrades the security intelligence layer while preserving the working GitHub → Security Scan → AI Patch → Sandbox → Approval → Branch → Commit → PR workflow.

## 🔎 Context-aware SAST

The scanner no longer labels every `"..." + username` expression as HIGH severity. SQL injection is considered a strong finding when SQL syntax, string concatenation, and a nearby database execution API such as `db.query()`, `execute()`, `run()` or `prepare()` are present. Without the database sink, the scanner reports a lower-confidence potential dynamic query construction finding.

## 🎯 Confidence scoring

Every finding has a confidence score. Examples:

- 99%: explicit `eval()` / private key / obvious credential
- 97%: SQL-like concatenation with a likely user-controlled value and DB sink
- 68%: SQL-like concatenation without an identified DB sink

## 🧩 Deduplication / grouping

Repeated instances are grouped by vulnerability class. The UI shows occurrence count and affected files, while each individual file/line remains expandable.

## 🧾 CWE + OWASP mapping

Findings expose a CWE identifier and OWASP Top 10 category when a useful mapping exists. Examples:

- SQL injection → CWE-89 / OWASP A03:2021
- eval → CWE-95 / OWASP A03:2021
- hardcoded credentials → CWE-798 / OWASP A07:2021
- XSS sink → CWE-79 / OWASP A03:2021

## 📊 Better scoring

Security scoring is based primarily on vulnerability groups with a small additional penalty for repeated occurrences. Three instances of the same SQL injection therefore do not get treated as three completely unrelated vulnerabilities.

## 🔐 Additional checks

- GitHub/OpenAI-style credential patterns
- AWS credential patterns
- private keys
- `eval()` and dynamic browser code
- process execution APIs
- HTML injection sinks
- plain HTTP
- hardcoded secret patterns
- permissive file modes
- unpinned dependency versions
- networked `postinstall` scripts
- Docker root execution
- Docker pipe-to-shell installs
- remote Docker `ADD`

## 🐙 Real repository intelligence

The repository endpoint returns:

- score
- risk
- autonomy policy
- individual findings
- grouped findings
- severity summary
- analyzed files
- lightweight SBOM

## 🧠 Safety policy

NEXUS does not automatically turn a high-risk match into a Git write. High-risk remediation remains behind patch generation, sandbox re-scan and explicit human approval before a branch, commit or pull request is created.
