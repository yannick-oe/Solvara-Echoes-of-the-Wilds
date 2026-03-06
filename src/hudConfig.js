export const HUD_SPRITE = { // Deklariert einen gemeinsamen konstanten Wert.
    frameWidth: 16, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    frameHeight: 16, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    scale: 2, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
};

export const HUD_LAYOUT = { // Deklariert einen gemeinsamen konstanten Wert.
    heartsY: 12, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    starsY: 52, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    diamondsY: 92, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    leftX: 12, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    iconGap: 8, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    scoreGap: 12, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    maxStars: 3, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
};

export const HUD_FRAMES = { // Deklariert einen gemeinsamen konstanten Wert.
    hearts: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 87, sy: 3, sw: 15, sh: 15 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 108, sy: 3, sw: 17, sh: 15 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 132, sy: 3, sw: 17, sh: 15 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 156, sy: 3, sw: 15, sh: 15 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 182, sy: 2, sw: 14, sh: 16 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 204, sy: 2, sw: 14, sh: 16 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 227, sy: 2, sw: 14, sh: 16 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.

    diamondSpin: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 1, sy: 1, sw: 13, sh: 11 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 18, sy: 1, sw: 13, sh: 11 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 35, sy: 1, sw: 13, sh: 11 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 52, sy: 1, sw: 13, sh: 11 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 69, sy: 1, sw: 13, sh: 11 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.

    starCoinSpin: [ // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 249, sy: 3, sw: 26, sh: 26 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 281, sy: 1, sw: 18, sh: 18 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 316, sy: 2, sw: 28, sh: 29 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
        { sx: 355, sy: 7, sw: 18, sh: 18 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    ], // Fuehrt diesen Schritt im aktuellen Ablauf aus.
};

export const HUD_FALLBACK_FRAMES = { // Deklariert einen gemeinsamen konstanten Wert.
    heart: { sx: 87, sy: 3, sw: 15, sh: 15 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    diamond: { sx: 1, sy: 1, sw: 13, sh: 11 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    starCoin: { sx: 249, sy: 3, sw: 26, sh: 26 }, // Fuehrt diesen Schritt im aktuellen Ablauf aus.
};
