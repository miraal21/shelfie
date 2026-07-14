/**
 * Options used when creating the header.
 */
export interface HeaderOptions {
  title?: string;
  puzzleNumber?: number;

  // Called when the statistics button is clicked.
  onStatsClick?: () => void;

  // Called when the archive button is clicked.
  onArchiveClick?: () => void;

  // Called when the settings button is clicked.
  onSettingsClick?: () => void;
}

/**
 * Methods returned by the header.
 */
export interface HeaderController {
  element: HTMLElement;

  // Changes the puzzle number after creation.
  setPuzzleNumber: (
    puzzleNumber: number
  ) => void;
}

/**
 * Creates the top area of the website.
 */
export function createHeader(
  options: HeaderOptions = {}
): HeaderController {
  const header =
    document.createElement("header");

  header.className = "header";

  /**
   * Left-side navigation area.
   */
  const leftActions =
    document.createElement("nav");

  leftActions.className = "header__actions";
  leftActions.setAttribute(
    "aria-label",
    "Puzzle navigation"
  );

  const archiveButton = createHeaderButton(
    "📚",
    "Open puzzle archive",
    () => options.onArchiveClick?.()
  );

  leftActions.append(archiveButton);

  /**
   * Center title area.
   */
  const titleGroup =
    document.createElement("div");

  titleGroup.className =
    "header__title-group";

  const titleElement =
    document.createElement("h1");

  titleElement.className = "header__title";
  titleElement.textContent =
    options.title ?? "Shelfie";

  const puzzleNumberElement =
    document.createElement("p");

  puzzleNumberElement.className =
    "header__subtitle";

  function setPuzzleNumber(
    puzzleNumber: number
  ): void {
    puzzleNumberElement.textContent =
      `Puzzle #${puzzleNumber}`;
  }

  if (options.puzzleNumber !== undefined) {
    setPuzzleNumber(options.puzzleNumber);
  }

  titleGroup.append(
    titleElement,
    puzzleNumberElement
  );

  /**
   * Right-side actions.
   */
  const rightActions =
    document.createElement("nav");

  rightActions.className = "header__actions";
  rightActions.setAttribute(
    "aria-label",
    "Game options"
  );

  const statsButton = createHeaderButton(
    "📊",
    "Open statistics",
    () => options.onStatsClick?.()
  );

  const settingsButton = createHeaderButton(
    "⚙️",
    "Open settings",
    () => options.onSettingsClick?.()
  );

  rightActions.append(
    statsButton,
    settingsButton
  );

  header.append(
    leftActions,
    titleGroup,
    rightActions
  );

  return {
    element: header,
    setPuzzleNumber
  };
}

/**
 * Small helper that creates a header icon button.
 *
 * Keeping it here avoids repeating the same button code.
 */
function createHeaderButton(
  icon: string,
  label: string,
  onClick: () => void
): HTMLButtonElement {
  const button =
    document.createElement("button");

  button.type = "button";
  button.className = "header__button";
  button.textContent = icon;
  button.setAttribute("aria-label", label);

  button.addEventListener("click", onClick);

  return button;
}