# 🚀 NEXUS Final — Release Notes

## 🛡️ Flagship end-to-end workflow

**GitHub → Security Scan → Conservative Patch → Sandbox Gate → Human Approval → Branch → Commit → Pull Request**

### Added

- 🐙 GitHub REST integration
- 🛡️ Security Autopilot UI
- 🔎 bounded repository tree analysis
- 🧠 conservative remediation engine
- 🧪 sandbox safety gate
- 👤 approval boundary before GitHub mutation
- 🌿 automated branch creation
- 💾 Git tree/blob/commit creation
- 🔀 automated pull request creation
- 🔐 webhook HMAC verification
- 📜 persistent pipeline logs
- 🧭 detailed operator documentation
- 🧪 optional Docker smoke sandbox

### Safety

The default sandbox is static validation. It does not execute arbitrary repository code. This is deliberate. Production deployments should use dedicated hardened workers for untrusted code.

## SSE / OmniRoute compatibility fix

- Added defensive SSE parsing for OmniRoute/OpenRouter responses.
- Agent calls now request `stream: false` by default.
- Streaming `chat.completion.chunk` responses are normalized into one text result.
- Existing 402/429 provider errors and multi-provider fallback behavior are preserved.
