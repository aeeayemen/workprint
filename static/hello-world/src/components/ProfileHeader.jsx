import React, { useState, useEffect } from 'react';
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import Avatar from '@atlaskit/avatar';
import Lozenge from '@atlaskit/lozenge';
import Button from '@atlaskit/button';
import Heading from '@atlaskit/heading';
import { token } from '@atlaskit/tokens';

import DownloadIcon from '@atlaskit/icon/glyph/download';
import SwapIcon from '@atlaskit/icon/glyph/refresh';
import MoreIcon from '@atlaskit/icon/glyph/more';
import CalendarIcon from '@atlaskit/icon/glyph/calendar';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';
import { fetchWorkspaceUsers } from '../services/bridgeService';
import { USERS } from '../data/mockData';

/**
 * ProfileHeader Component
 * Displays breadcrumbs, user avatar, context tags, global action buttons, and sprint header.
 */
export default function ProfileHeader({ user, onBackToSearch, onSelectUser }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuNotice, setMenuNotice] = useState(null);
  const [squad, setSquad] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadSquad() {
      try {
        const data = await fetchWorkspaceUsers();
        if (isMounted) {
          if (data && Array.isArray(data.users) && data.users.length > 0) {
            setSquad(data.users);
          } else {
            setSquad(Object.values(USERS));
          }
        }
      } catch (err) {
        if (isMounted) {
          setSquad(Object.values(USERS));
        }
      }
    }
    loadSquad();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!user) return null;

  const handleExport = () => {
    try {
      // Build CSV report content
      const headers = ['Task ID', 'Type', 'Title', 'Platform', 'Status', 'Time Spent'];
      const rows = (user.tasks || []).map((t) => [
        `"${t.key || t.id}"`,
        `"${t.type || 'task'}"`,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${t.platform || 'Jira'}"`,
        `"${t.status || 'Active'}"`,
        `"${t.timeSpent || '0 hrs'}"`,
      ]);

      const summaryLines = [
        `"Workprint Capacity Report - ${user.name}"`,
        `"Role: ${user.role || ''}"`,
        `"Department: ${user.department || ''}"`,
        `"Sprint: ${user.sprint || ''}"`,
        `"Status: ${user.status || ''}"`,
        `"Total Logged Hours: ${user.workloadDistribution?.totalLoggedHours || 0} hrs"`,
        `"Generated At: ${new Date().toLocaleString()}"`,
        '',
        headers.join(','),
        ...rows.map((r) => r.join(',')),
      ].join('\r\n');

      const blob = new Blob([summaryLines], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeFilename = `${(user.name || 'developer').toLowerCase().replace(/\s+/g, '_')}_workprint_report.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', safeFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Workprint] Export failed:', err);
    }
  };

  const handleReassign = () => {
    window.dispatchEvent(new CustomEvent('workprint:open-reassign'));
  };

  const handleMoreOptions = () => {
    console.log(`[Workprint] Opening more options menu for ${user.name}`);
  };

  return (
    <div style={{ marginBottom: token('space.300', '24px') }}>
      {/* Breadcrumbs Navigation */}
      <div style={{ marginBottom: token('space.100', '8px') }}>
        <Breadcrumbs>
          <BreadcrumbsItem
            text="Workprint"
            onClick={(e) => {
              e.preventDefault();
              if (onBackToSearch) onBackToSearch();
            }}
          />
          <BreadcrumbsItem
            text="Developers"
            onClick={(e) => {
              e.preventDefault();
              if (onBackToSearch) onBackToSearch();
            }}
          />
          <BreadcrumbsItem text={user.name} />
        </Breadcrumbs>
      </div>

      {/* Context Ribbon & Action Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: token('space.200', '16px'),
          paddingBottom: token('space.150', '12px'),
        }}
      >
        {/* User Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: token('space.150', '12px') }}>
          <Avatar
            name={user.name}
            size="large"
            presence="online"
            appearance="circle"
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: token('space.100', '8px'),
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: token('color.text', '#172b4d'),
                }}
              >
                {user.name}
              </span>
              <span style={{ color: token('color.text.subtle', '#737685') }}>•</span>
              <span
                style={{
                  fontSize: '14px',
                  color: token('color.text.subtle', '#5e6c84'),
                }}
              >
                {user.role}
              </span>
              <Lozenge appearance="inprogress" isBold>
                {user.department}
              </Lozenge>
              <Lozenge appearance="success" isBold>
                {user.status}
              </Lozenge>
            </div>
          </div>
        </div>

        {/* Global Action Group */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: token('space.100', '8px') }}>
          {/* Employee Switcher Dropdown */}
          {squad.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label
                htmlFor="employee-select-dropdown"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: token('color.text.subtle', '#5e6c84'),
                  whiteSpace: 'nowrap',
                }}
              >
                Engineer:
              </label>
              <select
                id="employee-select-dropdown"
                value={user.id}
                onChange={(e) => {
                  if (onSelectUser && e.target.value) {
                    onSelectUser(e.target.value);
                  }
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: token('border.radius', '3px'),
                  border: `1px solid ${token('color.border', '#dfe1e6')}`,
                  backgroundColor: token('color.background.input', '#ffffff'),
                  color: token('color.text', '#172b4d'),
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {squad.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.email ? `(${member.email})` : `(${member.role || 'Member'})`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {onBackToSearch && (
            <Button
              appearance="subtle"
              iconBefore={<ArrowLeftIcon label="Back" size="small" />}
              onClick={onBackToSearch}
            >
              Back to Search
            </Button>
          )}

          <Button
            appearance="default"
            iconBefore={<DownloadIcon label="Export" size="small" />}
            onClick={handleExport}
          >
            Export Report
          </Button>

          <Button
            appearance="primary"
            iconBefore={<SwapIcon label="Reassign" size="small" />}
            onClick={handleReassign}
          >
            Reassign Workload
          </Button>

          {/* More options dropdown menu (···) */}
          <div style={{ position: 'relative' }}>
            <Button
              appearance="default"
              iconBefore={<MoreIcon label="More options" size="small" />}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="More actions"
            />

            {isMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '38px',
                  right: 0,
                  width: '210px',
                  backgroundColor: token('color.background.elevation.surface', '#ffffff'),
                  border: `1px solid ${token('color.border', '#dfe1e6')}`,
                  borderRadius: '6px',
                  boxShadow: token('elevation.shadow.overlay', '0 4px 16px rgba(9, 30, 66, 0.25)'),
                  zIndex: 500,
                  padding: '4px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  fontFamily: 'sans-serif',
                }}
              >
                <button
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                    }
                    setIsMenuOpen(false);
                    setMenuNotice('Report link copied to clipboard!');
                    setTimeout(() => setMenuNotice(null), 3500);
                  }}
                  style={{
                    padding: '9px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    fontSize: '13px',
                    color: token('color.text', '#172b4d'),
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = token('color.background.neutral.subtle', '#f4f5f7'))}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  🔗 Copy Report Link
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.print();
                  }}
                  style={{
                    padding: '9px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    fontSize: '13px',
                    color: token('color.text', '#172b4d'),
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = token('color.background.neutral.subtle', '#f4f5f7'))}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  🖨️ Print / Save as PDF
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.location.reload();
                  }}
                  style={{
                    padding: '9px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    fontSize: '13px',
                    color: token('color.text', '#172b4d'),
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = token('color.background.neutral.subtle', '#f4f5f7'))}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  🔄 Refresh Live Telemetry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Notice Toast */}
      {menuNotice && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: token('color.background.success.bold', '#006644'),
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: token('elevation.shadow.overlay', '0 4px 12px rgba(0, 0, 0, 0.2)'),
            zIndex: 9999,
          }}
        >
          ✓ {menuNotice}
        </div>
      )}

      {/* Main Title & Sprint Status */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${token('color.border', '#dfe1e6')}`,
          paddingBottom: token('space.200', '16px'),
          gap: token('space.100', '8px'),
        }}
      >
        <Heading size="large">Workprint: Capacity &amp; Context</Heading>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: token('space.100', '8px'),
            fontSize: '13px',
            color: token('color.text.subtle', '#5e6c84'),
          }}
        >
          <CalendarIcon label="Calendar" size="small" />
          <span>{user.sprint}</span>
        </div>
      </div>
    </div>
  );
}
