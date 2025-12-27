# FeedbackPro - Client Feedback Analytics Platform

A professional-grade feedback collection and analysis platform built with Django and modern web technologies.

## 🚀 Features

- **Real-time Analytics Dashboard** with interactive charts
- **Sentiment Analysis** using Python pandas and numpy
- **Professional UI** with responsive design
- **RESTful API** for scalable architecture
- **Export Functionality** for data analysis
- **Mobile-optimized** feedback forms

## 🛠 Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Chart.js for data visualization
- Responsive design with CSS Grid/Flexbox

**Backend:**
- Django 4.2 (Python)
- Django REST Framework
- MySQL Database
- Pandas & NumPy for data analysis

**Deployment:**
- Frontend: Vercel
- Backend: Render
- Database: MySQL (cloud)

## 📁 Project Structure

```
feedback-platform/
├── frontend/                 # Static frontend
│   ├── index.html           # Landing page
│   ├── dashboard.html       # Analytics dashboard
│   ├── submit-feedback.html # Feedback form
│   ├── styles/              # CSS files
│   ├── js/                  # JavaScript files
│   └── assets/              # Images and icons
├── backend/                 # Django API
│   ├── feedback_platform/   # Django project
│   ├── feedback/            # Main Django app
│   ├── requirements.txt     # Python dependencies
│   └── manage.py           # Django management
└── docs/                    # Documentation
```

## 🏃‍♂️ Quick Start

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/feedback-platform.git
cd feedback-platform
```

2. **Backend Setup:**
```bash
cd backend
python -m venv feedback_env
source feedback_env/bin/activate  # Windows: feedback_env\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Edit with your settings
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

3. **Frontend Setup:**
```bash
cd frontend
python -m http.server 3000  # Or use any static server
```

4. **Visit:** http://localhost:3000

### Production Deployment

See [Deployment Guide](docs/deployment-guide.md) for detailed instructions.

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients/` | List all clients |
| POST | `/api/clients/` | Create new client |
| GET | `/api/feedback/` | List feedback |
| POST | `/api/feedback/` | Submit feedback |
| GET | `/api/analytics/` | Get dashboard data |
| GET | `/api/analytics/{client_id}/` | Client-specific analytics |
| GET | `/api/export/` | Export feedback data |

## 🎯 Key Features Demo

### Dashboard Analytics
- **Real-time metrics**: Total feedback, average ratings, satisfaction rates
- **Interactive charts**: Rating distribution, sentiment analysis, trends
- **Recent feedback**: Latest submissions with customer details
- **Keyword analysis**: Most mentioned terms and phrases

### Feedback Collection
- **Star rating system**: 1-5 star ratings with descriptive text
- **Comment collection**: Optional detailed feedback
- **Customer information**: Name and email capture
- **Mobile-optimized**: Responsive design for all devices

### Data Analysis
- **Sentiment analysis**: Automatic positive/negative/neutral classification
- **Keyword extraction**: Important terms and phrases identification
- **Trend analysis**: Rating patterns over time
- **Export capabilities**: JSON data export for further analysis

## 🎨 Design System

The platform uses a professional design system with:

- **Color Palette**: Modern blues and grays with semantic colors
- **Typography**: Inter font family for clean, readable text
- **Spacing**: 8px grid system for consistent layouts
- **Components**: Reusable UI components with hover states
- **Animations**: Smooth transitions and micro-interactions

## 🔒 Security Features

- **CORS Protection**: Properly configured cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Django ORM prevents SQL injection
- **XSS Protection**: HTML escaping and CSP headers
- **HTTPS Enforcement**: SSL/TLS in production

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Static File Compression**: Gzip compression for assets
- **Chart.js Optimization**: Efficient rendering for large datasets
- **Responsive Images**: Optimized images for different screen sizes
- **Caching**: Strategic caching for improved performance

## 🧪 Testing

```bash
# Run Django tests
python manage.py test

# Frontend testing (manual)
# - Cross-browser compatibility
# - Mobile responsiveness
# - Chart rendering
# - Form submission
```

## 📚 Documentation

- [API Documentation](docs/api-documentation.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Contributing Guidelines](docs/contributing.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- **Django Community** for the excellent web framework
- **Chart.js Team** for the powerful charting library
- **Vercel & Render** for reliable hosting platforms

## 📞 Support

For support and questions:
- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/feedback-platform/issues)
- 📖 Documentation: [Project Wiki](https://github.com/yourusername/feedback-platform/wiki)

---

**Built with ❤️ for modern businesses who value customer feedback**

---

# backend/feedback_platform/__init__.py
# This file makes Python treat the directory as a package

---

# backend/feedback/__init__.py
# This file makes Python treat the directory as a package
