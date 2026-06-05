import { useState } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Hexagon, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10"
      style={{ backgroundImage: 'url(/pictures/pexels-tkirkgoz-11765538.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="w-full max-w-md animate-scale-in relative">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-2xl shadow-brand-500/30 animate-float">
            <Hexagon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-main tracking-tight">MaintainX Pro</h1>
          <p className="text-muted mt-2">Connectez-vous à votre espace</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 text-sm font-medium animate-slide-up">
                {error}
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input text-lg py-4"
                placeholder="vous@entreprise.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input text-lg py-4 pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-4 shadow-xl shadow-brand-500/20">
              {loading ? (
                <span className="flex items-center gap-3"><span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Connexion...</span>
              ) : (
                <span className="flex items-center gap-3"><LogIn className="w-5 h-5" /> Se connecter</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-card text-center">
            <Link to="/register" className="text-muted hover:text-brand-400 font-medium transition-colors text-sm">
              Pas encore de compte ? <span className="text-brand-400 font-semibold">Créer un compte</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
