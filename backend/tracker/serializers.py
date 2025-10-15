from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Satellite, SatellitePosition, UserSatelliteSelection


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class SatelliteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Satellite
        fields = ['id', 'name', 'satellite_id', 'is_active']


class SatellitePositionSerializer(serializers.ModelSerializer):
    satellite_name = serializers.CharField(source='satellite.name', read_only=True)
    
    class Meta:
        model = SatellitePosition
        fields = ['id', 'satellite', 'satellite_name', 'timestamp', 'latitude', 
                  'longitude', 'altitude', 'velocity', 'created_at']
        read_only_fields = ['created_at']


class UserSatelliteSelectionSerializer(serializers.ModelSerializer):
    satellite_name = serializers.CharField(source='satellite.name', read_only=True)
    
    class Meta:
        model = UserSatelliteSelection
        fields = ['id', 'satellite', 'satellite_name', 'selected_at', 'is_active']
        read_only_fields = ['selected_at', 'is_active']
    
    def validate(self, data):
        user = self.context['request'].user
        satellite = data['satellite']
        
        active_selections = UserSatelliteSelection.objects.filter(
            user=user, is_active=True
        ).count()
        
        if active_selections >= 2:
            raise serializers.ValidationError(
                "You can only track 2 satellites at a time. Please deactivate one first."
            )
        
        if UserSatelliteSelection.objects.filter(
            user=user, satellite=satellite, is_active=True
        ).exists():
            raise serializers.ValidationError(
                "You are already tracking this satellite."
            )
        
        return data