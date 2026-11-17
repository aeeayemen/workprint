import React from 'react';
import { token } from '@atlaskit/tokens';

/**
 * Jira-style Workprint Loader Component
 * Features an Atlassian Design System inspired animated spinner with a centered "W" logo mark.
 */
export default function WorkprintLoader({
  message = 'Loading Workprint...',
  subMessage = 'Synchronizing cross-product telemetry',
  fullScreen = true,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '85vh' : '300px',
        width: '100%',
        padding: token('space.400', '32px'),
        boxSizing: 'border-box',
        backgroundColor: token('color.background.elevation.surface', '#ffffff'),
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      }}
    >
      <style>{`
        @keyframes wp-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes wp-dash {
          0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 100, 200;
            stroke-dashoffset: -20;
          }
          100% {
            stroke-dasharray: 100, 200;
            stroke-dashoffset: -125;
          }
        }

        @keyframes wp-pulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 2px 8px rgba(0, 82, 204, 0.25));
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 4px 14px rgba(0, 82, 204, 0.4));
          }
        }

        .wp-loader-spinner {
          animation: wp-spin 1.4s linear infinite;
        }

        .wp-loader-path {
          stroke: #0052cc;
          stroke-linecap: round;
          animation: wp-dash 1.4s ease-in-out infinite;
        }

        .wp-logo-pulse {
          animation: wp-pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Central Animated Badge Container */}
      <div
        style={{
          position: 'relative',
          width: '84px',
          height: '84px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: token('space.250', '20px'),
        }}
      >
        {/* Outer Circular SVG Spinner Ring (Jira Style) */}
        <svg
          className="wp-loader-spinner"
          viewBox="0 0 50 50"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {/* Subtle background track */}
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#ebecf0"
            strokeWidth="3.5"
          />
          {/* Active spinning arc */}
          <circle
            className="wp-loader-path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="3.5"
          />
        </svg>

        {/* Center Stylized "W" Atlassian-Style Emblem */}
        <div
          className="wp-logo-pulse"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#0052cc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 82, 204, 0.3)',
            zIndex: 2,
          }}
        >
          {/* Custom SVG Geometric "W" Icon matching Atlassian Design */}
          <svg
            width="26"
            height="26"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Crisp modern W glyph */}
            <path
              d="M5.5 8L10.5 24H12.5L16 13.5L19.5 24H21.5L26.5 8H23L19.5 19.5L16.2 9H15.8L12.5 19.5L9 8H5.5Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>

      {/* Loading Messages */}
      <div
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: token('color.text', '#172b4d'),
          marginBottom: '6px',
          textAlign: 'center',
        }}
      >
        {message}
      </div>

      {subMessage && (
        <div
          style={{
            fontSize: '13px',
            color: token('color.text.subtle', '#5e6c84'),
            textAlign: 'center',
            maxWidth: '360px',
          }}
        >
          {subMessage}
        </div>
      )}
    </div>
  );
}
