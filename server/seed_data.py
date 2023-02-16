import os
import random
from datetime import datetime, timedelta
from django.core.files import File
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from receipts.models import Receipt, Tag
from receipts.choices import EXPENSE_OPTIONS


def create_seed_data(num_receipts=50):
    # Define lists for generating random data
    tags = ['Green', 'Red', 'Blue', 'Yellow', 'Pink', 'White', 'Black', 'Silver', 'Gray', 'Violet', 'Indigo', 'Maroon', 'Brown']
    notes = ['Lunch with friends', 'Birthday present',
             'Gas for car', 'Weekly groceries', 'Monthly Potluck', 'Insurance Payment', 'Mortgage', 'New Car', 'Work Clothes', 'Student Loans', 'Pet Care', 'Daycare']
    store_names = ['Walmart', 'Target', 'Whole Foods', 'Costco', 'Giant Tiget', 'Laser Tag', 'Volvo', 'Petco', 'Chapters', 'Babies R Us', 'Netflix']
    expense_options = EXPENSE_OPTIONS
    start_date = datetime(2022, 1, 1)

    # Create three test users
    User = get_user_model()
    for i in range(3):
        username = f'user{i+1}'
        email = f'{username}@email.com'
        password = 'Password123!'
        user = User.objects.create_user(username, email, password)

    # Get the three test users
    users = User.objects.filter(
        username__in=['user1', 'user2', 'user3'])

    # Loop to create receipts
    for i in range(num_receipts):
        # Generate random data
        tag = random.choice(tags)
        note = random.choice(notes)
        store_name = random.choice(store_names)
        expense = random.choice(expense_options)
        date = start_date + timedelta(days=random.randint(0, 364))
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

    print('Seed data created successfully')
