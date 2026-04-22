import yaml from 'js-yaml';

const VALID_LEVELS = new Set(['info', 'success', 'warning', 'error']);

/**
 * Small service for per-tab alert banners.
 * YAML shape:
 *   alerts:
 *     - scope: <dashboardId> | <dashboardId>.<tabId> | *
 *       level: info | success | warning | error   (default: info)
 *       title: optional heading
 *       message: body text
 *       until: optional ISO timestamp (alert auto-hides after this)
 */
class AlertsService {
  constructor() {
    this.alerts = [];
    this.isLoaded = false;
  }

  loadFromYaml(yamlContent) {
    try {
      const parsed = yaml.load(yamlContent);
      const raw = Array.isArray(parsed?.alerts) ? parsed.alerts : [];
      this.alerts = raw
        .map((a) => this.normalize(a))
        .filter(Boolean);
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('AlertsService: failed to parse alerts.yml', error);
      this.alerts = [];
      this.isLoaded = true; // don't retry on soft-failure
      return false;
    }
  }

  normalize(entry) {
    if (!entry || typeof entry !== 'object') return null;
    const message = typeof entry.message === 'string' ? entry.message.trim() : '';
    if (!message) return null;
    const scopeRaw = typeof entry.scope === 'string' ? entry.scope.trim() : '*';
    const [dashboardId, tabId] = scopeRaw === '*' ? ['*', null] : scopeRaw.split('.');
    const level = VALID_LEVELS.has(entry.level) ? entry.level : 'info';
    const until = typeof entry.until === 'string' ? Date.parse(entry.until) : null;
    return {
      scope: scopeRaw,
      dashboardId: dashboardId || '*',
      tabId: tabId || null,
      level,
      title: typeof entry.title === 'string' ? entry.title.trim() : '',
      message,
      until: Number.isFinite(until) ? until : null
    };
  }

  /**
   * Return active alerts that apply to a given dashboard/tab.
   * Match order: global (`*`), dashboard-wide, then tab-specific.
   */
  getAlertsForTab(dashboardId, tabId) {
    if (!this.isLoaded || this.alerts.length === 0) return [];
    const now = Date.now();
    return this.alerts.filter((alert) => {
      if (alert.until && alert.until < now) return false;
      if (alert.dashboardId === '*') return true;
      if (alert.dashboardId !== dashboardId) return false;
      if (!alert.tabId) return true;
      return alert.tabId === tabId;
    });
  }
}

const alertsService = new AlertsService();
export default alertsService;
