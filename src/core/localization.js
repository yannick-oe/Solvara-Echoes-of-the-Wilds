// #region Constants
export const LANGS = ['en', 'de'];

export const TEXT = {
  en: {
    start:        'Start Game',
    character:    'Character',
    fox:          'Fox',
    imp:          'Imp',
    options:      'Options',
    controls:     'Controls',
    credits:      'Credits',
    pressEnter:   'Press Enter to Start',

    continue:     'Continue',
    restartLevel: 'Restart Level',
    mainMenu:     'Main Menu',

    masterVolume:    'Master Volume',
    musicVolume:     'Music Volume',
    sfxVolumeMaster: 'SFX Volume',
    sfxVolume:       'SFX Volume',
    language:     'Language',

    move:         'Move',
    jump:         'Jump',
    crouch:       'Crouch',
    roll:         'Roll',
    climb:        'Climb',
    lookUp:       'Look Up',
    pause:        'Pause',
    fullscreen:   'Fullscreen',

    creditsDev:    'Game Design & Programming',
    creditsAssets: 'Pixel Assets',

    back:         'Back',
    returnHint:   'Q  –  Back',
    retryHint:    'Press any key to retry',
    rotateDevice: 'Rotate device to play',

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
    start:        'Spiel starten',
    character:    'Charakter',
    fox:          'Fuchs',
    imp:          'Imp',
    options:      'Optionen',
    controls:     'Steuerung',
    credits:      'Credits',
    pressEnter:   'Drücke Enter zum Auswählen',

    continue:     'Weiter spielen',
    restartLevel: 'Level neustarten',
    mainMenu:     'Hauptmenü',

    masterVolume:    'Master-Lautstärke',
    musicVolume:     'Musik-Lautstärke',
    sfxVolumeMaster: 'SFX-Lautstärke',
    sfxVolume:       'SFX-Lautstärke',
    language:     'Sprache',

    move:         'Bewegen',
    jump:         'Springen',
    crouch:       'Ducken',
    roll:         'Rollen',
    climb:        'Klettern',
    lookUp:       'Hochschauen',
    pause:        'Pause',
    fullscreen:   'Vollbild',

    creditsDev:    'Spieldesign & Programmierung',
    creditsAssets: 'Pixel-Assets',

    back:         'Zurück',
    returnHint:   'Q  –  Zurück',
    retryHint:    'Beliebige Taste zum Neustarten',
    rotateDevice: 'Gerät drehen zum Spielen',

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

export let currentLang = 'en';

/**
 * Handles set lang.
 * @param {string} lang Input parameter.
 */
// #endregion

// #region Public Methods
/**
 * Handles set lang.
 * @param {string} lang Input parameter.
 */
export function setLang(lang) {
  if (LANGS.includes(lang)) currentLang = lang;
}

/**
 * Handles t.
 * @param {string} key Input parameter.
 */
export function t(key) {
  return TEXT[currentLang]?.[key] ?? TEXT.en[key] ?? key;
}
// #endregion