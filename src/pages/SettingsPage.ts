import { createHeader } from "../components/Header";
import type { NavigateFunction } from "./HomePage";

/**
 * Settings stored in the browser.
 */
export interface GameSettings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  highContrast: boolean;
}

const SETTINGS_KEY =
  "shelfie-settings";

/**
 * Default values used on a new device.
 */
export function getDefaultSettings():
  GameSettings {
  return {
    soundEnabled: true,
    animationsEnabled: true,
    highContrast: false
  };
}

/**
 * Load settings.
 */
export function loadSettings():
  GameSettings {
  const stored =
    localStorage.getItem(SETTINGS_KEY);

  if (!stored) {
    return getDefaultSettings();
  }

  try {
    return {
      ...getDefaultSettings(),
      ...(JSON.parse(
        stored
      ) as Partial<GameSettings>)
    };
  } catch {
    return getDefaultSettings();
  }
}

/**
 * Save settings.
 */
export function saveSettings(
  settings: GameSettings
): void {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(settings)
  );

  applySettings(settings);
}

/**
 * Apply settings to the page.
 */
export function applySettings(
  settings: GameSettings
): void {
  document.documentElement.classList.toggle(
    "reduce-animations",
    !settings.animationsEnabled
  );

  document.documentElement.classList.toggle(
    "high-contrast",
    settings.highContrast
  );
}

/**
 * Create one checkbox setting.
 */
function createCheckboxSetting(
  labelText: string,
  descriptionText: string,
  checked: boolean,
  onChange: (checked: boolean) => void
): HTMLElement {
  const row =
    document.createElement("label");

  row.className = "setting-row";

  const textArea =
    document.createElement("span");

  textArea.className =
    "setting-row__text";

  const title =
    document.createElement("strong");

  title.textContent = labelText;

  const description =
    document.createElement("small");

  description.textContent =
    descriptionText;

  textArea.append(title, description);

  const checkbox =
    document.createElement("input");

  checkbox.type = "checkbox";
  checkbox.checked = checked;

  checkbox.addEventListener(
    "change",
    () => onChange(checkbox.checked)
  );

  row.append(textArea, checkbox);

  return row;
}

/**
 * Render the settings page.
 */
export function renderSettingsPage(
  container: HTMLElement,
  navigate: NavigateFunction
): void {
  container.replaceChildren();

  let settings = loadSettings();

  const header = createHeader({
    title: "Settings",

    onArchiveClick: () =>
      navigate("archive"),

    onStatsClick: () =>
      navigate("stats"),

    onSettingsClick: () =>
      navigate("home")
  });

  const main =
    document.createElement("main");

  main.className = "settings-page";

  const heading =
    document.createElement("h2");

  heading.textContent =
    "Game settings";

  const settingsList =
    document.createElement("div");

  settingsList.className =
    "settings-list";

  const soundSetting =
    createCheckboxSetting(
      "Sound effects",
      "Play sounds when books move and puzzles are completed.",
      settings.soundEnabled,
      (checked) => {
        settings = {
          ...settings,
          soundEnabled: checked
        };

        saveSettings(settings);
      }
    );

  const animationSetting =
    createCheckboxSetting(
      "Animations",
      "Use movement and completion animations.",
      settings.animationsEnabled,
      (checked) => {
        settings = {
          ...settings,
          animationsEnabled: checked
        };

        saveSettings(settings);
      }
    );

  const contrastSetting =
    createCheckboxSetting(
      "High contrast",
      "Increase contrast around buttons and game pieces.",
      settings.highContrast,
      (checked) => {
        settings = {
          ...settings,
          highContrast: checked
        };

        saveSettings(settings);
      }
    );

  settingsList.append(
    soundSetting,
    animationSetting,
    contrastSetting
  );

  const homeButton =
    document.createElement("button");

  homeButton.type = "button";
  homeButton.className = "game-button";
  homeButton.textContent =
    "Save and return";

  homeButton.addEventListener(
    "click",
    () => navigate("home")
  );

  main.append(
    heading,
    settingsList,
    homeButton
  );

  container.append(
    header.element,
    main
  );
}