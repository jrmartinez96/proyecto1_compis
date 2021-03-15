import { v4 as uuidv4 } from 'uuid';
import { deleteArrayDuplicates } from '../afd/array_functions';
/**
 * type: 
 *      0: id
 *      1: or (|)
 *      2: and (.)
 *      3: Kleene (*)
 *      4: Kleene+ (+)
 *      5: Zero or instance (?)
 */
class TreeNode {
    type: number;
    value: string;
    leftChild: TreeNode | null;
    rightChild: TreeNode | null;
    id: string;
    // AFD DIRECTO
    leafId: number | null;
    nullable: boolean | null;
    primerapos: Array<number> | null;
    ultimapos: Array<number> | null;

    constructor(type: number, value: string, leftChild: TreeNode | null, rightChild: TreeNode | null) {
        this.type = type;
        this.leftChild = leftChild;
        this.rightChild = rightChild;
        this.id = uuidv4();

        switch (type) {
            case 0:
                this.value = value;
                break;
            case 1:
                this.value = '|';
                break;
            case 2:
                this.value = '●';
                break;
            case 3:
                this.value = '*';
                break;
            case 4:
                this.value = '+';
                break;
            case 5:
                this.value = '?';
                break;
        
            default:
                this.value = value;
                break;
        }

        // AFD
        this.leafId = null;
        this.nullable = null;
        this.primerapos = null;
        this.ultimapos = null;
    }

    isLeaf = (): boolean => {
        return this.leftChild === null && this.rightChild === null;
    }

    printTree = () => {
        console.log(this.toString());

        if (this.leftChild !== null) {
            this.leftChild.printTree();
        }

        if (this.rightChild !== null) {
            this.rightChild.printTree();
        }
    }

    getTreeNodeGraph = ():any => {
        let children = [];

        if (this.rightChild !== null) {
            children.push(this.rightChild.getTreeNodeGraph());
        }

        if (this.leftChild !== null) {
            children.push(this.leftChild.getTreeNodeGraph());
        } 

        return {name: this.value, id:this.id, children: children}
    }

    toString = () : string => {
        return `Value: ${this.value}, leftChild: ${this.leftChild !== null ? this.leftChild.value : 'null'}, rightChild: ${this.rightChild !== null ? this.rightChild.value : 'null'}`;
    }

    // -----------------------AFD DIRECT
    setNullable = ():boolean => {
        let nullable = false;

        if (this.isLeaf()) { // type id
            if (this.value === '&') {
                nullable = true;
            }
            nullable = false;
        } else if (this.type === 1) { // type |
            if (this.leftChild !== null && this.rightChild !== null) {
                nullable = this.leftChild.setNullable() || this.rightChild.setNullable();
            }
        } else if (this.type === 2) { // type .
            if (this.leftChild !== null && this.rightChild !== null) {
                nullable = this.leftChild.setNullable() && this.rightChild.setNullable();
            }
        } else if (this.type === 3) { // type *
            nullable = true;
        } else if (this.type === 4) { // type +
            if (this.rightChild !== null) {
                nullable = this.rightChild.setNullable();
            }
        } else if (this.type === 5) { // type ?
            nullable = true;
        }

        this.nullable = nullable;

        return nullable;
    }

    setLeafId = (leafIds: any):any => {
        let currentLeafIds = {...leafIds};

        if (this.isLeaf()) {
            const keys = Object.keys(currentLeafIds);
            let leafId = keys.length + 1;
            this.leafId = leafId;

            currentLeafIds = {...currentLeafIds, [leafId]: this.value};
        } else {
            if (this.leftChild !== null) {
                currentLeafIds = {...this.leftChild.setLeafId(currentLeafIds)};
            }

            if (this.rightChild !== null) {
                currentLeafIds = {...this.rightChild.setLeafId(currentLeafIds)};
            }
        }

        return currentLeafIds;
    }

    setPrimerapos = (): Array<number> => {
        let primerapos: Array<number> = [];

        if (this.isLeaf()) {
            if (this.leafId !== null && this.value !== "&") {
                primerapos = [this.leafId];
            }
        } else if (this.type === 1) { // type |
            if (this.leftChild !== null && this.rightChild !== null) {
                primerapos = [...this.leftChild.setPrimerapos(), ...this.rightChild.setPrimerapos()];
            }
        } else if (this.type === 2) { // type .
            if (this.leftChild !== null && this.rightChild !== null) {
                if (this.leftChild.nullable) {
                    primerapos = [...this.leftChild.setPrimerapos(), ...this.rightChild.setPrimerapos()];
                } else {
                    this.rightChild.setPrimerapos();
                    primerapos = [...this.leftChild.setPrimerapos()];
                }
            }
        } else if (this.type === 3) { // type *
            if (this.rightChild !== null) {
                primerapos = [...this.rightChild.setPrimerapos()];
            }
        } else if (this.type === 4) { // type +
            if (this.rightChild !== null) {
                primerapos = [...this.rightChild.setPrimerapos()];
            }
        } else if (this.type === 5) { // type ?
            if (this.rightChild !== null) {
                primerapos = [...this.rightChild.setPrimerapos()];
            }
        }

        this.primerapos = primerapos;

        return primerapos;
    }

    setUltimapos = (): Array<number> => {
        let ultimapos: Array<number> = [];

        if (this.isLeaf()) {
            if (this.leafId !== null && this.value !== "&") {
                ultimapos = [this.leafId];
            }
        } else if (this.type === 1) { // type |
            if (this.leftChild !== null && this.rightChild !== null) {
                ultimapos = [...this.leftChild.setUltimapos(), ...this.rightChild.setUltimapos()];
            }
        } else if (this.type === 2) { // type .
            if (this.leftChild !== null && this.rightChild !== null) {
                if (this.rightChild.nullable) {
                    ultimapos = [...this.leftChild.setUltimapos(), ...this.rightChild.setUltimapos()];
                } else {
                    this.leftChild.setUltimapos();
                    ultimapos = [...this.rightChild.setUltimapos()];
                }
            }
        } else if (this.type === 3) { // type *
            if (this.rightChild !== null) {
                ultimapos = [...this.rightChild.setUltimapos()];
            }
        } else if (this.type === 4) { // type +
            if (this.rightChild !== null) {
                ultimapos = [...this.rightChild.setUltimapos()];
            }
        } else if (this.type === 5) { // type ?
            if (this.rightChild !== null) {
                ultimapos = [...this.rightChild.setUltimapos()];
            }
        }

        this.ultimapos = ultimapos;

        return ultimapos;
    }

    setSiguientepos = (siguientepos: any):any => {
        let siguienteposCopy = {...siguientepos};

        if (this.type === 2) {
            if (this.leftChild !== null && this.leftChild.ultimapos !== null) {
                this.leftChild.ultimapos.forEach(id => {
                    if (this.rightChild !== null && this.rightChild.primerapos !== null) {
                        siguienteposCopy[id] = [...siguienteposCopy[id], ...this.rightChild?.primerapos];
                    }
                });
            }
        } else if (this.type === 3) {
            if (this.ultimapos !== null) {
                this.ultimapos.forEach(id => {
                    if (this.primerapos !== null) {
                        siguienteposCopy[id] = [...siguienteposCopy[id], ...this.primerapos];
                    }
                });
            }
        }

        const siguienteposKeys = Object.keys(siguienteposCopy);
        siguienteposKeys.forEach(key => {
            const spos = [...siguienteposCopy[key]];
            siguienteposCopy[key] = deleteArrayDuplicates(spos).sort((a, b) => a-b);
        });

        if (this.leftChild !== null) {
            siguienteposCopy = this.leftChild.setSiguientepos(siguienteposCopy);
        }

        if (this.rightChild !== null) {
            siguienteposCopy = this.rightChild.setSiguientepos(siguienteposCopy);
        }

        return siguienteposCopy;
    }

}

export default TreeNode;