export const MOCK_ACCOUNT = {
  id: "57f00949-a080-4788-a5d7-c9047d2a44f4",
  slug: "ecorp",
  name: "E Corp",
} as const

export const MOCK_PLAN = {
  id: "22db8e2c-6eef-46da-9353-bae4f2131c74",
  name: "Business",
} as const

export const MOCK_BILLING = {
  id: "a5d83ae8-2630-42f5-a928-21e8e417329a",
} as const

export const MOCK_ENVIRONMENTS = {
  sandbox: {
    id: "f5a40b59-ab07-4f1b-aee9-dd4c70f2d7e8",
    code: "sandbox",
    name: "Sandbox",
    isolationStrategy: "SHARED",
  },
  production: {
    id: "b943fc57-e03b-45a5-a9a2-828390de85d5",
    code: "production",
    name: "Production",
    isolationStrategy: "ISOLATED",
  },
} as const

export const MOCK_ADMIN = {
  id: "65fa5468-88c1-4990-8447-39142acf60af",
  email: "demo@ecorp.example",
  firstName: "Elliot",
  lastName: "Alderson",
  password: "demo",
} as const

export const MOCK_PORTAL_TOKEN = {
  id: "8aaf592e-366c-475a-b477-482e73e70acf",
  secret:
    "admin-3f1c9b7e2d4a6c8e0b2d4f6a8c0e2a4c6e8a0c2e4a6c8e0a2c4e6a8c0e2a4c6e8av3",
  name: "Portal Token",
} as const

export const MOCK_PRODUCTS = {
  wallet: {
    id: "c59cfe19-5781-4b72-8c37-b835dd5a8afe",
    name: "Ecoin Wallet",
    code: "ECOIN_WALLET",
    url: "https://ecorp.example/ecoin-wallet",
    distributionStrategy: "LICENSED",
  },
  archive: {
    id: "00225f1e-8797-414e-a31c-440e657ca4d8",
    name: "Enterprise Archive",
    code: "ENTERPRISE_ARCHIVE",
    url: "https://ecorp.example/archive",
    distributionStrategy: "CLOSED",
  },
  gateway: {
    id: "af25be97-a609-4db1-b718-f2b0bdc0969e",
    name: "Payments Gateway",
    code: "PAYMENTS_GATEWAY",
    url: "https://ecorp.example/payments-gateway",
    distributionStrategy: "LICENSED",
  },
} as const

export const MOCK_POLICIES = {
  branchWorkstation: {
    id: "f9e2d7c4-3b1a-4e8f-9c6d-2a1b3c4d9a10",
    name: "Branch Workstation",
    product: MOCK_PRODUCTS.wallet.id,
  },
  tradingDesk: {
    id: "0bd5b3a3-7c2e-4f1a-8d9b-6e5f4a3b2c1a",
    name: "Trading Desk",
    product: MOCK_PRODUCTS.wallet.id,
  },
  archiveNode: {
    id: "6f4f3a2b-1e0d-4c9b-8a7f-6e5d4c3b3a77",
    name: "Archive Node",
    product: MOCK_PRODUCTS.archive.id,
  },
  gatewayRelay: {
    id: "2d7e9f1a-5b3c-4d6e-8f0a-1b2c3d4e5f60",
    name: "Gateway Relay",
    product: MOCK_PRODUCTS.gateway.id,
  },
  evaluation: {
    id: "8a1b2c3d-4e5f-4a6b-9c7d-0e1f2a3b4c5d",
    name: "Evaluation",
    product: MOCK_PRODUCTS.wallet.id,
  },
} as const

export const MOCK_ENTITLEMENTS = {
  encryptionAtRest: {
    id: "b7f5c3a1-9e8d-4c6b-a5f4-3e2d1c0b9a81",
    name: "Encryption at Rest",
    code: "FEATURE_ENCRYPTION_AT_REST",
  },
  hardwareKeys: {
    id: "c8a6d4b2-0f9e-4d7c-b6a5-4f3e2d1c0b92",
    name: "Hardware Keys",
    code: "FEATURE_HARDWARE_KEYS",
  },
  highAvailability: {
    id: "d9b7e5c3-1a0f-4e8d-c7b6-5a4f3e2d1ca3",
    name: "High Availability",
    code: "FEATURE_HIGH_AVAILABILITY",
  },
  accessControl: {
    id: "eac8f6d4-2b1a-4f9e-d8c7-6b5a4f3e2db4",
    name: "Role-Based Access Control",
    code: "FEATURE_RBAC",
  },
  fraudAnalytics: {
    id: "fbd9a7e5-3c2b-4a0f-e9d8-7c6b5a4f3ec5",
    name: "Fraud Analytics",
    code: "FEATURE_FRAUD_ANALYTICS",
  },
  ledgerExport: {
    id: "aceab8f6-4d3c-4b1a-fae9-8d7c6b5a4fd6",
    name: "Ledger Export",
    code: "FEATURE_LEDGER_EXPORT",
  },
} as const

export const MOCK_GROUPS = {
  enterprise: {
    id: "39ab9b8a-c020-43bb-ae66-7c41bd83a80f",
    name: "Enterprise Accounts",
  },
} as const

export const MOCK_HERO_LICENSE = {
  id: "65aced02-eb89-417d-bd5b-64b3ea305480",
  key: "C7A9F1-3B2E4D-8A6C0F-1E9B7D-5A3C2E-4F6B8D-V3",
  name: "Acme Corporation: Site License",
} as const

export const MOCK_PACKAGES = {
  wallet: {
    id: "ddc61267-d754-48f2-a50b-a85f3418cc92",
    name: "Ecoin Wallet Installer",
    key: "ecoin-wallet",
  },
} as const

export const MOCK_RELEASES = {
  walletStable: {
    id: "3c206141-3df7-4278-878d-178706fe1834",
    version: "6.2.0",
  },
} as const

export const MOCK_WEBHOOK_ENDPOINTS = {
  main: {
    id: "fb94920e-9f5b-4a61-b5fa-40bb4ebc1885",
    url: "https://hooks.ecorp.example/keygen",
  },
} as const

export const MOCK_TEAM = [
  { firstName: "Dana", lastName: "Whitfield", role: "admin" },
  { firstName: "Desmond", lastName: "Hartley", role: "admin" },
  { firstName: "Theo", lastName: "Calloway", role: "developer" },
  { firstName: "Isabel", lastName: "Reyes", role: "developer" },
  { firstName: "Warren", lastName: "Ashford", role: "sales-agent" },
  { firstName: "Celeste", lastName: "Novak", role: "support-agent" },
  { firstName: "Graham", lastName: "Vance", role: "support-agent" },
  { firstName: "Iris", lastName: "Delgado", role: "read-only" },
] as const

export const MOCK_ORGANIZATIONS = [
  "Acme Corporation",
  "Contoso Ltd",
  "Fabrikam Inc",
  "Northwind Traders",
  "Adventure Works",
  "Wide World Importers",
  "Relecloud",
  "Woodgrove Bank",
  "Proseware Inc",
  "Litware Inc",
  "Lucerne Publishing",
  "Trey Research",
  "Blue Yonder Airlines",
  "Coho Vineyard",
  "Humongous Insurance",
  "Consolidated Messenger",
] as const

export const MOCK_CUSTOMER_DOMAINS = [
  "acme.example",
  "contoso.example",
  "fabrikam.example",
  "northwind.example",
  "adventure-works.example",
  "wideworldimporters.example",
  "relecloud.example",
  "woodgrovebank.example",
  "proseware.example",
  "litware.example",
  "lucernepublishing.example",
  "treyresearch.example",
  "blueyonder.example",
  "cohovineyard.example",
  "humongousinsurance.example",
  "consolidatedmessenger.example",
] as const

export const MOCK_FIRST_NAMES = [
  "Avery",
  "Blake",
  "Casey",
  "Dakota",
  "Emerson",
  "Finley",
  "Harper",
  "Jordan",
  "Kai",
  "Logan",
  "Morgan",
  "Noor",
  "Parker",
  "Quinn",
  "Reese",
  "Rowan",
  "Sasha",
  "Taylor",
  "Wren",
  "Zion",
] as const

export const MOCK_LAST_NAMES = [
  "Abara",
  "Bennett",
  "Chen",
  "Dubois",
  "Eriksen",
  "Fischer",
  "Garcia",
  "Haddad",
  "Ivanova",
  "Jensen",
  "Kimura",
  "Lindqvist",
  "Moreau",
  "Nakamura",
  "Okafor",
  "Petrov",
  "Quiroga",
  "Rahman",
  "Silva",
  "Tanaka",
] as const

export const MOCK_SEED = 117
