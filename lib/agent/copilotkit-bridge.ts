/**
 * MangoOS V14.8.1 — CopilotKit Bridge
 * Foundation for Generative UI and Human-in-the-Loop agent workflows.
 *
 * Phase 1 (current): Provider + shared state setup
 * Phase 2 (future): Generative UI cards for Agent outputs
 * Phase 3 (future): Human-in-the-Loop review before PDF export
 *
 * @see https://docs.copilotkit.ai
 */

import type { ReactNode } from "react";

// ── Agent State Types (shared between AI and UI) ───────────────

export interface AgentUIState {
  /** Current agent task type */
  taskType: string | null;
  /** Agent is processing */
  isRunning: boolean;
  /** Current quality score */
  qualityScore: number | null;
  /** Whether the result passed quality gate */
  qualityPassed: boolean;
  /** Active review mode (human-in-the-loop) */
  reviewMode: "none" | "pending" | "approved" | "rejected";
  /** Current output sections for rendering */
  sections: AgentUISection[];
}

export interface AgentUISection {
  id: string;
  title: string;
  content: string;
  collapsed: boolean;
}

// ── Placeholder — CopilotKit provider wraps the app in layout.tsx
//    when Generative UI is enabled.
//
//    Usage (future):
//    ```tsx
//    import { CopilotKit } from "@copilotkit/react-core";
//    <CopilotKit runtimeUrl="/api/agent/copilotkit">
//      {children}
//    </CopilotKit>
//    ```
// ──

/** Default empty state for the agent UI */
export const DEFAULT_AGENT_UI_STATE: AgentUIState = {
  taskType: null,
  isRunning: false,
  qualityScore: null,
  qualityPassed: false,
  reviewMode: "none",
  sections: [],
};

/**
 * Agent UI action types — dispatched from AI tool calls
 * to trigger Generative UI updates.
 */
export type AgentUIAction =
  | { type: "AGENT_START"; taskType: string }
  | { type: "AGENT_PROGRESS"; score: number }
  | { type: "AGENT_COMPLETE"; passed: boolean; score: number; sections: AgentUISection[] }
  | { type: "AGENT_REVIEW"; mode: "pending" | "approved" | "rejected" }
  | { type: "AGENT_RESET" };

/**
 * Reducer for Agent UI state transitions.
 * Used with useReducer in the Agent page for frontend state management.
 */
export function agentUIReducer(
  state: AgentUIState,
  action: AgentUIAction
): AgentUIState {
  switch (action.type) {
    case "AGENT_START":
      return { ...DEFAULT_AGENT_UI_STATE, taskType: action.taskType, isRunning: true };
    case "AGENT_PROGRESS":
      return { ...state, qualityScore: action.score };
    case "AGENT_COMPLETE":
      return {
        ...state,
        isRunning: false,
        qualityPassed: action.passed,
        qualityScore: action.score,
        sections: action.sections,
        reviewMode: action.passed ? "none" : "pending",
      };
    case "AGENT_REVIEW":
      return { ...state, reviewMode: action.mode };
    case "AGENT_RESET":
      return DEFAULT_AGENT_UI_STATE;
    default:
      return state;
  }
}
