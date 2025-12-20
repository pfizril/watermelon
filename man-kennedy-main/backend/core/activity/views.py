from rest_framework import generics, permissions
from django.db.models import Sum
from .models import Activity
from .serializers import ActivitySerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class ActivityListCreateView(generics.ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ActivitySerializer

    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ActivityDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ActivitySerializer

    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user)

class ActivityStatsView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ActivitySerializer

    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user).values('activity_type').annotate(
            total_duration=Sum('end_time' - 'start_time')
        )

class BehaviorStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO: Replace with real calculations
        data = {
            'app_usage_hours': 5.2,
            'idle_time_minutes': 45,
            'screen_time_hours': 6.5,
            'burnout_detected': False,
            'suggestions': [
                'Take a 5-minute break every hour.',
                'Try a short breathing exercise.',
                'Review your task list and prioritize.'
            ]
        }
        return Response(data) 