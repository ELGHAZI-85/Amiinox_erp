import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        console.log('Connexion réussie!');
        navigate('/formReception');
      } else if (formData.matricule === 'admin@' && formData.password === 'admin') {
        console.log('Connexion admin réussie!');
        navigate('/dashboard');
      } else {
        setError('Matricule ou mot de passe incorrect');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-4 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex min-h-[600px]">
          {/* Section gauche - Illustration */}
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-64 h-64 mx-auto">
                  <div className="relative">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-orange-200 rounded-full border-2 border-gray-800">
                      <div className="absolute -top-2 left-2 w-12 h-8 bg-gray-800 rounded-full"></div>
                      <div className="absolute top-4 left-4 w-2 h-2 bg-gray-800 rounded-full"></div>
                      <div className="absolute top-4 right-4 w-2 h-2 bg-gray-800 rounded-full"></div>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-3 border-b-2 border-gray-800 rounded-full"></div>
                    </div>
                    <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-24 h-32 bg-blue-600 rounded-t-full">
                      <div className="absolute -left-6 top-4 w-6 h-16 bg-blue-600 rounded-full transform rotate-12"></div>
                      <div className="absolute -right-6 top-4 w-6 h-16 bg-blue-600 rounded-full transform -rotate-12"></div>
                    </div>
                    <div className="absolute top-44 left-1/2 transform -translate-x-1/2">
                      <div className="w-8 h-16 bg-blue-800 rounded-full absolute -left-4"></div>
                      <div className="w-8 h-16 bg-blue-800 rounded-full absolute right-4"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-8">
                    <div className="w-24 h-18 bg-gray-800 rounded-t-lg border-2 border-gray-900">
                      <div className="w-20 h-14 bg-blue-100 m-1 rounded"></div>
                    </div>
                    <div className="w-28 h-4 bg-gray-600 rounded-b-lg -mt-1"></div>
                    <div className="w-20 h-3 bg-gray-700 rounded mt-1 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section droite - Formulaire */}
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="w-full max-w-sm">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-2">
                  Authentification
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="matricule"
                      value={formData.matricule}
                      onChange={handleInputChange}
                      placeholder="Matricule"
                      className="w-full px-4 py-3  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Connexion...
                    </div>
                  ) : (
                    'Connect'
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
