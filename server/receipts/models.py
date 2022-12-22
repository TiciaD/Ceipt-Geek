from django.db import models
from django.conf import settings

class Receipt(models.Model):
    # 'auth.User', related_name='receipts'
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, blank=True, null=True)
    date = models.DateField()
    receiptImage = models.ImageField(upload_to='receipts')
    tags = models.ManyToManyField('Tag')

    class meta:
        ordering = ['title', 'date', 'tags']

    def __str__(self):
        return f'{self.title or ""} {self.date.strftime("%m/%d/%Y")}'


class Tag(models.Model):
    tagName = models.CharField(max_length=255)

    class meta:
        ordering = ['tagName']

    def __str__(self):
        return self.tagName