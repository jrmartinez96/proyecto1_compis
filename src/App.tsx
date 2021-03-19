import React from 'react';
import './App.css';
import NodeGraph from './components/NodeGraph';
import TreeGraph from './components/TreeGraph';
import { re_to_afd } from './utils/afd-direct/re_to_afd';
import { afn_to_afd, convertAFDToD3Graph } from './utils/afd/afn_to_afd';
import { evaluate_afd } from './utils/afd/evaluate_afd';
import { evaluate_afd_direct } from './utils/afd-direct/evaluate_afd_direct';
import { convert_matrix_to_d3_graph, tree_to_afn } from './utils/afn/tree_to_afn';
import { re_to_tree } from './utils/arbol_sintactico/re_to_tree';
import TreeNode from './utils/arbol_sintactico/TreeNode';

export interface AppProps {
  
}
 
export interface AppState {
  
}
 
class App extends React.Component<AppProps, AppState> {
  state = {
    regularExpression: '(a*|b*)c',
    process: 0, // 0: sin evaluar, 1: ya hay arbol sintactico, 2: ya hay afn, 3: ya hay afd, 4 ya hay afd directo
    // --------------- SYNTACTIC TREE
    treeData: {},
    treeNode: new TreeNode(0, '', null, null),
    // --------------- AFN
    afnMatrix: [[], []],
    afnD3Data: {nodes: [], links: []},
    // --------------- AFD
    afdTransitionTable: {},
    afdD3Data: {nodes: [], links: []},
    // --------------- AFD DIRECT
    afdDirectD3Data: {nodes: [], links: []},
    // --------------- Evaluate
    evaluateText: 'abbba',
    expressionBelongs: null
  }

  convertRegularExpressionToTree = () => {
    const tree = re_to_tree(this.state.regularExpression);
    this.setState({treeNode: tree, treeData: tree.getTreeNodeGraph(), process: 1, expressionBelongs: null});
  }

  convertTreeToAFN = () => {
    if (this.state.treeNode.value !== '') {
      const afn = tree_to_afn(this.state.treeNode, [[], []], 0, 1);
      const d3GraphData = convert_matrix_to_d3_graph(afn);

      this.setState({afnMatrix: afn, afnD3Data: d3GraphData, process: 2, expressionBelongs: null});
    }
  }

  convertAFNToAFD = () => {
    if (this.state.treeNode.value !== '') {
      const afd = afn_to_afd(this.state.treeNode);
      const d3GraphData = convertAFDToD3Graph(this.state.treeNode);

      this.setState({afdTransitionTable: afd, afdD3Data: d3GraphData, process: 3, expressionBelongs: null});
    }
  }

  convertRegularExpressionToAFD = () => {
    const afdDirectData = re_to_afd(this.state.regularExpression);
    this.setState({afdDirectD3Data: afdDirectData.d3GraphData, process: 4, expressionBelongs: null});
  }

  evaluateExpressionAFD = () => {
    const itBelongs = evaluate_afd(this.state.evaluateText, this.state.treeNode);

    this.setState({expressionBelongs: itBelongs});
  }

  evaluateExpressionAFDDirect = () => {
    const itBelongs = evaluate_afd_direct(this.state.evaluateText, this.state.regularExpression);

    this.setState({expressionBelongs: itBelongs});
  }

  render() { 
    return (
      <div className="App">
        <label>Expresion regular</label>
        <input
          value={this.state.regularExpression}
          onChange={(e)=>this.setState({regularExpression: e.target.value})}
        ></input>
        <br/>
        {this.buildEvaluateInput()}
        <br/>
        <button
          onClick={this.convertRegularExpressionToTree}
        >Arbol sintactico</button>
        <button
          onClick={this.convertRegularExpressionToAFD}
        >AFD Directo</button>
        <br/>
        {this.buildShowGraph()}
        <br/>
        {this.buildBottomButtons()}
      </div>
    );
  }

  buildShowGraph = () => {
    if (this.state.process === 1) { // Hay arbol sintactico
      return (
        <div>
          <TreeGraph data={this.state.treeData}/>
        </div>
      );
    } else if (this.state.process === 2) { // Hay AFN
      return (
        <div>
          <NodeGraph data={this.state.afnD3Data}/>
        </div>
      );
    } else if (this.state.process === 3) { // Hay AFD
      return (
        <div>
          <NodeGraph data={this.state.afdD3Data}/>
        </div>
      );
    } else if (this.state.process === 4) { // Hay AFD Directo
      return (
        <div>
          <NodeGraph data={this.state.afdDirectD3Data}/>
        </div>
      );
    }

    return (<div></div>);
  }

  buildEvaluateInput = () => {
    if (this.state.process === 3 || this.state.process === 4) {
      let itBelongsText = <div></div>;

      if (this.state.expressionBelongs !== null) {
        if (this.state.expressionBelongs) {
          itBelongsText = (
            <div className="belongs ok">
              Pertenece.
            </div>
          );
        } else {
          itBelongsText = (
            <div className="belongs danger">
              No Pertenece.
            </div>
          );
        }
      }


      let buttonFunction = undefined;
      if (this.state.process === 3) {
        buttonFunction = this.evaluateExpressionAFD;
      } else if (this.state.process === 4) {
        buttonFunction = this.evaluateExpressionAFDDirect;
      }

      return (
        <div>
          <input
            value={this.state.evaluateText}
            onChange={(e)=>this.setState({evaluateText: e.target.value})}
          ></input>
          <button
            onClick={buttonFunction}
          >
            Evaluar
          </button>
          {itBelongsText}
        </div>
      );
    }
  }

  buildBottomButtons = () => {
    if (this.state.process === 1) {
      return (
        <div>
          <button
            onClick={this.convertTreeToAFN}
          >Convertir a AFN</button>
        </div>
      );
    } else if (this.state.process === 2) {
      return (
        <div>
          <button
            onClick={this.convertAFNToAFD}
          >Convertir a AFD</button>
        </div>
      );
    }

    return (<div></div>);
  }
}
 
export default App;
