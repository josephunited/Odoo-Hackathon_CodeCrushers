import React, { useState } from 'react';
import { authService } from '../../services/authService';

export default function Login({ onLogin, onSwitchToSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      onLogin(data);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px',
        padding: '48px', width: '100%', maxWidth: '420px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '24px', boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
          }}>📦</div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 }}>AssetFlow</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px' }}>Enterprise Asset Management</p>
        </div>

        <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 600, marginBottom: '24px', textAlign: 'center' }}>
          Welcome back
        </h2>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '10px', padding: '12px', marginBottom: '20px',
            color: '#fca5a5', fontSize: '13px', textAlign: 'center'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '6px' }}>
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: '14px', outline: 'none',
                transition: 'border 0.2s'
              }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                Password
              </label>
              <button 
                type="button"
                onClick={() => alert('Please contact your IT administrator to reset your password.')}
                style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '12px', cursor: 'pointer', padding: 0 }}
              >
                Forgot password?
              </button>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: '14px', outline: 'none'
              }}
            />
          </div>
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontSize: '15px', fontWeight: 600,
              boxShadow: '0 4px 15px rgba(99,102,241,0.35)', transition: 'all 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
          Don&apos;t have an account?{' '}
          <button onClick={onSwitchToSignup} style={{
            background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, textDecoration: 'underline'
          }}>Sign up</button>
        </p>
      </div>
    </div>
  );
}
