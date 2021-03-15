export const deleteArrayDuplicates = (array: Array<any>): Array<any> => {
    let arrayWithoutDuplicates: Array<string> = []

    array.forEach(item => {
        if (arrayWithoutDuplicates.indexOf(item) === -1) {
            arrayWithoutDuplicates.push(item);
        }
    })

    return arrayWithoutDuplicates;
}

export const removeAllOccurencesFromArray = (array: Array<any>, items: Array<any>): Array<any> => {
    let arrayCopy: Array<any> = [...array];

    items.forEach(item => {
        while (arrayCopy.indexOf(item) !== -1) {
            arrayCopy.splice(arrayCopy.indexOf(item), 1);
        }
    })

    return arrayCopy;
}

export const removeAllOccurencesFromItem = (array: Array<any>, item: any): Array<any> => {
    let arrayCopy: Array<any> = [...array];

    while (arrayCopy.indexOf(item) !== -1) {
        arrayCopy.splice(arrayCopy.indexOf(item), 1);
    }

    return arrayCopy;
}

export const areArraysEqual = (array1: Array<any>, array2: Array<any>): boolean => {
    let a = [...array1];
    let b = [...array2];

    a.sort((primer, segundo) => primer-segundo);
    b.sort((primer, segundo) => primer-segundo);

    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}