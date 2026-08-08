export type DeveloperRelease = {
  date: string
  description: string
  highlights: string[]
  stability: 'stable' | 'prerelease'
  title: string
  version: string
}

export const developerReleases: DeveloperRelease[] = [
  {
    date: '2026-08-08',
    description: 'The current stable package checkpoint with hardened CLI credential handling.',
    highlights: [
      'Aligned 1.0.5 SDK, CLI, and curated read-only MCP packages',
      'Complete browser-login, profile, remote-terminal, and credential-lifecycle documentation',
      'Native macOS, Linux, and Windows credential stores without plaintext fallback',
    ],
    stability: 'stable',
    title: 'Developer Platform 1.0.5',
    version: '1.0.5',
  },
  {
    date: '2026-08-05',
    description: 'The production-qualified native-credential and secure CLI authentication release.',
    highlights: [
      '208 synchronized API operations with Personal and Service Token routing',
      'Secure browser login with operating-system credential storage and manual-token fallback',
      'Aligned 1.0.3 SDK, CLI, and curated read-only MCP packages',
    ],
    stability: 'stable',
    title: 'Developer Platform 1.0.3',
    version: '1.0.3',
  },
  {
    date: '2026-07-27',
    description: 'The synchronized stable release of TeamGrid API v1, TypeScript SDK, CLI, and MCP server.',
    highlights: [
      '206 governed API operations and 87 canonical scopes',
      'Stable 1.0.0 SDK, CLI, and read-only MCP packages',
      'Qualified change feed, strong revisions, service accounts, and reveal-once credentials',
    ],
    stability: 'stable',
    title: 'Developer Platform 1.0',
    version: '1.0.0',
  },
  {
    date: '2026-07-21',
    description: 'The final controlled-beta contract checkpoint before the stable release.',
    highlights: [
      '181 synchronized API operations',
      'Static core contract while change-feed and core-CAS qualification completed',
      'Aligned 1.0.0-beta.2 client packages',
    ],
    stability: 'prerelease',
    title: 'Developer Platform Beta 2',
    version: '1.0.0-beta.2',
  },
]
