from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.conf import settings
from .satellite_service import fetch_and_save_satellite_positions, cleanup_old_positions


def start_scheduler():
    """
    Start the APScheduler to run satellite data fetching tasks
    """
    scheduler = BackgroundScheduler()
    
    # Fetch satellite positions every minute at the start of the minute
    scheduler.add_job(
        fetch_and_save_satellite_positions,
        trigger=CronTrigger(second=0),  # Run at the start of every minute
        id='fetch_satellite_positions',
        name='Fetch satellite positions every minute',
        replace_existing=True,
    )
    
    # Clean up old positions daily at midnight
    scheduler.add_job(
        cleanup_old_positions,
        trigger=CronTrigger(hour=0, minute=0),
        id='cleanup_old_positions',
        name='Clean up old satellite positions daily',
        replace_existing=True,
    )
    
    scheduler.start()
    print("Scheduler started successfully!")
    
    return scheduler