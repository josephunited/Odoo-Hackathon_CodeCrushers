import React, { useState } from 'react';
import { authService } from '../../services/authService';

export default function Signup({ onLogin, onSwitchToLogin }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.register(form.username, form.email, form.password, ['EMPLOYEE']);
      onLogin(data);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '10px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff', fontSize: '14px', outline: 'none'
  };
  const labelStyle = { display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '6px' };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px',
        padding: '48px', width: '100%', maxWidth: '440px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '24px', boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
          }}>📦</div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 }}>Create Account</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px' }}>Join AssetFlow Enterprise</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '10px', padding: '12px', marginBottom: '20px',
            color: '#fca5a5', fontSize: '13px', textAlign: 'center'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Username', name: 'username', type: 'text', placeholder: 'Choose a username', id: 'signup-username' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'Enter your email', id: 'signup-email' },
            { label: 'Password', name: 'password', type: 'password', placeholder: 'Create a password', id: 'signup-password' },
            { label: 'Confirm Password', name: 'confirmPassword', type: 'password', placeholder: 'Confirm your password', id: 'signup-confirm' },
          ].map(field => (
            <div key={field.name} style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>{field.label}</label>
              <input
                id={field.id}
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                required
                placeholder={field.placeholder}
                style={inputStyle}
              />
            </div>
          ))}
          <button
            id="signup-submit"
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontSize: '15px', fontWeight: 600, marginTop: '8px',
              boxShadow: '0 4px 15px rgba(99,102,241,0.35)', transition: 'all 0.2s'
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} style={{
            background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, textDecoration: 'underline'
          }}>Sign in</button>
        </p>
      </div>
    </div>
  );
}
