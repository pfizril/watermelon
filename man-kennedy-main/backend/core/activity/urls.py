from django.urls import path
from . import views
from .views import BehaviorStatsView

urlpatterns = [
    path('', views.ActivityListCreateView.as_view(), name='activity-list-create'),
    path('<int:pk>/', views.ActivityDetailView.as_view(), name='activity-detail'),
    path('stats/', views.ActivityStatsView.as_view(), name='activity-stats'),
    path('behavior-stats/', BehaviorStatsView.as_view(), name='behavior-stats'),
] 