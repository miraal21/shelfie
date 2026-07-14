import {
  createBook,
  type BookData
} from "./book";

import "../style/shelf.css";

/**
 * Settings passed into the shelf component.
 */
export interface ShelfOptions {
  // Books shown when the shelf first loads.
  books: BookData[];

  /**
   * This runs whenever the order changes.
   *
   * HomePage can use this to save the current order,
   * count moves, or check whether the answer is correct.
   */
  onOrderChange?: (
    books: BookData[],
    moveCount: number
  ) => void;
}

/**
 * The object returned by createShelf.
 *
 * It gives other files controlled access to the shelf.
 */
export interface ShelfController {
  // The actual shelf HTML element.
  element: HTMLElement;

  // Returns the current books in their current order.
  getBooks: () => BookData[];

  // Returns only the current book IDs.
  getBookOrder: () => string[];

  // Replaces all books on the shelf.
  setBooks: (books: BookData[]) => void;

  // Returns the number of moves.
  getMoveCount: () => number;

  // Clears the move count.
  resetMoveCount: () => void;

  // Removes the current selected-book state.
  clearSelection: () => void;

  // Prevents or allows interaction.
  setDisabled: (disabled: boolean) => void;
}

/**
 * Creates the complete shelf component.
 */
export function createShelf(
  options: ShelfOptions
): ShelfController {
  // Make a copy so we do not change the original array.
  let books: BookData[] = [...options.books];

  // Stores the first book clicked by the player.
  let selectedBookId: string | null = null;

  // Number of times the shelf order has changed.
  let moveCount = 0;

  // Used after the player completes the puzzle.
  let disabled = false;

  const shelfElement =
    document.createElement("section");

  shelfElement.className = "shelf";
  shelfElement.setAttribute(
    "aria-label",
    "Shelfie bookshelf puzzle"
  );

  /**
   * This container holds the books.
   */
  const booksContainer =
    document.createElement("div");

  booksContainer.className = "shelf__books";

  /**
   * This is the wooden board below the books.
   */
  const woodElement =
    document.createElement("div");

  woodElement.className = "shelf__wood";
  woodElement.setAttribute("aria-hidden", "true");

  shelfElement.append(
    booksContainer,
    woodElement
  );

  /**
   * Rebuilds the visible books.
   *
   * We call this whenever:
   * - books change position;
   * - a book is selected;
   * - the shelf is disabled.
   */
  function render(): void {
    booksContainer.replaceChildren();

    books.forEach((book, index) => {
      const bookElement = createBook({
        book,
        index,
        isSelected: book.id === selectedBookId,

        onSelect: disabled
          ? undefined
          : handleBookSelection,

        onDrop: disabled
          ? undefined
          : moveBookBefore
      });

      bookElement.disabled = disabled;

      booksContainer.append(bookElement);
    });
  }

  /**
   * Handles click/tap movement.
   *
   * First click:
   * Select a book.
   *
   * Second click:
   * Swap the selected book with the second book.
   */
  function handleBookSelection(
    bookId: string
  ): void {
    if (disabled) {
      return;
    }

    // No book is selected yet, so select this one.
    if (selectedBookId === null) {
      selectedBookId = bookId;
      render();
      return;
    }

    // Clicking the selected book again deselects it.
    if (selectedBookId === bookId) {
      selectedBookId = null;
      render();
      return;
    }

    // Otherwise swap the two books.
    swapBooks(selectedBookId, bookId);

    selectedBookId = null;
    render();
  }

  /**
   * Swaps the positions of two books.
   */
  function swapBooks(
    firstBookId: string,
    secondBookId: string
  ): void {
    const firstIndex = books.findIndex(
      (book) => book.id === firstBookId
    );

    const secondIndex = books.findIndex(
      (book) => book.id === secondBookId
    );

    // Stop if either book could not be found.
    if (firstIndex === -1 || secondIndex === -1) {
      console.warn(
        "Could not swap books because an ID was not found."
      );

      return;
    }

    // Swap the two items in the array.
    [books[firstIndex], books[secondIndex]] = [
      books[secondIndex],
      books[firstIndex]
    ];

    recordMove();
  }

  /**
   * Moves one book immediately before another book.
   *
   * This is used for drag and drop.
   */
  function moveBookBefore(
    draggedBookId: string,
    targetBookId: string
  ): void {
    if (disabled) {
      return;
    }

    const draggedIndex = books.findIndex(
      (book) => book.id === draggedBookId
    );

    const targetIndex = books.findIndex(
      (book) => book.id === targetBookId
    );

    if (
      draggedIndex === -1 ||
      targetIndex === -1 ||
      draggedBookId === targetBookId
    ) {
      return;
    }

    // Work with a copy of the array.
    const updatedBooks = [...books];

    // Remove the dragged book from its old position.
    const removedBooks = updatedBooks.splice(
      draggedIndex,
      1
    );

    const draggedBook = removedBooks[0];

    if (!draggedBook) {
      return;
    }

    /**
     * Find the target again because removing the dragged
     * book may have changed the target's index.
     */
    const updatedTargetIndex =
      updatedBooks.findIndex(
        (book) => book.id === targetBookId
      );

    // Insert the dragged book before the target book.
    updatedBooks.splice(
      updatedTargetIndex,
      0,
      draggedBook
    );

    books = updatedBooks;
    selectedBookId = null;

    recordMove();
    render();
  }

  /**
   * Updates the move count and tells the parent page
   * that the order changed.
   */
  function recordMove(): void {
    moveCount += 1;

    options.onOrderChange?.(
      [...books],
      moveCount
    );
  }

  /**
   * Replaces the current shelf with a new group of books.
   */
  function setBooks(
    updatedBooks: BookData[]
  ): void {
    books = [...updatedBooks];
    selectedBookId = null;
    moveCount = 0;

    render();
  }

  /**
   * Removes the current selected state.
   */
  function clearSelection(): void {
    selectedBookId = null;
    render();
  }

  /**
   * Locks or unlocks the shelf.
   */
  function setDisabled(
    shouldBeDisabled: boolean
  ): void {
    disabled = shouldBeDisabled;

    if (disabled) {
      selectedBookId = null;
    }

    shelfElement.classList.toggle(
      "shelf--disabled",
      disabled
    );

    render();
  }

  /**
   * Set the move count back to zero.
   */
  function resetMoveCount(): void {
    moveCount = 0;
  }

  // Draw the initial shelf.
  render();

  return {
    element: shelfElement,

    getBooks: () => [...books],

    getBookOrder: () =>
      books.map((book) => book.id),

    setBooks,

    getMoveCount: () => moveCount,

    resetMoveCount,

    clearSelection,

    setDisabled
  };
}