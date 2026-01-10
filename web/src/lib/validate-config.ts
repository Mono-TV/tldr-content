/**
 * TLDR Content - Configuration Validator
 *
 * This module ensures all configurations are confined to the correct projects:
 * - GCP: tldr-music (401132033262)
 * - Firebase: content-lumiolabs-internal (865621748276)
 */

// Project boundaries - DO NOT MODIFY
const ALLOWED_CONFIG = {
  firebase: {
    projectId: 'content-lumiolabs-internal',
    authDomain: 'content-lumiolabs-internal.firebaseapp.com',
  },
  gcp: {
    projectId: 'tldr-music',
    projectNumber: '401132033262',
  },
} as const;

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates Firebase configuration against allowed projects
 */
export function validateFirebaseConfig(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Check if Firebase config is present
  const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

  if (!firebaseProjectId) {
    result.errors.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not defined');
    result.valid = false;
    return result;
  }

  // Validate Firebase Project ID
  if (firebaseProjectId !== ALLOWED_CONFIG.firebase.projectId) {
    result.errors.push(
      `Invalid Firebase Project ID. Expected: ${ALLOWED_CONFIG.firebase.projectId}, Got: ${firebaseProjectId}`
    );
    result.valid = false;
  }

  // Validate Firebase Auth Domain
  if (firebaseAuthDomain && firebaseAuthDomain !== ALLOWED_CONFIG.firebase.authDomain) {
    result.warnings.push(
      `Firebase Auth Domain mismatch. Expected: ${ALLOWED_CONFIG.firebase.authDomain}, Got: ${firebaseAuthDomain}`
    );
  }

  return result;
}

/**
 * Validates all project configurations
 */
export function validateProjectConfig(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Validate Firebase
  const firebaseValidation = validateFirebaseConfig();
  result.errors.push(...firebaseValidation.errors);
  result.warnings.push(...firebaseValidation.warnings);

  if (!firebaseValidation.valid) {
    result.valid = false;
  }

  return result;
}

/**
 * Throws an error if configuration is invalid (use in server-side code)
 */
export function assertValidConfig(): void {
  const validation = validateProjectConfig();

  if (!validation.valid) {
    const errorMessage = [
      '❌ Invalid project configuration detected!',
      '',
      'This application MUST be configured with:',
      `  • Firebase Project: ${ALLOWED_CONFIG.firebase.projectId}`,
      `  • GCP Project: ${ALLOWED_CONFIG.gcp.projectId}`,
      '',
      'Errors:',
      ...validation.errors.map(e => `  - ${e}`),
      '',
      validation.warnings.length > 0 ? 'Warnings:' : '',
      ...validation.warnings.map(w => `  - ${w}`),
    ].filter(Boolean).join('\n');

    throw new Error(errorMessage);
  }

  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Configuration warnings:');
    validation.warnings.forEach(w => console.warn(`  - ${w}`));
  }
}

/**
 * Gets allowed configuration (read-only)
 */
export function getAllowedConfig() {
  return ALLOWED_CONFIG;
}

/**
 * Development helper to check config status
 */
export function getConfigStatus() {
  const validation = validateProjectConfig();

  return {
    ...validation,
    currentConfig: {
      firebase: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      },
    },
    allowedConfig: ALLOWED_CONFIG,
  };
}
