import React from 'react';
import { LayoutNode } from '@ug-layout/core';
import { TileComponent } from './Tile';
import { SplitComponent } from './Split';

export interface LayoutNodeComponentProps {
  node: LayoutNode;
}

export const LayoutNodeComponent: React.FC<LayoutNodeComponentProps> = ({ node }) => {
  return node.type === 'tile' ? <TileComponent node={node} /> : <SplitComponent node={node} />;
};
