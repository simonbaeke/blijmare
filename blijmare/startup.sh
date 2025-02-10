#!/bin/bash

# Wait for the database to be ready (optional but recommended)
echo "Waiting for the database to be ready..."
python manage.py wait_for_db

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Check if the superuser already exists
echo "Checking if superuser exists..."
if [ "$DJANGO_SUPERUSER_USERNAME" ]
then
    python manage.py shell -c "
import os
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username=os.environ.get('DJANGO_SUPERUSER_USERNAME')).exists():
    User.objects.create_superuser(
        os.environ.get('DJANGO_SUPERUSER_USERNAME'),
        os.environ.get('DJANGO_SUPERUSER_EMAIL'),
        os.environ.get('DJANGO_SUPERUSER_PASSWORD')
    )
    print('Superuser created.')
else:
    print('Superuser already exists.')
"
fi
