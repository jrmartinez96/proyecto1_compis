import TreeNode from "./TreeNode";

// Lee la expresion de fin a principio
export const re_to_tree = (regularExpression: string): TreeNode => {

    const lastCharacter = regularExpression[regularExpression.length - 1];

    if (lastCharacter === '*') {
        let childKleene: TreeNode;
        const secondLastCharacter = regularExpression[regularExpression.length - 2];
        let nextExpression = regularExpression.substring(0, regularExpression.length - 1);

        if (secondLastCharacter !== ')') {
            nextExpression = regularExpression.substring(0, regularExpression.length - 2);
            childKleene = re_to_tree(secondLastCharacter);
        } else {
            const parethesesExpression = get_expr_from_parentheses(nextExpression);
            childKleene = re_to_tree(parethesesExpression);
            nextExpression = regularExpression.substring(0, regularExpression.length - (parethesesExpression.length + 3));
        }

        const kleeneNode = new TreeNode(3, '', null, childKleene);

        if (nextExpression === '') {
            return kleeneNode;
        }

        let unionNodeType = 0;
        if (nextExpression[nextExpression.length - 1] === '|') {
            unionNodeType = 1; // OR
            nextExpression = nextExpression.substring(0, nextExpression.length - 1);
        } else {
            unionNodeType = 2; // CONCAT
        }
        const unionNode = new TreeNode(unionNodeType, '', re_to_tree(nextExpression), kleeneNode);

        return unionNode;
    } else if (lastCharacter === '+') {
        let childKleenePos: TreeNode;
        const secondLastCharacter = regularExpression[regularExpression.length - 2];
        let nextExpression = regularExpression.substring(0, regularExpression.length - 1);

        if (secondLastCharacter !== ')') {
            nextExpression = regularExpression.substring(0, regularExpression.length - 2);
            childKleenePos = re_to_tree(secondLastCharacter);
        } else {
            const parethesesExpression = get_expr_from_parentheses(nextExpression);
            childKleenePos = re_to_tree(parethesesExpression);
            nextExpression = regularExpression.substring(0, regularExpression.length - (parethesesExpression.length + 3));
        }

        const kleenePosNode = new TreeNode(4, '', null, childKleenePos);

        if (nextExpression === '') {
            return kleenePosNode;
        }

        let unionNodeType = 0;
        if (nextExpression[nextExpression.length - 1] === '|') {
            unionNodeType = 1; // OR
            nextExpression = nextExpression.substring(0, nextExpression.length - 1);
        } else {
            unionNodeType = 2; // CONCAT
        }
        const unionNode = new TreeNode(unionNodeType, '', re_to_tree(nextExpression), kleenePosNode);

        return unionNode;
    } else if (lastCharacter === '?') {
        let childZeroOrInstance: TreeNode;
        const secondLastCharacter = regularExpression[regularExpression.length - 2];
        let nextExpression = regularExpression.substring(0, regularExpression.length - 1);

        if (secondLastCharacter !== ')') {
            nextExpression = regularExpression.substring(0, regularExpression.length - 2);
            childZeroOrInstance = re_to_tree(secondLastCharacter);
        } else {
            const parethesesExpression = get_expr_from_parentheses(nextExpression);
            childZeroOrInstance = re_to_tree(parethesesExpression);
            nextExpression = regularExpression.substring(0, regularExpression.length - (parethesesExpression.length + 3));
        }

        const zeroOrInstanceNode = new TreeNode(5, '', null, childZeroOrInstance);

        if (nextExpression === '') {
            return zeroOrInstanceNode;
        }

        let unionNodeType = 0;
        if (nextExpression[nextExpression.length - 1] === '|') {
            unionNodeType = 1; // OR
            nextExpression = nextExpression.substring(0, nextExpression.length - 1);
        } else {
            unionNodeType = 2; // CONCAT
        }
        const unionNode = new TreeNode(unionNodeType, '', re_to_tree(nextExpression), zeroOrInstanceNode);

        return unionNode;
    } else if (lastCharacter === ")") {
        const parethesesExpression = get_expr_from_parentheses(regularExpression);
        const parenthesisNode = re_to_tree(parethesesExpression);
        const nextExpression = regularExpression.substring(0, regularExpression.length - (parethesesExpression.length + 2));

        if (nextExpression === '') {
            return parenthesisNode;
        } else {
            const concatNode = new TreeNode(2, '', re_to_tree(nextExpression), parenthesisNode);
            return concatNode;
        }
    } else { // Si es un caracter del lenguaje que no sean operaciones
        const secondLastCharacter = regularExpression[regularExpression.length - 2];
        const characterNode = new TreeNode(0, lastCharacter, null, null);

        if (secondLastCharacter === undefined) { // Si es el ultimo caracter
            return characterNode;
        } else {
            if (secondLastCharacter === '|') { // Le sigue un OR
                const nextExpression = regularExpression.substring(0, regularExpression.length - 2);
                const orNode = new TreeNode(1, '', re_to_tree(nextExpression), characterNode);
                return orNode;
            } else { // Le sigue un CONCAT
                const nextExpression = regularExpression.substring(0, regularExpression.length - 1);
                const concatNode = new TreeNode(2, '', re_to_tree(nextExpression), characterNode);
                return concatNode;
            }
        }
    }

}

// Lee la expresion de fin a principio para encontrar la expresion dentro del parentesis
const get_expr_from_parentheses = (expression: string):string => {
    let closeParenCount = 0;
    let openParenCount = 0;
    let returnExpression = '';

    for (let i = expression.length - 1; i >= 0; i--) {
        const character = expression[i];
        
        if (character === ')') {
            closeParenCount++;
        } else if (character === '(') {
            openParenCount++;
        }

        // Si ya se cerraron todos los parenetsis dentro de la expresion
        if (closeParenCount === openParenCount) {
            returnExpression = expression.substring(i + 1, expression.length - 1)
            i = -1;
        }
    }

    return returnExpression;
}