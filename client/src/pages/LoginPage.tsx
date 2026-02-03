import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Lock, User, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Дополнительная защита от всплытия события
    
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { username, password });
      setAuth(data.user, data.token);
      
      // Определяем куда направить пользователя на основе роли и прав
      const role = data.user.role;
      const permissions = data.user.permissions || [];
      
      if (role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'FIL_ADMIN') {
        navigate('/custom/dashboard');
      } else if (role === 'TEACHER') {
        navigate('/teacher/groups');
      } else {
        // Для кастомных ролей всегда используем custom layout
        navigate('/custom/dashboard');
      }
    } catch (err: any) {
      // Предотвращаем любую навигацию при ошибке
      const errorMessage = err.response?.data?.message || 'Login yoki parol noto\'g\'ri';
      setError(errorMessage);
      console.error('Login error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Login Card - Modern Glass Effect */}
        <div className="glass rounded-2xl p-8 animate-fade-in">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-32 h-32 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Xush kelibsiz</h1>
            <p className="text-muted-foreground text-sm">Tizimga kirish uchun ma'lumotlaringizni kiriting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Login
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Loginni kiriting"
                  className="w-full pl-12 pr-4 py-3.5 bg-background/50 border-2 border-border rounded-xl 
                    focus:ring-2 focus:ring-primary/20 focus:border-primary 
                    outline-none transition-all text-foreground placeholder:text-muted-foreground/60
                    hover:border-primary/50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Parol
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Parolni kiriting"
                  className="w-full pl-12 pr-4 py-3.5 bg-background/50 border-2 border-border rounded-xl 
                    focus:ring-2 focus:ring-primary/20 focus:border-primary 
                    outline-none transition-all text-foreground placeholder:text-muted-foreground/60
                    hover:border-primary/50"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-destructive-light border border-destructive/20 rounded-xl animate-slide-down">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white font-semibold py-3.5 rounded-xl 
                transition-all duration-300 shadow-md hover:shadow-xl 
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:-translate-y-0.5 active:translate-y-0
                relative overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Yuklanmoqda...
                  </span>
                ) : 'Kirish'}
              </span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              © 2025 Test Platform. Barcha huquqlar himoyalangan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
