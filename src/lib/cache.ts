/**
 * Cache for storing internal Emmet data. Kept in its own module so that
 * `config` and `emmet` can both reach it without forming an import cycle.
 */
let cache: object = {};

export function getCache(): object {
    return cache;
}

export function resetCache(): void {
    cache = {};
}
