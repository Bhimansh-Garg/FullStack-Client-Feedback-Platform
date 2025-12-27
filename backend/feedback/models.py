from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

class Client(models.Model):
    """Model representing a client/company that collects feedback"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    company = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.company})"

    class Meta:
        ordering = ['-created_at']

class Feedback(models.Model):
    """Model for storing customer feedback"""
    RATING_CHOICES = [
        (1, '1 Star - Very Poor'),
        (2, '2 Stars - Poor'),
        (3, '3 Stars - Average'),
        (4, '4 Stars - Good'),
        (5, '5 Stars - Excellent'),
    ]

    SENTIMENT_CHOICES = [
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='feedbacks')
    
    # Customer information
    customer_name = models.CharField(max_length=200, blank=True)
    customer_email = models.EmailField(blank=True)
    
    # Feedback content
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        choices=RATING_CHOICES
    )
    comment = models.TextField(blank=True)
    
    # Analysis results (computed automatically)
    sentiment = models.CharField(max_length=10, choices=SENTIMENT_CHOICES, blank=True)
    keywords = models.JSONField(default=list, blank=True)
    
    # Metadata
    submitted_at = models.DateTimeField(default=timezone.now)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.rating}⭐ - {self.customer_name or 'Anonymous'} ({self.client.name})"

    def save(self, *args, **kwargs):
        # Auto-analyze sentiment and keywords before saving
        if self.comment and not self.sentiment:
            self.analyze_feedback()
        super().save(*args, **kwargs)

    def analyze_feedback(self):
        """Simple sentiment analysis and keyword extraction"""
        from .utils import analyze_sentiment, extract_keywords
        
        if self.comment:
            self.sentiment = analyze_sentiment(self.comment, self.rating)
            self.keywords = extract_keywords(self.comment)

    class Meta:
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['client', '-submitted_at']),
            models.Index(fields=['rating']),
            models.Index(fields=['sentiment']),
        ]
