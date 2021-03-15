import * as React from 'react';
// @ts-ignore
import Tree from 'react-tree-graph';
import 'react-tree-graph/dist/style.css'

export interface TreeGraphProps {
    data: any;
}
 
export interface TreeGraphState {
    
}
 
class TreeGraph extends React.Component<TreeGraphProps, TreeGraphState> {
    render() { 
        return (<Tree
            key="1"
            data={this.props.data}
            keyProp="id"
            height={200}
            width={400}/>);
    }
}
 
export default TreeGraph;