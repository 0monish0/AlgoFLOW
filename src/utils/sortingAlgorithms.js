// Generates an array of steps for GSAP timelines
// Each step: { type: 'compare' | 'swap' | 'done', indices: number[], arrayState: number[] }

export function getBubbleSortSteps(initialArray) {
  const steps = [];
  const arr = [...initialArray];
  let n = arr.length;
  let swapped;
  
  do {
    swapped = false;
    for (let i = 0; i < n - 1; i++) {
      steps.push({ type: 'compare', indices: [i, i + 1], arrayState: [...arr] });
      
      if (arr[i] > arr[i + 1]) {
        let temp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = temp;
        swapped = true;
        steps.push({ type: 'swap', indices: [i, i + 1], arrayState: [...arr] });
      }
    }
    n--;
  } while (swapped);
  
  steps.push({ type: 'done', indices: [], arrayState: [...arr] });
  return steps;
}

export function getQuickSortSteps(initialArray) {
  const steps = [];
  const arr = [...initialArray];

  function partition(low, high) {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      steps.push({ type: 'compare', indices: [j, high], arrayState: [...arr] });
      if (arr[j] < pivot) {
        i++;
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        steps.push({ type: 'swap', indices: [i, j], arrayState: [...arr] });
      }
    }
    
    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    steps.push({ type: 'swap', indices: [i + 1, high], arrayState: [...arr] });
    
    return i + 1;
  }

  function quickSort(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    }
  }

  quickSort(0, arr.length - 1);
  steps.push({ type: 'done', indices: [], arrayState: [...arr] });
  return steps;
}

export function getMergeSortSteps(initialArray) {
  const steps = [];
  const arr = [...initialArray];

  function merge(left, mid, right) {
    const n1 = mid - left + 1;
    const n2 = right - mid;
    const L = new Array(n1);
    const R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = arr[left + i];
    for (let j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

    let i = 0, j = 0, k = left;

    while (i < n1 && j < n2) {
      steps.push({ type: 'compare', indices: [left + i, mid + 1 + j], arrayState: [...arr] });
      if (L[i] <= R[j]) {
        arr[k] = L[i];
        i++;
      } else {
        arr[k] = R[j];
        j++;
      }
      k++;
      steps.push({ type: 'swap', indices: [k - 1], arrayState: [...arr] });
    }

    while (i < n1) {
      arr[k] = L[i];
      i++;
      k++;
      steps.push({ type: 'swap', indices: [k - 1], arrayState: [...arr] });
    }

    while (j < n2) {
      arr[k] = R[j];
      j++;
      k++;
      steps.push({ type: 'swap', indices: [k - 1], arrayState: [...arr] });
    }
  }

  function mergeSort(left, right) {
    if (left >= right) return;
    const mid = left + Math.floor((right - left) / 2);
    mergeSort(left, mid);
    mergeSort(mid + 1, right);
    merge(left, mid, right);
  }

  mergeSort(0, arr.length - 1);
  steps.push({ type: 'done', indices: [], arrayState: [...arr] });
  return steps;
}
