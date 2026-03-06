export const HUD_SPRITE = { // Declare a shared constant value.
    frameWidth: 16, // Execute this step in the current flow.
    frameHeight: 16, // Execute this step in the current flow.
    scale: 2, // Execute this step in the current flow.
};

export const HUD_LAYOUT = { // Declare a shared constant value.
    heartsY: 12, // Execute this step in the current flow.
    starsY: 52, // Execute this step in the current flow.
    diamondsY: 92, // Execute this step in the current flow.
    leftX: 12, // Execute this step in the current flow.
    iconGap: 8, // Execute this step in the current flow.
    scoreGap: 12, // Execute this step in the current flow.
    maxStars: 3, // Execute this step in the current flow.
};

export const HUD_FRAMES = { // Declare a shared constant value.
    hearts: [ // Execute this step in the current flow.
        { sx: 87, sy: 3, sw: 15, sh: 15 }, // Execute this step in the current flow.
        { sx: 108, sy: 3, sw: 17, sh: 15 }, // Execute this step in the current flow.
        { sx: 132, sy: 3, sw: 17, sh: 15 }, // Execute this step in the current flow.
        { sx: 156, sy: 3, sw: 15, sh: 15 }, // Execute this step in the current flow.
        { sx: 182, sy: 2, sw: 14, sh: 16 }, // Execute this step in the current flow.
        { sx: 204, sy: 2, sw: 14, sh: 16 }, // Execute this step in the current flow.
        { sx: 227, sy: 2, sw: 14, sh: 16 }, // Execute this step in the current flow.
    ], // Execute this step in the current flow.

    diamondSpin: [ // Execute this step in the current flow.
        { sx: 1, sy: 1, sw: 13, sh: 11 }, // Execute this step in the current flow.
        { sx: 18, sy: 1, sw: 13, sh: 11 }, // Execute this step in the current flow.
        { sx: 35, sy: 1, sw: 13, sh: 11 }, // Execute this step in the current flow.
        { sx: 52, sy: 1, sw: 13, sh: 11 }, // Execute this step in the current flow.
        { sx: 69, sy: 1, sw: 13, sh: 11 }, // Execute this step in the current flow.
    ], // Execute this step in the current flow.

    starCoinSpin: [ // Execute this step in the current flow.
        { sx: 249, sy: 3, sw: 26, sh: 26 }, // Execute this step in the current flow.
        { sx: 281, sy: 1, sw: 18, sh: 18 }, // Execute this step in the current flow.
        { sx: 316, sy: 2, sw: 28, sh: 29 }, // Execute this step in the current flow.
        { sx: 355, sy: 7, sw: 18, sh: 18 }, // Execute this step in the current flow.
    ], // Execute this step in the current flow.
};

export const HUD_FALLBACK_FRAMES = { // Declare a shared constant value.
    heart: { sx: 87, sy: 3, sw: 15, sh: 15 }, // Execute this step in the current flow.
    diamond: { sx: 1, sy: 1, sw: 13, sh: 11 }, // Execute this step in the current flow.
    starCoin: { sx: 249, sy: 3, sw: 26, sh: 26 }, // Execute this step in the current flow.
};
