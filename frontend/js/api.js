/* ============================
   API CLIENT
============================ */

class APIClient {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    getBaseURL() {
        if (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1'
        ) {
            return 'http://localhost:8000/api';
        }
        return 'https://your-backend-url.onrender.com/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const config = {
            method: options.method || 'GET',
            headers: {
                ...this.defaultHeaders,
                ...(options.headers || {})
            },
            body: options.body || null
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const err = await response.json();
                    errorMessage = err.message || errorMessage;
                } catch {}
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            if (!navigator.onLine) {
                throw new Error('No internet connection.');
            }
            if (error.name === 'AbortError') {
                throw new Error('Request timeout.');
            }
            console.error('API Error:', error);
            throw error;
        }
    }

    /* ---------- HTTP METHODS ---------- */

    async get(endpoint, params = {}) {
        const qs = new URLSearchParams(params).toString();
        return this.request(qs ? `${endpoint}?${qs}` : endpoint);
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /* ---------- API ENDPOINTS ---------- */

    getClients() {
        return this.get('/clients/');
    }

    getAnalytics(clientId = null) {
        return this.get(clientId ? `/analytics/${clientId}/` : '/analytics/');
    }

    exportFeedback(clientId = null) {
        return this.get(clientId ? `/export/${clientId}/` : '/export/');
    }

    async healthCheck() {
        try {
            const res = await fetch(
                this.baseURL.replace('/api', '') + '/admin/',
                { method: 'HEAD' }
            );
            return res.ok;
        } catch {
            return false;
        }
    }
}

const API = new APIClient();

/* ============================
   DASHBOARD
============================ */

class Dashboard {
    constructor() {
        this.charts = {};
        this.currentFilters = {};
        this.init();
    }

    async init() {
        await this.loadClients();
        await this.loadAnalytics();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('refreshBtn')?.addEventListener(
            'click',
            () => this.handleRefresh()
        );

        window.addEventListener('resize', () => this.resizeCharts());
        window.addEventListener('focus', () => this.loadAnalytics());
    }

    async loadClients() {
        try {
            const clients = await API.getClients();
            const select = document.getElementById('clientFilter');

            if (!select) return;

            select.innerHTML = '<option value="">All Clients</option>';

            clients.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                select.appendChild(opt);
            });
        } catch (e) {
            console.error(e);
        }
    }

    async loadAnalytics() {
        try {
            const data = await API.getAnalytics(this.currentFilters.client);
            this.updateMetrics(data);
        } catch (e) {
            console.error(e);
        }
    }

    updateMetrics(data) {
        document.getElementById('totalCount').textContent =
            data.total_count ?? '0';
    }

    async handleRefresh() {
        await this.loadAnalytics();
    }

    resizeCharts() {
        Object.values(this.charts).forEach(chart => chart?.resize());
    }

    destroy() {
        Object.values(this.charts).forEach(chart => chart?.destroy());
        window.removeEventListener('resize', this.resizeCharts);
    }
}

/* ============================
   BOOTSTRAP
============================ */

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.dashboard-body')) {
        window.dashboard = new Dashboard();
    }
});

window.addEventListener('beforeunload', () => {
    window.dashboard?.destroy();
});

/* ============================
   EXPORTS (FOR TESTING)
============================ */

if (typeof module !== 'undefined') {
    module.exports = { APIClient, API, Dashboard };
}
