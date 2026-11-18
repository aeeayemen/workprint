import React, { useState, useEffect, useCallback } from 'react';
import {
  HashRouter,
  Routes,
  Route,
  useSearchParams,
  useNavigate,
} from 'react-router-dom';
import { view } from '@forge/bridge';
import SearchPage from './SearchPage';
import ReportPage from './ReportPage';
import WorkprintChat from './components/WorkprintChat';

/**
 * Root Route Handler
 * Supports React state, URL query parameters (?userId=...), and Forge Rovo deep links.
 */
function WorkprintRouteHandler({ activeUserId, onSelectUser, onBackToSearch }) {
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get('userId');
  const effectiveUserId = activeUserId || queryUserId;

  if (effectiveUserId) {
    return (
      <ReportPage
        userId={effectiveUserId}
        onBackToSearch={onBackToSearch}
        onSelectUser={onSelectUser}
      />
    );
  }

  return <SearchPage onSelectUser={onSelectUser} />;
}

function WorkprintAppShell() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check initial URL query params (both window.location and router searchParams)
  const initialUrlUser =
    searchParams.get('userId') ||
    new URLSearchParams(window.location.search).get('userId');

  const [activeUserId, setActiveUserId] = useState(initialUrlUser || null);

  // Sync state whenever URL searchParams change (e.g. from navigate('/?userId=...'))
  useEffect(() => {
    const paramUser = searchParams.get('userId');
    // Always update activeUserId to match the URL state
    setActiveUserId(paramUser || null);
  }, [searchParams]);

  // Intercept deep-link parameters passed from Jira / Rovo Agent URL (?userId=...)
  useEffect(() => {
    try {
      view
        .getContext()
        .then((context) => {
          const rovoUserId =
            context?.extension?.request?.queryParameters?.userId?.[0] ||
            context?.extension?.request?.queryParameters?.userId;
          if (rovoUserId) {
            setActiveUserId(rovoUserId);
          }
        })
        .catch(() => {
          // Safe fallback when running outside Forge iframe
        });
    } catch (e) {
      // Ignore bridge error in local browser
    }
  }, []);

  /*
   * handleSelectUser — navigate to a user's report.
   * We update both React state and the URL so that deep-links and browser
   * refresh both land on the correct report page.
   */
  const handleSelectUser = useCallback((userId) => {
    setActiveUserId(userId);
    setSearchParams({ userId });
  }, [setSearchParams]);

  /*
   * handleBackToSearch — return to the search / home view.
   *
   * BUG FIX: The previous implementation called BOTH setSearchParams({}) AND
   * navigate('/') in the same event handler.  In React Router v7 these are two
   * separate URL-change mechanisms; firing them together causes the router to
   * process them as independent navigation events and the second one can silently
   * win, leaving the app in an inconsistent state.
   *
   * Fix: use navigate('/') only. React Router clears the query string because
   * we are navigating to a fully-qualified path that has no search params.
   * The useEffect below then picks up the searchParams change and zeroes out
   * activeUserId in state to match.
   */
  const handleBackToSearch = useCallback(() => {
    setActiveUserId(null);
    navigate('/');
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <WorkprintRouteHandler
              activeUserId={activeUserId}
              onSelectUser={handleSelectUser}
              onBackToSearch={handleBackToSearch}
            />
          }
        />
        <Route
          path="/report/:userId"
          element={
            <ReportPage
              onBackToSearch={handleBackToSearch}
              onSelectUser={handleSelectUser}
            />
          }
        />
        <Route
          path="*"
          element={
            <WorkprintRouteHandler
              activeUserId={activeUserId}
              onSelectUser={handleSelectUser}
              onBackToSearch={handleBackToSearch}
            />
          }
        />
      </Routes>

      {/* Floating Workprint AI Chat Widget — always available */}
      <WorkprintChat onSelectUser={handleSelectUser} />
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <WorkprintAppShell />
    </HashRouter>
  );
}