# API Documentation

## Base URL

- **Local Development**: `http://localhost:8000/api`
- **Production**: `https://your-app.onrender.com/api`

## Authentication

Currently, the API uses Django's default session authentication. All endpoints are publicly accessible for demo purposes.

## Clients

### List Clients
```http
GET /api/clients/
```

**Response:**
```json
[
  {
    "id": "uuid-string",
    "name": "Client Name",
    "email": "client@example.com",
    "company": "Company Name",
    "feedbacks_count": 10,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### Create Client
```http
POST /api/clients/
Content-Type: application/json

{
  "name": "New Client",
  "email": "newclient@example.com",
  "company": "New Company"
}
```

## Feedback

### List Feedback
```http
GET /api/feedback/
```

**Query Parameters:**
- `client`: Filter by client ID
- `rating`: Filter by rating (1-5)
- `sentiment`: Filter by sentiment (positive, neutral, negative)

### Submit Feedback
```http
POST /api/feedback/
Content-Type: application/json

{
  "client": "client-uuid",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "rating": 5,
  "comment": "Great service!"
}
```

## Analytics

### Get Dashboard Data
```http
GET /api/analytics/
```

### Get Client-Specific Analytics
```http
GET /api/analytics/{client_id}/
```

**Response:**
```json
{
  "total_count": 100,
  "average_rating": 4.2,
  "rating_distribution": [
    {"rating": 5, "count": 50},
    {"rating": 4, "count": 30}
  ],
  "sentiment_distribution": [
    {"sentiment": "positive", "count": 70},
    {"sentiment": "neutral", "count": 20},
    {"sentiment": "negative", "count": 10}
  ],
  "recent_feedback": [...],
  "top_keywords": [...]
}
```

## Export

### Export Feedback Data
```http
GET /api/export/
GET /api/export/{client_id}/
```

Returns JSON data for all feedback or client-specific feedback.
