# 🧪 Security Intelligence Test Plan

## SQL injection — confirmed

Scan `security-fixtures/sql-injection.js`.
Expected: **HIGH**, SQL injection via dynamic query construction, confidence around 97%, CWE-89, OWASP A03:2021.

## SQL-like string — lower confidence

Scan `security-fixtures/dynamic-sql-without-sink.js`.
Expected: **MEDIUM**, potential dynamic query construction, confidence around 68%, because no nearby database sink is identified.

## Safe parameterized query

Scan `security-fixtures/safe-parameterized.js`.
Expected: no SQL injection finding from the query-construction heuristic.

## Docker

Scan `security-fixtures/docker-bad`.
Expected: container-root and pipe-to-shell findings.

## Dependency hygiene

Scan `security-fixtures/package-bad.json`.
Expected: unpinned dependency and networked postinstall findings.
