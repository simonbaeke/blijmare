import dj_database_url

from .base import *

DEBUG = True

try:
    from .local import *
except ImportError:
    pass

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'blijmare.onrender.com').split(',')
SECRET_KEY = "django-insecure-u(+#a0f5rnv4=np@uwnl0tkn22!ahkq7x@i63z7^eg6cs=q28("


# Replace the SQLite DATABASES configuration with PostgreSQL:
DATABASES = {
    'default': dj_database_url.config(
        # Replace this value with your local database's connection string.
        default='postgresql://root:eJsFuQBFcKFzLbs8ZxPHHKIyLjRbq828@dpg-culr33jqf0us73di0m00-a/blijmaredb',
        conn_max_age=600
    )
}



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