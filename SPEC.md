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

The portal will be used by a wide range of users, both technical and
non-technical. Understanding their roles will help inform the UX and UI
design to ensure an intuitive experience for all.

- **Technical users**:
  - Responsible for implementing Keygen into a product. They will set up
    environments, entitlements, products, policies, etc.
  - Perform debugging tasks, such as resolving production issues related to
    licensing and activation errors.
  - Draft and prepare new releases, as well as manage existing releases and
    artifacts.
  - Use the portal to create test data and simulate customer setups to
    ensure compatibility before changes go live.

- **Non-Technical sales**:
  - Use the portal to issue new licenses, renew existing ones, and extend
    trials for customers.
  - Perform routine tasks like looking up upcoming license renewals or
    viewing customer license histories.
  - Attach or detach entitlements (e.g., feature access) to individual
    licenses based on customer contracts.

- **Non-Technical support**:
  - Resolve customer issues such as deactivating old devices so that new
    activations can occur.
  - Update license details, such as adjusting expiration dates or
    entitlements as part of customer support.
  - Assist customers who encounter difficulties with license activations or
    need help understanding their licensing options.

- **Non-Technical execs**:
  - Monitor overall license performance, including tracking the number of
    active licenses, customer counts, and revenue.
  - Use the metrics dashboard to gain insights into customer behavior, such
    as activation rates, product usage, and license renewals.
  - Look for trends in customer activity to make data-driven business
    decisions related to pricing or customer engagement.

- **End-users**:
  - View their license details, such as when the license will expire or renew,
    and view their entitlements.
  - Manage activations when upgrading hardware (e.g., deactivating a license
    on an old machine and activating it on a new one).
  - Download the latest version of the licensed application, or simply review
    available upgrades or downgrades.

## Key features

These are features that Portal will offer that the current dashboard does not
do at all, or does in a way that is subpar.

- **User-facing portal.** The current dashboard application only allows admin
  access, and we want to introduce [user-facing capabilities](https://github.com/keygen-sh/example-react-licensing-portal)
  to portal so that users can self-manage their resources, e.g. licenses,
  machines, etc., as well as review and download releases that they have access
  to. For end-users, the experience can be tailored to thjem, e.g. more like a
  sub-app with very limited functionality, but all accessible from the same
  portal app so that it's easily self-hostable like Keygen's API.
- **Policy templates.** The current dashboard offers policy management, but
  because policies are a very complex object, most users find configuring a
  policy pretty daunting. I want to provide a wizard based upon templates or
  'recipes' that can be used and combined to craft a safe and effective policy
  configuration to implement the customer's required [licensing model](https://keygen.sh/docs/choosing-a-licensing-model/).
- **Policy cloning.** In addition to templates, cloning a policy would also be
  very beneficial in reducing errors during policy management.
- **Activity timeline.** The current dashboard offers enterprise customers
  audit logs, but they're not as useful as they can be because they're all
  lumped together in a sort of fire-hose feed. In order to make audit logs more
  useful, I'd like to add an activity-log per-object, e.g. like Stripe's
  'recent activity' and 'logs' at the bottom of any object page. The timeline
  will show all changes made to a given object, including what an attribute's
  value was before and after the change, and who made the change.
- **License calendar-view.** The current dashboard is frequently used by sales
  teams, and surfacing license expirations and renewals in a calendar-like view
  (think: GitHub's activity graph) would make sales more effective.
- **Environment-switcher.** The current dashboard only supports a production
  environment, but the API supports any number of environments. The new portal
  should provide an environment-switcher in the top of the sidebar for easy
  access to dev and test environments.
- **Table-view filtering.** The current dashboard has no UI for filtering
  table-views, even though the API supports a variety of [complex filters](https://keygen.sh/docs/api/licenses/#licenses-list),
  e.g. 'show all active licenses', or 'show all licenses expiring in
  the next 30 days', etc.
- **Command-bar.** The current dashboard has no quick navigation, so adding a
  command bar to quickly jump to certain pages "View License xxx", or actions
  "Edit license xxx" or "New release", would enable power-users to be more
  effective.
- **Language-specific onboarding.** The current dashboard does not walk the new
  user through integrating with their programming language of choice. Portal
  should do more to get the user to 'first API request' in their preferred
  programming language.
- **Personalization.** Accounts should be able to upload a company logo,
  and admins and team members should be able to upload an avatar.

## Design

First-and-foremost, the design will match [our current brand](https://keygen.sh).
We aim for a simple, functional design catering to technical and
non-technical users. Inspiration comes from dashboards like Resend, Vercel,
Neon, Oxide, PlanetScale, Heroku, DigitalOcean, and Stripe, with an emphasis on
Vercel, Neon, and [Oxide](https://console-preview.oxide.computer/).

We'll use [`shadcn/ui`](https://ui.shadcn.com/) to jump-start the UI.

## Tech

- **Frontend**: React or Preact
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Kit**: [`shadcn/ui`](https://ui.shadcn.com/) (includes charting support)

## Pages

### Unauthenticated

- **Registration**: Basic registration form (email, password, auto-generated
  account slug based on email domain, plan, etc.)
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
- Expiring/renewing licenses (e.g., GitHub activity-style calendar-view).
- Active licensed users (ALUs).
- API validation success vs. failure rates.
- New user registrations.
- New activations.
- Recent downloads.
- Recent upgrades.
- Stacked-line chart of app versions in-use.
- Stacked-line chart of validation statuses e.g. valid, expired, not activated,
  suspended, over activation limit, etc.
- etc.

Most of these can be displayed in some sort of chart.

### Licensing

Pages for managing API licensing resources. For enterprise customers, each
resource will include an event logs pane showing historical events for the
resource.

- **Products**: CRUD operations for product offerings.
  [(docs)](https://keygen.sh/docs/api/products/)
- **Policies**: CRUD operations for policies, covering licensing models
  (e.g., concurrency, device, user, and offline locks).
  [(docs)](https://keygen.sh/docs/api/policies/)
- **Users**: CRUD operations for product users, password resets, and MFA.
  [(docs)](https://keygen.sh/docs/api/users/)
- **Licenses**: CRUD operations for licenses, including renewals, revocation,
  as well as entitlement and user management.
  [(docs)](https://keygen.sh/docs/api/licenses/)
- **Machines**: CRUD operations for activated devices.
  [(docs)](https://keygen.sh/docs/api/machines/)
- **Components**: CRUD operations for hardware components of activated
  devices (e.g., CPU, GPU identifiers). This page won’t be in the main nav
  but will surface through individual machine views.
  [(docs)](https://keygen.sh/docs/api/components/)
- **Processes**: CRUD operations for application processes, used for managing
  concurrency limits (e.g., limiting the number of app instances). This page
  won’t be in the main nav but will surface through machine views.
  [(docs)](https://keygen.sh/docs/api/processes/)
- **Entitlements**: CRUD operations for feature flags or license entitlements.
  [(docs)](https://keygen.sh/docs/api/entitlements/)
- **Groups**: CRUD operations for organizing resources.
  [(docs)](https://keygen.sh/docs/api/groups/)

### Distribution

Pages for managing distribution resources. For enterprise customers, each will
include an event logs pane for tracking resource changes.

- **Packages**: Named buckets for releases (e.g., PyPI, Tauri packages).
  [(docs)](https://keygen.sh/docs/api/packages/)
- **Releases**: Versioned buckets for artifacts.
  [(docs)](https://keygen.sh/docs/api/releases/)
- **Artifacts**: Files attached to releases (e.g., installers, tarballs).
  [(docs)](https://keygen.sh/docs/api/artifacts/)
- **Engines, Channels, Platforms, Architectures**: Metadata for releases,
  populated automatically based on usage. These are read-only resources.
  [(docs)](https://keygen.sh/docs/api/)

### Automation

Pages for setting up automation, e.g. integrating with a payment provider like
Stripe, or a CRM like Salesforce.

- **Webhooks**: CRUD operations for webhook endpoints and logs for debugging.
  [(docs)](https://keygen.sh/docs/api/webhooks/)
- **Zapier**: Optional Zapier integrations page.
- **AI**: Future AI-based BI.

### Logs

Pages for debugging/reviewing raw request logs, and for auditing event logs.

- **Request Logs**: View recent API activity and request/response details for
  debugging.
  [(docs)](https://keygen.sh/docs/api/request-logs/)
- **Event Logs**: Audit logs for enterprise customers, showing actions made
  on an account.
  [(docs)](https://keygen.sh/docs/api/event-logs/)

### Access

Pages for managing API and Portal access.

- **Tokens**: CRUD operations for API tokens with varying permissions.
  [(docs)](https://keygen.sh/docs/api/tokens/)
- **Admins**: Manage admin users, including password resets and 2FA.
  [(docs)](https://keygen.sh/docs/api/users/)

### Account

Pages for managing the account and billing.

- **Account**: Manage account details like name, slug, logo, security settings,
  and import/export functionality.
- **Billing**: View billing info (current tier, subscription status) with
  links to Stripe for managing payments and invoices.
