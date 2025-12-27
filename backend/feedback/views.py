from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Count, Avg
from django.shortcuts import get_object_or_404

from .models import Client, Feedback
from .serializers import ClientSerializer, FeedbackSerializer, FeedbackCreateSerializer
from .utils import calculate_feedback_statistics

class ClientListCreateView(generics.ListCreateAPIView):
    """List all clients or create a new client"""
    serializer_class = ClientSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Client.objects.annotate(
            feedbacks_count=Count('feedbacks')
        ).order_by('-created_at')

class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a client"""
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.AllowAny]

class FeedbackListCreateView(generics.ListCreateAPIView):
    """List all feedback or create new feedback"""
    permission_classes = [permissions.AllowAny]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FeedbackCreateSerializer
        return FeedbackSerializer
    
    def get_queryset(self):
        queryset = Feedback.objects.select_related('client').order_by('-submitted_at')
        
        # Filter by client if specified
        client_id = self.request.query_params.get('client', None)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        # Filter by rating if specified
        rating = self.request.query_params.get('rating', None)
        if rating:
            queryset = queryset.filter(rating=rating)
        
        # Filter by sentiment if specified
        sentiment = self.request.query_params.get('sentiment', None)
        if sentiment:
            queryset = queryset.filter(sentiment=sentiment)
        
        return queryset

class FeedbackDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete feedback"""
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.AllowAny]

@api_view(['GET'])
def dashboard_analytics(request, client_id=None):
    """
    Get comprehensive analytics for dashboard
    
    URL: /api/analytics/ (all clients) or /api/analytics/{client_id}/ (specific client)
    """
    try:
        # Filter feedback by client if specified
        if client_id:
            client = get_object_or_404(Client, id=client_id)
            feedbacks = Feedback.objects.filter(client=client)
            context = {'client': client.name}
        else:
            feedbacks = Feedback.objects.all()
            context = {'client': 'All Clients'}
        
        # Calculate statistics using our utility function
        stats = calculate_feedback_statistics(feedbacks)
        stats.update(context)
        
        return Response(stats, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Error calculating analytics: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def export_feedback(request, client_id=None):
    """
    Export feedback data as JSON (can be extended to CSV/Excel)
    """
    try:
        # Filter by client if specified
        if client_id:
            client = get_object_or_404(Client, id=client_id)
            feedbacks = Feedback.objects.filter(client=client)
        else:
            feedbacks = Feedback.objects.all()
        
        # Serialize the data
        serializer = FeedbackSerializer(feedbacks, many=True)
        
        return Response({
            'data': serializer.data,
            'count': len(serializer.data),
            'exported_at': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Error exporting data: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
