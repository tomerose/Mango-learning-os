/**
 * MangoOS — Single Source of Version Truth
 *
 * All version-aware code (update modals, SW caches, onboarding, etc.)
 * MUST reference APP_VERSION from here. No hardcoded version strings.
 *
 * REGRESSION PREVENTION:
 * - All features live on `main` branch. No feature-silo branches.
 * - Before merge: verify `npm run build` passes with 0 errors.
 * - After deploy: verify key routes (/hub, /agent, /pack, /profile) return 200.
 */
export const APP_VERSION = "14.7.3";
export const APP_NAME = "Mango Learning OS";
export const APP_SLOGAN = "把焦虑变成准备";
export const APP_STUDIO = "第三自习室出品";

/** Service Worker cache key — bump on major UI changes to force client refresh */
export const SW_CACHE_KEY = `mango-v${APP_VERSION}`;

/** Onboarding — bump to re-show onboarding to existing users */
export const ONBOARDING_KEY = "mango-onboarding-v4";

/** Update changelog — bump to show what's-new modal. Set to "" to disable. */
export const UPDATE_CHANGELOG_KEY = ""; // disabled — user prefers no update modal
