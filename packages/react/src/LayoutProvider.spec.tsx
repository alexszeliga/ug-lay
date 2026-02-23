import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LayoutProvider } from './index';
import { LayoutEngine } from '../../core/src/index';

describe('LayoutProvider', () => {
  it('should render children', () => {
    const engine = new LayoutEngine();
    render(
      <LayoutProvider engine={engine}>
        <div data-testid="child">Hello World</div>
      </LayoutProvider>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Hello World');
  });
});
