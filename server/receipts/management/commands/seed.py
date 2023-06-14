import imghdr
import random
import logging
import os
import cloudinary.uploader

from decimal import Decimal
from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.auth import get_user_model
from receipts.models import Receipt, Tag
from datetime import datetime, timedelta
from receipts.choices import EXPENSE_OPTIONS
from django.core.files.uploadedfile import SimpleUploadedFile

# provides data logging for the script. __name__ ties the logger to this specific
# script which is useful if there are multiple loggers in different locations.
logger = logging.getLogger(__name__)
# displays logging messages to the console at level debug and higher
logging.basicConfig(level=logging.DEBUG)

User = get_user_model()

# THIS SEED FILE GENERATES RANDOM DATA FOR THE RECEIPT APP
# To use this script, navigate to the root of the backend (server)
# and in the console run: python manage.py seed
# There are additional arguments you can pass in:
# --mode specifies the mode. By default, mode=refresh, which will delete all
# data from the database, then seed the database.
# --mode=clear will instead delete all data from the database without seeding data.
# --num_receipts specifies the number of receipts to be created.
# For example, --num_receipts=10 will seed the database with 10 receipts.
# By default --num_receipts=20.

""" Clear all data from the database then seeds data """
MODE_REFRESH = 'refresh'

""" Clear all data from the database without seeding data """
MODE_CLEAR = 'clear'


class Command(BaseCommand):
    help = "seed database with random data for testing and development."

    def add_arguments(self, parser):
        parser.add_argument('--mode', type=str, default='refresh', help="Mode")
        parser.add_argument('--num_receipts', type=int,
                            default=20, help='Number of receipts to generate')

    def handle(self, *args, **options):
        if settings.DEBUG:
            mode = options['mode']
            num_receipts = options['num_receipts']
            self.stdout.write('starting seed...')
            if mode == MODE_REFRESH:
                self.stdout.write('refreshing the database...')
            elif mode == MODE_CLEAR:
                self.stdout.write('clearing the database...')
            run_seed(self, mode, num_receipts)
            self.stdout.write('done.')
        
        else:
            self.stdout.write('seed script not functional during production.')


def clear_data():
    """Deletes all data from the database"""
    logger.info("Deleting all data from the database")

    receipts = Receipt.objects.all()
    for receipt in receipts:
        if receipt.receipt_image:
            public_id = receipt.image_public_id()
            cloudinary.uploader.destroy(public_id)
        receipt.delete()

    Tag.objects.all().delete()
    User.objects.all().delete()


def create_receipt():
    """Creates a receipts and tags"""

    # Define lists for generating random data
    tags = ['Green', 'Red', 'Blue', 'Yellow', 'Pink', 'White', 'Black',
            'Silver', 'Gray', 'Violet', 'Indigo', 'Maroon', 'Brown']
    notes = ['Lunch with friends', 'Birthday present',
             'Gas for car', 'Weekly groceries', 'Monthly Potluck', 'Insurance Payment', 'Mortgage', 'New Car', 'Work Clothes', 'Student Loans', 'Pet Care', 'Daycare']
    store_names = ['Walmart', 'Target', 'Whole Foods', 'Costco', 'Giant Tiger',
                   'Laser Tag', 'Volvo', 'Petco', 'Chapters', 'Babies R Us', 'Netflix']
    expense_options = EXPENSE_OPTIONS
    start_date = datetime(2022, 12, 1)

    # Get the three test users
    users = User.objects.filter(
        username__in=['user1', 'user2', 'user3'])

    # Generate random data
    store_name = random.choice(store_names)
    date = start_date + timedelta(days=random.randint(0, 365))
    expense = random.choice(expense_options)[0]
    note = random.choice(notes)
    user = random.choice(users)
    cost = Decimal(str(random.uniform(0, 100))).quantize(Decimal('0.01'))
    tax = Decimal(str(random.uniform(0, 0.99))).quantize(Decimal('0.01'))

    # Get random receipt image
    if os.path.exists('test_images'):
        img_name = random.choice(os.listdir('test_images'))
        with open(f'test_images/{img_name}', 'rb') as f:
            image_file = SimpleUploadedFile(f.name, f.read(), content_type='image/jpeg')

    # Create receipt
    receipt = Receipt.objects.create(
        store_name=store_name,
        date=date,
        expense=expense,
        cost=cost,
        tax=tax,
        notes=note,
        user=user,
        receipt_image=image_file
    )

    # Add tags to receipt
    for _ in range(random.randint(1, 3)):
        tag = Tag.objects.get_or_create(
            user=user,
            tag_name=random.choice(tags)
        )[0]
        receipt.tags.add(tag)

    logger.info("{} receipt created.".format(receipt))


def run_seed(self, mode, num_receipts):
    """
    Seed database based on mode

    :param mode: refresh / clear
    :return:
    """
    # Clear data from tables
    clear_data()
    if mode == MODE_CLEAR:
        return

    if settings.DEBUG:
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
    for i in range(num_receipts):
        create_receipt()
