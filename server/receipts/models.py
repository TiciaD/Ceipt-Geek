from django.db import models
from django.contrib.auth.models import AbstractUser
from .choices import EXPENSE_OPTIONS
from cloudinary.models import CloudinaryField
from django.utils import timezone

from django.contrib.auth import get_user_model


class ExtendedUser(AbstractUser):
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "password"]


class Receipt(models.Model):
    store_name = models.CharField(
        max_length=255,
    )
    date = models.DateField()
    expense = models.CharField(max_length=80, choices=EXPENSE_OPTIONS)
    tax = models.DecimalField(
        max_digits=2,
        decimal_places=2,
    )
    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    # example of setting consistent image parameters
    # transformation={"width": 500, "height": 500, "crop": "fill"}
    receipt_image = CloudinaryField("image", blank=True, null=True)
    notes = models.TextField(
        null=True,
        blank=True,
    )

    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    tags = models.ManyToManyField("Tag")

    class meta:
        ordering = ["id"]

    def __str__(self):
        if self.store_name:
            return f"{self.store_name} - {self.date}"
        else:
            return f"{self.date}"

    def image_public_id(self):
        if self.receipt_image:
            # Return the public ID of the uploaded image
            return self.receipt_image.public_id

    def image_url(self):
        if self.receipt_image:
            # Generate a Cloudinary URL to the image
            return self.receipt_image.url


class Tag(models.Model):
    tag_name = models.CharField(max_length=255)

    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)

    class meta:
        ordering = ["tag_name"]

    def __str__(self):
        return self.tag_name


class PasswordRecovery(models.Model):
    token = models.TextField()
    expires_at = models.DateTimeField(
        default=timezone.now() + timezone.timedelta(hours=1)
    )
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
