import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebaseClient';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Obtener parámetro de redirección
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('redirect') || '/mis-reservas';
    }
    return '/mis-reservas';
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      let idToken = '';

      if (!auth) {
        // Fallback para desarrollo sin Firebase Client
        console.warn('⚠️ Firebase no inicializado. Usando flujo local simulado.');
        if (email === 'admin@viajaayacucho.com' && password === 'admin123') {
          idToken = 'admin_token';
        } else if (email === 'cliente@viajaayacucho.com' && password === 'cliente123') {
          idToken = 'client_token';
        } else {
          throw new Error('Credenciales incorrectas (Usa admin@viajaayacucho.com / admin123 para pruebas)');
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        idToken = await userCredential.user.getIdToken();
      }

      // Enviar token al servidor para crear cookie de sesión
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!res.ok) {
        throw new Error('Error al establecer sesión en el servidor');
      }

      window.location.href = getRedirectUrl();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error de autenticación. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      let idToken = '';

      if (!auth) {
        // Fallback local
        console.warn('⚠️ Firebase no inicializado. Usando flujo Google simulado.');
        idToken = 'client_token';
      } else {
        const userCredential = await signInWithPopup(auth, googleProvider);
        idToken = await userCredential.user.getIdToken();
      }

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!res.ok) {
        throw new Error('Error al establecer sesión en el servidor con Google');
      }

      window.location.href = getRedirectUrl();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-pampa-50/90 dark:bg-pampa-100/90 border border-pampa-200/60 dark:border-pampa-200/30 shadow-card backdrop-blur-md rounded-2xl p-6 sm:p-8">
        <h2 className="font-headline text-2xl text-center text-pampa-900 mb-2">
          Ingresar a tu Cuenta
        </h2>
        <p className="text-sm text-center text-pampa-600 dark:text-pampa-400 mb-6">
          Gestiona tus reservas y accede al panel privado de ViajaAyacucho.
        </p>

        {errorMessage && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-logo-500/10 border border-logo-500/20 p-3 text-xs text-logo-600">
            <span className="material-symbols-outlined shrink-0 text-sm mt-0.5">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pampa-700 mb-1.5" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full rounded-lg border border-pampa-200 dark:border-pampa-200/30 bg-white dark:bg-pampa-950/40 px-3.5 py-2.5 text-sm text-pampa-900 placeholder-pampa-400 dark:placeholder-pampa-500 outline-none transition-all focus:border-pampa-400 dark:focus:border-pampa-300 focus:ring-2 focus:ring-pampa-300/30"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pampa-700 mb-1.5" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full rounded-lg border border-pampa-200 dark:border-pampa-200/30 bg-white dark:bg-pampa-950/40 px-3.5 py-2.5 text-sm text-pampa-900 placeholder-pampa-400 dark:placeholder-pampa-500 outline-none transition-all focus:border-pampa-400 dark:focus:border-pampa-300 focus:ring-2 focus:ring-pampa-300/30"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-pampa-500 py-3 text-sm font-bold text-white dark:text-pampa-50 transition-all hover:bg-pampa-600 focus:ring-2 focus:ring-pampa-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-pampa-200/80 dark:border-pampa-200/30"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#FAF6ED] dark:bg-[#0d1e30] px-3 text-pampa-600 dark:text-pampa-400 font-semibold transition-colors">
              o continuar con
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full rounded-lg border border-pampa-200 dark:border-pampa-200/30 bg-white dark:bg-pampa-950/40 py-3 text-sm font-bold text-pampa-800 dark:text-pampa-900 transition-all hover:bg-pampa-100 dark:hover:bg-pampa-200/30 flex items-center justify-center gap-2.5 shadow-sm"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.42-4.51 6.76-4.51z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.73-4.94 3.73-8.55z"
            />
            <path
              fill="#FBBC05"
              d="M5.24 14.55c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.39 7.16C.5 8.93 0 10.91 0 13s.5 4.07 1.39 5.84l3.85-3.29z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.34 1.1-4.26 1.1-3.34 0-5.86-1.81-6.76-4.51l-3.85 2.99C3.37 20.33 7.35 23 12 23z"
            />
          </svg>
          Iniciar Sesión con Google
        </button>

        <div className="mt-6 text-center text-xs text-pampa-600 dark:text-pampa-400">
          ¿No tienes una cuenta?{' '}
          <a href="/registro" className="font-bold text-pampa-600 hover:text-pampa-700 hover:underline">
            Regístrate aquí
          </a>
        </div>
      </div>
    </div>
  );
}
