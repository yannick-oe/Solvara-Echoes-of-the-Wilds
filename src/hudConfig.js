export const HUD_SPRITE = {
    frameWidth: 16,
    frameHeight: 16,
    scale: 2,
};

export const HUD_LAYOUT = {
    topY: 12,
    leftX: 12,
    iconGap: 8,
    groupGap: 28,
    maxStars: 3,
};

export const HUD_FRAMES = {
    hearts: [
        { col: 4, row: 0 },
        { col: 5, row: 0 },
        { col: 6, row: 0 },
        { col: 7, row: 0 },
        { col: 8, row: 0 },
        { col: 9, row: 0 },
        { col: 10, row: 0 },
        { col: 11, row: 0 },
    ],

    diamondSpin: [
        { col: 0, row: 0 },
        { col: 1, row: 0 },
        { col: 2, row: 0 },
        { col: 3, row: 0 },
        { col: 4, row: 0 },
    ],

    starCoinSpin: [
        { col: 12, row: 0 },
        { col: 13, row: 0 },
        { col: 14, row: 0 },
        { col: 15, row: 0 },
    ],
};

export const HUD_FALLBACK_FRAMES = {
    heart: { col: 4, row: 0 },
    diamond: { col: 0, row: 0 },
    starCoin: { col: 12, row: 0 },
};