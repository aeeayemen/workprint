import React from 'react';
import { token } from '@atlaskit/tokens';

/**
 * WorkloadDistributionBar Component
 * Renders cross-product workload allocation bar across Jira, Bitbucket, and Confluence.
 */
export default function WorkloadDistributionBar({ distribution }) {
  if (!distribution) return null;

  const jiraColor = token('color.background.brand.bold', '#0052cc');
  const bitbucketColor = token('color.background.discovery.bold', '#2684ff');
  const confluenceColor = token('color.background.accent.teal.subtlest', '#0c56d0');

  return (
    <div
      style={{
        backgroundColor: token('color.background.elevation.surface', '#ffffff'),
        border: `1px solid ${token('color.border', '#dfe1e6')}`,
        borderRadius: token('border.radius', '3px'),
        boxShadow: token(
          'elevation.shadow.raised',
          '0 1px 1px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)'
        ),
        padding: token('space.200', '16px'),
        marginBottom: token('space.300', '24px'),
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: token('space.150', '12px'),
        }}
      >
        <span
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: token('color.text', '#172b4d'),
          }}
        >
          Cross-Product Workload Distribution (Past 7 Days)
        </span>
        <span
          style={{
            fontSize: '12px',
            color: token('color.text.subtle', '#5e6c84'),
          }}
        >
          Total Recorded: {distribution.totalLoggedHours} logged hrs
        </span>
      </div>

      {/* Segmented Bar */}
      <div
        style={{
          width: '100%',
          height: '10px',
          borderRadius: token('border.radius', '3px'),
          backgroundColor: token('color.background.neutral', '#ebecf0'),
          display: 'flex',
          overflow: 'hidden',
          marginBottom: token('space.150', '12px'),
        }}
      >
        <div
          title={`${distribution.jira.label}: ${distribution.jira.percentage}%`}
          style={{
            width: `${distribution.jira.percentage}%`,
            backgroundColor: jiraColor,
            height: '100%',
          }}
        />
        <div
          title={`${distribution.bitbucket.label}: ${distribution.bitbucket.percentage}%`}
          style={{
            width: `${distribution.bitbucket.percentage}%`,
            backgroundColor: bitbucketColor,
            height: '100%',
          }}
        />
        <div
          title={`${distribution.confluence.label}: ${distribution.confluence.percentage}%`}
          style={{
            width: `${distribution.confluence.percentage}%`,
            backgroundColor: confluenceColor,
            height: '100%',
          }}
        />
      </div>

      {/* Legend Chips */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: token('space.300', '24px'),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: token('space.100', '8px') }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: jiraColor,
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: token('color.text', '#172b4d'),
            }}
          >
            {distribution.jira.label}
          </span>
          <span
            style={{
              fontSize: '11px',
              color: token('color.text.subtle', '#5e6c84'),
            }}
          >
            {distribution.jira.percentage}% ({distribution.jira.hours} hrs)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: token('space.100', '8px') }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: bitbucketColor,
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: token('color.text', '#172b4d'),
            }}
          >
            {distribution.bitbucket.label}
          </span>
          <span
            style={{
              fontSize: '11px',
              color: token('color.text.subtle', '#5e6c84'),
            }}
          >
            {distribution.bitbucket.percentage}% ({distribution.bitbucket.hours} hrs)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: token('space.100', '8px') }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: confluenceColor,
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: token('color.text', '#172b4d'),
            }}
          >
            {distribution.confluence.label}
          </span>
          <span
            style={{
              fontSize: '11px',
              color: token('color.text.subtle', '#5e6c84'),
            }}
          >
            {distribution.confluence.percentage}% ({distribution.confluence.hours} hrs)
          </span>
        </div>
      </div>
    </div>
  );
}

