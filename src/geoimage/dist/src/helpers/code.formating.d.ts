/**
 * Check if the value in included in enum posibilities.
 * @param value Value we need to check
 * @param enumEntity Enum type we check againts the value
 * @returns Is the value in this enum?
 */
export declare const isInEnum: (value: any, enumEntity: any) => boolean;
/**
 * Sort array of string elements
 * @param rawArray Raw unsorted array of elements
 * @returns Sorted string array
 */
export declare const sortStringArray: (rawArray: string[]) => string[];
/**
 * Remove all duplicity string items from an array
 * @param arr Original array with duplicities
 * @returns Array of original values
 */
export declare const removeDuplicitiesFromArray: (arr: any[]) => any[];
/**
 * Check if the string value is not ` "" `
 * @param value Value to check
 * @returns Boolean result about the truth
 */
export declare const notEmptyString: (value: string) => boolean;
/**
 * Return enum values as array of string
 * @param enumType Type of the enum from code
 * @param separator Optional - separator character
 * @returns Array of enum possible values
 */
export declare const enumValuesToString: (enumType: any, separator?: string) => string;
/**
 * Return enum values as array of string
 * @param enumTypes Combination of enum types
 * @param separator Optional - separator character
 * @returns Array of enum possible values
 */
export declare const enumCombineValuesToString: (enumTypes: any[], separator?: string) => string;
/**
 * Return all enum values as array
 * @param enumType What array we want to work with
 * @returns Array of enum values
 */
export declare const enumValuesToArray: (enumType: any) => string[];
/**
 * Return random number (integer) between two values
 * @param min
 * @param max
 * @returns
 */
export declare const randomNumberBetween: (min: number, max: number) => number;
