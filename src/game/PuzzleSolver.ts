import {
  evaluateClue,
  type Puzzle
} from "./PuzzleEngine";

/**
 * Generate every possible arrangement of an array.
 *
 * This is called a permutation function.
 *
 * It is suitable for small puzzles with around 5–7 books.
 */
export function generatePermutations<T>(
  items: T[]
): T[][] {
  /**
   * An empty list has one possible arrangement:
   * the empty arrangement.
   */
  if (items.length === 0) {
    return [[]];
  }

  const results: T[][] = [];

  items.forEach((item, index) => {
    /**
     * Remove the selected item from the list.
     */
    const remainingItems = [
      ...items.slice(0, index),
      ...items.slice(index + 1)
    ];

    /**
     * Find all arrangements of the remaining items.
     */
    const remainingPermutations =
      generatePermutations(remainingItems);

    /**
     * Place the selected item at the beginning
     * of every smaller arrangement.
     */
    remainingPermutations.forEach(
      (permutation) => {
        results.push([item, ...permutation]);
      }
    );
  });

  return results;
}

/**
 * Check whether every clue is true for an order.
 */
export function orderPassesAllClues(
  puzzle: Puzzle,
  order: string[]
): boolean {
  return puzzle.clues.every((clue) =>
    evaluateClue(order, clue)
  );
}

/**
 * Find every arrangement that satisfies the clues.
 */
export function findPuzzleSolutions(
  puzzle: Puzzle
): string[][] {
  const bookIds = puzzle.books.map(
    (book) => book.id
  );

  const possibleOrders =
    generatePermutations(bookIds);

  return possibleOrders.filter((order) =>
    orderPassesAllClues(puzzle, order)
  );
}

/**
 * A good Shelfie puzzle should have exactly one solution.
 */
export function hasUniqueSolution(
  puzzle: Puzzle
): boolean {
  return findPuzzleSolutions(puzzle).length === 1;
}

/**
 * Validate a puzzle and return readable messages.
 */
export function validatePuzzle(
  puzzle: Puzzle
): string[] {
  const errors: string[] = [];

  const bookIds = puzzle.books.map(
    (book) => book.id
  );

  /**
   * Check for duplicate book IDs.
   */
  const uniqueBookIds = new Set(bookIds);

  if (uniqueBookIds.size !== bookIds.length) {
    errors.push(
      "The puzzle contains duplicate book IDs."
    );
  }

  /**
   * Check that starting order includes every book.
   */
  if (
    puzzle.startingOrder.length !==
    puzzle.books.length
  ) {
    errors.push(
      "The starting order has the wrong number of books."
    );
  }

  /**
   * Check that the solution includes every book.
   */
  if (
    puzzle.solution.length !==
    puzzle.books.length
  ) {
    errors.push(
      "The solution has the wrong number of books."
    );
  }

  /**
   * Check that every starting-order ID exists.
   */
  puzzle.startingOrder.forEach((bookId) => {
    if (!uniqueBookIds.has(bookId)) {
      errors.push(
        `Starting order contains unknown book: ${bookId}.`
      );
    }
  });

  /**
   * Check that every solution ID exists.
   */
  puzzle.solution.forEach((bookId) => {
    if (!uniqueBookIds.has(bookId)) {
      errors.push(
        `Solution contains unknown book: ${bookId}.`
      );
    }
  });

  /**
   * Avoid running the slower solution search
   * if the basic puzzle structure is already broken.
   */
  if (errors.length === 0) {
    const solutions =
      findPuzzleSolutions(puzzle);

    if (solutions.length === 0) {
      errors.push(
        "The clues do not produce any valid solution."
      );
    }

    if (solutions.length > 1) {
      errors.push(
        `The clues produce ${solutions.length} solutions instead of one.`
      );
    }

    if (
      solutions.length === 1 &&
      !solutions[0].every(
        (bookId, index) =>
          bookId === puzzle.solution[index]
      )
    ) {
      errors.push(
        "The unique clue solution does not match the stored solution."
      );
    }
  }

  return errors;
}