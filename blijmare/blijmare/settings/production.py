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
        default='postgresql://postgres:postgres@localhost:5432/mysite',
        conn_max_age=600
    )
}