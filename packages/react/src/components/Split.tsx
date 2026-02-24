import React from 'react';
import { SplitNode } from '@ug-layout/core';
import { LayoutNodeComponent } from './LayoutNode';
import { Gutter } from './Gutter';
import { useLayout } from '../context';

export interface SplitComponentProps<TMetadata = any> {
  node: SplitNode<TMetadata>;
}

export function SplitComponent<TMetadata = any>({ node }: SplitComponentProps<TMetadata>) {
  const { engine } = useLayout();
  const r = node.ratio;
  const gutterSize = engine.gutterSize;
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
}
