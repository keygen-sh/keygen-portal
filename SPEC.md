# Keygen Portal

Keygen Portal is a complete rewrite and redesign of the current admin
dashboard ([app.keygen.sh](https://app.keygen.sh)), which is outdated and
uses old branding. This redesign introduces new functionality, including
support for environments, better workflows for sales and support teams, and
self-management tools for users, such as access to releases and resource
management.

Portal will serve as a front-end for Keygen's API, providing UI access to
all API functionalities. The project will be Open Source under the MIT
license.

## Personas

The portal will cater to a range of users, both technical and non-technical:

- **Technical Users**:
  - Set up environments, entitlements, products, and policies.
  - Debug production issues, draft new releases, manage test data.
- **Sales Staff**:
  - Issue licenses, manage renewals, extend trials, manage entitlements.
- **Support Staff**:
  - Manage device activations, update licenses, handle client issues.
- **VPs/Executives**:
  - Monitor license performance and customer data.
- **End Users**:
  - Manage devices, view license info, download releases.

## Design

We aim for a simple, functional design catering to technical and
non-technical users. Inspiration comes from dashboards like Vercel, Neon,
Oxide, PlanetScale, Heroku, DigitalOcean, and Stripe, with an emphasis on
Vercel, Neon, and [Oxide](https://console-preview.oxide.computer/).

We'll use [`shadcn/ui`](https://ui.shadcn.com/) to jump-start the UI.

## Tech

- **Frontend**: React or Preact
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Kit**: [`shadcn/ui`](https://ui.shadcn.com/) (includes charting support)

## Pages

### Unauthenticated

- **Registration**: Basic registration form (email, password,
  auto-generated account slug).
- **Login**: Basic login form (account slug, email, password, 2FA/SSO/SAML
  support). Support for logging in via license key.
- **Downloads**: Public download page for 'public' releases (freemium
  products), e.g., `https://portal.keygen.sh/{account}/downloads`.

### Authenticated

Authenticated pages will depend on user role and permissions. Users can log in
via email/password or license key.

- **Accounts**: Sessions tied to specific accounts, e.g.,
  `https://portal.keygen.sh/{account}`. Account switching requires re-login.
- **Environments**: Environments (e.g., production, QA, development) for
  data siloing. Environment selection via a dropdown that updates the
  `Keygen-Environment` header for API calls.
  - Switching environments may prompt for reauthentication, i.e. a login modal
    may be required.

### Metrics

This will be the dashboard or landing page after login, showing:

- Daily request volume vs. tier limits (upsell if needed).
- Expiring/renewing licenses (e.g., GitHub activity-style view).
- Active licensed users (ALU).
- API validation success vs. failure rates.
- New user registrations.
- etc.

### Licensing

Pages for managing API licensing resources. Each resource will include an
event logs pane showing historical events for the resource.

- **Products**: CRUD operations for product offerings.
  - [Docs](https://keygen.sh/docs/api/products/)
- **Policies**: CRUD operations for policies, covering licensing models
  (e.g., concurrency, device, user, and offline locks).
  - [Docs](https://keygen.sh/docs/api/policies/)
- **Users**: CRUD operations for product users, password resets, and MFA.
  - [Docs](https://keygen.sh/docs/api/users/)
- **Licenses**: CRUD operations for licenses, including renewals, revokes,
  and entitlement management.
  - [Docs](https://keygen.sh/docs/api/licenses/)
- **Machines**: CRUD operations for activated devices.
  - [Docs](https://keygen.sh/docs/api/machines/)
- **Components**: CRUD operations for hardware components of activated
  devices (e.g., CPU, GPU identifiers). This page won’t be in the main nav
  but will surface through individual machine views.
  - [Docs](https://keygen.sh/docs/api/components/)
- **Processes**: CRUD operations for application processes, used for managing
  concurrency limits (e.g., limiting the number of app instances). This page
  won’t be in the main nav but will surface through machine views.
  - [Docs](https://keygen.sh/docs/api/processes/)
- **Entitlements**: CRUD operations for feature flags or license entitlements.
  - [Docs](https://keygen.sh/docs/api/entitlements/)
- **Groups**: CRUD operations for organizing resources.
  - [Docs](https://keygen.sh/docs/api/groups/)

### Distribution

Pages for managing distribution resources. Each will include an event logs
pane for tracking resource changes.

- **Packages**: Named buckets for releases (e.g., PyPI, Tauri packages).
  - [Docs](https://keygen.sh/docs/api/packages/)
- **Releases**: Versioned buckets for artifacts.
  - [Docs](https://keygen.sh/docs/api/releases/)
- **Artifacts**: Files attached to releases (e.g., installers, tarballs).
  - [Docs](https://keygen.sh/docs/api/artifacts/)
- **Engines, Channels, Platforms, Architectures**: Metadata for releases,
  populated automatically based on usage. These are read-only resources.
  - [Docs](https://keygen.sh/docs/api/)

### Automation

- **Webhooks**: CRUD operations for webhook endpoints and logs for debugging.
  - [Docs](https://keygen.sh/docs/api/webhooks/)
- **Zapier**: Optional Zapier integrations page.

### Logs

- **Request Logs**: View recent API activity and request/response details for
  debugging.
  - [Docs](https://keygen.sh/docs/api/request-logs/)
- **Event Logs**: Audit logs for enterprise customers, showing actions made
  on an account.
  - [Docs](https://keygen.sh/docs/api/event-logs/)

### Access

- **Tokens**: CRUD operations for API tokens with varying permissions.
  - [Docs](https://keygen.sh/docs/api/tokens/)
- **Admins**: Manage admin users, including password resets and 2FA.
  - [Docs](https://keygen.sh/docs/api/users/)

### Account

- **Account**: Manage account details like name, slug, logo, security settings,
  and import/export functionality.
- **Billing**: View billing info (current tier, subscription status) with
  links to Stripe for managing payments.
