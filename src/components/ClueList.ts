/**
 * The possible states of a clue.
 *
 * "unchecked" means the player has not pressed Check yet.
 */
export type ClueStatus =
  | "unchecked"
  | "satisfied"
  | "unsatisfied";

/**
 * Information needed to display one clue.
 */
export interface ClueData {
  id: string;
  text: string;
  status?: ClueStatus;
}

/**
 * Methods returned by the clue list.
 */
export interface ClueListController {
  element: HTMLElement;

  // Replace all clues.
  setClues: (clues: ClueData[]) => void;

  // Update only the statuses of existing clues.
  updateStatuses: (
    statuses: Record<string, ClueStatus>
  ) => void;

  // Set every clue back to unchecked.
  resetStatuses: () => void;
}

/**
 * Creates the list of puzzle clues.
 */
export function createClueList(
  startingClues: ClueData[]
): ClueListController {
  let clues: ClueData[] = startingClues.map(
    (clue) => ({
      ...clue,
      status: clue.status ?? "unchecked"
    })
  );

  const section =
    document.createElement("section");

  section.className = "clues";
  section.setAttribute(
    "aria-labelledby",
    "clue-list-heading"
  );

  /**
   * Builds the clue list from the current clue data.
   */
  function render(): void {
    section.replaceChildren();

    const heading =
      document.createElement("h2");

    heading.id = "clue-list-heading";
    heading.className = "clues__heading";
    heading.textContent = "Clues";

    const list =
      document.createElement("ol");

    list.className = "clues__list";

    clues.forEach((clue) => {
      const listItem =
        document.createElement("li");

      listItem.className = "clues__item";
      listItem.dataset.clueId = clue.id;

      const status =
        clue.status ?? "unchecked";

      listItem.classList.add(
        `clues__item--${status}`
      );

      const statusIcon =
        document.createElement("span");

      statusIcon.className = "clues__status";
      statusIcon.setAttribute(
        "aria-hidden",
        "true"
      );

      /**
       * Use a different symbol for each clue state.
       */
      switch (status) {
        case "satisfied":
          statusIcon.textContent = "✓";
          break;

        case "unsatisfied":
          statusIcon.textContent = "○";
          break;

        default:
          statusIcon.textContent = "•";
      }

      const textElement =
        document.createElement("span");

      textElement.className = "clues__text";
      textElement.textContent = clue.text;

      listItem.append(
        statusIcon,
        textElement
      );

      list.append(listItem);
    });

    section.append(heading, list);
  }

  /**
   * Replace every clue.
   */
  function setClues(
    updatedClues: ClueData[]
  ): void {
    clues = updatedClues.map((clue) => ({
      ...clue,
      status: clue.status ?? "unchecked"
    }));

    render();
  }

  /**
   * Update clue statuses by clue ID.
   *
   * Example:
   *
   * updateStatuses({
   *   "clue-1": "satisfied",
   *   "clue-2": "unsatisfied"
   * });
   */
  function updateStatuses(
    statuses: Record<string, ClueStatus>
  ): void {
    clues = clues.map((clue) => {
      const newStatus = statuses[clue.id];

      // Keep the old status if no new one was provided.
      if (!newStatus) {
        return clue;
      }

      return {
        ...clue,
        status: newStatus
      };
    });

    render();
  }

  /**
   * Return every clue to its original unchecked state.
   */
  function resetStatuses(): void {
    clues = clues.map((clue) => ({
      ...clue,
      status: "unchecked"
    }));

    render();
  }

  render();

  return {
    element: section,
    setClues,
    updateStatuses,
    resetStatuses
  };
}