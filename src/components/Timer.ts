/**
 * Options used to create the timer.
 */
export interface TimerOptions {
  // Automatically begin counting when created.
  autoStart?: boolean;

  // Starting time, useful when restoring saved progress.
  initialSeconds?: number;

  // Runs every time the visible second changes.
  onTick?: (seconds: number) => void;
}

/**
 * Methods returned by the timer.
 */
export interface TimerController {
  element: HTMLElement;

  start: () => void;
  pause: () => void;
  reset: (newSeconds?: number) => void;
  stop: () => void;

  getSeconds: () => number;
  getFormattedTime: () => string;
  isRunning: () => boolean;
}

/**
 * Creates a timer display.
 */
export function createTimer(
  options: TimerOptions = {}
): TimerController {
  let elapsedSeconds =
    options.initialSeconds ?? 0;

  let running = false;

  /**
   * setInterval returns a number in a browser project.
   * null means no interval is currently active.
   */
  let intervalId: number | null = null;

  const timerElement =
    document.createElement("div");

  timerElement.className = "timer";
  timerElement.setAttribute(
    "aria-label",
    "Puzzle timer"
  );

  const labelElement =
    document.createElement("span");

  labelElement.className = "timer__label";
  labelElement.textContent = "Time";

  const valueElement =
    document.createElement("time");

  valueElement.className = "timer__value";

  timerElement.append(
    labelElement,
    valueElement
  );

  /**
   * Convert seconds into MM:SS or HH:MM:SS.
   */
  function formatTime(
    totalSeconds: number
  ): string {
    const hours = Math.floor(
      totalSeconds / 3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    const minutesText = String(
      minutes
    ).padStart(2, "0");

    const secondsText = String(
      seconds
    ).padStart(2, "0");

    if (hours > 0) {
      const hoursText = String(
        hours
      ).padStart(2, "0");

      return `${hoursText}:${minutesText}:${secondsText}`;
    }

    return `${minutesText}:${secondsText}`;
  }

  /**
   * Refresh the time shown on the screen.
   */
  function render(): void {
    const formattedTime =
      formatTime(elapsedSeconds);

    valueElement.textContent =
      formattedTime;

    /**
     * The datetime property provides a machine-readable
     * duration for browsers and accessibility tools.
     */
    valueElement.dateTime =
      `PT${elapsedSeconds}S`;
  }

  /**
   * Start counting.
   */
  function start(): void {
    // Do nothing if the timer is already running.
    if (running) {
      return;
    }

    running = true;

    intervalId = window.setInterval(() => {
      elapsedSeconds += 1;

      render();
      options.onTick?.(elapsedSeconds);
    }, 1000);
  }

  /**
   * Pause without changing the current time.
   */
  function pause(): void {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }

    running = false;
  }

  /**
   * Reset to zero or a supplied value.
   */
  function reset(
    newSeconds = 0
  ): void {
    elapsedSeconds = newSeconds;

    render();
    options.onTick?.(elapsedSeconds);
  }

  /**
   * Stop is currently the same as pause.
   *
   * Giving it a separate name makes HomePage code easier
   * to understand when the player finishes the puzzle.
   */
  function stop(): void {
    pause();
  }

  render();

  if (options.autoStart) {
    start();
  }

  return {
    element: timerElement,
    start,
    pause,
    reset,
    stop,
    getSeconds: () => elapsedSeconds,
    getFormattedTime: () =>
      formatTime(elapsedSeconds),
    isRunning: () => running
  };
}