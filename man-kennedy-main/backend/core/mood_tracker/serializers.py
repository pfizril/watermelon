from rest_framework import serializers
from .models import MoodEntry

class MoodEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodEntry
        fields = ['id', 'mood', 'note', 'created_at']
        read_only_fields = ['created_at'] 