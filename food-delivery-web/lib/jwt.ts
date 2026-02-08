/**
 * Decode a JWT token and return the payload as a typed object.
 * Does NOT verify the signature — this is for extracting claims only.
 */
export function decodeJwt(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;

        // Base64url → Base64 → decode
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(base64);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

// The .NET role claim key used by ASP.NET Identity / IdentityServer
const ROLE_CLAIM =
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

/**
 * Extract roles from a JWT access token.
 * Handles both a single string value and an array of strings.
 */
export function getRolesFromToken(token: string): string[] {
    const payload = decodeJwt(token);
    if (!payload) return [];

    const roleClaim = payload[ROLE_CLAIM] ?? payload['role'];
    if (!roleClaim) return [];

    return Array.isArray(roleClaim) ? roleClaim : [roleClaim as string];
}
