import React, { useEffect, useState } from 'react';
import { categoryService } from '../../services/categoryService';

export default function CategoryList({ onEdit, onNew }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getAll().then(setCategories).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryService.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 }}>Asset Categories</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px' }}>Manage asset classification categories</p>
        </div>
        <button id="new-category-btn" onClick={onNew} style={{
          padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: '14px'
        }}>+ New Category</button>
      </div>
      {loading ? <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p> : (
        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {categories.map(cat => (
            <div key={cat.id} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px', padding: '20px 24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: '#fff', fontWeight: 600, margin: 0 }}>{cat.name}</p>
                  {cat.description && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '4px 0 0' }}>{cat.description}</p>}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => onEdit(cat)} style={{
                    padding: '5px 12px', borderRadius: '7px', border: '1px solid rgba(99,102,241,0.4)',
                    background: 'rgba(99,102,241,0.12)', color: '#818cf8', cursor: 'pointer', fontSize: '12px'
                  }}>Edit</button>
                  <button onClick={() => handleDelete(cat.id)} style={{
                    padding: '5px 12px', borderRadius: '7px', border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', fontSize: '12px'
                  }}>Del</button>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div style={{
              gridColumn: '1/-1', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px', padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.4)'
            }}>No categories yet. Create your first category.</div>
          )}
        </div>
      )}
    </div>
  );
}
