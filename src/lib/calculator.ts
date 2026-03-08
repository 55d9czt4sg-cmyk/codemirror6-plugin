/**
 * Compound interest calculator and related scientific/mathematical utilities.
 */

/**
 * Calculate compound interest.
 * Formula: A = P * (1 + r/n)^(n*t)
 *
 * @param principal - Initial investment amount (P)
 * @param annualRate - Annual interest rate as a decimal (e.g. 0.05 for 5%)
 * @param timesCompounded - Number of times interest is compounded per year (n)
 * @param years - Investment duration in years (t)
 * @returns Final amount after compound interest
 */
export function compoundInterest(
    principal: number,
    annualRate: number,
    timesCompounded: number,
    years: number
): number {
    return principal * Math.pow(1 + annualRate / timesCompounded, timesCompounded * years);
}

/**
 * Calculate the total distance a projectile has traveled from the launch point
 * after a given time.
 *
 * @param initialVelocity - Initial velocity in m/s
 * @param angleDegrees - Launch angle in degrees
 * @param time - Time elapsed in seconds
 * @param g - Gravitational acceleration (default 9.8 m/s²)
 * @returns Distance traveled from the launch point in meters
 */
export function projectileDistance(
    initialVelocity: number,
    angleDegrees: number,
    time: number,
    g: number = 9.8
): number {
    const angleRad = (angleDegrees * Math.PI) / 180;
    const vx = initialVelocity * Math.cos(angleRad);
    const vy = initialVelocity * Math.sin(angleRad);

    const x = vx * time;
    const y = vy * time - 0.5 * g * time * time;

    return Math.sqrt(x * x + y * y);
}

/**
 * Calculate the surface area of a sphere given its volume.
 *
 * @param volume - Volume of the sphere in cubic units
 * @returns Surface area of the sphere in square units
 */
export function sphereSurfaceAreaFromVolume(volume: number): number {
    // V = (4/3)*π*r³  =>  r = (3V / (4π))^(1/3)
    const radius = Math.pow((3 * volume) / (4 * Math.PI), 1 / 3);
    return 4 * Math.PI * radius * radius;
}

/**
 * Calculate the population standard deviation of a dataset.
 *
 * @param data - Array of numbers
 * @returns Population standard deviation
 */
export function populationStdDev(data: number[]): number {
    const n = data.length;
    if (n === 0) return 0;

    const mean = data.reduce((sum, x) => sum + x, 0) / n;
    const variance = data.reduce((sum, x) => sum + (x - mean) * (x - mean), 0) / n;

    return Math.sqrt(variance);
}

/**
 * Calculate the pH of a solution from its hydrogen ion concentration.
 *
 * @param hydrogenIonConcentration - [H⁺] concentration in mol/L
 * @returns pH value
 */
export function calculatePH(hydrogenIonConcentration: number): number {
    return -Math.log10(hydrogenIonConcentration);
}
