from django.apps import AppConfig
import sys


class TrackerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tracker'
    
    def ready(self):
        # Only start scheduler in the main process, not in migration or other commands
        if 'runserver' in sys.argv and not any(
            x in sys.argv for x in ['makemigrations', 'migrate', 'collectstatic']
        ):
            from .scheduler import start_scheduler
            start_scheduler()