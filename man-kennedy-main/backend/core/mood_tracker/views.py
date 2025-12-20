from rest_framework import generics, permissions
from django.db.models import Count
from .models import MoodEntry
from .serializers import MoodEntrySerializer

class MoodEntryListCreateView(generics.ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = MoodEntrySerializer

    def get_queryset(self):
        return MoodEntry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MoodEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = MoodEntrySerializer

    def get_queryset(self):
        return MoodEntry.objects.filter(user=self.request.user)

class MoodStatsView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = MoodEntrySerializer

    def get_queryset(self):
        return MoodEntry.objects.filter(user=self.request.user).values('mood').annotate(count=Count('mood')) 