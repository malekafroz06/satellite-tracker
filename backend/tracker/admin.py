from django.contrib import admin
from .models import Satellite, SatellitePosition, UserSatelliteSelection


@admin.register(Satellite)
class SatelliteAdmin(admin.ModelAdmin):
    list_display = ['name', 'satellite_id', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'satellite_id']


@admin.register(SatellitePosition)
class SatellitePositionAdmin(admin.ModelAdmin):
    list_display = ['satellite', 'user', 'timestamp', 'latitude', 'longitude', 'created_at']
    list_filter = ['satellite', 'user', 'timestamp']
    search_fields = ['satellite__name', 'user__username']
    date_hierarchy = 'timestamp'


@admin.register(UserSatelliteSelection)
class UserSatelliteSelectionAdmin(admin.ModelAdmin):
    list_display = ['user', 'satellite', 'is_active', 'selected_at']
    list_filter = ['is_active', 'satellite']
    search_fields = ['user__username', 'satellite__name']