import { tree_to_afn } from "../afn/tree_to_afn";
import TreeNode from "../arbol_sintactico/TreeNode";
import {areArraysEqual, deleteArrayDuplicates, removeAllOccurencesFromArray, removeAllOccurencesFromItem} from './array_functions';
import { nextChar } from "./nextChar";

// Se obtendra una tabla de transiciones de tipo objeto, cada llave representa un estado, y dentro de la llave se encuentra otro objeto que contiene informacion del estado (el conjunto que representa, los estados a los que se mueve con las letras ej: e(Mueve(A, a)))
export const afn_to_afd = (treeNode: TreeNode):any => {
    const afn = tree_to_afn(treeNode, [[], []], 0, 1);
    const languageCharacters = getLanguageCharactersFromTreeNode(treeNode);

    var transitionTable: any = {
        "A": {
            name: 'A',
            set: eClosure(afn, [0], []),
            isDoneChecking: false
        }
    };

    while (!isAllDoneChecking(transitionTable)) {
        let copyTransitionTable: any = {...transitionTable};
        let newTransitionTable: any = {...transitionTable};

        const keys = Object.keys(copyTransitionTable);
        keys.forEach((key: string) => {
            if (copyTransitionTable[key]["isDoneChecking"] === false) {
                const stateSet = copyTransitionTable[key]["set"];
                languageCharacters.forEach(character => {
                    const cMove = move(afn, stateSet, character);
                    const cClosure = eClosure(afn, cMove, []);
                    
                    newTransitionTable[key][character] = cClosure;

                    if (cClosure.length > 0 && !doesSetExists(newTransitionTable, cClosure)) {
                        const stateNames = Object.keys(newTransitionTable);
                        const lastCharacter = stateNames[stateNames.length - 1];
                        const nextCharacter = nextChar(lastCharacter);
                        
                        newTransitionTable = {
                            ...newTransitionTable,
                            [nextCharacter]: {
                                name: nextCharacter,
                                set: cClosure,
                                isDoneChecking: false
                            }
                        }
                    }
                });
                newTransitionTable[key]["isDoneChecking"] = true;
            }
        });

        transitionTable = {...newTransitionTable};
    }

    transitionTable = convertCharacterSetToState(transitionTable, languageCharacters);
    console.log(transitionTable);

    return transitionTable;
}

const eClosure = (afn: Array<Array<string|undefined>>, states: Array<number>, alreadyChecked: Array<number>): Array<number> => {
    let set: Array<number> = [];
    let alreadyCheckedCopy: Array<number>  = [...alreadyChecked];

    states.forEach((state) => {
        set = [...set, state]; // Siempre se agrega el estado que se evalua
        alreadyCheckedCopy = deleteArrayDuplicates([...alreadyCheckedCopy, ...set])
        let stateSet: Array<number> = [];

        afn[state].forEach((transition, index) => {
            if (transition === '&') {
                stateSet = [...stateSet, index];
            }
        });

        stateSet = eClosure(afn, removeAllOccurencesFromArray(stateSet, alreadyChecked), alreadyCheckedCopy);

        set = [...set, ...stateSet];
    });

    const setWithoutDuplicates: Array<number> = deleteArrayDuplicates(set);

    return setWithoutDuplicates;
}

const move = (afn: Array<Array<string|undefined>>, states: Array<number>, character: string): Array<number> => {
    let moveSet: Array<number> = [];

    states.forEach(state => {
        afn[state].forEach((transition, index) => {
            if (transition === character) {
                moveSet = [...moveSet, index];
            }
        });

        moveSet = deleteArrayDuplicates(moveSet);

        moveSet = [...moveSet, ...move(afn, moveSet, character)];
    });

    moveSet = deleteArrayDuplicates(moveSet);

    return moveSet;
}

export const getLanguageCharactersFromTreeNode = (treeNode: TreeNode): Array<string> => {
    let characters: Array<string> = [];

    // Obtener caracteres del lenguaje
    if (treeNode.isLeaf()) {
        characters.push(treeNode.value);
    } else {
        if (treeNode.leftChild !== null) {
            const leftLeafCharacters = getLanguageCharactersFromTreeNode(treeNode.leftChild);
            characters = [...characters, ...leftLeafCharacters];
        }

        if (treeNode.rightChild !== null) {
            const rightLeafCharacters = getLanguageCharactersFromTreeNode(treeNode.rightChild);
            characters = [...characters, ...rightLeafCharacters];
        }
    }

    characters = removeAllOccurencesFromItem(characters, '&');

    // Eliminar duplicados del array
    let charactersWithoutDuplicates: Array<string> = deleteArrayDuplicates(characters);

    return charactersWithoutDuplicates;
}

const isAllDoneChecking = (transitionTable: any): boolean => {
    const keys = Object.keys(transitionTable);
    let isDoneChecking = true;

    keys.forEach(key => {
        const isKeyDoneChecking: boolean = transitionTable[key]["isDoneChecking"];
        isDoneChecking = isDoneChecking && isKeyDoneChecking;
    });

    return isDoneChecking;
}

const doesSetExists = (transitionTable: any, set: Array<number>): boolean => {
    const keys = Object.keys(transitionTable);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const stateSet = transitionTable[key]["set"];

        if (areArraysEqual(stateSet, set)) {
            return true;
        }
    }

    return false;
}

const convertCharacterSetToState = (transitionTable: any, languageCharacters: Array<string>): any => {
    let newTransitionTable = {...transitionTable};
    const keys = Object.keys(newTransitionTable);

    keys.forEach(key => {
        const state = transitionTable[key];

        languageCharacters.forEach(character => {
            const characterSet = state[character];

            if (characterSet.length > 0) {
                keys.forEach(otherStateKey => {
                    const otherStateSet = transitionTable[otherStateKey]["set"];
    
                    if (areArraysEqual(otherStateSet, characterSet)) {
                        const otherStateName = transitionTable[otherStateKey]["name"];
                        newTransitionTable[key][character] = otherStateName;
                    }
                })
            } else {
                newTransitionTable[key][character] = '';
            }
        });
    });

    return newTransitionTable;
}

export const convertAFDToD3Graph = (treeNode: TreeNode): any => {
    let nodes: Array<any> = [];
    let links: Array<any> = [];

    const afd = afn_to_afd(treeNode);
    const languageCharacters = getLanguageCharactersFromTreeNode(treeNode);
    const keys = Object.keys(afd);

    keys.forEach(key => {
        const state = afd[key];
        const set = state["set"];

        nodes.push({id: key, label: key, isInitial: set.indexOf(0) !== -1, isFinal: set.indexOf(1) !== -1});

        languageCharacters.forEach((character) => {
            const characterTarget = state[character];

            if (characterTarget !== '') {
                links.push({source: key, target: characterTarget, label: character});
            }
        });
    })

    return {nodes: nodes, links:links};
}

