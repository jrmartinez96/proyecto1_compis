import { re_to_tree } from "../arbol_sintactico/re_to_tree";

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

    console.log(siguientepos);

}