import { re_to_tree } from "../arbol_sintactico/re_to_tree";

export const re_to_afd = (regularExpression: string) => {
    regularExpression = regularExpression + "#";
    const treeNode = re_to_tree(regularExpression);
    treeNode.setNullable();
    const afdDNodes = treeNode.setLeafId({});
    console.log(afdDNodes);

}