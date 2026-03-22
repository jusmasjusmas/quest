/** Horizontal sweep duration (matches Framer transition in WhimSuccessTransition). */
export const WHIM_SUCCESS_SWEEP_DURATION_SEC = 2.85;

/**
 * Time from phase-2 mount (after sweep) until joined → active should occur:
 * first line in, stagger, second line in, hold. Keep in sync with
 * `WhimSuccessTransition` (stagger + `HOLD_AFTER_SECOND_MS` + small buffer).
 */
export const WHIM_SUCCESS_PHASE2_FULL_MS = 2400;

/**
 * Min time whimState stays "joined" so the success overlay can finish sweep + phase 2.
 * Must stay in sync with WhimSuccessTransition + WhimContext timer.
 */
export const WHIM_JOINED_STATE_MIN_MS =
  Math.ceil(WHIM_SUCCESS_SWEEP_DURATION_SEC * 1000) +
  WHIM_SUCCESS_PHASE2_FULL_MS +
  900;
