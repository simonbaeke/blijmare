import dj_database_url

from .base import *

DEBUG = False

try:
    from .local import *
except ImportError:
    pass

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'your-app.onrender.com').split(',')


# Replace the SQLite DATABASES configuration with PostgreSQL:
DATABASES = {
    'default': dj_database_url.config(
        # Replace this value with your local database's connection string.
        default='postgresql://root:eJsFuQBFcKFzLbs8ZxPHHKIyLjRbq828@dpg-culr33jqf0us73di0m00-a/blijmaredb',
        conn_max_age=600
    )
}

SECRET_KEY = os.getenv('SECRET_KEY')

# Static files (make sure you run `collectstatic` before deployment)
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'

# Media files
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True