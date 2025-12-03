import fs from 'fs';

/**
 * Reads a secret from Docker secrets file (/run/secrets/) or falls back to env var
 * @param secretName - Name of the secret file in /run/secrets/
 * @param envVarName - Name of the environment variable fallback
 * @returns The secret value
 */
export function getSecret(secretName: string, envVarName: string): string & { length: number } {
  console.log(`🔐 Loading secret: ${secretName} (fallback env: ${envVarName})`);

  const secretPath = `/run/secrets/${secretName}`;

  // Try Docker secret first (production)
  try {
    if (fs.existsSync(secretPath)) {
      const value = fs.readFileSync(secretPath, 'utf-8').trim();
      console.log(`✓ Secret '${secretName}' loaded from Docker secrets`);
      return value;
    }
  } catch (error) {
    throw new Error(
      `Failed to read Docker secret '${secretName}': ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // Fallback to environment variable (development)
  const envValue = process.env[envVarName];
  if (!envValue) {
    throw new Error(
      `Missing secret: Neither Docker secret '${secretName}' nor env var '${envVarName}' found`,
    );
  }

  console.log(`✓ Secret '${secretName}' loaded from environment variable`);
  return envValue;
}
