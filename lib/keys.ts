import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

// Use environment variables for key paths, defaulting to /tmp for development.
// For production, these paths should point to a persistent volume.
const PRIVATE_KEY_PATH = process.env.JWT_RSA_PRIVATE_KEY_PATH || '/tmp/jwt_rsa_private_key.pem'
const PUBLIC_KEY_PATH = process.env.JWT_RSA_PUBLIC_KEY_PATH || '/tmp/jwt_rsa_public_key.pem'

interface KeyPair {
  privateKey: string
  publicKey: string
  kid: string // Key ID
}

// Cache the key pair in memory to avoid reading from the file system on every request.
let cachedKeyPair: KeyPair | null = null

export const getOrCreateKeyPair = (): KeyPair => {
  if (cachedKeyPair) {
    return cachedKeyPair
  }

  // Ensure the directory for keys exists before trying to read or write.
  const privateKeyDir = path.dirname(PRIVATE_KEY_PATH)
  const publicKeyDir = path.dirname(PUBLIC_KEY_PATH)
  if (!fs.existsSync(privateKeyDir)) fs.mkdirSync(privateKeyDir, { recursive: true })
  if (!fs.existsSync(publicKeyDir)) fs.mkdirSync(publicKeyDir, { recursive: true })

  // If keys don't exist, generate and save them.
  if (!fs.existsSync(PRIVATE_KEY_PATH) || !fs.existsSync(PUBLIC_KEY_PATH)) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    })

    fs.writeFileSync(PRIVATE_KEY_PATH, privateKey)
    fs.writeFileSync(PUBLIC_KEY_PATH, publicKey)
  }

  const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8')
  const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8')

  // Generate a Key ID (kid) from the public key hash for use in JWKS.
  const kid = crypto.createHash('sha256').update(publicKey).digest('hex').substring(0, 16)

  cachedKeyPair = { privateKey, publicKey, kid }
  return cachedKeyPair
}

export const getPublicKey = (): string => {
  return getOrCreateKeyPair().publicKey
}

export const getPrivateKey = (): string => {
  return getOrCreateKeyPair().privateKey
}

export const getKeyId = (): string => {
  return getOrCreateKeyPair().kid
}
