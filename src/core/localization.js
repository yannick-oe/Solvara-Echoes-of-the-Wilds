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
    masterVolume:    'Master Volume',
    musicVolume:     'Music Volume',
    sfxVolumeMaster: 'SFX Volume',
    sfxVolume:       'SFX Volume',
    language:     'Language',

    // Steuerungsscreen
    move:         'Move',
    jump:         'Jump',
    crouch:       'Crouch',
    roll:         'Roll',
    climb:        'Climb',
    lookUp:       'Look Up',
    pause:        'Pause',
    fullscreen:   'Fullscreen',

    // Credits
    creditsDev:    'Game Design & Programming',
    creditsAssets: 'Pixel Assets',

    // Allgemein
    back:        'Back',
    returnHint:  'Q  –  Back',
    retryHint:   'Press any key to retry',

    // Victory-Screen
    levelComplete:   'Level Complete',
    livesRemaining:  'Lives',
    score:           'Score',
    gems:            'Gems',
    time:            'Time',
    continueHint:    'Enter / Space  –  Continue',
    menuHint:        'P  –  Main Menu',
    nextPathAwaits:  'A new challenge lies ahead…',
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
    masterVolume:    'Master-Lautstärke',
    musicVolume:     'Musik-Lautstärke',
    sfxVolumeMaster: 'SFX-Lautstärke',
    sfxVolume:       'SFX-Lautstärke',
    language:     'Sprache',

    // Steuerungsscreen
    move:         'Bewegen',
    jump:         'Springen',
    crouch:       'Ducken',
    roll:         'Rollen',
    climb:        'Klettern',
    lookUp:       'Hochschauen',
    pause:        'Pause',
    fullscreen:   'Vollbild',

    // Credits
    creditsDev:    'Spieldesign & Programmierung',
    creditsAssets: 'Pixel-Assets',

    // Allgemein
    back:        'Zurück',
    returnHint:  'Q  –  Zurück',
    retryHint:   'Beliebige Taste zum Neustarten',

    // Victory-Screen
    levelComplete:   'Level abgeschlossen',
    livesRemaining:  'Leben',
    score:           'Punkte',
    gems:            'Edelsteine',
    time:            'Zeit',
    continueHint:    'Enter / Leertaste  –  Weiter',
    menuHint:        'P  –  Hauptmenü',
    nextPathAwaits:  'Ein neues Abenteuer wartet auf dich…',
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
