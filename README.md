# Workprint 🚀

**Workprint** is a powerful Atlassian Forge application designed to bridge the gap between fragmented engineering workflows. It unifies productivity metrics, tasks, and code activity from **Jira Software**, **Confluence**, and **Bitbucket** into a single, cohesive developer dashboard.

---

## ✨ Core Features

- **Cross-Platform Telemetry**: Automatically aggregates individual developer output across Jira issues, Confluence technical documentation, and Bitbucket Pull Requests.
- **Rovo AI Capacity Synthesis**: Dynamically calculates workload distribution and triggers cognitive load warnings when a developer is balancing multiple high-priority tasks and reviews.
- **Interactive Task Reassignment**: Spot project bottlenecks and instantly reassign Jira tasks to other squad members directly from the dashboard with a single click.
- **Workprint Chat**: Query team progress and access instant performance summaries in seconds.
- **Export & Reporting**: Seamlessly export audit-ready productivity reports.

---

## 🛠️ Tech Stack & Architecture

- **Platform**: Atlassian Forge (Custom UI)
- **Frontend**: React, Atlassian Design System (@atlaskit)
- **Backend**: Node.js, Forge API (`api.asApp()`, REST APIs)
- **Integrations**: Jira REST API, Confluence CQL, Bitbucket API v2.0

---

## 🚀 Getting Started (Development)

1. Clone the repository:
   ```bash
   git clone [https://bitbucket.org/workprint/feature.git](https://bitbucket.org/workprint/feature.git)
   cd workprint
