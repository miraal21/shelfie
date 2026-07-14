import type { BookData } from "../components/book";

/**
 * Every clue has an ID so the clue list can update it later.
 */
interface BaseClue {
  id: string;
}

/**
 * Book A must be somewhere to the left of Book B.
 *
 * The books do not have to touch.
 */
export interface LeftOfClue extends BaseClue {
  type: "leftOf";
  firstBookId: string;
  secondBookId: string;
}

/**
 * Two books must be directly beside each other.
 *
 * Either order is accepted.
 */
export interface AdjacentClue extends BaseClue {
  type: "adjacent";
  firstBookId: string;
  secondBookId: string;
}

/**
 * Book A must be immediately before Book B.
 *
 * The order matters.
 */
export interface ImmediatelyBeforeClue extends BaseClue {
  type: "immediatelyBefore";
  firstBookId: string;
  secondBookId: string;
}

/**
 * A book must be in a specific shelf position.
 *
 * Positions begin at 1 for players.
 */
export interface PositionClue extends BaseClue {
  type: "position";
  bookId: string;
  position: number;
}

/**
 * A book cannot be in one or more positions.
 */
export interface NotPositionClue extends BaseClue {
  type: "notPosition";
  bookId: string;
  forbiddenPositions: number[];
}

/**
 * ClueDefinition can be any one of the clue types above.
 */
export type ClueDefinition =
  | LeftOfClue
  | AdjacentClue
  | ImmediatelyBeforeClue
  | PositionClue
  | NotPositionClue;

/**
 * The structure of one complete puzzle.
 */
export interface Puzzle {
  id: string;
  number: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";

  books: BookData[];

  /**
   * The order displayed when the puzzle opens.
   */
  startingOrder: string[];

  /**
   * The correct order.
   */
  solution: string[];

  clues: ClueDefinition[];
}

/**
 * The result of checking every clue.
 */
export interface PuzzleCheckResult {
  solved: boolean;

  /**
   * Example:
   *
   * {
   *   "clue-1": true,
   *   "clue-2": false
   * }
   */
  clueResults: Record<string, boolean>;

  satisfiedCount: number;
  totalClues: number;
}

/**
 * Find a book inside a puzzle using its ID.
 */
export function getBookById(
  puzzle: Puzzle,
  bookId: string
): BookData | undefined {
  return puzzle.books.find(
    (book) => book.id === bookId
  );
}

/**
 * Get a readable book title.
 *
 * If the book cannot be found, its ID is returned instead.
 */
export function getBookTitle(
  puzzle: Puzzle,
  bookId: string
): string {
  return getBookById(puzzle, bookId)?.title ?? bookId;
}

/**
 * Turn a clue object into text that players can read.
 */
export function getClueText(
  puzzle: Puzzle,
  clue: ClueDefinition
): string {
  switch (clue.type) {
    case "leftOf":
      return (
        `${getBookTitle(puzzle, clue.firstBookId)} is ` +
        `somewhere left of ` +
        `${getBookTitle(puzzle, clue.secondBookId)}.`
      );

    case "adjacent":
      return (
        `${getBookTitle(puzzle, clue.firstBookId)} is ` +
        `directly beside ` +
        `${getBookTitle(puzzle, clue.secondBookId)}.`
      );

    case "immediatelyBefore":
      return (
        `${getBookTitle(puzzle, clue.firstBookId)} is ` +
        `immediately before ` +
        `${getBookTitle(puzzle, clue.secondBookId)}.`
      );

    case "position":
      return (
        `${getBookTitle(puzzle, clue.bookId)} is in ` +
        `position ${clue.position}.`
      );

    case "notPosition": {
      const positions = clue.forbiddenPositions.join(" or ");

      return (
        `${getBookTitle(puzzle, clue.bookId)} is not in ` +
        `position ${positions}.`
      );
    }
  }
}

/**
 * Check whether one clue is currently true.
 */
export function evaluateClue(
  order: string[],
  clue: ClueDefinition
): boolean {
  switch (clue.type) {
    case "leftOf": {
      const firstPosition = order.indexOf(
        clue.firstBookId
      );

      const secondPosition = order.indexOf(
        clue.secondBookId
      );

      /**
       * A missing book should never pass a clue.
       */
      if (
        firstPosition === -1 ||
        secondPosition === -1
      ) {
        return false;
      }

      return firstPosition < secondPosition;
    }

    case "adjacent": {
      const firstPosition = order.indexOf(
        clue.firstBookId
      );

      const secondPosition = order.indexOf(
        clue.secondBookId
      );

      if (
        firstPosition === -1 ||
        secondPosition === -1
      ) {
        return false;
      }

      return (
        Math.abs(firstPosition - secondPosition) === 1
      );
    }

    case "immediatelyBefore": {
      const firstPosition = order.indexOf(
        clue.firstBookId
      );

      const secondPosition = order.indexOf(
        clue.secondBookId
      );

      if (
        firstPosition === -1 ||
        secondPosition === -1
      ) {
        return false;
      }

      return secondPosition - firstPosition === 1;
    }

    case "position": {
      /**
       * Arrays begin at 0, but player positions begin at 1.
       */
      return order[clue.position - 1] === clue.bookId;
    }

    case "notPosition": {
      const actualPosition =
        order.indexOf(clue.bookId) + 1;

      if (actualPosition === 0) {
        return false;
      }

      return !clue.forbiddenPositions.includes(
        actualPosition
      );
    }
  }
}

/**
 * Check all clues for a puzzle.
 */
export function checkPuzzle(
  puzzle: Puzzle,
  order: string[]
): PuzzleCheckResult {
  const clueResults: Record<string, boolean> = {};

  let satisfiedCount = 0;

  puzzle.clues.forEach((clue) => {
    const isSatisfied = evaluateClue(order, clue);

    clueResults[clue.id] = isSatisfied;

    if (isSatisfied) {
      satisfiedCount += 1;
    }
  });

  /**
   * Checking the clues is normally enough.
   *
   * We also compare against the stored solution to make sure
   * the final result is exactly what the puzzle designer intended.
   */
  const matchesSolution = order.every(
    (bookId, index) =>
      bookId === puzzle.solution[index]
  );

  return {
    solved:
      matchesSolution &&
      satisfiedCount === puzzle.clues.length,

    clueResults,
    satisfiedCount,
    totalClues: puzzle.clues.length
  };
}

/**
 * Put books into the order given by an array of IDs.
 */
export function arrangeBooks(
  puzzle: Puzzle,
  order: string[]
): BookData[] {
  return order
    .map((bookId) => getBookById(puzzle, bookId))
    .filter(
      (book): book is BookData =>
        book !== undefined
    );
}

/**
 * Puzzle 1.
 */
const puzzleOne: Puzzle = {
  id: "shelf-001",
  number: 1,
  title: "A Quiet Evening",
  difficulty: "Easy",

  books: [
    {
      id: "moon",
      title: "Moon",
      color: "#7868d8",
      icon: "🌙"
    },
    {
      id: "ocean",
      title: "Ocean",
      color: "#408bbd",
      icon: "🌊"
    },
    {
      id: "fern",
      title: "Fern",
      color: "#51966f",
      icon: "🌿"
    },
    {
      id: "ember",
      title: "Ember",
      color: "#d85c4a",
      icon: "🔥"
    },
    {
      id: "ghost",
      title: "Ghost",
      color: "#7c8796",
      icon: "👻"
    },
    {
      id: "honey",
      title: "Honey",
      color: "#d8a93f",
      icon: "🍯"
    }
  ],

  startingOrder: [
    "ghost",
    "fern",
    "honey",
    "moon",
    "ember",
    "ocean"
  ],

  solution: [
    "moon",
    "ocean",
    "fern",
    "ember",
    "ghost",
    "honey"
  ],

  clues: [
    {
      id: "clue-1",
      type: "immediatelyBefore",
      firstBookId: "moon",
      secondBookId: "ocean"
    },
    {
      id: "clue-2",
      type: "immediatelyBefore",
      firstBookId: "fern",
      secondBookId: "ember"
    },
    {
      id: "clue-3",
      type: "position",
      bookId: "ghost",
      position: 5
    },
    {
      id: "clue-4",
      type: "position",
      bookId: "honey",
      position: 6
    },
    {
      id: "clue-5",
      type: "leftOf",
      firstBookId: "ocean",
      secondBookId: "fern"
    }
  ]
};

/**
 * Puzzle 2.
 */
const puzzleTwo: Puzzle = {
  id: "shelf-002",
  number: 2,
  title: "Tea and Stars",
  difficulty: "Easy",

  books: [
    {
      id: "tea",
      title: "Tea",
      color: "#b88754",
      icon: "🍵"
    },
    {
      id: "rose",
      title: "Rose",
      color: "#c75b75",
      icon: "🌹"
    },
    {
      id: "cloud",
      title: "Cloud",
      color: "#8ca6b8",
      icon: "☁️"
    },
    {
      id: "star",
      title: "Star",
      color: "#d2aa3b",
      icon: "⭐"
    },
    {
      id: "ink",
      title: "Ink",
      color: "#4a4c6a",
      icon: "🖋️"
    }
  ],

  startingOrder: [
    "cloud",
    "ink",
    "tea",
    "rose",
    "star"
  ],

  solution: [
    "tea",
    "rose",
    "cloud",
    "star",
    "ink"
  ],

  clues: [
    {
      id: "clue-1",
      type: "position",
      bookId: "tea",
      position: 1
    },
    {
      id: "clue-2",
      type: "immediatelyBefore",
      firstBookId: "rose",
      secondBookId: "cloud"
    },
    {
      id: "clue-3",
      type: "immediatelyBefore",
      firstBookId: "star",
      secondBookId: "ink"
    },
    {
      id: "clue-4",
      type: "leftOf",
      firstBookId: "cloud",
      secondBookId: "star"
    }
  ]
};

/**
 * Puzzle 3.
 */
const puzzleThree: Puzzle = {
  id: "shelf-003",
  number: 3,
  title: "After the Rain",
  difficulty: "Medium",

  books: [
    {
      id: "owl",
      title: "Owl",
      color: "#785d4b",
      icon: "🦉"
    },
    {
      id: "moss",
      title: "Moss",
      color: "#577a52",
      icon: "🍃"
    },
    {
      id: "sun",
      title: "Sun",
      color: "#d6a637",
      icon: "☀️"
    },
    {
      id: "rain",
      title: "Rain",
      color: "#4b7fa6",
      icon: "🌧️"
    },
    {
      id: "plum",
      title: "Plum",
      color: "#765184",
      icon: "🍑"
    },
    {
      id: "acorn",
      title: "Acorn",
      color: "#9a704b",
      icon: "🌰"
    }
  ],

  startingOrder: [
    "sun",
    "acorn",
    "rain",
    "owl",
    "plum",
    "moss"
  ],

  solution: [
    "owl",
    "moss",
    "sun",
    "rain",
    "plum",
    "acorn"
  ],

  clues: [
    {
      id: "clue-1",
      type: "position",
      bookId: "owl",
      position: 1
    },
    {
      id: "clue-2",
      type: "immediatelyBefore",
      firstBookId: "moss",
      secondBookId: "sun"
    },
    {
      id: "clue-3",
      type: "immediatelyBefore",
      firstBookId: "rain",
      secondBookId: "plum"
    },
    {
      id: "clue-4",
      type: "position",
      bookId: "acorn",
      position: 6
    },
    {
      id: "clue-5",
      type: "leftOf",
      firstBookId: "sun",
      secondBookId: "rain"
    }
  ]
};

/**
 * All available puzzles.
 */
export const PUZZLES: Puzzle[] = [
  puzzleOne,
  puzzleTwo,
  puzzleThree
];

/**
 * Find a puzzle using its ID.
 */
export function getPuzzleById(
  puzzleId: string
): Puzzle | undefined {
  return PUZZLES.find(
    (puzzle) => puzzle.id === puzzleId
  );
}

/**
 * Choose a puzzle based on the current date.
 *
 * Everyone gets one puzzle per day.
 */
export function getDailyPuzzle(
  date = new Date()
): Puzzle {
  /**
   * Convert the current date to a whole number of days.
   */
  const dayNumber = Math.floor(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    ) /
      86_400_000
  );

  const puzzleIndex =
    dayNumber % PUZZLES.length;

  return PUZZLES[puzzleIndex];
}

/**
 * ArchivePage stores a selected puzzle ID here.
 */
const SELECTED_PUZZLE_KEY =
  "shelfie-selected-puzzle";

/**
 * Select a puzzle from the archive.
 */
export function selectArchivePuzzle(
  puzzleId: string
): void {
  localStorage.setItem(
    SELECTED_PUZZLE_KEY,
    puzzleId
  );
}

/**
 * Get the selected archive puzzle.
 *
 * The ID is removed after reading it so refreshing later
 * returns to the daily puzzle.
 */
export function getSelectedPuzzle():
  | Puzzle
  | undefined {
  const puzzleId = localStorage.getItem(
    SELECTED_PUZZLE_KEY
  );

  if (!puzzleId) {
    return undefined;
  }

  localStorage.removeItem(
    SELECTED_PUZZLE_KEY
  );

  return getPuzzleById(puzzleId);
}