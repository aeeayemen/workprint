import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@forge/bridge';
import { token } from '@atlaskit/tokens';

/**
 * BitbucketConnect — OAuth 2.0 connection banner for Bitbucket.
 *
 * This component detects whether the current Jira user has connected their
 * Bitbucket account via OAuth. If not, it shows a prominent connect button
 * that triggers the Atlassian-managed OAuth consent popup.
 *
 * The Forge External Authentication framework (providers.auth in manifest.yml)
 * handles all token exchange, secure storage, and refresh automatically.
 * No tokens are ever stored or managed in app code.
 *
 * Props:
 *  - onConnected: () => void  — Called after successful connection so the parent
 *                               can re-fetch Bitbucket data.
 */
export default function BitbucketConnect({ onConnected }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'disconnected' | 'connecting' | 'connected' | 'error'
  const [errorMsg, setErrorMsg] = useState(null);

  /**
   * Check if the current user already has an active Bitbucket OAuth connection.
   */
  const checkConnection = useCallback(async () => {
    setStatus('checking');
    try {
      const result = await invoke('checkBitbucketConnection');
      setStatus(result?.connected ? 'connected' : 'disconnected');
    } catch (err) {
      console.warn('[BitbucketConnect] checkBitbucketConnection error:', err);
      setStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  /**
   * Initiate the Bitbucket OAuth 2.0 consent flow.
   * Forge will open the Atlassian-managed OAuth popup in the user's browser.
   * After the user approves, Atlassian stores the token securely — no manual storage.
   */
  const handleConnect = async () => {
    setStatus('connecting');
    setErrorMsg(null);
    try {
      const result = await invoke('initiateBitbucketAuth');
      if (result?.success) {
        setStatus('connected');
        // Notify parent so it re-fetches Bitbucket data with the new token.
        if (onConnected) onConnected();
      } else {
        setStatus('error');
        setErrorMsg(result?.error || 'Connection was not completed. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'An unexpected error occurred during Bitbucket OAuth.');
    }
  };

  /**
   * Revoke the current user's Bitbucket OAuth connection.
   */
  const handleDisconnect = async () => {
    try {
      await invoke('disconnectBitbucket');
      setStatus('disconnected');
    } catch (err) {
      console.warn('[BitbucketConnect] disconnectBitbucket error:', err);
    }
  };

  // ── Render: nothing while checking, nothing if already connected ──
  if (status === 'checking') return null;
  if (status === 'connected') return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: token('space.200', '16px'),
        padding: `${token('space.150', '12px')} ${token('space.200', '16px')}`,
        background: token('color.background.information', '#E9F2FF'),
        borderRadius: token('border.radius.100', '4px'),
        border: `1px solid ${token('color.border.information', '#B3D4FF')}`,
        marginBottom: token('space.200', '16px'),
      }}
    >
      {/* Bitbucket logo indicator */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#0052CC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        Bb
      </div>

      {/* Message */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: token('color.text', '#172b4d'),
            marginBottom: 2,
          }}
        >
          Connect your Bitbucket account
        </div>
        <div style={{ fontSize: 12, color: token('color.text.subtle', '#5e6c84') }}>
          {status === 'error' && errorMsg
            ? `⚠️ ${errorMsg}`
            : 'Sign in with Bitbucket to see your pull requests and code review activity in Workprint.'}
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={status === 'connecting' ? undefined : handleConnect}
        disabled={status === 'connecting'}
        style={{
          padding: '6px 16px',
          background: status === 'connecting'
            ? token('color.background.disabled', '#ebecf0')
            : token('color.background.brand.bold', '#0052cc'),
          color: status === 'connecting'
            ? token('color.text.disabled', '#8993a4')
            : '#ffffff',
          border: 'none',
          borderRadius: token('border.radius.100', '4px'),
          fontWeight: 600,
          fontSize: 13,
          cursor: status === 'connecting' ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s',
        }}
      >
        {status === 'connecting' ? 'Connecting…' : status === 'error' ? 'Try Again' : 'Connect Bitbucket'}
      </button>
    </div>
  );
}
