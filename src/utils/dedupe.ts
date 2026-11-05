export function dedupeById<T extends { id: number | string }>(items: T[]): T[] {
    const seen = new Set<number | string>();
    const result: T[] = [];

    for (const item of items) {
        if (!seen.has(item.id)) {
            seen.add(item.id);
            result.push(item);
        }
    }

    return result;
}
