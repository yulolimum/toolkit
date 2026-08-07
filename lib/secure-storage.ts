import type { SecureStorageSchema } from '../services/secure-storage'

import { SecureStorage } from '../services/secure-storage'

export const secureStorage = new SecureStorage({
  accessToken: { default: undefined as string | undefined },
  refreshToken: { default: undefined as string | undefined },
} satisfies SecureStorageSchema)
