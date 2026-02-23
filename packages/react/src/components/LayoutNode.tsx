import React from 'react';
import { LayoutNode } from '@ug-layout/core';
import { TileComponent } from './Tile';
import { SplitComponent } from './Split';

export interface LayoutNodeComponentProps<TMetadata = any> {
  node: LayoutNode<TMetadata>;
}

export function LayoutNodeComponent<TMetadata = any>({ node }: LayoutNodeComponentProps<TMetadata>) {
  return node.type === 'tile' ? <TileComponent node={node} /> : <SplitComponent node={node} />;
}
