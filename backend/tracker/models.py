from django.db import models
from django.contrib.auth.models import User

class Satellite(models.Model):
    name = models.CharField(max_length=100, unique=True)
    satellite_id = models.CharField(max_length=50, unique=True)
    api_url = models.URLField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']


class SatellitePosition(models.Model):
    satellite = models.ForeignKey(Satellite, on_delete=models.CASCADE, related_name='positions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tracked_positions')
    timestamp = models.DateTimeField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    altitude = models.FloatField(null=True, blank=True)
    velocity = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.satellite.name} - {self.timestamp}"
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'satellite', '-timestamp']),
        ]


class UserSatelliteSelection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='satellite_selections')
    satellite = models.ForeignKey(Satellite, on_delete=models.CASCADE)
    selected_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['user', 'satellite']
        ordering = ['selected_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.satellite.name}"