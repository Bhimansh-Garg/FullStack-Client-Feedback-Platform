class APIClient {
    constructor() {
        // Configure API base URL - change this for production
        this.baseURL = this.getBaseURL();
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    getBaseURL() {
        // Auto-detect environment
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:8000/api';
        } else {
            // Production backend URL - update this with your Render URL
            return 'https://your-backend-url.onrender.com/api';
        }
    }

    /**
     * Generic HTTP request method
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            console.log(`API Request: ${config.method || 'GET'} ${url}`);
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);
            return data;
            
        } catch (error) {
            this.hideLoadingState();
            throw error;
        }
    }

    async loadClients() {
        try {
            const clients = await API.getClients();
            const clientFilter = document.getElementById('clientFilter');
            
            if (clientFilter) {
                // Clear existing options except "All Clients"
                clientFilter.innerHTML = '<option value="">All Clients</option>';
                
                clients.forEach(client => {
                    const option = document.createElement('option');
                    option.value = client.id;
                    option.textContent = `${client.name}${client.company ? ` (${client.company})` : ''}`;
                    clientFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load clients:', error);
            this.showToast('Failed to load clients', 'error');
        }
    }

    async loadAnalytics() {
        try {
            const clientId = this.currentFilters.client || null;
            const data = await API.getAnalytics(clientId);
            
            this.currentData = data;
            this.updateDashboard(data);
            
        } catch (error) {
            console.error('Failed to load analytics:', error);
            this.showError('Failed to load analytics data');
        }
    }

    updateDashboard(data) {
        this.updateMetrics(data);
        this.updateCharts(data);
        this.updateTables(data);
    }

    updateMetrics(data) {
        // Total feedback count
        const totalCountEl = document.getElementById('totalCount');
        if (totalCountEl) {
            totalCountEl.textContent = data.total_count?.toLocaleString() || '0';
        }

        // Average rating
        const averageRatingEl = document.getElementById('averageRating');
        const ratingStarsEl = document.getElementById('ratingStars');
        
        if (averageRatingEl) {
            averageRatingEl.textContent = data.average_rating?.toFixed(1) || '0.0';
        }
        
        if (ratingStarsEl) {
            ratingStarsEl.innerHTML = this.generateStars(data.average_rating || 0);
        }

        // Satisfaction rate
        const satisfactionRateEl = document.getElementById('satisfactionRate');
        if (satisfactionRateEl && data.rating_distribution) {
            const goodRatings = data.rating_distribution.filter(r => r.rating >= 4)
                .reduce((sum, r) => sum + r.count, 0);
            const rate = data.total_count > 0 ? (goodRatings / data.total_count * 100) : 0;
            satisfactionRateEl.textContent = `${rate.toFixed(0)}%`;
        }

        // Response rate (feedback with comments)
        const responseRateEl = document.getElementById('responseRate');
        if (responseRateEl && data.recent_feedback) {
            const withComments = data.recent_feedback.filter(f => f.comment && f.comment.trim()).length;
            const rate = data.total_count > 0 ? (withComments / Math.min(data.total_count, data.recent_feedback.length) * 100) : 0;
            responseRateEl.textContent = `${rate.toFixed(0)}%`;
        }
    }

    updateCharts(data) {
        this.createRatingChart(data.rating_distribution || []);
        this.createSentimentChart(data.sentiment_distribution || []);
        this.createTrendsChart(data.trends?.weekly_ratings || []);
    }

    createRatingChart(ratingData) {
        const ctx = document.getElementById('ratingChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.rating) {
            this.charts.rating.destroy();
        }

        // Prepare data
        const labels = ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'];
        const data = [1, 2, 3, 4, 5].map(rating => {
            const item = ratingData.find(r => r.rating === rating);
            return item ? item.count : 0;
        });

        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

        this.charts.rating = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { usePointStyle: true, padding: 20 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    createSentimentChart(sentimentData) {
        const ctx = document.getElementById('sentimentChart');
        if (!ctx) return;

        if (this.charts.sentiment) {
            this.charts.sentiment.destroy();
        }

        const sentimentMap = {
            positive: { label: 'Positive', color: '#10b981' },
            neutral: { label: 'Neutral', color: '#6b7280' },
            negative: { label: 'Negative', color: '#ef4444' }
        };

        const labels = [];
        const data = [];
        const colors = [];

        sentimentData.forEach(item => {
            const sentiment = sentimentMap[item.sentiment];
            if (sentiment) {
                labels.push(sentiment.label);
                data.push(item.count);
                colors.push(sentiment.color);
            }
        });

        this.charts.sentiment = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((context.parsed.y / total) * 100).toFixed(1) : 0;
                                return `${context.parsed.y} responses (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    createTrendsChart(trendsData) {
        const ctx = document.getElementById('trendsChart');
        if (!ctx) return;

        if (this.charts.trends) {
            this.charts.trends.destroy();
        }

        if (!trendsData || trendsData.length === 0) {
            // Show empty state
            const container = ctx.parentElement;
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📈</div>
                    <div class="empty-state-title">No Trend Data</div>
                    <div class="empty-state-description">Not enough data to show trends yet.</div>
                </div>
            `;
            return;
        }

        const labels = trendsData.map(item => {
            const date = new Date(item.week);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const data = trendsData.map(item => item.average_rating);

        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Average Rating',
                    data,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 0.5,
                            callback: function(value) {
                                return value.toFixed(1);
                            }
                        }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    updateTables(data) {
        this.updateRecentFeedback(data.recent_feedback || []);
        this.updateKeywords(data.top_keywords || []);
    }

    updateRecentFeedback(feedbackData) {
        const container = document.getElementById('recentFeedbackTable');
        if (!container) return;

        if (feedbackData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <div class="empty-state-title">No Feedback Yet</div>
                    <div class="empty-state-description">Feedback will appear here once submitted.</div>
                </div>
            `;
            return;
        }

        container.innerHTML = feedbackData.map(feedback => `
            <div class="feedback-item">
                <div class="feedback-header-row">
                    <div class="feedback-rating">
                        <div class="rating-stars">${this.generateStars(feedback.rating)}</div>
                        <span class="rating-number">${feedback.rating}/5</span>
                    </div>
                    <div class="feedback-date">${FeedbackApp.formatDate(feedback.submitted_at)}</div>
                </div>
                <div class="feedback-customer">
                    <strong>${feedback.customer_name || 'Anonymous'}</strong>
                </div>
                ${feedback.comment ? `<div class="feedback-comment">${this.escapeHtml(feedback.comment)}</div>` : ''}
            </div>
        `).join('');
    }

    updateKeywords(keywordsData) {
        const container = document.getElementById('keywordsTable');
        if (!container) return;

        if (keywordsData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏷️</div>
                    <div class="empty-state-title">No Keywords</div>
                    <div class="empty-state-description">Keywords will appear as feedback is analyzed.</div>
                </div>
            `;
            return;
        }

        container.innerHTML = keywordsData.map(item => `
            <div class="keyword-tag">
                <span>${this.escapeHtml(item.keyword)}</span>
                <span class="keyword-count">${item.count}</span>
            </div>
        `).join('');
    }

    // Event Handlers
    async handleClientFilter(event) {
        this.currentFilters.client = event.target.value;
        this.showLoadingState();
        await this.loadAnalytics();
        this.hideLoadingState();
    }

    async handleTimeRangeFilter(event) {
        this.currentFilters.timeRange = event.target.value;
        // Note: Backend would need to implement time range filtering
        this.showToast('Time range filtering coming soon!', 'info');
    }

    async handleRefresh() {
        const btn = document.getElementById('refreshBtn');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<div class="loading-spinner small"></div> Refreshing...';
        btn.disabled = true;
        
        try {
            await this.loadAnalytics();
            this.showToast('Dashboard refreshed successfully!', 'success');
        } catch (error) {
            this.showToast('Failed to refresh dashboard', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    async handleExport() {
        try {
            const clientId = this.currentFilters.client || null;
            const data = await API.exportFeedback(clientId);
            
            // Create and download JSON file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `feedback-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showToast('Data exported successfully!', 'success');
        } catch (error) {
            this.showToast('Failed to export data', 'error');
        }
    }

    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'r':
                    event.preventDefault();
                    this.handleRefresh();
                    break;
                case 'e':
                    event.preventDefault();
                    this.handleExport();
                    break;
            }
        }
    }

    handleWindowFocus() {
        // Refresh data when window regains focus
        if (document.hidden === false) {
            this.loadAnalytics();
        }
    }

    handleResize() {
        // Resize charts
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    }

    // Auto-refresh functionality
    setupAutoRefresh() {
        // Refresh every 5 minutes
        this.refreshInterval = setInterval(() => {
            if (!document.hidden) {
                this.loadAnalytics();
            }
        }, 5 * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // UI State Management
    showLoadingState() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    hideLoadingState() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'success') {
        const toastId = type === 'success' ? 'successToast' : 'errorToast';
        const toast = document.getElementById(toastId);
        
        if (toast) {
            const messageEl = toast.querySelector('.toast-message');
            messageEl.textContent = message;
            
            toast.classList.remove('hidden');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 5000);
            
            // Close button
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.onclick = () => toast.classList.add('hidden');
        }
    }

    // Utility Methods
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + 
               (hasHalfStar ? '☆' : '') + 
               '☆'.repeat(emptyStars);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showAllFeedback() {
        // Could open a modal or navigate to detailed view
        this.showToast('Detailed feedback view coming soon!', 'info');
    }

    showAllKeywords() {
        // Could show expanded keyword analysis
        this.showToast('Detailed keyword analysis coming soon!', 'info');
    }

    // Cleanup
    destroy() {
        this.stopAutoRefresh();
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        
        // Remove event listeners
        window.removeEventListener('focus', this.handleWindowFocus);
        window.removeEventListener('resize', this.handleResize);
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.dashboard-body')) {
        window.dashboard = new Dashboard();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.dashboard) {
        window.dashboard.destroy();
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
}
            console.error('API Error:', error);
            
            // Handle network errors
            if (!navigator.onLine) {
                throw new Error('No internet connection. Please check your network.');
            }
            
            // Handle timeout errors
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Please try again.');
            }
            
            throw error;
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * Client Management
     */
    async getClients() {
        return this.get('/clients/');
    }

    async getClient(clientId) {
        return this.get(`/clients/${clientId}/`);
    }

    async createClient(clientData) {
        return this.post('/clients/', clientData);
    }

    async updateClient(clientId, clientData) {
        return this.put(`/clients/${clientId}/`, clientData);
    }

    async deleteClient(clientId) {
        return this.delete(`/clients/${clientId}/`);
    }

    /**
     * Feedback Management
     */
    async getFeedback(params = {}) {
        return this.get('/feedback/', params);
    }

    async getFeedbackById(feedbackId) {
        return this.get(`/feedback/${feedbackId}/`);
    }

    async submitFeedback(feedbackData) {
        return this.post('/feedback/', feedbackData);
    }

    async updateFeedback(feedbackId, feedbackData) {
        return this.put(`/feedback/${feedbackId}/`, feedbackData);
    }

    async deleteFeedback(feedbackId) {
        return this.delete(`/feedback/${feedbackId}/`);
    }

    /**
     * Analytics and Reporting
     */
    async getAnalytics(clientId = null) {
        const endpoint = clientId ? `/analytics/${clientId}/` : '/analytics/';
        return this.get(endpoint);
    }

    async exportFeedback(clientId = null, format = 'json') {
        const endpoint = clientId ? `/export/${clientId}/` : '/export/';
        return this.get(endpoint, { format });
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL.replace('/api', '')}/admin/`, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Create global API instance
const API = new APIClient();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, API };
}
