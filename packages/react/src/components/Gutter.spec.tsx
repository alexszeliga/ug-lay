import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Gutter } from './Gutter';
import { LayoutProvider } from '../context';
import { LayoutEngine } from '@ug-lay/core';

describe('Gutter cleanup', () => {
  let engine: LayoutEngine;

  beforeEach(() => {
    engine = new LayoutEngine();
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
  });

  it('should remove window listeners when unmounted while resizing', () => {
    const { unmount, container } = render(
      <LayoutProvider engine={engine}>
        <div style={{ width: '100px', height: '100px' }}>
          <Gutter splitId="1" direction="horizontal" />
        </div>
      </LayoutProvider>
    );

    const gutter = container.querySelector('.ug-gutter') as HTMLElement;
    
    // Start resizing
    fireEvent.mouseDown(gutter, { button: 0 });
    
    expect(window.addEventListener).toHaveBeenCalledWith('pointermove', expect.any(Function));

    // Unmount while resizing
    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('pointerup', expect.any(Function));
  });

  it('should remove window listeners after resizing finishes', () => {
    const { container } = render(
      <LayoutProvider engine={engine}>
        <div style={{ width: '100px', height: '100px' }}>
          <Gutter splitId="1" direction="horizontal" />
        </div>
      </LayoutProvider>
    );

    const gutter = container.querySelector('.ug-gutter') as HTMLElement;
    
    fireEvent.mouseDown(gutter, { button: 0 });
    
    // Finish resizing
    act(() => {
      window.dispatchEvent(new CustomEvent('pointerup'));
    });

    expect(window.removeEventListener).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('pointerup', expect.any(Function));
  });
});
