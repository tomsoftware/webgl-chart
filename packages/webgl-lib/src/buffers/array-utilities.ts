export type TypedArray =
  | Float32Array
  | Float64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array;

export class ArrayUtilities {
    /**
     *  guesses a index-range a given value lays in
     *  Returns null if value is outside of array
     */
    public static guessIndexRange(array: TypedArray, minIndex: number, maxIndex: number, value: number) {
        const len = maxIndex - minIndex;
        if (len <= 0) {
            return null;
        }

        const start = array[minIndex];
        const end = array[maxIndex];
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
        if (array[guess] < value) {
            while (array[high] < value) {
                low = high;
                high = high + step;
                if (high >= maxIndex) {
                    return [low, maxIndex];
                }
                step *= 2;
            }
        } else {
            while (array[low] > value) {
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
    public static binarySearch(array: TypedArray, minIndex: number, maxIndex: number, value: number) {
        let low = minIndex;
        let high = maxIndex;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const midVal = array[mid];

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
}
