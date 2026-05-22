export class ArrayUtilities {
    /**
     *  guesses a index-range a given value lays in
     *  Returns null if value is outside of array
     */
    public static guessIndexRange(getFunc: (index: number) => number, minIndex: number, maxIndex: number, value: number) {
        const len = maxIndex - minIndex;
        if (len <= 0) {
            return null;
        }

        const start = getFunc(minIndex);
        const end = getFunc(maxIndex);
        if (value < start || value > end) {
            return null;
        }

        // make a guess about the index
        const estimatedDelta = (end - start) / (len - 1);
        let guess = Math.floor((value - start) / estimatedDelta);
        guess = Math.max(minIndex, Math.min(maxIndex, guess));

        // Extend range dynamically until value is safely between low and high
        let low = guess;
        let high = guess;

        // enlarge the range so value is in (inverse Binary)
        let step = 1;
        // Determine direction
        if (getFunc(guess) < value) {
            while (getFunc(high) < value) {
                low = high;
                high = high + step;
                if (high >= maxIndex) {
                    return [low, maxIndex];
                }
                step *= 2;
            }
        } else {
            while (getFunc(low) > value) {
                high = low;
                low = low - step;
                if (low <= minIndex) {
                    return [minIndex, high];
                }
                step *= 2;
            }
        }

        return [low, high];
    }

    /** returns the index that is closes to a given value  */
    public static binarySearch(getFunc: (index: number) => number, minIndex: number, maxIndex: number, value: number) {
        let low = minIndex;
        let high = maxIndex;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const midVal = getFunc(mid);

            if (midVal < value) {
                low = mid + 1;
            } else if (midVal > value) {
                high = mid - 1;
            } else {
                return [mid, mid];
            }
        }
        return [low, high];
    }

    /** returns the index that is closest to a given value */
    public static interpolationSearch(
        getFunc: (index: number) => number,
        minIndex: number,
        maxIndex: number,
        value: number
    ): [number, number] {

        if (minIndex > maxIndex) return [minIndex, maxIndex];

        const first = getFunc(minIndex);
        const last = getFunc(maxIndex);

        // Try to detect gradient direction
        const ascending = first <= last;

        return ascending
            ? this.searchAscending(getFunc, minIndex, maxIndex, value)
            : this.searchDescending(getFunc, minIndex, maxIndex, value);
    }

    private static searchAscending(
        getFunc: (index: number) => number,
        low: number,
        high: number,
        value: number
    ): [number, number] {

        let lowVal = getFunc(low);
        let highVal = getFunc(high);

        // value is completely outside the array range
        if (value < lowVal) return [low - 1, low];
        if (value > highVal) return [high, high + 1];

        // Track the best candidates:
        // below = last index with value <= target
        // above = first index with value >= target
        let below = low - 1;
        let above = high + 1;

        while (low <= high) {
            // Interpolation estimate
            const pos = low + Math.floor(
                ((value - lowVal) * (high - low)) / (highVal - lowVal)
            );

            // Clamp to valid range
            const p = Math.min(Math.max(pos, low), high);
            const v = getFunc(p);

            // Exact match
            if (v === value) {
                return [p, p];
            }

            if (v < value) {
                // p is a valid "below" candidate
                below = p;
                low = p + 1;

                if (low > high) break;
                lowVal = getFunc(low);
            } else {
                // p is a valid "above" candidate
                above = p;
                high = p - 1;

                if (high < low) break;
                highVal = getFunc(high);
            }
        }

        // Return the interval that actually contains the target value
        return [below, above];
    }


    private static searchDescending(
        getFunc: (index: number) => number,
        low: number,
        high: number,
        value: number
    ): [number, number] {

        let lowVal = getFunc(low);
        let highVal = getFunc(high);

        // value is completely outside the array range (descending order)
        if (value > lowVal) return [low - 1, low];
        if (value < highVal) return [high, high + 1];

        // Track the best candidates:
        // below = last index with value >= target
        // above = first index with value <= target
        let below = low - 1;
        let above = high + 1;

        while (low <= high) {
            // Interpolation estimate (note reversed value direction)
            const pos = low + Math.floor(
                ((lowVal - value) * (high - low)) / (lowVal - highVal)
            );

            // Clamp to valid range
            const p = Math.min(Math.max(pos, low), high);
            const v = getFunc(p);

            // Exact match
            if (v === value) {
                return [p, p];
            }

            if (v > value) {
                // p is a valid "below" candidate (still >= value)
                below = p;
                low = p + 1;

                if (low > high) break;
                lowVal = getFunc(low);
            } else {
                // p is a valid "above" candidate (<= value)
                above = p;
                high = p - 1;

                if (high < low) break;
                highVal = getFunc(high);
            }
        }

        // Return the interval that actually contains the target value
        return [below, above];
    }

}
