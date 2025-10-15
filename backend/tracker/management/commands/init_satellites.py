from django.core.management.base import BaseCommand
from tracker.models import Satellite


class Command(BaseCommand):
    help = 'Initialize satellite database with ISS and Hubble Space Telescope'

    def handle(self, *args, **kwargs):
        satellites = [
            {
                'name': 'ISS (International Space Station)',
                'satellite_id': '25544',
                'api_url': 'https://api.wheretheiss.at/v1/satellites/25544',
            },
            {
                'name': 'Hubble Space Telescope',
                'satellite_id': '20580',
                'api_url': 'https://api.satellitemap.space/v1/20580/position',
            },
        ]
        