from rest_framework import serializers
from .models import Activity

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'activity_type', 'description', 'start_time', 'end_time', 'created_at']
        read_only_fields = ['created_at'] 