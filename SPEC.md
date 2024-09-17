# Keygen Portal

At a high level, this is a rewrite and redesign of the current admin dashboard
app, https://app.keygen.sh, which is outdated and uses Keygen's old branding.
In addition to being a redesign, we'll also be implementing additional
functionality, such as environments, better workflows for sales and support
teams, and user-facing functionality e.g. self-management of resources and
access to releases.

At its core, Portal will be a front-end for Keygen's API. So anything the API
can do, Portal should offer a way to do that via a UI.

Portal will be Open Source under the MIT license.

## Personas

I figure it'd be valuable to detail how Portal will be used, and what types of
people will use it. This way we can design UX accordingly.

- Technical users responsible for implementing Keygen into a product. They
  will set things up like environments, entitlements, products and policies.
  They will also create a lot of test data.
- Technical users debugging production issues.
- Technical users drafting new releases.
- Non-technical sales staff, using Keygen to issue licenses to new clients.
  They may do things such as look for upcoming license renewals, and also
  renew licenses and extend trials, or attach/detach entitlements.
- Non-technical support staff, using Keygen to resolve client issues, e.g.
  manually deactivating old devices to allow new device activations, or
  updating a license's expiry or entitlements.
- Non-technical VP wanting to look at overall license performance of
  their product, e.g. activity and customer count.
- Non-technical end-user managing their own activated devices, e.g. they
  bought a new PC and want to deactivate old for the new.
- Non-technical end-user viewing their licensing info, e.g. when their
  license is set to expire or renew.
- Non-technical end-user wanting to download the latest release of a
  product they have a license key for.

This is not exhaustive, just an idea of the types of people using Portal.

## Design

Design-wise, I don't want Portal to be anything fancy. I like the layouts of
dashboards like Vercel, Neon, Planet Scale, Heroku, Digital Ocean, and Stripe.
I do particularly like the aesthetic of Vercel, Neon, and Oxide:

  https://console-preview.oxide.computer/

But I'd also defer to you as well, because Portal will be used by non-technical
users as well as technical users.

I'd prefer to use a UI kit like [`shadcn/ui`](https://ui.shadcn.com/) to
kick-off.

## Frameworks

- React or Preact
- Typescript
- Tailwind
- Maybe https://ui.shadcn.com to kick start? (Just intro'd charting.)

## Pages

These are the pages of Portal.

### Unauthenticated

These are the unauthenticated routes.

#### Registration

Basic registration form. Email and password. Account slug can be automatically
derived from the email domain, and if there's a conflict, show an account slug
field.

#### Login

Basic login form. Account slug, email, and password. Needs to support TOTP
second-factor authentication. Account slug can likely be derived from the URL,
e.g.:

  https://portal.keygen.sh/{account}/login

The login form should also support logging in via a license key, instead of
email and password (maybe via a form switcher?).

It will eventually support SSO/SAML.

#### Distribution

Some accounts may distribute releases to unauthenticated users. These are known
as 'open' releases, since they can be downloaded without any API authentication.
Typically, these are used to distribute freemium products. Thinking something
like:

  https://portal.keygen.sh/{account}/releases

Which will show the list page for releases, but hide most other navigiation
since the user isn't logged in yet. But I'm covering this now so that the UI
can be designed to support some resource pages being accessed without logging
in.

As an example, we use Keygen to distribute our CLI as an 'open' product:

  https://keygen.sh/docs/cli/

This would include other distribution-related artifacts as well, since they'd
all be accessible if an 'open' product exists on the account.

### Authenticated

These are the authenticated routes. Access to these resources will depend on
the current bearer's type, role, and permissions. For example, if the current
bearer is an admin, they will be able to access any resource (barring
permissions), but if the current bearer is a license or a user, they will only
be able to view a subset of resources (i.e. those that they're associated to).

As alluded to above, there will be multiple ways to 'login' depending on
account configuration. A user may login via an email/password, but they may
also login via a license key if that's configured instead.

More: https://keygen.sh/docs/api/authentication/
      https://keygen.sh/docs/api/authorization/

#### Accounts

Every session will be for a specific Keygen account. I want to implement this
using a URL slug, e.g. https://portal.keygen.sh/{account}. When visiting a new
account, Portal should ask the user to switch accounts, i.e. login again.

In addition, accounts may include a logo and/or custom theme colors
(primary/secondary, dark/light), so let's design the UI with that functionality
in mind.

#### Environments

These represent 'silos' for data within an account, e.g. "production",
"qa", and "development" environments. Basic CRUD resource, but most
resources will be for a specific environment. There will be an
environment selector in the nav that will update a `Keygen-Environment`
header, which will silo all queried data from the API. There will also
be a 'null' environment, which will query resources without an
environment.

I'd like to automatically create 'live' and 'test' environments upon
account creation, so that new accounts can immediately start playing
with the API.

I'm thinking a typical dropdown in the top left, e.g. see Oxide.

Docs: https://keygen.sh/docs/api/environments/

#### Metrics

There will be a metrics page that shows charts of recent API activity
and e.g. how many active users an account has, as well as daily API
request volume. This will provide a birds-eye view of an account.

Prominent charts and components:

- Chart of daily request volume vs. tier limits (with upsell to larger
  tier if volume > limit occurs > x times in a month)
- Calendar view of licenses expiring soon (like GH activity?)
- Active licensed user (ALU) count
- Validation success vs failures
- New users, etc.

This will be the 'landing' page when logging in.

#### Licensing

These pages are the API's licensing-related resources. Many resources
will have additional actions, e.g. renewing a license, so the resource
view component should leave space for these.

Pages available in the main navigation:

- Products
- Policies
- Users
- Licenses
- Machines
- Entitlements
- Groups

Pages that aren't in main nav, but should be available:

- Components
- Processes

All licensing resources will have a pane of event logs on the view resource
page. This will show all historical "events" for the resource, with any
additional information logged.

##### Products

These represent an account's core product offerings, e.g. App X and
App Y. Pretty basic CRUD resource, and one that needs to be created
up-front since most other resources are associated with a product.

Docs: https://keygen.sh/docs/api/products/

##### Policies

These represent a set of 'rules' that licenses implement and have to
follow, e.g. Trial vs Pro license types. It's a CRUD resource, but does
have some additional functionality such as attaching/detaching
entitlements. Overall, this is the most complicated resource in the API
because of its sheer configurability, so I'd really like to spend time
here and create a wizard-like UI for setting up commonly used rules,
e.g. license model 'blueprints.'

For example, common licensing models include:

- Concurrency-controlled
- Device-locked
- Process-locked
- User-locked
- Feature-based
- Offline-based
- Pooled
- Timed
- Perpetual
- Perpetual-fallback
- etc.

Many of these can be mixed-and-matched, so having a grid layout clearly
explaining each model, and letting the user select functionality to
'build-their-own-model,' with support for setting things up manually
using a form as well.

Docs: https://keygen.sh/docs/api/policies/

##### Users

These represent an account's users, i.e. users of a product, owner of a
license, etc. Users are a CRUD resource with additional actions, such as
ban and unban. In addition, a user has password reset functionality, as
well as MFA/2FA management.

Users may be able to log into Portal and self-manage their own resources,
depending on their permissions and the account's configuration.

Docs: https://keygen.sh/docs/api/users/

##### Licenses

These represent the various licenses for each product. Licenses are a CRUD
resource with a plethora of additional actions, such as renew, revoke,
suspend, reinstate, check-out, and check-in. In addition, a license will
have some additional functionality such as attaching/detaching users and
entitlements (the user management UI will need to be thought through
because a license could potentially have thousands of users e.g. a site
license for a large company).

Docs: https://keygen.sh/docs/api/licenses/

##### Machines

These represent the activated devices for each license. Machines are a
basic CRUD resource, with a couple additional actions such as offline
check-out.

Docs: https://keygen.sh/docs/api/machines/

##### Components

These represent the hardware components of activated devices, e.g. these
are used to make sure that a given CPU or GPU are not used across multiple
trials. Components are a basic CRUD resource, and won't be directly in
the nav (likely surfaced through the individual machine view since each
component is machine-specific).

Docs: https://keygen.sh/docs/api/components/

##### Processes

These represent the application processes for activated devices, e.g.
these are used to control an application's concurrency i.e. how many
instances of an application can be running at one time. Processes are a
basic CRUD resource, and won't be directly in the nav (likely surfaced
through the individual machine view since each process is
machine-specific).

Docs: https://keygen.sh/docs/api/processes/

##### Entitlements

These represent "feature flags" or other entitlements that can be attached
to policies and licenses. Entitlements are a very basic CRUD resource.

Docs: https://keygen.sh/docs/api/entitlements/

##### Groups

These represent groups that resources can be 'bucketed' into for
organizational purposes. Groups are a very basic CRUD resource.

Docs: https://keygen.sh/docs/api/groups/

#### Distribution

These pages are the API's distribution-related resources. Many resources
will be accessible without authentication (see #unauthenticated).

Pages available in the main navigation:

- Packages
- Releases
- Artifacts

Pages that aren't in main nav, but should be available:

- Engines
- Channels
- Platforms
- Arches

All distribution resources will have a pane of event logs on the view resource
page. This will show all historical "events" for the resource, with any
additional information logged.

##### Packages

These represent a named bucket that releases can be put into, but you can
think of them in the same way as an npm package or a Rubygem. Essentially,
you create a package and then add releases to it, and you upload artifacts
to each release.

Packages can use a particular engine. Right now we support PyPI, which
allows installation of the package via Python's PyPI package manager, and
we also support Tauri, which allows for application auto-updates to be
distributed via Keygen.

I.r.t. engines, there's plans to support everything from npm to Rubygems
to Docker to Composer in the future. Tauri and PyPI were testing the
waters here.

Very basic CRUD resource.

Docs: https://keygen.sh/docs/api/packages/

##### Releases

These represent a versioned bucket that artifacts can be put into, but
you can again think of these in the same way as an npm package or Rubygem.
You create a release, upload artifacts for it, and then publish it.

Basic CRUD resource with a couple additional actions, such as publish
and yank.

Docs: https://keygen.sh/docs/api/releases/

##### Artifacts

These represent a file for a particular release; everything from tarballs
to installers. After creating an artifact, an uploader must be shown to
upload the file.

Basic CRUD resource with a couple additional actions, such as yank.

Docs: https://keygen.sh/docs/api/artifacts/

##### Engines

These represent the engines used for an account. As mentioned in
#packages, right now, we offer the PyPI and Tauri engines, but we will
offer more in the future. These are automatically populated based on
usage.

This is a readonly resource.

Docs: https://keygen.sh/docs/api/engines/

##### Channels

These represent the channels used for an account, e.g. stable, dev, rc,
beta, etc. These are automatically populated based on usage.

This is a readonly resource.

Docs: https://keygen.sh/docs/api/channels/

##### Platforms

These represent the platforms used for an account, e.g. darwin, windows,
linux. These are automatically populated based on usage.

This is a readonly resource.

Docs: https://keygen.sh/docs/api/platforms/

##### Arches

These represent the arches used for an account, e.g. x86_64, amd64,
arm64, 386. These are automatically populated based on usage.

This is a readonly resource.

Docs: https://keygen.sh/docs/api/arches/

#### Automations

These pages can be used for automations, i.e. webhooks and Zapier.

##### Webhooks

These pages are used to manage webhooks. Keygen has a robust webhook
system that powers automation workflows.

Docs: https://keygen.sh/docs/api/webhooks/

###### Endpoints

These represent webhook endpoints for an account, i.e. where Keygen will
send events to as they happen. Very basic CRUD resource.

###### Events

These represent webhook logs ala Stripe webhook logs, showing recently
delivered webhooks for debugging purposes. Readonly resource with a
couple additional actions such as retry.

##### Zapier

This will be a separate page with a Zapier embed. Can likely deprioritize
this and implement later on.

Link: https://zapier.com/apps/keygen/integrations

#### Logs

These pages can be used for debugging and auditing purposes.

##### Request logs

These represent request logs ala Stripe request logs, showing recent API
activity request/response for debugging purposes. This is a readonly
resource.

Docs: https://keygen.sh/docs/api/request-logs/

##### Event logs

These represent audit logs for enterprise customers, showing recent
actions made on an account, including info on who made the action.
Readonly.

Docs: https://keygen.sh/docs/api/event-logs/

#### Access

These pages are used to manage access to an account.

##### Tokens

These represent tokens used for authenticating with the API. There are
many different token types, and each carries their own permissions. Basic
CRUD resources, with an action for regenerating token.

Docs: https://keygen.sh/docs/api/authentication/
      https://keygen.sh/docs/api/tokens/

##### Admins

These represent a set users with an admin role, on a separate page from
/users. Like users, will include password reset functionality and 2FA.

Docs: https://keygen.sh/docs/api/users/

#### Account

These pages will be used for managing an account, e.g. billing, etc.

##### Settings

Page to manage an account's details, e.g. name, slug, logo, etc. In
addition, this page will include security-related information such as
public keys, and will offer import/export functionality.

##### Billing

Page showing billing information, e.g. current tier, subscription info,
etc. It will link out to Stripe for most billing-related actions.
