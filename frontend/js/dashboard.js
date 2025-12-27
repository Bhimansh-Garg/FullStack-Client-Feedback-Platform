class Dashboard {
    constructor() {
        this.charts = {};
        this.currentData = null;
        this.currentFilters = {
            client: '',
            timeRange: '30'
        };
        this.refreshInterval = null;
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            this.showLoadingState();
            await this.loadInitialData();
            this.setupAutoRefresh();
            console.log('Dashboard initialized successfully');
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById('clientFilter')?.addEventListener('change', this.handleClientFilter.bind(this));
        document.getElementById('timeRange')?.addEventListener('change', this.handleTimeRangeFilter.bind(this));
        
        // Action buttons
        document.getElementById('refreshBtn')?.addEventListener('click', this.handleRefresh.bind(this));
        document.getElementById('exportBtn')?.addEventListener('click', this.handleExport.bind(this));
        
        // Table actions
        document.getElementById('viewAllFeedback')?.addEventListener('click', this.showAllFeedback.bind(this));
        document.getElementById('viewAllKeywords')?.addEventListener('click', this.showAllKeywords.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Window events
        window.addEventListener('focus', this.handleWindowFocus.bind(this));
        window.addEventListener('resize', FeedbackApp.debounce(this.handleResize.bind(this), 250));
    }

    async loadInitialData() {
        try {
            // Load clients for filter
            await this.loadClients();
            
            // Load analytics data
            await this.loadAnalytics();
            
            this.hideLoadingState();
        } catch (error) {