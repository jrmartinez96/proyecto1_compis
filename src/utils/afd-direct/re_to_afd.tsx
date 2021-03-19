import { removeAllOccurencesFromItem, deleteArrayDuplicates, areArraysEqual } from "../afd/array_functions";
import { nextChar } from "../afd/nextChar";
import { re_to_tree } from "../arbol_sintactico/re_to_tree";
import TreeNode from "../arbol_sintactico/TreeNode";

export const re_to_afd = (regularExpression: string) => {
    regularExpression = regularExpression + "#";

    // Configurar arbol con nodos anulables, primerotipos y ultimapos
    const treeNode = re_to_tree(regularExpression);
    treeNode.setNullable();
    const leafNodesIds = treeNode.setLeafId({});
    treeNode.setPrimerapos();
    treeNode.setUltimapos();

    // Construccion de objeto de ids de las hojas
    let siguientepos: any = {};
    const leafNodesIdsKeys = Object.keys(leafNodesIds);
    leafNodesIdsKeys.forEach(leafId => {
        siguientepos[leafId] = [];
    });
    siguientepos = treeNode.setSiguientepos(siguientepos);

    // Constantes y variables de uso
    const languageCharacters = getLanguageCharactersFromTreeNode(treeNode);
    let stateTable: any = {
        "A": {
            name: 'A',
            set: treeNode.primerapos,
            isDoneChecking: false
        }
    };
    
    let transitionTable: any = {
        "A": {}
    };

    while(!isAllDoneChecking(stateTable)) {
        let copyStateTable: any = {...stateTable};
        let newStateTable: any = {...stateTable};
        let newTransitionTable: any = {...transitionTable};

        const keys = Object.keys(copyStateTable);
        keys.forEach((key: string) => {
            if (copyStateTable[key]["isDoneChecking"] === false) {
                const stateSet = copyStateTable[key]["set"];
                languageCharacters.forEach(character => {
                    const transition = tranD(stateSet, character, leafNodesIds, siguientepos);
                    newTransitionTable[key][character] = transition;

                    if (transition.length > 0 && !doesSetExists(newStateTable, transition)) {
                        const stateNames = Object.keys(newStateTable);
                        const lastCharacter = stateNames[stateNames.length - 1];
                        const nextCharacter = nextChar(lastCharacter);
                        
                        newStateTable = {
                            ...newStateTable,
                            [nextCharacter]: {
                                name: nextCharacter,
                                set: transition,
                                isDoneChecking: false
                            }
                        }

                        newTransitionTable = {
                            ...newTransitionTable,
                            [nextCharacter]: {}
                        }
                    }
                });
                newStateTable[key]["isDoneChecking"] = true;
            }
        });
        
        stateTable = {...newStateTable};
        transitionTable = {...newTransitionTable};
    }

    transitionTable = convertCharacterSetToState(stateTable, transitionTable, languageCharacters);

    console.log(stateTable);
    console.log(transitionTable);

    const d3GraphData = convertAFDToD3Graph(transitionTable, stateTable, leafNodesIds, languageCharacters, treeNode.primerapos);

    return {stateTable, transitionTable, d3GraphData, primeraposRaiz: treeNode.primerapos, leafNodesIds, languageCharacters}
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

const getLanguageCharactersFromTreeNode = (treeNode: TreeNode): Array<string> => {
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
    characters = removeAllOccurencesFromItem(characters, '#');

    // Eliminar duplicados del array
    let charactersWithoutDuplicates: Array<string> = deleteArrayDuplicates(characters);

    return charactersWithoutDuplicates;
}

const tranD = (stateSet: Array<number>, character: string, leafNodesIds: any, siguientepos: any) => {
    let siguientePosNodes: Array<number> = [];

    stateSet.forEach(id => {
        if (leafNodesIds[id] === character) {
            siguientePosNodes = [...siguientePosNodes, id];
        }
    });

    let siguientePosReturn: Array<number> = [];
    siguientePosNodes.forEach(node => {
        siguientePosReturn = [...siguientePosReturn, ...siguientepos[node]];
    });

    siguientePosReturn = deleteArrayDuplicates(siguientePosReturn);

    return siguientePosReturn;
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

const convertCharacterSetToState = (statesTable: any, transitionTable: any, languageCharacters: Array<string>): any => {
    let newTransitionTable = {...transitionTable};
    const keys = Object.keys(newTransitionTable);

    keys.forEach(key => {
        const state = transitionTable[key];

        languageCharacters.forEach(character => {
            const characterSet = state[character];

            if (characterSet.length > 0) {
                keys.forEach(otherStateKey => {
                    const otherStateSet = statesTable[otherStateKey]["set"];
    
                    if (areArraysEqual(otherStateSet, characterSet)) {
                        const otherStateName = statesTable[otherStateKey]["name"];
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

const convertAFDToD3Graph = (afdTransitionTable: any, afdStateTable: any, leafNodesIds: any, languageCharacters: Array<string>, primeraposRaiz: any): any => {
    let nodes: Array<any> = [];
    let links: Array<any> = [];

    // Obtener id del nodo de aceptacion
    const leafNodesIdsKeys = Object.keys(leafNodesIds);
    const acceptanceNode = leafNodesIdsKeys.length;

    const states = Object.keys(afdTransitionTable);
    states.forEach(state => {
        const set = afdStateTable[state]["set"];
        nodes.push({id: state, label: state, isInitial: areArraysEqual(primeraposRaiz, set), isFinal: set.indexOf(acceptanceNode) !== -1});

        languageCharacters.forEach((character) => {
            const characterTarget = afdTransitionTable[state][character];

            if (characterTarget !== '') {
                links.push({source: state, target: characterTarget, label: character});
            }
        });
    })

    return {nodes: nodes, links:links};
}