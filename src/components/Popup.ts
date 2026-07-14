import "../style/popup.css";

/**
 * Options used to create a popup.
 */
export interface PopupOptions {
  title: string;

  /**
   * Initial popup content.
   *
   * This can be plain text or an existing HTML element.
   */
  content?: string | HTMLElement;

  // Text read by screen readers for the close button.
  closeLabel?: string;

  // Controls whether clicking outside closes the popup.
  closeOnBackdrop?: boolean;

  // Runs after the popup closes.
  onClose?: () => void;
}

/**
 * Methods returned by the popup component.
 */
export interface PopupController {
  element: HTMLDialogElement;
  open: () => void;
  close: () => void;
  setTitle: (title: string) => void;
  setContent: (
    content: string | HTMLElement
  ) => void;
}

/**
 * Creates a reusable HTML dialog popup.
 */
export function createPopup(
  options: PopupOptions
): PopupController {
  const dialog =
    document.createElement("dialog");

  dialog.className = "popup";

  /**
   * The visible card inside the dark background.
   */
  const popupCard =
    document.createElement("div");

  popupCard.className = "popup__card";

  /**
   * Popup heading.
   */
  const header =
    document.createElement("header");

  header.className = "popup__header";

  const titleElement =
    document.createElement("h2");

  titleElement.className = "popup__title";
  titleElement.textContent = options.title;

  /**
   * Close button.
   */
  const closeButton =
    document.createElement("button");

  closeButton.type = "button";
  closeButton.className = "popup__close";
  closeButton.textContent = "×";

  closeButton.setAttribute(
    "aria-label",
    options.closeLabel ?? "Close popup"
  );

  /**
   * Main popup content area.
   */
  const body =
    document.createElement("div");

  body.className = "popup__body";

  header.append(
    titleElement,
    closeButton
  );

  popupCard.append(header, body);
  dialog.append(popupCard);

  /**
   * Change the heading without rebuilding the popup.
   */
  function setTitle(title: string): void {
    titleElement.textContent = title;
  }

  /**
   * Replace the popup's body content.
   */
  function setContent(
    content: string | HTMLElement
  ): void {
    body.replaceChildren();

    if (typeof content === "string") {
      const paragraph =
        document.createElement("p");

      paragraph.textContent = content;
      body.append(paragraph);

      return;
    }

    body.append(content);
  }

  /**
   * Show the popup.
   */
  function open(): void {
    if (!dialog.isConnected) {
      document.body.append(dialog);
    }

    if (!dialog.open) {
      dialog.showModal();
    }
  }

  /**
   * Hide the popup.
   */
  function close(): void {
    if (dialog.open) {
      dialog.close();
    }
  }

  closeButton.addEventListener("click", close);

  /**
   * Clicking the dark backdrop can close the popup.
   *
   * event.target is the dialog only when the player clicks
   * outside the popup card.
   */
  dialog.addEventListener(
    "click",
    (event: MouseEvent) => {
      const closeOnBackdrop =
        options.closeOnBackdrop ?? true;

      if (
        closeOnBackdrop &&
        event.target === dialog
      ) {
        close();
      }
    }
  );

  /**
   * The browser fires this event after dialog.close().
   */
  dialog.addEventListener("close", () => {
    options.onClose?.();
  });

  if (options.content !== undefined) {
    setContent(options.content);
  }

  return {
    element: dialog,
    open,
    close,
    setTitle,
    setContent
  };
}

/**
 * Helper for making a standard button inside a popup.
 */
export function createPopupButton(
  text: string,
  onClick: () => void,
  secondary = false
): HTMLButtonElement {
  const button =
    document.createElement("button");

  button.type = "button";
  button.className = "popup__button";
  button.textContent = text;

  if (secondary) {
    button.classList.add(
      "popup__button--secondary"
    );
  }

  button.addEventListener("click", onClick);

  return button;
}