'use strict';

// Swap elements at 2 indexes in an array
const swapArrayElement = async (array, index1, index2)=> {
  var temp = array[index1];
  array[index1] = array[index2];
  array[index2] = temp;
  return Promise.resolve(array);
}

// Get all permutated combinations of an array by Heap Algorithm
const permutationHeap = async (array, n = array.length)=> {
  if (n === 1) { return Promise.resolve(array.slice()); }

  let result = [];
  for (var i = 1; i <= n; i++) {
    result.push(await permutationHeap(array, n - 1));
    if (n % 2) {
      await swapArrayElement(array, 0, n - 1); // when length is odd so n % 2 is 1,  select the first number, then the second number, then the third number. . . to be swapped with the last number
    }
    else {
      await swapArrayElement(array, i - 1, n - 1); // when length is even so n % 2 is 0,  always select the first number with the last number
    }
  }

  return Promise.resolve(result);
}

// Simplified array sorting functions
const sortArrayAsc = async (array, column)=> { return Promise.resolve(await objectSort(array, [{ column:column, sortOrder:-1 }]))};
const sortArrayDesc = async (array, column)=> { return Promise.resolve(await objectSort(array, [{ column:column, sortOrder:1 }]))};

// sortRequirements.sortOrder = -1 for sorting in ascending order
// sortRequirements.sortOrder = 1 for sorting in descending order
// sortRequirements.column is the array of attribute to do sort, first sort on sortRequirements[0].column, if equal, it will look at sortRequirements[1].column, and so on
// If column parameter does not match any object attribute, the array will remain unsorted.
// Example to call this function: objectSort(array, [{ column:"name",sortOrder:-1 },{ column:"_id",sortOrder:-1 }]);
const objectSort = async (array, sortRequirements)=> {
  return Promise.resolve(
    array.sort((element1, element2)=>{
      var result = 0, i = 0;
      for (i = 0; i < sortRequirements.length; ++i) {
        if (element1[sortRequirements[i].column] > element2[sortRequirements[i].column]) { result = -1 * sortRequirements[i].sortOrder; break; }
        if (element1[sortRequirements[i].column] < element2[sortRequirements[i].column]) { result = 1 * sortRequirements[i].sortOrder; break; }
      }
      return result;
    })
  );
}

// Remove all empty key from object, array or array of objects
// If findNest is set true, it will remove all empty key at nested levels
// Note: 
// 1. Need to set findNest for array or array of objects
// 2. The passed obj will be modified directly. Make a copy before passing to the function to keep the original object
const removeEmptyKey = async (obj, findNest)=> {
  for (var key in obj) {
    if (obj[key] === "" || obj[key] == null || (typeof obj[key] === 'number' && isNaN(obj[key]))) { delete obj[key]; }
    else if (findNest && Object.prototype.toString.call(obj[key]) === "[object Object]") { removeEmptyKey(obj[key], findNest); }
    else if (findNest && Object.prototype.toString.call(obj[key]) === "[object Array]") { obj[key].forEach(element => removeEmptyKey(element, findNest)); }
  }
  return Promise.resolve(obj);
}

module.exports = {
  permutationHeap,
  swapArrayElement,
  objectSort,
  sortArrayAsc,
  sortArrayDesc,
  removeEmptyKey
};