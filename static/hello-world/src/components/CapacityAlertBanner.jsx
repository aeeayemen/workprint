import React, { useState } from 'react';
import SectionMessage, { SectionMessageAction } from '@atlaskit/section-message';
import Lozenge from '@atlaskit/lozenge';
import Button from '@atlaskit/button';
import { token } from '@atlaskit/tokens';

/**
 * CapacityAlertBanner Component
 * Displays Rovo AI workload alerts using Atlassian SectionMessage.
 */
export default function CapacityAlertBanner({ alert }) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !alert) {
    return null;
  }

  return (
    <div style={{ marginBottom: token('space.300', '24px') }}>
      <SectionMessage
        appearance="warning"
        title={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              gap: token('space.100', '8px'),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: token('space.100', '8px') }}>
              <span>{alert.title}</span>
              {alert.badge && (
                <Lozenge appearance="moved" isBold>
                  {alert.badge}
                </Lozenge>
              )}
            </div>
            <Button
              appearance="link"
              spacing="none"
              onClick={() => setIsDismissed(true)}
            >
              Dismiss
            </Button>
          </div>
        }
        actions={[
          <SectionMessageAction
            key="rebalance"
            onClick={() => alert.onAction && alert.onAction()}
          >
            {alert.actionText || 'Suggest rebalancing (3 actions)'}
          </SectionMessageAction>,
        ]}
      >
        <p style={{ margin: `${token('space.050', '4px')} 0` }}>
          {alert.message}
        </p>
        {alert.sourceNote && (
          <div
            style={{
              color: token('color.text.subtle', '#5e6c84'),
              fontSize: '12px',
              marginTop: token('space.050', '4px'),
            }}
          >
            • {alert.sourceNote}
          </div>
        )}
      </SectionMessage>
    </div>
  );
}
