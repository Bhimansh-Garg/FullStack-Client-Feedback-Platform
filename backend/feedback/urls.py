from django.urls import path
from . import views

urlpatterns = [
    # Client endpoints
    path('clients/', views.ClientListCreateView.as_view(), name='client-list-create'),
    path('clients/<uuid:pk>/', views.ClientDetailView.as_view(), name='client-detail'),
    
    # Feedback endpoints
    path('feedback/', views.FeedbackListCreateView.as_view(), name='feedback-list-create'),
    path('feedback/<uuid:pk>/', views.FeedbackDetailView.as_view(), name='feedback-detail'),
    
    # Analytics endpoints
    path('analytics/', views.dashboard_analytics, name='dashboard-analytics'),
    path('analytics/<uuid:client_id>/', views.dashboard_analytics, name='client-analytics'),
    
    # Export endpoints
    path('export/', views.export_feedback, name='export-feedback'),
    path('export/<uuid:client_id>/', views.export_feedback, name='export-client-feedback'),
]
