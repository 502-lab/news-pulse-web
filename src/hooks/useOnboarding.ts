import { useReducer } from "react";
import type { Dispatch } from "react";
import { submitOnboarding } from "@/lib/api/auth";
import {
  AGE_TO_ENUM,
  ONB_KW_GROUPS,
  type Category,
  type ConsumeMode,
  type SummaryDepth,
  type VoiceId,
} from "@/constants/onboarding";
import type { components } from "../../generated/api-types";

type OnboardingRequest = components["schemas"]["OnboardingRequest"];

export interface OnboardingFormState {
  step: 1 | 2 | 3 | 4 | 5;
  nick: string;
  age: string;
  job: string;
  topics: Category[];
  keywords: string[];
  depth: SummaryDepth;
  consumeMode: ConsumeMode;
  briefingTime: string;
  voice: VoiceId | null;
  pushAgreed: boolean;
  submitStatus: "idle" | "loading" | "error";
  submitError: string;
}

export type OnboardingAction =
  | { type: "SET_NICK"; value: string }
  | { type: "SET_AGE"; value: string }
  | { type: "SET_JOB"; value: string }
  | { type: "TOGGLE_TOPIC"; value: Category }
  | { type: "TOGGLE_KW"; value: string }
  | { type: "SET_DEPTH"; value: SummaryDepth }
  | { type: "SET_CONSUME_MODE"; value: ConsumeMode }
  | { type: "SET_TIME"; value: string }
  | { type: "SET_VOICE"; value: VoiceId | null }
  | { type: "SET_PUSH"; value: boolean }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "SKIP" }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "SUBMIT_RESET" };

const INITIAL_STATE: OnboardingFormState = {
  step: 1,
  nick: "",
  age: "",
  job: "",
  topics: [],
  keywords: [],
  depth: "BALANCED",
  consumeMode: "READ",
  briefingTime: "07:30",
  voice: null,
  pushAgreed: true,
  submitStatus: "idle",
  submitError: "",
};

function onboardingReducer(
  state: OnboardingFormState,
  action: OnboardingAction,
): OnboardingFormState {
  switch (action.type) {
    case "SET_NICK":
      return { ...state, nick: action.value };
    case "SET_AGE":
      return { ...state, age: state.age === action.value ? "" : action.value };
    case "SET_JOB":
      return { ...state, job: state.job === action.value ? "" : action.value };
    case "TOGGLE_TOPIC":
      return {
        ...state,
        topics: state.topics.includes(action.value)
          ? state.topics.filter((t) => t !== action.value)
          : [...state.topics, action.value],
      };
    case "TOGGLE_KW":
      return {
        ...state,
        keywords: state.keywords.includes(action.value)
          ? state.keywords.filter((k) => k !== action.value)
          : [...state.keywords, action.value],
      };
    case "SET_DEPTH":
      return { ...state, depth: action.value };
    case "SET_CONSUME_MODE":
      return { ...state, consumeMode: action.value };
    case "SET_TIME":
      return { ...state, briefingTime: action.value };
    case "SET_VOICE":
      return { ...state, voice: action.value };
    case "SET_PUSH":
      return { ...state, pushAgreed: action.value };
    case "NEXT":
      return state.step < 5
        ? { ...state, step: (state.step + 1) as OnboardingFormState["step"] }
        : state;
    case "BACK":
      return state.step > 1
        ? { ...state, step: (state.step - 1) as OnboardingFormState["step"] }
        : state;
    case "SKIP":
      if (state.step === 3 || state.step === 4) {
        return {
          ...state,
          step: (state.step + 1) as OnboardingFormState["step"],
        };
      }
      return state;
    case "SUBMIT_START":
      return { ...state, submitStatus: "loading", submitError: "" };
    case "SUBMIT_ERROR":
      return { ...state, submitStatus: "error", submitError: action.error };
    case "SUBMIT_RESET":
      return { ...state, submitStatus: "idle", submitError: "" };
    default:
      return state;
  }
}

function getCanProceed(state: OnboardingFormState): boolean {
  if (state.step === 1) return state.nick.trim().length > 0;
  if (state.step === 2) return state.topics.length >= 3;
  return true;
}

function buildPayload(state: OnboardingFormState): OnboardingRequest {
  const trimmedNick = state.nick.trim();
  return {
    nickname: trimmedNick || undefined,
    ageGroup: state.age
      ? (AGE_TO_ENUM[state.age] as OnboardingRequest["ageGroup"])
      : undefined,
    occupation: state.job || undefined,
    categories: state.topics,
    keywords:
      state.keywords.length > 0
        ? state.keywords.map((kw) => {
            const group = ONB_KW_GROUPS.find((g) => g.items.includes(kw));
            return { keyword: kw, type: group?.type ?? "THEME" };
          })
        : undefined,
    summaryDepth: state.depth,
    consumeMode: state.consumeMode,
    briefingTime: state.briefingTime,
    timezoneOffset: new Date().getTimezoneOffset() * -1,
    voiceEnabled: state.voice !== null,
    pushAgreed: state.pushAgreed,
  };
}

export interface UseOnboardingReturn {
  state: OnboardingFormState;
  dispatch: Dispatch<OnboardingAction>;
  canProceed: boolean;
  next: () => void;
  back: () => void;
  skip: () => void;
  submit: () => Promise<void>;
}

export function useOnboarding(): UseOnboardingReturn {
  const [state, dispatch] = useReducer(onboardingReducer, INITIAL_STATE);
  const canProceed = getCanProceed(state);

  function next() {
    if (state.step < 5) {
      dispatch({ type: "NEXT" });
    }
  }

  function back() {
    dispatch({ type: "BACK" });
  }

  function skip() {
    dispatch({ type: "SKIP" });
  }

  async function submit(): Promise<void> {
    if (state.submitStatus === "loading") return;
    dispatch({ type: "SUBMIT_START" });
    try {
      await submitOnboarding(buildPayload(state));
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "설정 저장 중 오류가 발생했습니다. 다시 시도해주세요.";
      dispatch({ type: "SUBMIT_ERROR", error: msg });
      throw err;
    }
  }

  return { state, dispatch, canProceed, next, back, skip, submit };
}
