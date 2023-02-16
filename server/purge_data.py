import os
import django
from django.contrib.auth import get_user_model
from receipts.models import Receipt, Tag

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

User = get_user_model()


def purge_data():
    Receipt.objects.all().delete()
    Tag.objects.all().delete()
    User.objects.filter(
        username__in=['user1', 'user2', 'user3']).delete()
    print('Data purged successfully')
