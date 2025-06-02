import config from "./config"
export { config }

import { authenticate, AuthResponse } from "./authenticate"
export { authenticate }
export type { AuthResponse }

import { verify } from "./verify"
export { verify }

import * as environments from "./environments"
export { environments }

import { ErrorCode, error, isAuthError } from "./errors"
export { ErrorCode, error, isAuthError }

import { logout } from "./logout"
export { logout }
