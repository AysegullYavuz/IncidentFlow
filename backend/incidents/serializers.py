from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Incident

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class IncidentSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.ReadOnlyField(source='assigned_to.username')

    class Meta:
        model = Incident
        fields = [
            'id',
            'title',
            'description',
            'status',
            'priority',
            'assigned_to',
            'assigned_to_username',
            'created_at',
            'updated_at',
        ]