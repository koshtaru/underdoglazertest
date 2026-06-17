import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

// Validation schema
const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      await login(data.email, data.password);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    } catch (error) {
      setAuthError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--clr-bg)' }}>
      <div className="w-full max-w-md space-y-8 p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--clr-accent)' }}>
            <span className="text-2xl font-bold" style={{ color: 'var(--clr-bg)' }}>⚡</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold" style={{ color: 'var(--clr-white)', fontFamily: 'var(--font-family)' }}>
            Underdog Lazer
          </h2>
          <p className="mt-2 text-lg font-medium" style={{ color: 'var(--clr-accent)' }}>
            Admin Portal
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--clr-text-muted)' }}>
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Error Message */}
          {authError && (
            <div className="p-4 rounded-md border" style={{ 
              backgroundColor: 'rgba(220, 53, 69, 0.1)', 
              borderColor: 'rgba(220, 53, 69, 0.3)' 
            }}>
              <div className="flex">
                <AlertCircle className="h-5 w-5" style={{ color: '#dc3545' }} />
                <div className="ml-3">
                  <p className="text-sm" style={{ color: '#dc3545' }}>{authError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--clr-white)' }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5" style={{ color: 'var(--clr-text-muted)' }} />
                </div>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full pl-10 pr-3 py-3 rounded-md border transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--clr-bg-light)',
                    borderColor: errors.email ? '#dc3545' : 'var(--clr-border)',
                    color: 'var(--clr-text)',
                    focusRingColor: 'var(--clr-accent)'
                  }}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm" style={{ color: '#dc3545' }}>{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--clr-white)' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5" style={{ color: 'var(--clr-text-muted)' }} />
                </div>
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 rounded-md border transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--clr-bg-light)',
                    borderColor: errors.password ? '#dc3545' : 'var(--clr-border)',
                    color: 'var(--clr-text)',
                    focusRingColor: 'var(--clr-accent)'
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors hover:opacity-80"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" style={{ color: 'var(--clr-text-muted)' }} />
                  ) : (
                    <Eye className="h-5 w-5" style={{ color: 'var(--clr-text-muted)' }} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm" style={{ color: '#dc3545' }}>{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              style={{
                backgroundColor: 'var(--clr-accent)',
                color: 'var(--clr-bg)',
                borderColor: 'var(--clr-accent)',
                focusRingColor: 'var(--clr-accent)',
                boxShadow: 'var(--shadow-md)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--clr-accent-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--clr-accent)'}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </div>

          {/* Back to Main Site */}
          <div className="text-center">
            <a 
              href="/"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--clr-text-muted)' }}
            >
              ← Back to main site
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;