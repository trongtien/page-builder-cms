import { describe, it, expect } from "vitest";
import { unique, groupBy, chunk, shuffle, randomItem } from "./array";

describe("Array Utils", () => {
    describe("unique", () => {
        it("should remove duplicates", () => {
            expect(unique([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
        });

        it("should handle empty array", () => {
            expect(unique([])).toEqual([]);
        });

        it("should work with strings", () => {
            expect(unique(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
        });
    });

    describe("groupBy", () => {
        it("should group items by key", () => {
            const items = [
                { type: "fruit", name: "apple" },
                { type: "fruit", name: "banana" },
                { type: "veggie", name: "carrot" }
            ];
            const grouped = groupBy(items, (item) => item.type);
            expect(grouped.fruit).toHaveLength(2);
            expect(grouped.veggie).toHaveLength(1);
        });

        it("should handle empty array", () => {
            expect(groupBy([], (item: any) => item.key)).toEqual({});
        });
    });

    describe("chunk", () => {
        it("should split array into chunks", () => {
            expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
        });

        it("should handle exact division", () => {
            expect(chunk([1, 2, 3, 4], 2)).toEqual([
                [1, 2],
                [3, 4]
            ]);
        });

        it("should handle empty array", () => {
            expect(chunk([], 2)).toEqual([]);
        });
    });

    describe("shuffle", () => {
        it("should return array with same length", () => {
            const arr = [1, 2, 3, 4, 5];
            expect(shuffle(arr)).toHaveLength(arr.length);
        });

        it("should contain same elements", () => {
            const arr = [1, 2, 3, 4, 5];
            const shuffled = shuffle(arr);
            expect(shuffled.sort()).toEqual(arr.sort());
        });

        it("should not modify original array", () => {
            const arr = [1, 2, 3, 4, 5];
            const original = [...arr];
            shuffle(arr);
            expect(arr).toEqual(original);
        });
    });

    describe("randomItem", () => {
        it("should return item from array", () => {
            const arr = [1, 2, 3, 4, 5];
            const item = randomItem(arr);
            expect(arr).toContain(item);
        });

        it("should return undefined for empty array", () => {
            expect(randomItem([])).toBeUndefined();
        });
    });
});
