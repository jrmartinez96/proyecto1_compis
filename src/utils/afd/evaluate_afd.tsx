import TreeNode from "../arbol_sintactico/TreeNode";
import { afn_to_afd } from "./afn_to_afd";

export const evaluate_afd = (expression: String, treeNode: TreeNode): boolean => {
    const afd = afn_to_afd(treeNode);
    let initialStates: Array<String> = [];
    let acceptStates: Array<String> = [];

    const statesNames = Object.keys(afd);
    statesNames.forEach(stateName => {
        const stateSet = afd[stateName]["set"];

        if (stateSet.indexOf(0) !== -1) {
            initialStates.push(stateName);
        }

        if (stateSet.indexOf(1) !== -1) {
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