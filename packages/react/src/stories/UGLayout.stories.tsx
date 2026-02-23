import React, { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LayoutProvider, UGLayout } from '../index';
import { LayoutEngine } from '@ug-layout/core';

const SampleComponent = ({ node }: any) => (
  <div style={{ 
    padding: '20px', 
    background: '#333', 
    color: 'white', 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center',
    border: '1px dashed #555',
    boxSizing: 'border-box'
  }}>
    <h3 style={{ margin: '0 0 10px 0' }}>{node.contentId || 'Empty'}</h3>
    <p style={{ margin: 0, opacity: 0.5, fontSize: '12px' }}>ID: {node.id.substring(0, 8)}</p>
  </div>
);

const registry = {
  'analytics': SampleComponent,
  'chat': SampleComponent,
  'feed': SampleComponent,
};

const meta: Meta<typeof UGLayout> = {
  title: 'Components/UGLayout',
  component: UGLayout,
};

export default meta;
type Story = StoryObj<typeof UGLayout>;

export const Default: Story = {
  render: () => {
    const engine = useMemo(() => {
      const e = new LayoutEngine();
      e.split(e.getState().root.id, 'horizontal');
      const leftId = (e.getState().root as any).children[0].id;
      e.updateTile(leftId, { contentId: 'analytics' });
      return e;
    }, []);

    return (
      <LayoutProvider engine={engine} registry={registry}>
        <div style={{ width: '100%', height: '500px', border: '1px solid #444' }}>
          <UGLayout />
        </div>
      </LayoutProvider>
    );
  }
};

export const ComplexLayout: Story = {
  render: () => {
    const engine = useMemo(() => {
      const e = new LayoutEngine();
      const rootId = e.getState().root.id;
      e.split(rootId, 'horizontal');
      const leftId = (e.getState().root as any).children[0].id;
      const rightId = (e.getState().root as any).children[1].id;
      e.split(leftId, 'vertical');
      e.updateTile(rightId, { contentId: 'chat' });
      return e;
    }, []);

    return (
      <LayoutProvider engine={engine} registry={registry}>
        <div style={{ width: '100%', height: '600px', border: '1px solid #444' }}>
          <UGLayout />
        </div>
      </LayoutProvider>
    );
  }
};

export const CustomTheme: Story = {
  render: () => {
    const engine = useMemo(() => {
      const e = new LayoutEngine();
      e.split(e.getState().root.id, 'horizontal');
      return e;
    }, []);

    return (
      <div style={{ 
        width: '100%', 
        height: '500px', 
        border: '1px solid #444',
        '--ug-tile-bg': '#f9f9f9',
        --ug-header-bg: '#eee',
        --ug-header-text: '#666',
        --ug-header-title: '#007acc',
        --ug-gutter-bg: '#007acc',
        --ug-tile-border: '1px solid #ddd'
      } as React.CSSProperties}>
        <LayoutProvider engine={engine} registry={registry}>
          <UGLayout />
        </LayoutProvider>
      </div>
    );
  }
};
