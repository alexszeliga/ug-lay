import React from 'react';
import { SplitNode } from '@ug-layout/core';
import { LayoutNodeComponent } from './LayoutNode';
import { Gutter } from './Gutter';

export interface SplitComponentProps {
  node: SplitNode;
}

export const SplitComponent: React.FC<SplitComponentProps> = ({ node }) => {
  const r = node.ratio;
  const gutterSize = 4;
  const style: React.CSSProperties = {
    display: 'grid',
    width: '100%',
    height: '100%',
    gridTemplateColumns: node.direction === 'horizontal' ? `calc(${r * 100}% - ${gutterSize / 2}px) ${gutterSize}px 1fr` : '100%',
    gridTemplateRows: node.direction === 'vertical' ? `calc(${r * 100}% - ${gutterSize / 2}px) ${gutterSize}px 1fr` : '100%',
  };

  return (
    <div className="ug-split" style={style}>
      <LayoutNodeComponent node={node.children[0]} />
      <Gutter splitId={node.id} direction={node.direction} />
      <LayoutNodeComponent node={node.children[1]} />
    </div>
  );
};
