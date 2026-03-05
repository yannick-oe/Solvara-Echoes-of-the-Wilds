export const HUD_SPRITE = {
    frameWidth: 16,
    frameHeight: 16,
    scale: 2,
};

export const HUD_LAYOUT = {
    heartsY: 12,
    starsY: 52,
    diamondsY: 92,
    leftX: 12,
    iconGap: 8,
    scoreGap: 12,
    maxStars: 3,
};

export const HUD_FRAMES = {
    hearts: [
        { sx: 87, sy: 3, sw: 15, sh: 15 },
        { sx: 108, sy: 3, sw: 17, sh: 15 },
        { sx: 132, sy: 3, sw: 17, sh: 15 },
        { sx: 156, sy: 3, sw: 15, sh: 15 },
        { sx: 182, sy: 2, sw: 14, sh: 16 },
        { sx: 204, sy: 2, sw: 14, sh: 16 },
        { sx: 227, sy: 2, sw: 14, sh: 16 },
    ],

    diamondSpin: [
        { sx: 1, sy: 1, sw: 13, sh: 11 },
        { sx: 18, sy: 1, sw: 13, sh: 11 },
        { sx: 35, sy: 1, sw: 13, sh: 11 },
        { sx: 52, sy: 1, sw: 13, sh: 11 },
        { sx: 69, sy: 1, sw: 13, sh: 11 },
    ],

    starCoinSpin: [
        { sx: 249, sy: 3, sw: 26, sh: 26 },
        { sx: 281, sy: 1, sw: 18, sh: 18 },
        { sx: 316, sy: 2, sw: 28, sh: 29 },
        { sx: 355, sy: 7, sw: 18, sh: 18 },
    ],
};

export const HUD_FALLBACK_FRAMES = {
    heart: { sx: 87, sy: 3, sw: 15, sh: 15 },
    diamond: { sx: 1, sy: 1, sw: 13, sh: 11 },
    starCoin: { sx: 249, sy: 3, sw: 26, sh: 26 },
};