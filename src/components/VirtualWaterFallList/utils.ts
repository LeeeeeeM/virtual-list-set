export const randomColor = () => `color${(Math.random() * 8) >>> 0}`;
export const randomNumebr = (base: number) => base + 100 * Math.random();

export const color = (n: number) => `color${n % 8}`;
