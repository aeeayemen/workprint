import React, { useState, useMemo, useEffect } from 'react';
import DynamicTable from '@atlaskit/dynamic-table';
import Button, { ButtonGroup } from '@atlaskit/button';
import Textfield from '@atlaskit/textfield';
import Badge from '@atlaskit/badge';
import Lozenge from '@atlaskit/lozenge';
import Pagination from '@atlaskit/pagination';
import SectionMessage from '@atlaskit/section-message';
import { token } from '@atlaskit/tokens';
import { requestJira, router } from '@forge/bridge';
import { fetchWorkspaceUsers, reassignTask } from '../services/bridgeService';
import { USERS } from '../data/mockData';

import SearchIcon from '@atlaskit/icon/glyph/search';
import IssueIcon from '@atlaskit/icon/glyph/issue';
import DocumentIcon from '@atlaskit/icon/glyph/document';
import TaskIcon from '@atlaskit/icon/glyph/task';
import PullRequestIcon from '@atlaskit/icon/glyph/bitbucket/pullrequests';
import SwapIcon from '@atlaskit/icon/glyph/refresh';
import MoreVerticalIcon from '@atlaskit/icon/glyph/more-vertical';

const JiraIcon = ({ size = 'medium', primaryColor = 'currentColor', ...props }) => {
  const dimensions = size === 'small' ? 16 : 24;
  return (
    <svg
      width={dimensions}
      height={dimensions}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M11.53 2c0 .03-.02.05-.03.08L2.52 11.08c-.34.34-.34.89 0 1.23l8.98 9c.34.34.89.34 1.23 0l9-9c.34-.34.34-.89 0-1.23L12.76 2.08c-.34-.33-.89-.33-1.23 0z"
        fill={primaryColor}
        fillOpacity="0.3"
      />
      <path
        d="M12.002 8.53l6.53 6.53-6.53 6.53-6.53-6.53 6.53-6.53z"
        fill={primaryColor}
      />
    </svg>
  );
};

const BitbucketIcon = ({ size = 'medium', primaryColor = 'currentColor', ...props }) => {
  const dimensions = size === 'small' ? 16 : 24;
  return (
    <svg
      width={dimensions}
      height={dimensions}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2.318 3.5h19.364a1 1 0 01.986 1.157l-2.318 15.322a1 1 0 01-.986.843H4.622a1 1 0 01-.986-.843L1.332 4.657A1 1 0 012.318 3.5z"
        stroke={primaryColor}
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M6.5 9h11l-1.5 8h-8l-1.5-8z"
        fill={primaryColor}
      />
    </svg>
  );
};

const ConfluenceIcon = ({ size = 'medium', primaryColor = 'currentColor', ...props }) => {
  const dimensions = size === 'small' ? 16 : 24;
  return (
    <svg
      width={dimensions}
      height={dimensions}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M21.5 12.2c0-3.2-1.7-6.1-4.4-7.6-2.7-1.5-6-1.3-8.5.5-1.5 1.1-2.5 2.8-2.8 4.7-.3 1.9.3 3.8 1.5 5.3 1.2 1.5 3 2.5 5 2.7 2 .2 4-.4 5.5-1.6 1.4-1.2 2.3-3 2.3-4.8z"
        fill={primaryColor}
        fillOpacity="0.2"
      />
      <path
        d="M14.5 8.5c-.8-.5-1.8-.7-2.7-.6-1 .1-1.9.6-2.5 1.4-.6.8-.9 1.8-.7 2.8.2 1 .8 1.9 1.6 2.4.8.5 1.8.7 2.8.5 1-.2 1.9-.8 2.4-1.6.5-.8.7-1.8.5-2.8-.2-1-.8-1.9-1.4-2.2z"
        fill={primaryColor}
      />
    </svg>
  );
};

const ROWS_PER_PAGE = 5;

export default function WorkloadTable({ tasks = [] }) {
  const [currentTasks, setCurrentTasks] = useState(tasks);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reassign Modal States
  const [reassigningTask, setReassigningTask] = useState(null);
  const [availableSquad, setAvailableSquad] = useState([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);

  // Sync internal tasks with props
  useEffect(() => {
    setCurrentTasks(tasks);
  }, [tasks]);

  // Load available squad members for reassignment
  useEffect(() => {
    async function loadSquad() {
      try {
        const data = await fetchWorkspaceUsers();
        if (data && data.users && data.users.length > 0) {
          setAvailableSquad(data.users);
          setSelectedAssigneeId(data.users[0].id);
        } else {
          const fallbackList = Object.values(USERS);
          setAvailableSquad(fallbackList);
          setSelectedAssigneeId(fallbackList[0]?.id || '');
        }
      } catch (err) {
        const fallbackList = Object.values(USERS);
        setAvailableSquad(fallbackList);
        setSelectedAssigneeId(fallbackList[0]?.id || '');
      }
    }
    loadSquad();
  }, []);

  // Filter to only real Jira issues (DOC-xxxx and PR-xxxx are not Jira issues)
  const jiraOnlyTasks = useMemo(() => {
    return currentTasks.filter(
      (t) =>
        t.platformKey === 'jira' &&
        !String(t.key).startsWith('DOC-') &&
        !String(t.key).startsWith('PR-')
    );
  }, [currentTasks]);

  // Listen to global "workprint:open-reassign" event from ProfileHeader
  useEffect(() => {
    const handleGlobalReassign = () => {
      if (jiraOnlyTasks.length > 0) {
        setReassigningTask(jiraOnlyTasks[0]);
      } else {
        alert('No Jira tasks available to reassign. Only Jira issues can be reassigned.');
      }
    };
    window.addEventListener('workprint:open-reassign', handleGlobalReassign);
    return () => window.removeEventListener('workprint:open-reassign', handleGlobalReassign);
  }, [jiraOnlyTasks]);

  // Execute Reassignment
  const handleConfirmReassign = async () => {
    if (!reassigningTask || !selectedAssigneeId) return;

    setIsSubmitting(true);
    const targetMember = availableSquad.find((m) => m.id === selectedAssigneeId) || {
      name: 'Squad Member',
    };

    try {
      // Only real Jira issues can be reassigned via Jira Cloud REST API
      const isJiraIssue =
        reassigningTask.platformKey === 'jira' &&
        !String(reassigningTask.key).startsWith('DOC-') &&
        !String(reassigningTask.key).startsWith('PR-');

      let result = { success: true };

      if (isJiraIssue) {
        // Call the backend resolver to execute the real Jira assignee update with write:jira-work permissions
        result = await reassignTask(reassigningTask.key, selectedAssigneeId);
      }

      if (result.success) {
        // Update local task state immediately
        setCurrentTasks((prev) =>
          prev.map((t) =>
            t.id === reassigningTask.id
              ? {
                  ...t,
                  status: `Reassigned to ${targetMember.name}`,
                  statusAppearance: 'success',
                }
              : t
          )
        );

        setSuccessBanner(
          `✓ Successfully reassigned "${reassigningTask.key}: ${reassigningTask.title}" to ${targetMember.name}${isJiraIssue ? ' in Jira' : ''}!`
        );
        setReassigningTask(null);

        // Auto-hide success message after 6 seconds
        setTimeout(() => {
          setSuccessBanner(null);
        }, 6000);
      } else {
        alert(`Failed to reassign task in Jira: ${result.error || 'Permission denied'}.\n\nNote: If this task was just created, ensure forge deploy --approve MAJOR_VERSION_RULE and forge install --upgrade have been completed to grant write:jira-work.`);
      }
    } catch (err) {
      console.error('[WorkloadTable] Reassign failed:', err);
      alert(`Error reassigning task: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter tasks based on platform tab and search query
  const filteredTasks = useMemo(() => {
    return currentTasks.filter((task) => {
      const matchesFilter =
        selectedFilter === 'all' || task.platformKey === selectedFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        (task.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.key || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.context || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [currentTasks, selectedFilter, searchQuery]);

  const jiraCount = currentTasks.filter((t) => t.platformKey === 'jira').length;
  const bitbucketCount = currentTasks.filter((t) => t.platformKey === 'bitbucket').length;
  const confluenceCount = currentTasks.filter((t) => t.platformKey === 'confluence').length;

  const totalPages = Math.ceil(filteredTasks.length / ROWS_PER_PAGE) || 1;
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredTasks.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredTasks, currentPage]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug':
        return <IssueIcon label="Bug" size="small" primaryColor={token('color.icon.brand', '#0052cc')} />;
      case 'pr':
        return <PullRequestIcon label="Pull Request" size="small" primaryColor={token('color.icon.discovery', '#0065ff')} />;
      case 'doc':
        return <DocumentIcon label="Document" size="small" primaryColor={token('color.icon.subtle', '#5e6c84')} />;
      case 'task':
      default:
        return <TaskIcon label="Task" size="small" primaryColor={token('color.icon.brand', '#0052cc')} />;
    }
  };

  const getPlatformIcon = (platformKey) => {
    switch (platformKey) {
      case 'jira':
        return <JiraIcon label="Jira" size="small" />;
      case 'bitbucket':
        return <BitbucketIcon label="Bitbucket" size="small" />;
      case 'confluence':
        return <ConfluenceIcon label="Confluence" size="small" />;
      default:
        return null;
    }
  };

  const head = {
    cells: [
      { key: 'type', content: 'Type', width: 8, isSortable: false },
      { key: 'title', content: 'Task Name & Context', width: 42, isSortable: true },
      { key: 'platform', content: 'Platform Source', width: 18, isSortable: true },
      { key: 'status', content: 'Status', width: 14, isSortable: true },
      { key: 'timeSpent', content: 'Time Spent', width: 10, isSortable: true },
      { key: 'actions', content: 'Actions', width: 8, isSortable: false },
    ],
  };

  const rows = paginatedTasks.map((task) => ({
    key: task.id,
    cells: [
      {
        key: 'type',
        content: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getTypeIcon(task.type)}
          </div>
        ),
      },
      {
        key: 'title',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                color: token('color.link', '#0052cc'),
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              {task.key}: {task.title}
            </span>
            <span style={{ fontSize: '11px', color: token('color.text.subtle', '#5e6c84') }}>
              {task.context}
            </span>
          </div>
        ),
      },
      {
        key: 'platform',
        content: (
          <div style={{ display: 'flex', alignItems: 'center', gap: token('space.050', '4px') }}>
            {getPlatformIcon(task.platformKey)}
            <span style={{ fontSize: '13px', color: token('color.text', '#172b4d') }}>
              {task.platform}
            </span>
          </div>
        ),
      },
      {
        key: 'status',
        content: (
          <Lozenge appearance={task.statusAppearance || 'default'} isBold>
            {task.status}
          </Lozenge>
        ),
      },
      {
        key: 'timeSpent',
        content: (
          <span style={{ fontSize: '13px', fontWeight: 600, color: token('color.text', '#172b4d') }}>
            {task.timeSpent}
          </span>
        ),
      },
      {
        key: 'actions',
        content: (() => {
          // Only Jira issues (not DOC-xxxx or PR-xxxx) can be reassigned via Jira API
          const isJiraTask =
            task.platformKey === 'jira' &&
            !String(task.key).startsWith('DOC-') &&
            !String(task.key).startsWith('PR-');

          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: token('space.050', '4px') }}>
              {/* 1. Reassign Task Button (🔄) — only shown for real Jira issues */}
              {isJiraTask && (
                <Button
                  appearance="subtle"
                  spacing="none"
                  title="Reassign Task"
                  iconBefore={<SwapIcon label="Reassign" size="small" />}
                  onClick={() => setReassigningTask(task)}
                />
              )}

              {/* 2. Open / View Task Button (⋮) */}
              <Button
                appearance="subtle"
                spacing="none"
                title={
                  isJiraTask
                    ? 'Open task in Jira'
                    : task.platformKey === 'confluence'
                    ? 'Open document in Confluence'
                    : task.platformKey === 'bitbucket'
                    ? 'Open pull request in Bitbucket'
                    : 'View source / Copy key'
                }
                iconBefore={<MoreVerticalIcon label="Open task" size="small" />}
                onClick={() => {
                  if (isJiraTask && task.key) {
                    try {
                      router.open(`/browse/${task.key}`);
                    } catch (e) {
                      window.open(`/browse/${task.key}`, '_blank');
                    }
                  } else if (task.platformKey === 'confluence') {
                    const rawPageId = String(task.id || task.key || '').replace(/\D/g, '');
                    let targetUrl = task.sourceUrl || '';
                    if (!targetUrl && rawPageId) {
                      targetUrl = `https://workprint.atlassian.net/wiki/pages/viewpage.action?pageId=${rawPageId}`;
                    } else if (targetUrl && !targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                      const cleanPath = targetUrl.startsWith('/wiki')
                        ? targetUrl
                        : `/wiki${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
                      targetUrl = `https://workprint.atlassian.net${cleanPath}`;
                    }

                    if (targetUrl) {
                      try {
                        router.open(targetUrl);
                      } catch (e) {
                        window.open(targetUrl, '_blank');
                      }
                    } else {
                      if (navigator?.clipboard?.writeText) {
                        navigator.clipboard.writeText(task.key || task.title);
                      }
                      setSuccessBanner(`✓ Copied "${task.key || task.title}" to clipboard!`);
                      setTimeout(() => setSuccessBanner(null), 3000);
                    }
                  } else if (task.platformKey === 'bitbucket') {
                    const targetUrl =
                      task.sourceUrl ||
                      'https://bitbucket.org/workprint/feature/pull-requests';
                    try {
                      router.open(targetUrl);
                    } catch (e) {
                      window.open(targetUrl, '_blank');
                    }
                  } else {
                    if (navigator?.clipboard?.writeText) {
                      navigator.clipboard.writeText(task.key || task.title);
                    }
                    setSuccessBanner(`✓ Copied "${task.key || task.title}" to clipboard!`);
                    setTimeout(() => setSuccessBanner(null), 3000);
                  }
                }}
              />
            </div>
          );
        })(),
      },
    ],
  }));

  return (
    <div
      style={{
        backgroundColor: token('color.background.elevation.surface', '#ffffff'),
        border: `1px solid ${token('color.border', '#dfe1e6')}`,
        borderRadius: token('border.radius', '3px'),
        boxShadow: token('elevation.shadow.raised', '0 1px 1px rgba(9, 30, 66, 0.25)'),
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Success Notification Banner */}
      {successBanner && (
        <div style={{ padding: token('space.150', '12px'), borderBottom: `1px solid ${token('color.border', '#dfe1e6')}` }}>
          <SectionMessage appearance="success">
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>{successBanner}</p>
          </SectionMessage>
        </div>
      )}

      {/* Toolbar */}
      <div
        style={{
          padding: token('space.200', '16px'),
          borderBottom: `1px solid ${token('color.border', '#ebecf0')}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: token('space.150', '12px'),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: token('space.150', '12px') }}>
          <ButtonGroup>
            <Button
              appearance="default"
              isSelected={selectedFilter === 'all'}
              onClick={() => {
                setSelectedFilter('all');
                setCurrentPage(1);
              }}
              spacing="compact"
            >
              All Tasks ({currentTasks.length})
            </Button>
            <Button
              appearance="default"
              isSelected={selectedFilter === 'jira'}
              onClick={() => {
                setSelectedFilter('jira');
                setCurrentPage(1);
              }}
              spacing="compact"
            >
              Jira ({jiraCount})
            </Button>
            <Button
              appearance="default"
              isSelected={selectedFilter === 'bitbucket'}
              onClick={() => {
                setSelectedFilter('bitbucket');
                setCurrentPage(1);
              }}
              spacing="compact"
            >
              Bitbucket ({bitbucketCount})
            </Button>
            <Button
              appearance="default"
              isSelected={selectedFilter === 'confluence'}
              onClick={() => {
                setSelectedFilter('confluence');
                setCurrentPage(1);
              }}
              spacing="compact"
            >
              Confluence ({confluenceCount})
            </Button>
          </ButtonGroup>

          <Badge appearance="primary">{filteredTasks.length} tasks logged</Badge>
        </div>

        {/* Search Field */}
        <div style={{ width: '260px' }}>
          <Textfield
            placeholder="Filter tasks by key or title..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            elemBeforeInput={
              <div style={{ paddingLeft: token('space.100', '8px') }}>
                <SearchIcon label="Search" size="small" />
              </div>
            }
            isCompact
          />
        </div>
      </div>

      {/* Dynamic Table */}
      <DynamicTable
        head={head}
        rows={rows}
        isFixedSize
        emptyView={
          <div style={{ padding: token('space.400', '32px'), textAlign: 'center', color: token('color.text.subtle', '#5e6c84') }}>
            No tasks found matching the criteria.
          </div>
        }
      />

      {/* Footer / Pagination */}
      <div
        style={{
          padding: `${token('space.150', '12px')} ${token('space.200', '16px')}`,
          borderTop: `1px solid ${token('color.border', '#ebecf0')}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: token('color.background.neutral.subtle', '#fafbfc'),
        }}
      >
        <span style={{ fontSize: '12px', color: token('color.text.subtle', '#5e6c84') }}>
          Showing {paginatedTasks.length} of {filteredTasks.length} linked items
        </span>

        {totalPages > 1 && (
          <Pagination
            pages={Array.from({ length: totalPages }, (_, i) => i + 1)}
            selectedIndex={currentPage - 1}
            onChange={(_event, page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Interactive Reassign Task Modal */}
      {reassigningTask && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(9, 30, 66, 0.54)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              backgroundColor: token('color.background.elevation.surface', '#ffffff'),
              borderRadius: '8px',
              width: '480px',
              maxWidth: '90vw',
              padding: token('space.300', '24px'),
              boxShadow: token('elevation.shadow.overlay', '0 8px 30px rgba(9, 30, 66, 0.3)'),
              display: 'flex',
              flexDirection: 'column',
              gap: token('space.200', '16px'),
            }}
          >
            <div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: token('color.text', '#172b4d'), marginBottom: '4px' }}>
                Reassign Task
              </div>
              <div style={{ fontSize: '13px', color: token('color.text.subtle', '#5e6c84') }}>
                Select the task and new assignee to rebalance engineering workload.
              </div>
            </div>

            {/* 1. SELECT WHICH TASK TO REASSIGN (Jira issues only) */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: token('color.text.subtle', '#5e6c84'), marginBottom: '6px' }}>
                SELECT TASK TO REASSIGN
              </label>
              {jiraOnlyTasks.length === 0 ? (
                <div style={{ padding: '12px', fontSize: '13px', color: token('color.text.warning', '#ff8b00'), backgroundColor: token('color.background.warning', '#fffae6'), borderRadius: '4px', border: '1px solid #ffe380' }}>
                  No Jira issues found. Only Jira tasks (e.g. KAN-1) can be reassigned.
                </div>
              ) : (
                <select
                  value={reassigningTask.id}
                  onChange={(e) => {
                    const selected = jiraOnlyTasks.find((t) => String(t.id) === String(e.target.value));
                    if (selected) {
                      setReassigningTask(selected);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${token('color.border', '#dfe1e6')}`,
                    fontSize: '13px',
                    backgroundColor: '#ffffff',
                    color: token('color.text', '#172b4d'),
                    fontWeight: 600,
                  }}
                >
                  {jiraOnlyTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.platform}] {t.key}: {t.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Task Details Box */}
            <div
              style={{
                backgroundColor: token('color.background.neutral.subtle', '#f4f5f7'),
                border: `1px solid ${token('color.border', '#dfe1e6')}`,
                borderRadius: '6px',
                padding: token('space.150', '12px'),
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 600, color: token('color.text', '#172b4d'), marginBottom: '4px' }}>
                {reassigningTask.key}: {reassigningTask.title}
              </div>
              <div style={{ fontSize: '12px', color: token('color.text.subtle', '#5e6c84') }}>
                Platform: <strong>{reassigningTask.platform}</strong> &bull; Current Status: <strong>{reassigningTask.status}</strong>
              </div>
            </div>

            {/* 2. SELECT TARGET SQUAD MEMBER */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: token('color.text.subtle', '#5e6c84'), marginBottom: '6px' }}>
                SELECT NEW ASSIGNEE
              </label>
              <select
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${token('color.border', '#dfe1e6')}`,
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  color: token('color.text', '#172b4d'),
                }}
              >
                {availableSquad.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role || 'Software Engineer'})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: token('space.100', '8px'), marginTop: '8px' }}>
              <Button appearance="subtle" onClick={() => setReassigningTask(null)} isDisabled={isSubmitting}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleConfirmReassign} isDisabled={isSubmitting || jiraOnlyTasks.length === 0}>
                {isSubmitting ? 'Reassigning...' : 'Confirm Reassignment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
