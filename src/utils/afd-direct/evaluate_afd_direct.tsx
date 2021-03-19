import { areArraysEqual } from "../afd/array_functions";
import { re_to_afd } from "./re_to_afd";

export const evaluate_afd_direct = (expression: string, regularExpression: string): boolean => {
    const afd_direct = re_to_afd(regularExpression);
    let initialStates: Array<string> = [];
    let acceptStates: Array<string> = [];

    const statesNames = Object.keys(afd_direct.stateTable);
    let afd: any = {};
    let primeraposRaiz: any = afd_direct.primeraposRaiz;

    // Unir tabla de estados y de transicion
    statesNames.forEach(stateName => {
        afd = {
            ...afd,
            [stateName]: {
                ...afd_direct.stateTable[stateName],
                ...afd_direct.transitionTable[stateName]
            }
        };
    });

    // Obtener estados iniciales y de aceptacion
    statesNames.forEach(stateName => {
        const stateSet = afd[stateName]["set"];
        
        if (areArraysEqual(stateSet, primeraposRaiz)) {
            initialStates.push(stateName);
        }

        if (stateSet.indexOf(Object.keys(afd_direct.leafNodesIds).length) !== -1) {
            acceptStates.push(stateName);
        }
    });

    let itBelongs = false;

    initialStates.forEach(stateName => {
        let currentStateName = stateName;
        for (let iExpression = 0; iExpression < expression.length; iExpression++) {
            const expressionCharacter = expression[iExpression];
            currentStateName = evaluateCharacter(currentStateName, expressionCharacter, afd);
            console.log(currentStateName);

            if (currentStateName === null) {
                itBelongs = itBelongs || false;
                iExpression = expression.length;
            } else {
                if (iExpression === expression.length - 1) {
                    if (acceptStates.indexOf(currentStateName) !== -1) {
                        itBelongs = true;
                    }
                }
            }
        }
    });

    return itBelongs;
}

const evaluateCharacter = (initialStateName: any, character: any, afd: any): any => {
    const initialState = afd[initialStateName];

    if (initialState[character] !== undefined && initialState[character] !== "") {
        return initialState[character];
    }

    return null;
}