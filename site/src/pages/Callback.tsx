import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForTokens, getAndClearRedirectPath } from '../auth/oauth';
import { useAuth } from '../auth/AuthContext';

export function Callback(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthTokens, clearAuthState } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => {
    return {
      code: searchParams.get('code'),
      state: searchParams.get('state'),
      error: searchParams.get('error'),
      errorDescription: searchParams.get('error_description'),
    };
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      try {
        if (params.error) {
          throw new Error(params.errorDescription || params.error);
        }
        if (!params.code) {
          throw new Error('Authorization code not found in callback.');
        }
        if (!params.state) {
          throw new Error('State parameter not found in callback.');
        }

        const tokenResponse = await exchangeCodeForTokens(
          params.code,
          params.state
        );

        setAuthTokens(
          tokenResponse.access_token,
          tokenResponse.id_token,
          tokenResponse.refresh_token
        );

        const redirectTo = getAndClearRedirectPath() || '/';
        navigate(redirectTo, { replace: true });
      } catch (err) {
        clearAuthState();
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [params, navigate, setAuthTokens, clearAuthState]);

  return (
    <div className="container">
      <h1>Completing login…</h1>
      {error ? (
        <div className="card">
          <h2>Authentication failed</h2>
          <p>{error}</p>
          <button type="button" onClick={() => navigate('/', { replace: true })}>
            Go home
          </button>
        </div>
      ) : (
        <p>You will be redirected shortly.</p>
      )}
    </div>
  );
}

