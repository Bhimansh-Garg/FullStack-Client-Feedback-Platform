from django.contrib import admin
from .models import Client, Feedback

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'email', 'created_at']
    list_filter = ['created_at', 'company']
    search_fields = ['name', 'email', 'company']
    readonly_fields = ['id', 'created_at', 'updated_at']

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['customer_name', 'client', 'rating', 'sentiment', 'submitted_at']
    list_filter = ['rating', 'sentiment', 'submitted_at', 'client']
    search_fields = ['customer_name', 'customer_email', 'comment']
    readonly_fields = ['id', 'sentiment', 'keywords', 'created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('client')
