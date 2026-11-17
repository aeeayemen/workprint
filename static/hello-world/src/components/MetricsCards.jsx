import React from 'react';
import ProgressBar from '@atlaskit/progress-bar';
import Lozenge from '@atlaskit/lozenge';
import { token } from '@atlaskit/tokens';
// import JiraIcon from '@atlaskit/icon/glyph/jira';
// import BitbucketIcon from '@atlaskit/icon/glyph/bitbucket';
// import ConfluenceIcon from '@atlaskit/icon/glyph/confluence';

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

/**
 * MetricsCards Component
 * Renders 3 Atlassian Design System metric cards representing Jira, Bitbucket, and Confluence activity.
 */
export default function MetricsCards({ metrics }) {
  if (!metrics) return null;

  const cardStyle = {
    backgroundColor: token('color.background.elevation.surface', '#ffffff'),
    border: `1px solid ${token('color.border', '#dfe1e6')}`,
    borderRadius: token('border.radius', '3px'),
    boxShadow: token(
      'elevation.shadow.raised',
      '0 1px 1px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)'
    ),
    padding: token('space.250', '20px'),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '210px',
  };

  const cardHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: token('space.150', '12px'),
  };

  const titleGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: token('space.100', '8px'),
  };

  const iconContainerStyle = (bgColor) => ({
    width: '28px',
    height: '28px',
    borderRadius: token('border.radius', '3px'),
    backgroundColor: bgColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const cardTitleStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: token('color.text', '#172b4d'),
    margin: 0,
  };

  const primaryStatStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: token('color.text', '#172b4d'),
    lineHeight: '28px',
    marginTop: token('space.050', '4px'),
  };

  const subtextStyle = {
    fontSize: '12px',
    color: token('color.text.subtle', '#5e6c84'),
    marginTop: token('space.050', '4px'),
    lineHeight: '16px',
  };

  const footerDividerStyle = {
    borderTop: `1px solid ${token('color.border', '#ebecf0')}`,
    marginTop: token('space.200', '16px'),
    paddingTop: token('space.150', '12px'),
    display: 'flex',
    flexDirection: 'column',
    gap: token('space.100', '8px'),
  };

  const footerMetaStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    color: token('color.text.subtle', '#5e6c84'),
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: token('space.200', '16px'),
        marginBottom: token('space.300', '24px'),
      }}
    >
      {/* Card 1: Jira Issues */}
      <div style={cardStyle}>
        <div>
          <div style={cardHeaderStyle}>
            <div style={titleGroupStyle}>
              <div
                style={iconContainerStyle(
                  token('color.background.brand.subtle', '#deebff')
                )}
              >
                <JiraIcon label="Jira" size="small" />
              </div>
              <h3 style={cardTitleStyle}>
                Jira Issues ({metrics.jira.count})
              </h3>
            </div>
            <Lozenge appearance="inprogress" isBold>
              {metrics.jira.capacityPercent}% Capacity
            </Lozenge>
          </div>
          <div>
            <div style={primaryStatStyle}>
              {metrics.jira.activeIssuesCount} Active Issues
            </div>
            <div style={subtextStyle}>{metrics.jira.summary}</div>
          </div>
        </div>

        <div style={footerDividerStyle}>
          <div style={footerMetaStyle}>
            <span>
              Allocated: {metrics.jira.allocatedHours}h /{' '}
              {metrics.jira.totalHours}h
            </span>
            <span style={{ fontWeight: 600, color: token('color.text', '#172b4d') }}>
              Est. remaining: {metrics.jira.estimatedRemainingHours}h
            </span>
          </div>
          <ProgressBar
            value={metrics.jira.progressValue}
            appearance="in-progress"
          />
        </div>
      </div>

      {/* Card 2: Bitbucket PRs */}
      <div style={cardStyle}>
        <div>
          <div style={cardHeaderStyle}>
            <div style={titleGroupStyle}>
              <div
                style={iconContainerStyle(
                  token('color.background.discovery.subtle', '#eae6ff')
                )}
              >
                <BitbucketIcon label="Bitbucket" size="small" />
              </div>
              <h3 style={cardTitleStyle}>
                Bitbucket PRs ({metrics.bitbucket.count})
              </h3>
            </div>
            <Lozenge appearance="moved" isBold>
              {metrics.bitbucket.statusTag}
            </Lozenge>
          </div>
          <div>
            <div style={primaryStatStyle}>
              {metrics.bitbucket.awaitingReviewCount} Awaiting Review
            </div>
            <div style={subtextStyle}>{metrics.bitbucket.summary}</div>
          </div>
        </div>

        <div style={footerDividerStyle}>
          <div style={footerMetaStyle}>
            <span>Reviews Completed: {metrics.bitbucket.reviewsCompleted}</span>
            <span
              style={{
                fontWeight: 600,
                color: token('color.text.danger', '#bf2600'),
              }}
            >
              {metrics.bitbucket.comparison}
            </span>
          </div>
          <ProgressBar
            value={metrics.bitbucket.progressValue}
            appearance="in-progress"
          />
        </div>
      </div>

      {/* Card 3: Confluence Docs */}
      <div style={cardStyle}>
        <div>
          <div style={cardHeaderStyle}>
            <div style={titleGroupStyle}>
              <div
                style={iconContainerStyle(
                  token('color.background.neutral', '#ebecf0')
                )}
              >
                <ConfluenceIcon label="Confluence" size="small" />
              </div>
              <h3 style={cardTitleStyle}>
                Confluence Docs ({metrics.confluence.count})
              </h3>
            </div>
            <Lozenge appearance="default" isBold>
              {metrics.confluence.timePercent}% Time
            </Lozenge>
          </div>
          <div>
            <div style={primaryStatStyle}>
              {metrics.confluence.specsUnderEditCount} Specs Under Edit
            </div>
            <div style={subtextStyle}>{metrics.confluence.summary}</div>
          </div>
        </div>

        <div style={footerDividerStyle}>
          <div style={footerMetaStyle}>
            <span>Collaborators: {metrics.confluence.collaboratorsCount} active</span>
            <span
              style={{
                fontWeight: 600,
                color: token('color.text.brand', '#0052cc'),
              }}
            >
              {metrics.confluence.lastUpdated}
            </span>
          </div>
          <ProgressBar
            value={metrics.confluence.progressValue}
            appearance="default"
          />
        </div>
      </div>
    </div>
  );
}

