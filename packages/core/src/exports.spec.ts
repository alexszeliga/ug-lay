import { describe, it, expect } from 'vitest';
// @ts-ignore - testing actual resolution
import { LayoutEngine } from '../dist/index.mjs';

describe('Package Resolution', () => {
  it('should have a built entry point', () => {
    expect(LayoutEngine).toBeDefined();
  });
});
