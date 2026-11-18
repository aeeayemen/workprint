import { invoke, requestJira } from '@forge/bridge';
import { USERS, RECENT_PROFILES } from '../data/mockData';

/**
 * Service to bridge React Custom UI frontend with the Forge backend resolvers.
 * Provides automatic fallback to mockData when running in local development mode outside Forge iframe.
 */

/**
 * Fetch a Jira user preference safely with graceful fallback on 404.
 *
 * @param {string} key - Preference key.
 * @param {*} defaultValue - Fallback value when the preference is not set.
 * @returns {Promise<*>} The stored preference value or fallback value.
 */
export async function fetchUserPreference(key, defaultValue = null) {
  if (!key) {
    return defaultValue;
  }

  try {
    const response = await requestJira(
      `/rest/api/3/mypreferences?key=${encodeURIComponent(key)}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }
    );

    if (response.status === 404 || !response.ok) {
      if (response.status !== 404) {
        console.warn(
          `[Workprint Bridge] Jira preference endpoint returned ${response.status} for key "${key}". Using default.`
        );
      }
      return defaultValue;
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (error) {
    console.warn(
      `[Workprint Bridge] Error retrieving preference "${key}":`,
      error.message
    );
    return defaultValue;
  }
}

/**
 * Fetch all workspace users and recent profiles.
 */
export async function fetchWorkspaceUsers() {
  try {
    const response = await invoke('getWorkspaceUsers');
    if (response && response.users) {
      return response;
    }
  } catch (error) {
    console.warn(
      '[Workprint Bridge] invoke("getWorkspaceUsers") unavailable or running outside Forge. Falling back to mockData.',
      error
    );
  }

  return {
    users: Object.values(USERS),
    recentProfiles: RECENT_PROFILES,
  };
}

/**
 * Fetch a Workprint report for a user.
 * @param {string} userId - Jira account ID or application user identifier.
 * @returns {Promise<object>} The live report or a mock fallback.
 */
export async function fetchWorkprintReport(userId) {
  try {
    const response = await invoke('getWorkprintReport', { userId });
    if (response && response.id) {
      return response;
    }
  } catch (error) {
    console.warn(
      `[Workprint Bridge] invoke("getWorkprintReport", { userId: "${userId}" }) unavailable or running outside Forge. Falling back to mockData.`,
      error
    );
  }

  return USERS[userId] || USERS['alex-chen'];
}

/**
 * Fetch Confluence pages, optionally limited to a space.
 *
 * This calls the fetchConfluencePages resolver defined in the Forge backend.
 * The UI can then normalize the returned page objects into report tasks.
 *
 * @param {string} [spaceId] - Optional Confluence space ID.
 * @returns {Promise<Array>} Array of Confluence page objects.
 */
export async function fetchConfluencePages(spaceId) {
  try {
    const payload = spaceId ? { spaceId } : {};
    const result = await invoke('fetchConfluencePages', payload);
    return Array.isArray(result?.pages) ? result.pages : [];
  } catch (error) {
    console.warn('[Workprint Bridge] fetchConfluencePages error:', error);
    return [];
  }
}

/**
 * Reassign a Jira issue to a new squad member via Forge backend resolver.
 * @param {string} issueKey - Jira issue key (e.g. KAN-2).
 * @param {string} accountId - Target Atlassian account ID.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function reassignTask(issueKey, accountId) {
  try {
    const result = await invoke('reassignTask', { issueKey, accountId });
    if (result && result.success) {
      return { success: true };
    }

    return {
      success: false,
      error: result?.error || 'Reassignment failed in backend',
    };
  } catch (error) {
    console.warn('[Workprint Bridge] invoke("reassignTask") error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger the Bitbucket OAuth 2.0 consent flow for the current user.
 * Atlassian opens the consent popup — user signs in to Bitbucket and approves scopes.
 * On success, the token is stored securely per-user by the Atlassian platform.
 *
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function initiateBitbucketAuth() {
  try {
    const result = await invoke('initiateBitbucketAuth');
    return result || { success: false, error: 'No response from backend' };
  } catch (error) {
    console.warn('[Workprint Bridge] invoke("initiateBitbucketAuth") error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check whether the current user has an active Bitbucket OAuth connection.
 *
 * @returns {Promise<{connected: boolean}>}
 */
export async function checkBitbucketConnection() {
  try {
    const result = await invoke('checkBitbucketConnection');
    return result || { connected: false };
  } catch (error) {
    console.warn('[Workprint Bridge] invoke("checkBitbucketConnection") error:', error);
    return { connected: false };
  }
}

/**
 * Revoke the current user's Bitbucket OAuth token.
 *
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function disconnectBitbucket() {
  try {
    const result = await invoke('disconnectBitbucket');
    return result || { success: false };
  } catch (error) {
    console.warn('[Workprint Bridge] invoke("disconnectBitbucket") error:', error);
    return { success: false, error: error.message };
  }
}
