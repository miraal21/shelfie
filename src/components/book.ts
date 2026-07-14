import "../style/books.css";

/**
 * Describes the information needed to display one book.
 *
 * This interface is exported so other files, such as shelf.ts,
 * can use exactly the same book structure.
 */
export interface BookData {
  id: string;
  title: string;
  color: string;
  icon?: string;
}

/**
 * Settings passed into the createBook function.
 */
export interface BookOptions {
  // The book that should be displayed.
  book: BookData;

  // The book's current position on the shelf.
  index: number;

  // Whether this book is currently selected.
  isSelected?: boolean;

  // Runs when the player clicks or taps the book.
  onSelect?: (bookId: string) => void;

  // Runs when the player starts dragging the book.
  onDragStart?: (bookId: string) => void;

  // Runs when one book is dropped onto another book.
  onDrop?: (
    draggedBookId: string,
    targetBookId: string
  ) => void;
}

/**
 * Creates and returns the HTML element for one book.
 */
export function createBook(
  options: BookOptions
): HTMLButtonElement {
  const {
    book,
    index,
    isSelected = false,
    onSelect,
    onDragStart,
    onDrop
  } = options;

  // A button is used instead of a div because buttons can be
  // focused and activated using a keyboard.
  const bookElement = document.createElement("button");

  bookElement.type = "button";
  bookElement.className = "book";
  bookElement.draggable = true;

  // Store information on the element.
  // This can later be read using element.dataset.bookId.
  bookElement.dataset.bookId = book.id;
  bookElement.dataset.index = String(index);

  // This CSS variable lets every book have its own cover color.
  bookElement.style.setProperty(
    "--book-color",
    book.color
  );

  // Give screen-reader users useful information.
  bookElement.setAttribute(
    "aria-label",
    `${book.title}, shelf position ${index + 1}`
  );

  // Tell assistive technology whether the book is selected.
  bookElement.setAttribute(
    "aria-pressed",
    String(isSelected)
  );

  if (isSelected) {
    bookElement.classList.add("book--selected");
  }

  /**
   * We create separate child elements instead of using innerHTML.
   * This avoids accidentally inserting unsafe HTML through a title.
   */
  const iconElement = document.createElement("span");
  iconElement.className = "book__icon";
  iconElement.setAttribute("aria-hidden", "true");
  iconElement.textContent = book.icon ?? "📖";

  const titleElement = document.createElement("span");
  titleElement.className = "book__title";
  titleElement.textContent = book.title;

  bookElement.append(iconElement, titleElement);

  /**
   * Clicking a book selects it.
   *
   * The shelf component will decide what selecting means.
   * For example, clicking two books can swap their positions.
   */
  bookElement.addEventListener("click", () => {
    onSelect?.(book.id);
  });

  /**
   * Start dragging the book.
   */
  bookElement.addEventListener(
    "dragstart",
    (event: DragEvent) => {
      bookElement.classList.add("book--dragging");

      // Store the dragged book's ID inside the drag event.
      event.dataTransfer?.setData(
        "text/plain",
        book.id
      );

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
      }

      onDragStart?.(book.id);
    }
  );

  /**
   * Remove the dragging style when dragging finishes.
   */
  bookElement.addEventListener("dragend", () => {
    bookElement.classList.remove("book--dragging");
  });

  /**
   * Browsers do not allow dropping by default.
   * Calling preventDefault enables dropping.
   */
  bookElement.addEventListener(
    "dragover",
    (event: DragEvent) => {
      event.preventDefault();

      bookElement.classList.add(
        "book--drag-target"
      );

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    }
  );

  /**
   * Remove the target style when the dragged book leaves.
   */
  bookElement.addEventListener("dragleave", () => {
    bookElement.classList.remove(
      "book--drag-target"
    );
  });

  /**
   * Handle another book being dropped onto this book.
   */
  bookElement.addEventListener(
    "drop",
    (event: DragEvent) => {
      event.preventDefault();

      bookElement.classList.remove(
        "book--drag-target"
      );

      const draggedBookId =
        event.dataTransfer?.getData("text/plain");

      // Stop if no ID was found.
      if (!draggedBookId) {
        return;
      }

      // Dropping a book onto itself should do nothing.
      if (draggedBookId === book.id) {
        return;
      }

      onDrop?.(draggedBookId, book.id);
    }
  );

  return bookElement;
}