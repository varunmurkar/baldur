# Security

- New Baldur releases require MFA for RubyGems owners via gem metadata starting with `0.1.2`.
- Release artifacts should be installed from RubyGems or GitHub releases and can be verified with the published `.sha512` checksum file.
- Report vulnerabilities privately through GitHub Security Advisories.

## Verify a Release Artifact

```sh
sha512sum -c baldur-0.1.3.gem.sha512
```
