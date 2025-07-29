import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // Assurez-vous d'avoir installé ce package

const AuthPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    matricule: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (formData.matricule === 'rec@' && formData.password === 'rec') {
        navigate('/formReception');
      } else if (formData.matricule === 'admin@' && formData.password === 'admin') {
        navigate('/dashboard');
      } else {
        setError('Matricule ou mot de passe incorrect');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
<div
  style={{
    minHeight: '100vh',
    background: 'linear-gradient(to top right, #bfdbfe, #ffffff, #c7d2fe)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  }}
>
  <div
    style={{
      maxWidth: '64rem',
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      animation: 'fade-in 0.5s ease-in',
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '600px',
      }}
    >
      {/* Left Section */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(to bottom right, #bfdbfe, #c7d2fe)',
          display: 'none',
        }}
        className="md:flex" // keep this if you use media queries in CSS elsewhere
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            gap: '0.5rem',
            flex: 1,
          }}
        >
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1d4ed8' }}>
            Bienvenue 👋
          </h2>
          <p style={{ color: '#1e3a8a' }}>Connectez-vous pour accéder à votre espace</p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#2563eb' }}>
              Authentification
            </h1>
            <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
              Entrez vos identifiants pour continuer
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && (
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #f87171',
                  color: '#b91c1c',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: '5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.875rem', fontWeight: 500, color: '#4b5563' }}>
                Matricule
              </label>
              <input
                type="text"
                name="matricule"
                value={formData.matricule}
                onChange={handleInputChange}
                placeholder="Ex: admin@"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  outline: 'none',
                  transition: '0.2s',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500, color: '#4b5563' }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Votre mot de passe"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    paddingRight: '3rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    transition: '0.2s',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                  }}
                  aria-label="Toggle Password"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                color: '#fff',
                backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: '0.2s',
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      height: '1.25rem',
                      width: '1.25rem',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};

export default AuthPage;
