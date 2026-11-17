import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Heading from '@atlaskit/heading';
import Textfield from '@atlaskit/textfield';
import Avatar from '@atlaskit/avatar';
import Lozenge from '@atlaskit/lozenge';
import Button from '@atlaskit/button';
import SectionMessage from '@atlaskit/section-message';
import Icon from '@atlaskit/icon';
import { token } from '@atlaskit/tokens';

import { USERS, RECENT_PROFILES } from './data/mockData';
import { fetchWorkspaceUsers } from './services/bridgeService';
import WorkprintLoader from './components/WorkprintLoader';

// Official Atlassian Design System SVG Glyphs wrapped in @atlaskit/icon
const SearchGlyph = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" role="presentation" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M16.436 15.085l3.94 4.01a1 1 0 01-1.425 1.402l-3.938-4.006a7.5 7.5 0 111.423-1.406zM10.5 16a5.5 5.5 0 100-11 5.5 5.5 0 000 11z"
    />
  </svg>
);

const ArrowRightGlyph = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" role="presentation" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M14.707 12.707a1 1 0 000-1.414l-4-4a1 1 0 10-1.414 1.414L11.586 11H6a1 1 0 100 2h5.586l-2.293 2.293a1 1 0 001.414 1.414l4-4z"
    />
  </svg>
);

const DiscoverGlyph = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" role="presentation" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12 20a8 8 0 100-16 8 8 0 000 16zm0 2C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm2.369-12.369l-4.596 1.768-1.768 4.596 4.596-1.768 1.768-4.596zM12 13a1 1 0 110-2 1 1 0 010 2z"
    />
  </svg>
);

const JiraGlyph = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" role="presentation" {...props}>
    <path
      fill="currentColor"
      d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 00-.84-.84H11.53zM6.77 6.8a4.362 4.362 0 004.34 4.38h1.8v1.72a4.362 4.362 0 004.34 4.34V7.63a.84.84 0 00-.83-.83H6.77zM2 11.6c0 2.4 1.95 4.34 4.35 4.35h1.78v1.72c.01 2.39 1.95 4.33 4.34 4.33v-9.57a.84.84 0 00-.84-.83H2z"
    />
  </svg>
);

const TimeGlyph = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" role="presentation" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12 20a8 8 0 100-16 8 8 0 000 16zm0 2C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm1-10.414V7a1 1 0 10-2 0v5a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L13 11.586z"
    />
  </svg>
);

const CheckCircleGlyph = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" role="presentation" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L6.643 12.79l4.18 4.182 6.534-6.534-1.414-1.414-5.12 5.116z"
    />
  </svg>
);

const SearchIcon = (props) => <Icon glyph={SearchGlyph} {...props} />;
const ArrowRightIcon = (props) => <Icon glyph={ArrowRightGlyph} {...props} />;
const DiscoverIcon = (props) => <Icon glyph={DiscoverGlyph} {...props} />;
const JiraIcon = (props) => <Icon glyph={JiraGlyph} {...props} />;
const TimeIcon = (props) => <Icon glyph={TimeGlyph} {...props} />;
const CheckCircleIcon = (props) => <Icon glyph={CheckCircleGlyph} {...props} />;

/**
 * SearchPage Component
 * Entry search screen to look up team members and navigate to their Workprint report.
 * Supports Forge bridge resolver with local fallback.
 */
export default function SearchPage({ onSelectUser }) {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [recentProfiles, setRecentProfiles] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load live users from Forge backend resolver if available
  useEffect(() => {
    let isMounted = true;
    async function loadUsers() {
      setIsLoading(true);
      try {
        const data = await fetchWorkspaceUsers();
        if (isMounted) {
          if (data && Array.isArray(data.users) && data.users.length > 0) {
            setUsersList(data.users);
            setRecentProfiles(data.recentProfiles || data.users.slice(0, 4));
          } else {
            // Only fallback to mock data on complete failure or empty
            setUsersList(Object.values(USERS));
            setRecentProfiles(RECENT_PROFILES);
          }
        }
      } catch (err) {
        if (isMounted) {
          setUsersList(Object.values(USERS));
          setRecentProfiles(RECENT_PROFILES);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Global Cmd+K / Ctrl+K listener for quick search focusing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter users based on query
  const searchResults = usersList.filter(
    (user) =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.role.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectUser = (userId) => {
    // Priority 1: Use the passed callback to update parent state directly
    if (onSelectUser) {
      onSelectUser(userId);
    } else {
      // Fallback: Navigate via URL which App.jsx should detect
      navigate({
        pathname: '/',
        search: `?userId=${userId}`,
      });
    }
  };

  const handleClearHistory = () => {
    setRecentProfiles([]);
  };

  if (isLoading) {
    return (
      <WorkprintLoader
        message="Loading Workprint..."
        subMessage="Discovering workspace engineers across Jira and Confluence"
      />
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${token('space.400', '32px')} ${token('space.200', '16px')}`,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Intelligence Icon Badge */}
        <div
          style={{
            marginBottom: token('space.300', '24px'),
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            backgroundColor: token('color.background.brand.subtle', '#deebff'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: token('elevation.shadow.raised', '0 1px 1px rgba(9, 30, 66, 0.25)'),
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: token('color.background.elevation.surface', '#ffffff'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DiscoverIcon
              label="Workprint Intelligence"
              size="medium"
              primaryColor={token('color.icon.brand', '#0052cc')}
            />
          </div>
        </div>

        {/* Header Typography */}
        <Heading size="xlarge">Generate Workprint Report</Heading>
        <p
          style={{
            fontSize: '14px',
            lineHeight: '20px',
            color: token('color.text.subtle', '#5e6c84'),
            maxWidth: '520px',
            marginTop: token('space.100', '8px'),
            marginBottom: token('space.400', '32px'),
          }}
        >
          Search for a team member to analyze their cross-product workload,
          velocity trends, and cross-functional capacity.
        </p>

        {/* Search Field Container */}
        <div style={{ width: '100%', position: 'relative' }}>
          <Textfield
            ref={searchInputRef}
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsDropdownOpen(e.target.value.trim().length > 0);
            }}
            onFocus={() => {
              if (query.trim().length > 0) setIsDropdownOpen(true);
            }}
            elemBeforeInput={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: token('space.150', '12px'),
                  color: token('color.icon.subtle', '#5e6c84'),
                }}
              >
                <SearchIcon label="Search" size="medium" />
              </div>
            }
            elemAfterInput={
              <div
                style={{
                  paddingRight: token('space.150', '12px'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    backgroundColor: token('color.background.neutral', '#ebecf0'),
                    color: token('color.text.subtle', '#5e6c84'),
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  ⌘K
                </span>
              </div>
            }
          />

          {/* Predictive Search Dropdown */}
          {isDropdownOpen && searchResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                left: 0,
                right: 0,
                backgroundColor: token('color.background.elevation.surface', '#ffffff'),
                border: `1px solid ${token('color.border', '#dfe1e6')}`,
                borderRadius: token('border.radius', '3px'),
                boxShadow: token(
                  'elevation.shadow.overlay',
                  '0 4px 8px -2px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)'
                ),
                zIndex: 50,
                padding: token('space.100', '8px'),
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: token('color.text.subtle', '#5e6c84'),
                  textTransform: 'uppercase',
                  padding: `${token('space.050', '4px')} ${token('space.100', '8px')}`,
                }}
              >
                Suggested Results
              </div>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: token('space.100', '8px'),
                    borderRadius: token('border.radius', '3px'),
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = token('color.background.neutral.subtle', '#fafbfc');
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: token('space.150', '12px') }}>
                    <Avatar name={user.name} size="medium" />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: token('color.text', '#172b4d') }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '12px', color: token('color.text.subtle', '#5e6c84') }}>
                        {user.email} &bull; {user.role}
                      </div>
                    </div>
                  </div>
                  <Button
                    appearance="subtle-link"
                    spacing="none"
                    onClick={() => handleSelectUser(user.id)}
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Metrics Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: token('space.150', '12px'),
            width: '100%',
            marginTop: token('space.300', '24px'),
            marginBottom: token('space.400', '32px'),
            textAlign: 'left',
          }}
        >
          <div
            style={{
              padding: token('space.150', '12px'),
              backgroundColor: token('color.background.elevation.surface', '#ffffff'),
              border: `1px solid ${token('color.border', '#dfe1e6')}`,
              borderRadius: token('border.radius', '3px'),
              display: 'flex',
              alignItems: 'center',
              gap: token('space.150', '12px'),
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '3px',
                backgroundColor: token('color.background.brand.subtle', '#deebff'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <JiraIcon label="Sources" size="small" primaryColor={token('color.icon.brand', '#0052cc')} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: token('color.text', '#172b4d') }}>
                3 Sources
              </div>
              <div style={{ fontSize: '11px', color: token('color.text.subtle', '#5e6c84') }}>
                Jira, Bitbucket, Confluence
              </div>
            </div>
          </div>

          <div
            style={{
              padding: token('space.150', '12px'),
              backgroundColor: token('color.background.elevation.surface', '#ffffff'),
              border: `1px solid ${token('color.border', '#dfe1e6')}`,
              borderRadius: token('border.radius', '3px'),
              display: 'flex',
              alignItems: 'center',
              gap: token('space.150', '12px'),
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '3px',
                backgroundColor: token('color.background.discovery.subtle', '#eae6ff'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TimeIcon label="Rolling window" size="small" primaryColor={token('color.icon.discovery', '#5243aa')} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: token('color.text', '#172b4d') }}>
                Rolling 90-Day
              </div>
              <div style={{ fontSize: '11px', color: token('color.text.subtle', '#5e6c84') }}>
                Activity synthesis window
              </div>
            </div>
          </div>

          <div
            style={{
              padding: token('space.150', '12px'),
              backgroundColor: token('color.background.elevation.surface', '#ffffff'),
              border: `1px solid ${token('color.border', '#dfe1e6')}`,
              borderRadius: token('border.radius', '3px'),
              display: 'flex',
              alignItems: 'center',
              gap: token('space.150', '12px'),
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '3px',
                backgroundColor: token('color.background.success.subtle', '#e3fcef'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircleIcon label="Capacity Safe" size="small" primaryColor={token('color.icon.success', '#006644')} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: token('color.text', '#172b4d') }}>
                Capacity Safe
              </div>
              <div style={{ fontSize: '11px', color: token('color.text.subtle', '#5e6c84') }}>
                Anonymized load telemetry
              </div>
            </div>
          </div>
        </div>

        {/* Recent Profiles Section */}
        {recentProfiles.length > 0 && (
          <div style={{ width: '100%', textAlign: 'left', marginBottom: token('space.400', '32px') }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: token('space.100', '8px'),
                borderBottom: `1px solid ${token('color.border', '#ebecf0')}`,
                marginBottom: token('space.150', '12px'),
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: token('color.text.subtle', '#5e6c84'),
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Recent Profiles
              </span>
              <Button appearance="subtle-link" spacing="none" onClick={handleClearHistory}>
                Clear History
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: token('space.100', '8px') }}>
              {recentProfiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => handleSelectUser(profile.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: token('space.150', '12px'),
                    backgroundColor: token('color.background.elevation.surface', '#ffffff'),
                    border: `1px solid ${token('color.border', '#dfe1e6')}`,
                    borderRadius: token('border.radius', '3px'),
                    boxShadow: token('elevation.shadow.raised', '0 1px 1px rgba(9, 30, 66, 0.25)'),
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = token('color.border.brand', '#0052cc');
                    e.currentTarget.style.backgroundColor = token('color.background.neutral.subtle', '#fafbfc');
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = token('color.border', '#dfe1e6');
                    e.currentTarget.style.backgroundColor = token('color.background.elevation.surface', '#ffffff');
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: token('space.150', '12px'), minWidth: 0 }}>
                    <Avatar name={profile.name} size="medium" />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: token('space.100', '8px') }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: token('color.text', '#172b4d') }}>
                          {profile.name}
                        </span>
                        <Lozenge appearance={profile.badgeAppearance || 'primary'} isBold>
                          {profile.badge || profile.badgeText || 'Member'}
                        </Lozenge>
                      </div>
                      <span
                        style={{
                          fontSize: '12px',
                          color: token('color.text.subtle', '#5e6c84'),
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {profile.role}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: token('space.100', '8px') }}>
                    <span style={{ fontSize: '11px', color: token('color.text.subtle', '#5e6c84') }}>
                      {profile.analyzedAgo}
                    </span>
                    <ArrowRightIcon label="View Report" size="small" primaryColor={token('color.icon.subtle', '#5e6c84')} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Banner */}
        <div style={{ width: '100%', textAlign: 'left' }}>
          <SectionMessage appearance="information">
            <p style={{ margin: 0, fontSize: '13px' }}>
              <strong>ProTip:</strong> Workprint automatically maps cross-product touchpoints across Jira Software issues, Bitbucket pull request reviews, and Confluence technical specs.
            </p>
          </SectionMessage>
        </div>
      </div>
    </div>
  );
}