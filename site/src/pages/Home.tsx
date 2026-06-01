import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Home(): JSX.Element {
  const { isAuthenticated, user, tokens, login, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="container">
      <h1>Rx Refill Reminders</h1>
      <p>This is a placeholder homepage.</p>

      <div className="card">
        <div className="row">
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => login(location.pathname + location.search)}
            >
              Login
            </button>
          ) : (
            <>
              <button type="button" onClick={logout}>
                Logout
              </button>
              <span style={{ opacity: 0.8 }}>
                Signed in as {user?.email || user?.sub || 'unknown'}
              </span>
            </>
          )}
        </div>

        <details style={{ marginTop: 12 }}>
          <summary>Debug</summary>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(
              {
                isAuthenticated,
                user,
                tokens: {
                  accessToken: tokens.accessToken ? 'present' : null,
                  idToken: tokens.idToken ? 'present' : null,
                  refreshToken: tokens.refreshToken ? 'present' : null,
                },
              },
              null,
              2
            )}
          </pre>
        </details>
      </div>
    </div>
  );
}

