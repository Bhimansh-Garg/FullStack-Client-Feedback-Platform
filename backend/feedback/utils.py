import re
import pandas as pd
import numpy as np
from typing import List, Dict, Any

def analyze_sentiment(comment: str, rating: int) -> str:
    """
    Simple sentiment analysis combining rating and keyword analysis
    
    Args:
        comment: The feedback comment text
        rating: The star rating (1-5)
    
    Returns:
        sentiment: 'positive', 'negative', or 'neutral'
    """
    # Define positive and negative keywords
    positive_keywords = [
        'excellent', 'amazing', 'great', 'fantastic', 'wonderful', 'perfect',
        'love', 'awesome', 'outstanding', 'brilliant', 'superb', 'impressed',
        'satisfied', 'happy', 'pleased', 'recommend', 'best', 'good'
    ]
    
    negative_keywords = [
        'terrible', 'awful', 'horrible', 'worst', 'bad', 'poor', 'disappointing',
        'frustrated', 'angry', 'hate', 'useless', 'waste', 'problem', 'issues',
        'slow', 'broken', 'difficult', 'confusing', 'expensive'
    ]
    
    # Clean and normalize comment
    comment_lower = comment.lower()
    words = re.findall(r'\b\w+\b', comment_lower)
    
    # Count positive and negative words
    positive_count = sum(1 for word in words if word in positive_keywords)
    negative_count = sum(1 for word in words if word in negative_keywords)
    
    # Sentiment logic combining rating and keyword analysis
    if rating >= 4 and positive_count > negative_count:
        return 'positive'
    elif rating <= 2 or negative_count > positive_count:
        return 'negative'
    else:
        return 'neutral'

def extract_keywords(comment: str, max_keywords: int = 10) -> List[str]:
    """
    Extract meaningful keywords from feedback comment
    
    Args:
        comment: The feedback comment text
        max_keywords: Maximum number of keywords to return
    
    Returns:
        List of extracted keywords
    """
    # Common stop words to filter out
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
        'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
        'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her',
        'its', 'our', 'their', 'very', 'really', 'quite', 'just', 'only'
    }
    
    # Clean text and extract words
    comment_lower = comment.lower()
    words = re.findall(r'\b[a-zA-Z]{3,}\b', comment_lower)  # Only words 3+ chars
    
    # Filter out stop words and count frequency
    meaningful_words = [word for word in words if word not in stop_words]
    
    # Count word frequency
    word_freq = {}
    for word in meaningful_words:
        word_freq[word] = word_freq.get(word, 0) + 1
    
    # Sort by frequency and return top keywords
    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    keywords = [word for word, freq in sorted_words[:max_keywords]]
    
    return keywords

def calculate_feedback_statistics(feedbacks_queryset) -> Dict[str, Any]:
    """
    Calculate comprehensive statistics from feedback data
    
    Args:
        feedbacks_queryset: Django QuerySet of Feedback objects
    
    Returns:
        Dictionary containing various statistics and insights
    """
    if not feedbacks_queryset.exists():
        return {
            'total_count': 0,
            'average_rating': 0,
            'rating_distribution': [],
            'sentiment_distribution': [],
            'recent_feedback': [],
            'top_keywords': [],
            'trends': {}
        }
    
    # Convert to pandas DataFrame for analysis
    data = list(feedbacks_queryset.values(
        'rating', 'sentiment', 'comment', 'keywords',
        'submitted_at', 'customer_name'
    ))
    df = pd.DataFrame(data)
    
    # Basic statistics
    total_count = len(df)
    average_rating = round(df['rating'].mean(), 2)
    
    # Rating distribution for charts
    rating_counts = df['rating'].value_counts().sort_index()
    rating_distribution = [
        {'rating': int(rating), 'count': int(count)}
        for rating, count in rating_counts.items()
    ]
    
    # Sentiment distribution
    sentiment_counts = df['sentiment'].value_counts()
    sentiment_distribution = [
        {'sentiment': sentiment, 'count': int(count)}
        for sentiment, count in sentiment_counts.items()
    ]
    
    # Recent feedback (last 10)
    recent_feedback = [
        {
            'rating': row['rating'],
            'comment': row['comment'][:100] + '...' if len(row['comment']) > 100 else row['comment'],
            'customer_name': row['customer_name'] or 'Anonymous',
            'submitted_at': row['submitted_at'].isoformat()
        }
        for _, row in df.head(10).iterrows()
    ]
    
    # Top keywords analysis
    all_keywords = []
    for keywords_list in df['keywords']:
        if keywords_list:
            all_keywords.extend(keywords_list)
    
    keyword_freq = {}
    for keyword in all_keywords:
        keyword_freq[keyword] = keyword_freq.get(keyword, 0) + 1
    
    top_keywords = [
        {'keyword': keyword, 'count': count}
        for keyword, count in sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)[:10]
    ]
    
    # Weekly trends (if enough data)
    trends = {}
    if len(df) > 7:
        df['week'] = pd.to_datetime(df['submitted_at']).dt.to_period('W')
        weekly_avg = df.groupby('week')['rating'].mean()
        trends['weekly_ratings'] = [
            {'week': str(week), 'average_rating': round(avg, 2)}
            for week, avg in weekly_avg.tail(8).items()
        ]
    
    return {
        'total_count': total_count,
        'average_rating': average_rating,
        'rating_distribution': rating_distribution,
        'sentiment_distribution': sentiment_distribution,
        'recent_feedback': recent_feedback,
        'top_keywords': top_keywords,
        'trends': trends
    }
