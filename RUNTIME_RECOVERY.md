# Recovery from the inherited expiring download URL

The first sales-preview deployment failed at the old Dockerfile's remote runtime fetch (HTTP403), before applying the new pilot code. This patch removes the remote URL from the Dockerfile and from build arguments.

Startup fetches the existing private runtime only when a verified archive is absent from `/data/.mei-release-cache`. The URL is passed as the service runtime variable `MEI_RUNTIME_SOURCE_URL`, not committed into GitHub or embedded in image metadata. SHA256 is pinned to the original 940770-byte source ZIP. Extracted paths, types, archive bounds and required files are checked. The URL is removed from the environment inherited by app children. Business databases are not altered by the bootstrap.

Once populated, the cache is reused after its SHA256 is checked on every restart. This does not constitute an independent offsite backup: restoring to a new/empty volume still requires the original ZIP or a fresh authorized download URL. Keep the original release package private. Before a public commercial launch migrate to a private self-contained build source or private image registry.

12 local bootstrap integrity/cache/extraction tests passed; network is mocked locally. Actual Railway start/cache reuse are separate checks. No assertion of comprehensive security audit, multi-tenant readiness or payment verification.

Do not commit credentials, the signed source URL or paid buyer material. Do not apply pending unrelated environment-wide deletions.
