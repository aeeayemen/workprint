import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { token } from '@atlaskit/tokens';

import ProfileHeader from './components/ProfileHeader';
import CapacityAlertBanner from './components/CapacityAlertBanner';
import MetricsCards from './components/MetricsCards';
import WorkloadDistributionBar from './components/WorkloadDistributionBar';
import WorkloadTable from './components/WorkloadTable';
import { USERS } from './data/mockData';
import {
  fetchWorkprintReport,
  fetchConfluencePages,
} from './services/bridgeService';
import WorkprintLoader from './components/WorkprintLoader';

function normalizeConfluencePage(page) {
  const pageId = String(page?.id || '');
  const statusName = page?.status?.name || 'Published';
  const rawWebUi = page?._links?.webui || '';
  const rawBase = page?._links?.base || '';

  let webUrl = '';
  if (rawBase && rawWebUi) {
    webUrl = `${rawBase.replace(/\/+$/, '')}${rawWebUi.startsWith('/') ? '' : '/'}${rawWebUi}`;
  } else if (rawWebUi) {
    webUrl = rawWebUi.startsWith('http')
      ? rawWebUi
      : `https://workprint.atlassian.net/wiki${rawWebUi.startsWith('/') ? '' : '/'}${rawWebUi}`;
  } else if (pageId) {
    webUrl = `https://workprint.atlassian.net/wiki/pages/viewpage.action?pageId=${pageId}`;
  }

  return {
    id: `DOC-${pageId}`,
    key: `DOC-${pageId}`,
    type: 'doc',
    title: page?.title || 'Confluence Page',
    context: `Confluence${page?.space?.name ? ` • Space: ${page.space.name}` : ''}`,
    platform: 'Confluence',
    platformKey: 'confluence',
    status: statusName,
    statusAppearance: statusName.toLowerCase() === 'published' ? 'success' : 'inprogress',
    timeSpent: '0.0 hrs',
    timeSpentNumber: 0,
    sourceUrl: webUrl,
  };
}

function mergeConfluencePages(report, pages) {
  if (!report || !Array.isArray(pages) || pages.length === 0) {
    return report;
  }

  const existingTasks = Array.isArray(report.tasks) ? report.tasks : [];
  const existingConfluenceIds = new Set(
    existingTasks
      .filter((task) => task?.platformKey === 'confluence')
      .map((task) => String(task.id || task.key))
  );

  const newTasks = pages
    .map(normalizeConfluencePage)
    .filter((task) => task.id !== 'DOC-' && !existingConfluenceIds.has(String(task.id)));

  if (newTasks.length === 0) {
    return report;
  }

  const mergedTasks = [...existingTasks, ...newTasks].sort(
    (a, b) => (Number(b.timeSpentNumber) || 0) - (Number(a.timeSpentNumber) || 0)
  );

  const previousConfluence = report.metrics?.confluence || {};
  const previousCount = Number(previousConfluence.count) || 0;
  const newConfluenceCount = previousCount + newTasks.length;

  return {
    ...report,
    tasks: mergedTasks,
    metrics: {
      ...report.metrics,
      confluence: {
        ...previousConfluence,
        count: Math.max(previousCount, newConfluenceCount),
        specsUnderEditCount: Math.max(
          Number(previousConfluence.specsUnderEditCount) || 0,
          newConfluenceCount
        ),
        summary: `${newConfluenceCount} Confluence documents available`,
      },
    },
  };
}

/**
 * Main Workprint dashboard displaying cross-product engineering capacity,
 * AI warnings, and detailed task distributions.
 */
export default function ReportPage({ userId: propUserId, onBackToSearch: propBackToSearch }) {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();

  const resolvedUserId =
    propUserId || searchParams.get('userId') || params.userId || 'alex-chen';

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadReport() {
      setIsLoading(true);
      try {
        // Load the existing aggregated report and all current Confluence pages.
        const [report, confluencePages] = await Promise.all([
          fetchWorkprintReport(resolvedUserId),
          fetchConfluencePages(),
        ]);

        if (isMounted) {
          if (report) {
            setUser(mergeConfluencePages(report, confluencePages));
          } else {
            // Fallback only if live report could not be retrieved
            setUser(USERS ? (USERS[resolvedUserId] || USERS['alex-chen']) : null);
          }
        }
      } catch (err) {
        console.error('[Workprint] Failed to load report for', resolvedUserId, err);
        if (isMounted) {
          setUser(USERS ? (USERS[resolvedUserId] || USERS['alex-chen']) : null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      isMounted = false;
    };
  }, [resolvedUserId]);

  const handleBackToSearch = useCallback(() => {
    if (propBackToSearch) {
      propBackToSearch();
    } else {
      navigate('/');
    }
  }, [propBackToSearch, navigate]);

  if (isLoading || !user) {
    return (
      <WorkprintLoader
        message="Loading Workprint report..."
        subMessage="Aggregating capacity, sprint balance, and task telemetry across Jira, Confluence, and Bitbucket"
      />
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: token('space.400', '32px'),
        paddingBottom: token('space.400', '32px'),
        paddingLeft: token('space.300', '24px'),
        paddingRight: token('space.300', '24px'),
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ProfileHeader user={user} onBackToSearch={handleBackToSearch} />
        <CapacityAlertBanner alert={user?.rovoAlert} />
        <MetricsCards metrics={user?.metrics} />
        <WorkloadDistributionBar distribution={user?.workloadDistribution} />
        <WorkloadTable tasks={user?.tasks || []} />
      </div>
    </div>
  );
}
