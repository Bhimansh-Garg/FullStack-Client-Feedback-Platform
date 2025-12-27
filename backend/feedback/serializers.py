from rest_framework import serializers
from .models import Client, Feedback

class ClientSerializer(serializers.ModelSerializer):
    feedbacks_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Client
        fields = ['id', 'name', 'email', 'company', 'feedbacks_count', 'created_at']

class FeedbackSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    
    class Meta:
        model = Feedback
        fields = [
            'id', 'client', 'client_name', 'customer_name', 'customer_email',
            'rating', 'comment', 'sentiment', 'keywords', 'submitted_at', 'created_at'
        ]
        read_only_fields = ['sentiment', 'keywords', 'submitted_at']

class FeedbackCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating feedback from frontend"""
    
    class Meta:
        model = Feedback
        fields = ['client', 'customer_name', 'customer_email', 'rating', 'comment']
    
    def create(self, validated_data):
        # Add IP address and user agent from request if available
        request = self.context.get('request')
        if request:
            validated_data['ip_address'] = self.get_client_ip(request)
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        return super().create(validated_data)
    
    def get_client_ip(self, request):
        """Extract client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
