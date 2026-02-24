import React from 'react';
import { useLayout } from '../context';

export interface DefaultPickerProps {
  tileId: string;
  onSelect?: () => void;
  asTab?: boolean;
}

export const DefaultPicker: React.FC<DefaultPickerProps> = ({ tileId, onSelect, asTab }) => {
  const { engine, registry } = useLayout();
  
  if (!registry) return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Select a Component (No Registry)</div>;

  const handleClick = (id: string) => {
    if (asTab) {
      engine.addTab(tileId, id);
    } else {
      engine.updateTile(tileId, { contentId: id });
    }
    onSelect?.();
  };

  return (
    <div className="ug-picker" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px' }}>
      <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '4px', fontSize: '12px' }}>Select a Component</div>
      {Object.keys(registry).map((id) => (
        <button 
          key={id} 
          onClick={() => handleClick(id)}
          style={{ 
// ... rest of the button styles
            padding: '8px', 
            cursor: 'pointer', 
            background: '#444', 
            color: 'white', 
            border: '1px solid #555', 
            borderRadius: '4px' 
          }}
        >
          {id}
        </button>
      ))}
    </div>
  );
};
