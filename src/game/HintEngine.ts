import {
  evaluateClue,
  getBookTitle,
  type ClueDefinition,
  type Puzzle
} from "./PuzzleEngine";

/**
 * The information returned for one hint.
 */
export interface HintResult {
  text: string;
  clueId?: string;
}

/**
 * Build a hint for a specific clue.
 */
function createClueHint(
  puzzle: Puzzle,
  clue: ClueDefinition,
  hintLevel: number
): string {
  switch (clue.type) {
    case "leftOf": {
      const first = getBookTitle(
        puzzle,
        clue.firstBookId
      );

      const second = getBookTitle(
        puzzle,
        clue.secondBookId
      );

      if (hintLevel === 0) {
        return `Focus on the clue involving ${first} and ${second}.`;
      }

      return `${first} must appear somewhere before ${second}.`;
    }

    case "adjacent": {
      const first = getBookTitle(
        puzzle,
        clue.firstBookId
      );

      const second = getBookTitle(
        puzzle,
        clue.secondBookId
      );

      if (hintLevel === 0) {
        return `${first} and ${second} should be treated as a pair.`;
      }

      return `Place ${first} directly beside ${second}.`;
    }

    case "immediatelyBefore": {
      const first = getBookTitle(
        puzzle,
        clue.firstBookId
      );

      const second = getBookTitle(
        puzzle,
        clue.secondBookId
      );

      if (hintLevel === 0) {
        return `Try creating a two-book block using ${first} and ${second}.`;
      }

      return `${first} should sit directly to the left of ${second}.`;
    }

    case "position": {
      const title = getBookTitle(
        puzzle,
        clue.bookId
      );

      if (hintLevel === 0) {
        return `One clue gives an exact position for ${title}.`;
      }

      return `${title} belongs in position ${clue.position}.`;
    }

    case "notPosition": {
      const title = getBookTitle(
        puzzle,
        clue.bookId
      );

      const positions =
        clue.forbiddenPositions.join(" or ");

      if (hintLevel === 0) {
        return `Check whether ${title} is in a forbidden position.`;
      }

      return `${title} cannot be in position ${positions}.`;
    }
  }
}

/**
 * Get a useful hint based on the player's current order.
 */
export function getHint(
  puzzle: Puzzle,
  order: string[],
  hintsAlreadyUsed: number
): HintResult {
  /**
   * Find clues that are currently not satisfied.
   */
  const unsatisfiedClues =
    puzzle.clues.filter(
      (clue) => !evaluateClue(order, clue)
    );

  /**
   * If all clues are true, the player may simply need
   * to press Check Shelf.
   */
  if (unsatisfiedClues.length === 0) {
    return {
      text:
        "Every clue currently looks correct. Try checking the shelf."
    };
  }

  /**
   * Cycle through the unsatisfied clues so repeated hints
   * do not always show the same message.
   */
  const clueIndex =
    hintsAlreadyUsed %
    unsatisfiedClues.length;

  const selectedClue =
    unsatisfiedClues[clueIndex];

  /**
   * The first hint is gentle.
   * Later hints become more direct.
   */
  const hintLevel =
    hintsAlreadyUsed === 0 ? 0 : 1;

  return {
    clueId: selectedClue.id,
    text: createClueHint(
      puzzle,
      selectedClue,
      hintLevel
    )
  };
}