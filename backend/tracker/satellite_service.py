import ray
import requests
from datetime import datetime
from django.utils import timezone
from .models import Satellite, SatellitePosition, UserSatelliteSelection


# Initialize Ray
if not ray.is_initialized():
    ray.init(ignore_reinit_error=True)


@ray.remote
def fetch_satellite_data(satellite_id, api_url):
    """
    Ray remote function to fetch satellite data from API
    """
    try:
        response = requests.get(api_url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Parse different API response formats
        if 'iss_position' in data:  # open-notify.org format
            return {
                'satellite_id': satellite_id,
                'latitude': float(data['iss_position']['latitude']),
                'longitude': float(data['iss_position']['longitude']),
                'timestamp': datetime.fromtimestamp(int(data['timestamp'])),
                'altitude': None,
                'velocity': None,
                'success': True
            }
        elif 'latitude' in data:  # wheretheiss.at format
            return {
                'satellite_id': satellite_id,
                'latitude': float(data['latitude']),
                'longitude': float(data['longitude']),
                'timestamp': datetime.fromtimestamp(int(data['timestamp'])),
                'altitude': float(data.get('altitude', 0)),
                'velocity': float(data.get('velocity', 0)),
                'success': True
            }
        elif 'lat' in data:  # satellitemap.space format
            return {
                'satellite_id': satellite_id,
                'latitude': float(data['lat']),
                'longitude': float(data['lon']),
                'timestamp': datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00')),
                'altitude': float(data.get('alt', 0)),
                'velocity': None,
                'success': True
            }
        else:
            return {
                'satellite_id': satellite_id,
                'success': False,
                'error': 'Unknown API response format'
            }
            
    except requests.exceptions.RequestException as e:
        return {
            'satellite_id': satellite_id,
            'success': False,
            'error': str(e)
        }
    except Exception as e:
        return {
            'satellite_id': satellite_id,
            'success': False,
            'error': str(e)
        }


def fetch_and_save_satellite_positions():
    """
    Main function to fetch satellite positions for all users with active selections
    Uses Ray to parallelize API calls
    """
    print(f"[{timezone.now()}] Starting satellite position fetch...")
    
    # Get all active satellite selections
    active_selections = UserSatelliteSelection.objects.filter(is_active=True).select_related('user', 'satellite')
    
    if not active_selections.exists():
        print("No active satellite selections found.")
        return
    
    # Group by satellite to avoid duplicate API calls
    satellite_users = {}
    for selection in active_selections:
        sat_id = selection.satellite.id
        if sat_id not in satellite_users:
            satellite_users[sat_id] = {
                'satellite': selection.satellite,
                'users': []
            }
        satellite_users[sat_id]['users'].append(selection.user)
    
    # Fetch data for all satellites in parallel using Ray
    ray_tasks = []
    for sat_data in satellite_users.values():
        satellite = sat_data['satellite']
        task = fetch_satellite_data.remote(satellite.id, satellite.api_url)
        ray_tasks.append((task, sat_data))
    
    # Wait for all tasks to complete
    results = []
    for task, sat_data in ray_tasks:
        try:
            result = ray.get(task, timeout=15)
            results.append((result, sat_data))
        except Exception as e:
            print(f"Error getting result for satellite {sat_data['satellite'].name}: {e}")
    
    # Save results to database
    positions_to_create = []
    for result, sat_data in results:
        if result.get('success'):
            satellite = sat_data['satellite']
            users = sat_data['users']
            
            # Create position records for all users tracking this satellite
            for user in users:
                position = SatellitePosition(
                    satellite=satellite,
                    user=user,
                    timestamp=timezone.make_aware(result['timestamp']) if timezone.is_naive(result['timestamp']) else result['timestamp'],
                    latitude=result['latitude'],
                    longitude=result['longitude'],
                    altitude=result.get('altitude'),
                    velocity=result.get('velocity')
                )
                positions_to_create.append(position)
        else:
            print(f"Failed to fetch data for satellite {sat_data['satellite'].name}: {result.get('error')}")
    
    # Bulk create all positions
    if positions_to_create:
        SatellitePosition.objects.bulk_create(positions_to_create)
        print(f"Successfully saved {len(positions_to_create)} position records.")
    else:
        print("No position data to save.")


def cleanup_old_positions(days=7):
    """
    Clean up old satellite position data
    """
    from datetime import timedelta
    cutoff_date = timezone.now() - timedelta(days=days)
    deleted_count = SatellitePosition.objects.filter(created_at__lt=cutoff_date).delete()[0]
    if deleted_count > 0:
        print(f"Cleaned up {deleted_count} old position records.")