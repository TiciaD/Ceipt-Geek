from rest_framework import serializers

from .models import Receipt, Tag
from django.contrib.auth.models import User
from .choices import EXPENSE_OPTIONS

from django.contrib.auth import password_validation
from django.contrib.auth.hashers import make_password
from rest_framework.validators import UniqueValidator


class TagSerializer(serializers.ModelSerializer):
    receipts = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ('id', 'tag_name', 'receipts')

    def get_receipts(self, obj):
        return [receipt.pk for receipt in obj.receipt_set.all()]


class ManyToManyListField(serializers.ListField):
    def to_representation(self, value):
        # Convert the ManyToMany field to a list of tag names
        return [tag.tag_name for tag in value.all()]

    def to_internal_value(self, data):
        # Convert the list of tag names to a ManyToMany field
        tags = []
        for tag_name in data:
            tag, created = Tag.objects.get_or_create(tag_name=tag_name)
            tags.append(tag)
        return tags


class ReceiptSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    store_name = serializers.CharField(required=False)
    expense = serializers.ChoiceField(choices=EXPENSE_OPTIONS)
    tax = serializers.DecimalField(
        max_digits=2,
        decimal_places=2,
        min_value=0,
        max_value=1,
        required=False
    )
    cost = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0,
        max_value=999999999,
        required=False
    )
    receipt_image = serializers.ImageField(required=False)
    notes = serializers.CharField(required=False)
    tags = ManyToManyListField(required=False)

    class Meta:
        model = Receipt
        fields = [
            'id', 
            'user', 
            'store_name', 
            'date',
            'expense', 
            'tax',  
            'cost', 
            'receipt_image', 
            'notes',
            'tags'
        ]


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        help_text=password_validation.password_validators_help_text_html()
    )
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    receipts = ReceiptSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'receipts']

    def validate_password(self, password):
        password_validation.validate_password(password)

        return make_password(password)


class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        help_text=password_validation.password_validators_help_text_html()
    )
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def validate_password(self, password):
        password_validation.validate_password(password)

        return make_password(password)
