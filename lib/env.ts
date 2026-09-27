/**
 * SYM Egypt Enterprise Platform - Client-Safe Environment Accessor
 * 
 * SECURITY POLICY:
 * - ONLY variables starting with NEXT_PUBLIC_ are ever exposed to the client bundle.
 * - Secret variables (FAWRY_SECURITY_KEY, DB_PASS, etc.) must NEVER be accessed here.
 */

export const env = {
  // Public Configuration
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://symegypt.com',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  CLARITY_PROJECT_ID: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || '',

  // Environment mode
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

/**
 * Validates that no backend secret variables were accidentally compiled into client bundle
 */
export function assertClientEnvironmentSafety(): boolean {
  if (typeof window !== 'undefined') {
    // Check global scope for any accidental leakage
    const windowObj = window as unknown as Record<string, unknown>;
    const forbiddenKeys = [
      'DB_PASS',
      'DB_USER',
      'FAWRY_SECURITY_KEY',
      'FAWRY_MERCHANT_CODE',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    for (const key of forbiddenKeys) {
      if (windowObj[key] !== undefined) {
        console.error(`[CRITICAL SECURITY ALERT] Leaked secret key detected: ${key}`);
        return false;
      }
    }
  }
  return true;
}
