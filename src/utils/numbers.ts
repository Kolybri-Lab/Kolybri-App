export const round = (value: number, decimals = 2) => {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
};
