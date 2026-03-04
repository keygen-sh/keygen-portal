export enum Encoding {
  Base64 = "base64",
  Aes256Gcm = "aes-256-gcm",
}

export enum SigningAlgorithm {
  Ed25519 = "ed25519",
  EcdsaP256 = "ecdsa-p256",
  RsaPssSha256 = "rsa-pss-sha256",
  RsaSha256 = "rsa-sha256",
}

export const SigningAlgorithmLabels: Readonly<
  Record<SigningAlgorithm, string>
> = {
  [SigningAlgorithm.Ed25519]: "Ed25519",
  [SigningAlgorithm.EcdsaP256]: "ECDSA P-256",
  [SigningAlgorithm.RsaPssSha256]: "RSA PKCS1-PSS",
  [SigningAlgorithm.RsaSha256]: "RSA PKCS1",
} as const
