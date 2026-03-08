/** Unterstützte Sprachen (Reihenfolge bestimmt Toggle-Richtung). */
export const LANGS = ['en', 'de'];

export const TEXT = {
  en: {
    // Hauptmenü
    start:        'Start Game',
    options:      'Options',
    controls:     'Controls',
    credits:      'Credits',
    pressEnter:   'Press Enter to Select',

    // Pause-Menü
    continue:     'Continue',
    restartLevel: 'Restart Level',
    mainMenu:     'Main Menu',

    // Options-Screen
    musicVolume:  'Music Volume',
    sfxVolume:    'SFX Volume',
    language:     'Language',

    // Steuerungsscreen
    move:         'Move',
    jump:         'Jump',
    crouch:       'Crouch',
    lookUp:       'Look Up',
    pause:        'Pause',

    // Credits
    creditsDev:    'Game Design & Programming',
    creditsAssets: 'Pixel Assets',

    // Allgemein
    returnHint:  'Enter or ESC to return',
    retryHint:   'Press any key to retry',
  },
  de: {
    // Hauptmenü
    start:        'Spiel starten',
    options:      'Optionen',
    controls:     'Steuerung',
    credits:      'Credits',
    pressEnter:   'Drücke Enter zum Auswählen',

    // Pause-Menü
    continue:     'Weiter spielen',
    restartLevel: 'Level neustarten',
    mainMenu:     'Hauptmenü',

    // Options-Screen
    musicVolume:  'Musik-Lautstärke',
    sfxVolume:    'SFX-Lautstärke',
    language:     'Sprache',

    // Steuerungsscreen
    move:         'Bewegen',
    jump:         'Springen',
    crouch:       'Ducken',
    lookUp:       'Hochschauen',
    pause:        'Pause',

    // Credits
    creditsDev:    'Spieldesign & Programmierung',
    creditsAssets: 'Pixel-Assets',

    // Allgemein
    returnHint:  'Enter oder ESC → Zurück',
    retryHint:   'Beliebige Taste zum Neustarten',
  },
};

/** Aktuell gewählte Sprache. */
export let currentLang = 'en';

/** Sprache wechseln. */
export function setLang(lang) {
  if (LANGS.includes(lang)) currentLang = lang;
}

/** Lokalisierter Text für einen Schlüssel. Fällt auf Englisch zurück. */
export function t(key) {
  return TEXT[currentLang]?.[key] ?? TEXT.en[key] ?? key;
}
