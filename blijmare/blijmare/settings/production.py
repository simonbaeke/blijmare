import dj_database_url

from .base import *

DEBUG = False

try:
    from .local import *
except ImportError:
    pass

# Replace the SQLite DATABASES configuration with PostgreSQL:
DATABASES = {
    'default': dj_database_url.config(
        # Replace this value with your local database's connection string.
        default='postgresql://root:eJsFuQBFcKFzLbs8ZxPHHKIyLjRbq828@dpg-culr33jqf0us73di0m00-a/blijmaredb',
        conn_max_age=600
    )
}