# Security policy

Please do not disclose credentials, tokens, private keys, or sensitive infrastructure details in
public issues. Report suspected security vulnerabilities privately to the repository owner through
GitHub's private vulnerability reporting if it is enabled, or contact the maintainer directly.

The website is a static application. Runtime secrets must never be exposed to browser code. Build
credentials such as `SONAR_TOKEN` belong only in protected repository or runner configuration.
