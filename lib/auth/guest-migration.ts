// ═══════════════════════════════════════════════════════════════
// Guest State Migration Bridge
// When a guest user triggers login, their temporary state is saved
// to sessionStorage. After successful auth, it's restored into the
// cloud workspace — no data loss, no blank reloads.
// ═══════════════════════════════════════════════════════════════

const BRIDGE_KEY = "mango-guest-bridge-v1";

interface GuestBridgeData {
  savedAt: string;
  returnPath: string;
  // Study Pack state
  lastStudyPackInput?: { courseName: string; school: string; scope: string };
  // Agent state
  lastAgentIntent?: string;
  // Notes draft
  draftNote?: { subject: string; content: string };
  // Any other guest-typed content
  customData?: Record<string, unknown>;
}

/** Save guest state before redirecting to login. */
export function saveGuestBridge(data: Partial<GuestBridgeData>) {
  try {
    const existing = loadGuestBridge();
    const merged: GuestBridgeData = {
      savedAt: new Date().toISOString(),
      returnPath: data.returnPath ?? existing?.returnPath ?? "/dashboard",
      lastStudyPackInput: data.lastStudyPackInput ?? existing?.lastStudyPackInput,
      lastAgentIntent: data.lastAgentIntent ?? existing?.lastAgentIntent,
      draftNote: data.draftNote ?? existing?.draftNote,
      customData: { ...(existing?.customData ?? {}), ...(data.customData ?? {}) },
    };
    sessionStorage.setItem(BRIDGE_KEY, JSON.stringify(merged));
  } catch {}
}

/** Load saved guest state after login. */
export function loadGuestBridge(): GuestBridgeData | null {
  try {
    const raw = sessionStorage.getItem(BRIDGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as GuestBridgeData;

    // Expire after 30 minutes
    const savedTime = new Date(data.savedAt).getTime();
    if (Date.now() - savedTime > 30 * 60 * 1000) {
      sessionStorage.removeItem(BRIDGE_KEY);
      return null;
    }

    return data;
  } catch { return null; }
}

/** Clear the bridge after successful migration. */
export function clearGuestBridge() {
  try { sessionStorage.removeItem(BRIDGE_KEY); } catch {}
}

/** Check if there's guest data to migrate. */
export function hasGuestBridge(): boolean {
  return loadGuestBridge() !== null;
}

/** Get the return path that was stored before login redirect. */
export function getBridgeReturnPath(): string | null {
  const bridge = loadGuestBridge();
  return bridge?.returnPath ?? null;
}
