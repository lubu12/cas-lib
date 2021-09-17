'use strict';

/**
 * Swap elements at 2 indexes in an array
 * 
 * @param {Array} array Array
 * @param {number} index1 Array index
 * @param {number} index2 Array index
 * @returns {Array} Array after swapping elements
 */
const swapArrayElement = (array, index1, index2)=> {
  var temp = array[index1];
  array[index1] = array[index2];
  array[index2] = temp;
  return array;
}

/**
 * Get all permutated combinations of an array by Heap Algorithm
 * 
 * @param {Array} array Array
 * @param {number} n Length of array
 * @returns {promise} Promise with array of all combination arrays
 */
const permutationHeap = async (array, n = array.length)=> {
  if (n === 1) { return Promise.resolve(array.slice()); }

  let result = [];
  for (let i = 1; i <= n; i++) {
    result.push(await permutationHeap(array, n - 1));
    if (n % 2) { swapArrayElement(array, 0, n - 1); } // when length is odd so n % 2 is 1,  select the first number, then the second number, then the third number. . . to be swapped with the last number
    else { swapArrayElement(array, i - 1, n - 1); } // when length is even so n % 2 is 0,  always select the first number with the last number
  }

  return Promise.resolve(result);
}

/**
 * Sort the object array in ascending order 
 * 
 * @param {Array} array Object array
 * @param {string} column Name of key for sorting
 * @returns {promise} Promise with sorted object array
 */
const sortArrayAsc = async (array, column)=> { return Promise.resolve(await objectSort(array, [{ column: column, sortOrder: -1 }]))};

/**
 * Sort the object array in descending order 
 * 
 * @param {Array} array Object array
 * @param {string} column Name of key for sorting
 * @returns {promise} Promise with sorted object array
 */
const sortArrayDesc = async (array, column)=> { return Promise.resolve(await objectSort(array, [{ column: column, sortOrder: 1 }]))};

/**
 * Object array sort on multiple columns (keys)
 * - sortRequirements.sortOrder = -1 for sorting in ascending order
 * - sortRequirements.sortOrder = 1 for sorting in descending order
 * - sortRequirements.column is the array of attribute to do sort, first sort on sortRequirements[0].column, if equal, it will look at sortRequirements[1].column, and so on
 * - If column parameter does not match any object attribute, the array will remain unsorted.
 * - Example to call this function: objectSort(array, [{ column: "name", sortOrder: -1 },{ column: "_id", sortOrder: -1 }]);
 * 
 * @param {Array} array Object array
 * @param {Array} sortRequirements Sorting object E.g., [{ column: "name", sortOrder: -1 },{ column: "_id", sortOrder: -1 }]
 * @returns {promise} Promise with sorted object array
 */
const objectSort = async (array, sortRequirements)=> {
  return Promise.resolve(
    array.sort((element1, element2)=>{
      let result = 0, i = 0;
      for (i = 0; i < sortRequirements.length; ++i) {
        if (element1[sortRequirements[i].column] > element2[sortRequirements[i].column]) { result = -1 * sortRequirements[i].sortOrder; break; }
        if (element1[sortRequirements[i].column] < element2[sortRequirements[i].column]) { result = 1 * sortRequirements[i].sortOrder; break; }
      }
      return result;
    })
  );
}

/**
 * Sort the object array in ascending order
 * 
 * @param {Array} array Object array
 * @param {string} column Name of key for sorting
 * @returns {promise} Promise with sorted object array
 */
const sortArray2Asc = async (array, column)=> { return Promise.resolve(objectSort2Sync(array, { [column]: 1 }))};

/**
 * Sort the object array in descending order
 * 
 * @param {Array} array Object array
 * @param {string} column Name of key for sorting
 * @returns {promise} Promise with sorted object array
 */
const sortArray2Desc = async (array, column)=> { return Promise.resolve(objectSort2Sync(array, { [column]: -1 }))};

/**
 * Synchorous Sort the object array in ascending order
 * 
 * @param {Array} array Object array
 * @param {string} column Name of key for sorting
 * @returns {Array} Sorted object array
 */
const sortArray2AscSync = (array, column)=> { return objectSort2Sync(array, { [column]: 1 })};

/**
 * Synchronous Sort the object array in descending order
 * 
 * @param {Array} array Object array
 * @param {string} column Name of key for sorting
 * @returns {Array} Sorted object array
 */
const sortArray2DescSync = (array, column)=> { return objectSort2Sync(array, { [column]: -1 })};

/**
 * Object array sort on multiple columns (keys)
 * - value at sortRequirements = -1 for sorting in ascending order
 * - value at sortRequirements = 1 for sorting in descending order
 * - key at sortRequirements is the array of attribute to do sort, first sort on key of sortRequirements[0], if equal, it will look at sortRequirements[1], and so on
 * - If column parameter does not match any object attribute, the array will remain unsorted.
 * - Example to call this function: objectSort(array, { name: -1, _id: -1 });
 * 
 * @param {Array} array Object array
 * @param {object} sortRequirements Sorting object E.g., { name: -1, _id: -1 }
 * @returns {promise} Promise with sorted object array
 */
const objectSort2 = async (array, sortRequirements)=> { return Promise.resolve(objectSort2Sync(array, sortRequirements)); }

/**
 * Synchronous - Object array sort on multiple columns (keys)
 * - value at sortRequirements = -1 for sorting in ascending order
 * - value at sortRequirements = 1 for sorting in descending order
 * - key at sortRequirements is the array of attribute to do sort, first sort on key of sortRequirements[0], if equal, it will look at sortRequirements[1], and so on
 * - If column parameter does not match any object attribute, the array will remain unsorted.
 * - Example to call this function: objectSort(array, { name: -1, _id: -1 });
 * 
 * @param {Array} array Object array
 * @param {object} sortRequirements Sorting object E.g., { name: -1, _id: -1 }
 * @returns {Array} Promise with sorted object array
 */
const objectSort2Sync = (array, sortRequirements)=> {
  let keys = Object.keys(sortRequirements);
  array.sort((element1, element2)=> {
    let result = 0, i = 0;
    for (i = 0; i < keys.length; ++i) {
      if (element1[keys[i]] > element2[keys[i]]) { result = sortRequirements[keys[i]]; break; }
      if (element1[keys[i]] < element2[keys[i]]) { result = -1 * sortRequirements[keys[i]]; break; }
    }
    return result;
  });
  
  return array;
}

/**
 * Remove all empty key/value from object, array or array of objects
 * 
 * Function can be passed as parameter to perform some custom logic. e.g.,
 * ```
 *   removeEmptyKeySync(objData, true, (obj) => {
 *     if (typeof obj === "string") { obj = obj.trim(); }
 *     if (obj === "true") { obj = true; }
 *     else if (obj === "false") { obj = false; }
 *     return obj;
 *   });
 * ```
 * Note:
 * - Need to set findNest to true for array or array of objects
 * - The passed obj will be modified directly. Make a copy before passing to the function to keep the original object
 * 
 * @param {object|Array} obj Object, array or object array
 * @param {boolean} [findNest=false] If set true, it will remove all empty key at nested levels
 * @param {function} [fn] Function to perform some custom logic
 * @returns {promise} Promise with object without empty-value key
 */
const removeEmptyKey = async (obj, findNest = false, fn)=> {
  removeEmptyKeySync(obj, findNest, fn);
  return Promise.resolve(obj);
}

/**
 * Synchronous - Remove all empty key/value from object, array or array of objects
 * 
 * Function can be passed as parameter to perform some custom logic. e.g.,
 * ```
 *   removeEmptyKeySync(objData, true, (obj) => {
 *     if (typeof obj === "string") { obj = obj.trim(); }
 *     if (obj === "true") { obj = true; }
 *     else if (obj === "false") { obj = false; }
 *     return obj;
 *   });
 * ```
 * Note:
 * - Need to set findNest to true for array or array of objects
 * - The passed obj will be modified directly. Make a copy before passing to the function to keep the original object
 * 
 * @param {object|Array} obj Object, array or object array
 * @param {boolean} [findNest=false] If set true, it will remove all empty key at nested levels
 * @param {function} [fn] Function to perform some custom logic
 * @returns {object|Array} Promise with object without empty-value key
 */
const removeEmptyKeySync = (obj, findNest = false, fn)=> {
  if (Object.prototype.toString.call(obj) !== "[object Object]" && Object.prototype.toString.call(obj) !== "[object Array]") { throw new Error("unsupport-type-found-object-and-array-only"); }

  for (let key in obj) {
    if (Array.isArray(obj) && (obj[key] === "" || obj[key] == null || (typeof obj[key] === 'number' && isNaN(obj[key])))) { obj.splice(key, 1); }
    else if (obj[key] === "" || obj[key] == null || (typeof obj[key] === "number" && isNaN(obj[key]))) { delete obj[key]; }
    else if (findNest && Object.prototype.toString.call(obj[key]) === "[object Object]") { removeEmptyKeySync(obj[key], findNest, fn); }
    else if (findNest && Object.prototype.toString.call(obj[key]) === "[object Array]") {
      for (let i = 0; i < obj[key].length; ++i) {
        if (obj[key][i] === "" || obj[key] == null || (typeof obj[key] === 'number' && isNaN(obj[key]))) { obj[key].splice(i, 1); }
      }
      removeEmptyKeySync(obj[key], findNest, fn);
    }

    if (fn && obj[key]) { obj[key] = fn(obj[key]); }
  }
  return obj;
}

/**
 * Tranverse all elements in objects or arrays and run function on it
 * 
 * @param {object|Array} obj Object or array
 * @param {function} fn Function to perform some custom logic
 * @returns {promise} Promise with object or array
 */
const runFnOnElement = async (obj, fn)=> {
  runFnOnElementSync(obj, fn);
  return Promise.resolve(obj);
}

/**
 * Synchronous - Tranverse all elements in objects or arrays and run function on it
 * 
 * @param {object|Array} obj Object or array
 * @param {function} fn Function to perform some custom logic
 * @returns {promise} Promise with object or array
 */
const runFnOnElementSync = (obj, fn)=> {
  for (var key in obj) {
    if (Object.prototype.toString.call(obj[key]) === "[object Object]" || Object.prototype.toString.call(obj[key]) === "[object Array]") {
      runFnOnElementSync(obj[key], fn);
    }

    if (fn) { obj[key] = fn(obj[key]); }
  }
  return obj;
}

/**
 * Find duplicates in string, number or boolean array
 * 
 * @param {Array} array Array
 * @returns {Array|undefined} [] if no duplicate is found, array of duplicates if found or undefined for non-array or find any unsupport data type
 */
const findDuplicates = (array)=> {
  if (!Array.isArray(array)) { return undefined; }
  if (array.length < 2) { return []; }

  let clonedArr = [];
  for (let i = 0; i < array.length; ++i) {
    if (typeof array[i] !== "string" && typeof array[i] !== "number" && typeof array[i] !== "boolean") {
      return undefined;
    }
    clonedArr.push(array[i]);
  }

  clonedArr.sort();
  let duplicates = [];
  for (let i = 0; i < clonedArr.length; ++i) {
    if (clonedArr[i] === clonedArr[i + 1]) {
      duplicates.push(clonedArr[i]);
    }
  }

  return Array.from(new Set(duplicates));
}

/**
 * Check if arrays are the identical - Only supports string, number or boolean array
 * 
 * @param {Array} array1 Array 1
 * @param {Array} array2 Array 2
 * @param {boolean} [isOrderMatter=false] if order matters, element in different positions will be considered as not the same, default is false
 * @returns {boolean|undefined} boolean or undefined for non-array or find any unsupport data type
 */
const isSameArray = (array1, array2, isOrderMatter = false)=> {
  if (!Array.isArray(array1) || !Array.isArray(array2)) { return undefined; }
  if (array1.length !== array2.length) { return false; }

  let clonedArr1 = [], clonedArr2 = [];
  for (let i = 0; i < array1.length; ++i) {
    if ((typeof array1[i] !== "string" && typeof array1[i] !== "number" && typeof array1[i] !== "boolean") ||
        (typeof array2[i] !== "string" && typeof array2[i] !== "number" && typeof array2[i] !== "boolean")) {
      return undefined;
    }
    clonedArr1.push(array1[i]);
    clonedArr2.push(array2[i]);
  }

  if (!isOrderMatter) {
    clonedArr1.sort();
    clonedArr2.sort(); 
  }

  for (let i = 0; i < clonedArr1.length; ++i) {
    if (clonedArr1[i] !== clonedArr2[i]) { return false; }
  }

  return true;
}

module.exports = {
  permutationHeap,
  swapArrayElement,
  objectSort,
  objectSort2,
  objectSort2Sync,
  sortArray2Asc,
  sortArray2Desc,
  sortArray2AscSync,
  sortArray2DescSync,
  sortArrayAsc,
  sortArrayDesc,
  removeEmptyKey,
  removeEmptyKeySync,
  runFnOnElement,
  runFnOnElementSync,
  findDuplicates,
  isSameArray
};