from django.core.management.base import BaseCommand
import random
import logging
import os

from django.contrib.auth import get_user_model
from receipts.models import Receipt, Tag
from datetime import datetime, timedelta
from django.core.files import File
from receipts.choices import EXPENSE_OPTIONS

# provides data logging for the script. __name__ ties the logger to this specific
# script which is useful if there are multiple loggers in different locations.
logger = logging.getLogger(__name__)

User = get_user_model()

# python manage.py seed --mode=refresh

""" Clear all data from the database then seeds data """
MODE_REFRESH = 'refresh'

""" Clear all data from the database without seeding data """
MODE_CLEAR = 'clear'


class Command(BaseCommand):
    help = "seed database with random data for testing and development."

    def add_arguments(self, parser):
        parser.add_argument('--mode', type=str, help="Mode")

    def handle(self, *args, **options):
        mode = options['mode']
        self.stdout.write('starting seed...')
        if mode == MODE_REFRESH:
            self.stdout.write('refreshing the database...')
        elif mode == MODE_CLEAR:
            self.stdout.write('clearing the database...')
        run_seed(self, mode)
        self.stdout.write('done.')


def clear_data():
    """Deletes all data from the database"""
    logger.info("Deleting all data from the database")
    Receipt.objects.all().delete()
    Tag.objects.all().delete()
    User.objects.all().delete()


def create_receipt():
    """Creates a receipts and tags"""

    # Define lists for generating random data
    tags = ['Green', 'Red', 'Blue', 'Yellow', 'Pink', 'White', 'Black',
            'Silver', 'Gray', 'Violet', 'Indigo', 'Maroon', 'Brown']
    notes = ['Lunch with friends', 'Birthday present',
             'Gas for car', 'Weekly groceries', 'Monthly Potluck', 'Insurance Payment', 'Mortgage', 'New Car', 'Work Clothes', 'Student Loans', 'Pet Care', 'Daycare']
    store_names = ['Walmart', 'Target', 'Whole Foods', 'Costco', 'Giant Tiget',
                   'Laser Tag', 'Volvo', 'Petco', 'Chapters', 'Babies R Us', 'Netflix']
    expense_options = EXPENSE_OPTIONS
    start_date = datetime(2022, 1, 1)

    # Get the three test users
    users = User.objects.filter(
        username__in=['user1', 'user2', 'user3'])

    # Generate random data
    store_name = random.choice(store_names)
    date = start_date + timedelta(days=random.randint(0, 364))
    expense = random.choice(expense_options)
    note = random.choice(notes)
    user = random.choice(users)

    # Create receipt
    receipt = Receipt.objects.create(
        store_name=store_name,
        date=date,
        expense=expense,
        cost=random.uniform(0, 100),
        tax=random.uniform(0, 10),
        notes=note,
        user=user
    )

    # Add tags to receipt
    for _ in range(random.randint(1, 3)):
        tag = Tag.objects.get_or_create(
            tag_name=random.choice(tags)
        )[0]
        receipt.tags.add(tag)

    # Add receipt image
    if os.path.exists('test_images'):
        img_name = random.choice(os.listdir('test_images'))
        with open(f'test_images/{img_name}', 'rb') as f:
            receipt.receipt_image.save(img_name, File(f), save=True)

    logger.info("{} receipt created.".format(receipt))


def run_seed(self, mode):
    """
    Seed database based on mode

    :param mode: refresh / clear 
    :return:
    """
    # Clear data from tables
    clear_data()
    if mode == MODE_CLEAR:
        return

    # Create a superuser
    logger.info("Creating superuser...")
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@email.com',
        password='password'
    )
    logger.info("{} superuser created.".format(admin))

    # Create test users
    logger.info('creating users...')
    for i in range(3):
        username = f'user{i+1}'
        email = f'{username}@email.com'
        password = 'Password123!'
        test_user = User.objects.create_user(username, email, password)
        logger.info("{} user created.".format(test_user))

    # Seed data
    logger.info('creating receipts...')
    for i in range(50):
        create_receipt()
