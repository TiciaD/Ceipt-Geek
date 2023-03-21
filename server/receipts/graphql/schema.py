from ..models import Receipt, Tag
from django.contrib.auth import get_user_model
from django.db.models import QuerySet
from django.db.models import Q

import graphene
from graphql import GraphQLError
from graphene_file_upload.scalars import Upload
from graphene_django.types import DjangoObjectType, ObjectType
from graphene_django.converter import convert_django_field

import cloudinary.uploader
from cloudinary.models import CloudinaryField

import jwt as pyjwt
from .decorators import login_required, is_receipt_owner_or_superuser
from django.contrib.auth import login
from django.contrib.auth import logout
from django.conf import settings
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

import re
from datetime import datetime, timedelta
from django.utils.crypto import get_random_string
from django.db.models import Sum
from decimal import Decimal


# Auth Schema

class LoginMutation(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    success = graphene.Boolean()
    token = graphene.String()

    def mutate(self, info, email, password):
        
        def authenticate(email, password):
            user = get_user_model().objects.get(email=email)
            if user.check_password(password):
                return user
            return None

        user = authenticate(email=email, password=password)

        if user is not None and user.is_active:
            # Login the user to create a session
            login(info.context, user)
            # Generate JWT token
            token = pyjwt.encode({
                'user_id': str(user.id),
                'exp': datetime.utcnow() + timedelta(days=1)  # Token expires in 1 day
            }, settings.GRAPHQL_JWT["JWT_SECRET_KEY"], algorithm='HS256')

            return LoginMutation(success=True, token=token)
        else:
            return LoginMutation(success=False, token=None)


class LogoutMutation(graphene.Mutation):
    success = graphene.Boolean()

    def mutate(self, info, **kwargs):
        # Get the user from the request
        user = info.context.user

        if user.is_authenticated:
            # If the user is authenticated, delete the session cookie and log them out
            logout(info.context)
            return LogoutMutation(success=True)
        else:
            # If the user is not authenticated, there's nothing to do
            return LogoutMutation(success=False)


# User Schema


User = get_user_model()


class UserType(DjangoObjectType):
    class Meta:
        model = User
        exclude = ('password',)


class UserQuery(graphene.ObjectType):
    user = graphene.Field(
        UserType,
        id=graphene.Int(),
        email=graphene.String()
    )
    all_users = graphene.List(UserType)

    def resolve_user(self, info, **kwargs):
        id = kwargs.get('id')
        email = kwargs.get('email')

        if id is None and email is None:
            raise GraphQLError(
                'Please enter a user id and/or email to query by.')

        user = User.objects.filter(**kwargs).first()
        if user:
            return user
        elif id and email:
            raise GraphQLError(
                f"No user found with id: {id} and email: {email}"
            )
        elif id:
            raise GraphQLError(f"No user found with id: {id}")
        else:
            raise GraphQLError(f"No user found with email: {email}")

    def resolve_all_users(self, info, **kwargs):
        users = User.objects.all()
        if not users.exists():
            raise GraphQLError('No users found.')
        return users


class CreateUser(graphene.Mutation):
    user = graphene.Field(lambda: UserType)

    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        email = graphene.String(required=True)

    @staticmethod
    def validate_username(string):
        if not re.match(r'^[\w.@+-]+$', string):
            raise ValidationError(
                'Enter a valid username. Username may contain only letters, numbers, and @/./+/-/_ characters.'
            )
        if len(string) < 2:
            raise ValidationError(
                'Username must be at least 3 characters long.'
            )
        if len(string) > 20:
            raise ValidationError(
                'Username cannot be more than 30 characters long.'
            )

    def mutate(self, info, username, password, email):
        if User.objects.filter(username=username).exists():
            raise GraphQLError('Username already taken')
        if User.objects.filter(email=email).exists():
            raise GraphQLError('Email already taken')

        try:
            CreateUser.validate_username(username)
            validate_password(password)
            validate_email(email)
        except Exception as e:
            return GraphQLError(e)

        user = User(
            username=username,
            email=email,
        )

        try:
            user.set_password(password)
            user.save()
        except Exception as e:
            raise GraphQLError(e)

        return CreateUser(user=user)


class UpdateUser(graphene.Mutation):
    user = graphene.Field(lambda: UserType)

    class Arguments:
        id = graphene.Int(required=True)
        username = graphene.String()
        password = graphene.String()
        email = graphene.String()

    @staticmethod
    def validate_username(string):
        if not re.match(r'^[\w.@+-]+$', string):
            raise ValidationError(
                'Enter a valid username. Username may contain only letters, numbers, and @/./+/-/_ characters.'
            )
        if len(string) < 2:
            raise ValidationError(
                'Username must be at least 3 characters long.'
            )
        if len(string) > 20:
            raise ValidationError(
                'Username cannot be more than 30 characters long.'
            )

    def mutate(self, info, id, username=None, password=None, email=None):
        try:
            user = User.objects.get(pk=id)
        except User.DoesNotExist:
            raise GraphQLError(f'User with id: {id} does not exist.')

        if username and User.objects.filter(username=username).exclude(pk=id).exists():
            raise GraphQLError('Username already taken')
        if email and User.objects.filter(email=email).exclude(pk=id).exists():
            raise GraphQLError('Email already taken')

        if email:
            try:
                validate_email(email)
            except Exception as e:
                raise GraphQLError(e)
      
        if username:
            try:
                UpdateUser.validate_username(username)
            except Exception as e:
                raise GraphQLError(e)
            
        if password:
            try:
                validate_password(password)
            except Exception as e:
                raise GraphQLError(e)

        if username:
            user.username = username
        if password:
            user.set_password(password)
        if email:
            user.email = email

        try:
            user.save()
        except Exception as e:
            raise GraphQLError(e)

        return UpdateUser(user=user)


class DeleteUser(graphene.Mutation):
    success = graphene.Boolean()

    class Arguments:
        id = graphene.ID(required=True)

    def mutate(root, info, id):
        try:
            user = User.objects.get(pk=id)
            receipts = Receipt.objects.filter(user=user)
            for receipt in receipts:
                if receipt.receipt_image:
                    public_id = receipt.image_public_id()
                    cloudinary.uploader.destroy(public_id)
            user.delete()
            return DeleteUser(success=True)
        except User.DoesNotExist:
            raise GraphQLError(f'User with id: {id} does not exist.')


# Receipt Schema


# Register a custom converter for CloudinaryField
@convert_django_field.register(CloudinaryField)
def convert_field_to_string(field, registry=None):
    """
    Converter for CloudinaryField to be used by Graphene.
    """
    return graphene.String()


# Custom graphene scalar that allows both string and number decimal inputs and outputs decimals as numbers
class DecimalType(graphene.Scalar):
    @staticmethod
    def serialize(decimal):
        return float(decimal)

    @staticmethod
    def parse_literal(node):
        return Decimal(node.value)

    @staticmethod
    def parse_value(value):
        return Decimal(value)


class ReceiptType(DjangoObjectType):
    cost = DecimalType()
    tax = DecimalType()

    class Meta:
        fields = "__all__"
        model = Receipt

    def resolve_receipt_image(self, info):
        if self.receipt_image:
            self.receipt_image = self.image_url()
        return self.receipt_image


class ReceiptQuery(ObjectType):
    receipt = graphene.Field(
        ReceiptType, 
        id=graphene.ID(required=True)
    )
    all_receipts = graphene.List(
        ReceiptType
    )
    all_receipts_by_user = graphene.List(
        ReceiptType,
        user_id=graphene.ID(required=True),
    )
    filtered_receipts = graphene.List(
        ReceiptType,
        user_id=graphene.ID(),
        store_name=graphene.String(),
        expense=graphene.String(),
        date_gte=graphene.Date(),
        date_lte=graphene.Date(),
        cost_gte=DecimalType(),
        cost_lte=DecimalType(),
        tax_gte=DecimalType(),
        tax_lte=DecimalType(),
        notes=graphene.String(),
        tags_contains_any=graphene.List(graphene.String),
        tags_contains_all=graphene.List(graphene.String),
    )
    total_expenditure_by_date = graphene.Float(
        user_id = graphene.ID(required=True), 
        date_gte=graphene.Date(required=True),
        date_lte=graphene.Date(required=True),
    )

    def resolve_receipt(self, info, id):
        try:
            return Receipt.objects.get(pk=id)
        except Receipt.DoesNotExist:
            raise GraphQLError(f'No receipt with id: {id} found.')

    def resolve_all_receipts(self, info, **kwargs):
        receipts = Receipt.objects.all()
        if not receipts.exists():
            raise GraphQLError('No receipts found.')
        return receipts

    def resolve_all_receipts_by_user(self, info, user_id):
        try:
            user = get_user_model().objects.get(pk=user_id)
        except get_user_model().DoesNotExist:
            raise GraphQLError(
                f'No user with user id: {user_id} found. Could not query for receipts belonging to a user that does not exist.'
            )

        receipts = Receipt.objects.filter(user=user)
        if not receipts.exists():
            raise GraphQLError(
                f'No receipts found for user with user id: {user_id}.'
            )
        return receipts

    @staticmethod
    def filter_queryset(qs: QuerySet, condition) -> QuerySet:
        filtered_qs = qs.filter(**condition)
        if not filtered_qs.exists():
            raise GraphQLError('No receipts found matching filtered fields.')

        return filtered_qs

    def resolve_filtered_receipts(self, info, **kwargs):
        if not kwargs:
            raise GraphQLError(
                'Please provide at least one field to filter by. Fields include: userId, storeName, expense, dateGte, dateLte, costGte, costLte, notes, and tags')

        queryset = Receipt.objects.all()
        if not queryset.exists():
            raise GraphQLError('No receipts found in the database.')

        user_id = kwargs.get('user_id')
        store_name = kwargs.get('store_name')
        expense = kwargs.get('expense')
        date_gte = kwargs.get('date_gte')
        date_lte = kwargs.get('date_lte')
        cost_gte = kwargs.get('cost_gte')
        cost_lte = kwargs.get('cost_lte')
        tax_gte = kwargs.get('tax_gte')
        tax_lte = kwargs.get('tax_lte')
        notes = kwargs.get('notes')
        tags_contains_any = kwargs.get('tags_contains_any')
        tags_contains_all = kwargs.get('tags_contains_all')

        if user_id:
            try:
                user = get_user_model().objects.get(pk=user_id)
                queryset = queryset.filter(user=user)
            except get_user_model().DoesNotExist:
                raise GraphQLError(
                    f"No user found with id {user_id}. Could not filter receipts belonging to a user that does not exist.")

        if store_name:
            store_name = store_name.strip()
            queryset = Query.filter_queryset(
                queryset,
                {'store_name__icontains': store_name},
            )

        if expense:
            expense = expense.strip()
            queryset = Query.filter_queryset(
                queryset,
                {'expense': expense},
            )

        if date_gte:
            queryset = Query.filter_queryset(
                queryset,
                {'date__gte': date_gte},
            )

        if date_lte:
            queryset = Query.filter_queryset(
                queryset,
                {'date__lte': date_lte},
            )

        if cost_gte:
            queryset = Query.filter_queryset(
                queryset,
                {'cost__gte': cost_gte},
            )

        if cost_lte:
            queryset = Query.filter_queryset(
                queryset,
                {'cost__lte': cost_lte},
            )

        if tax_gte:
            queryset = Query.filter_queryset(
                queryset,
                {'tax__gte': tax_gte},
            )

        if tax_lte:
            queryset = Query.filter_queryset(
                queryset,
                {'tax__lte': tax_lte},
            )

        if notes:
            notes = notes.strip()
            queryset = Query.filter_queryset(
                queryset,
                {'notes__icontains': notes},
            )

            # notes = [note.strip() for note in notes.split(',')]
            # q_objects = Q()
            # for note in notes:
            #     q_objects |= Q(notes__icontains=note)
            # queryset = queryset.filter(q_objects).distinct()
            # if not queryset.exists():
            #     raise GraphQLError(
            #         'No receipts found matching filtered fields.'
            #     )

        if tags_contains_any:
            tags = [tag.strip() for tag in tags_contains_any]
            q_objects = Q()
            for tag in tags:
                q_objects |= Q(tags__tag_name__icontains=tag)
            queryset = queryset.filter(q_objects).distinct()
            if not queryset.exists():
                raise GraphQLError(
                    'No receipts found matching filtered fields.'
                )

        if tags_contains_all:
            tags = [tag.strip() for tag in tags_contains_all]
            for tag in tags:
                queryset = queryset.filter(tags__tag_name__icontains=tag)
            if not queryset.exists():
                raise GraphQLError(
                    'No receipts found matching filtered fields.'
                )

        return queryset

    def resolve_total_expenditure_by_date(self, info, user_id, date_gte, date_lte):
        try:
            user = get_user_model().objects.get(pk=user_id)
        except User.DoesNotExist:
            raise GraphQLError(f'No user with id: {user_id} found.')
        
        receipts = Receipt.objects.filter(
            user = user,
            date__gte = date_gte,
            date__lte = date_lte,
        )
        if not receipts.exists():
            raise GraphQLError('No receipts found for given date range.')

        total_cost = receipts.aggregate(Sum('cost'))['cost__sum'] or Decimal('0')

        return round(total_cost, 2)


class ReceiptInput(graphene.InputObjectType):
    store_name = graphene.String(required=True)
    date = graphene.Date(required=True)
    expense = graphene.String(required=True)
    tax = DecimalType(required=True)
    cost = DecimalType(required=True)
    notes = graphene.String(required=False)
    tags = graphene.List(graphene.String, required=False)
    receipt_image = Upload(required=False)


class CreateReceipt(graphene.Mutation):
    class Arguments:
            receipt_data = ReceiptInput(required=True)

    receipt = graphene.Field(ReceiptType)

    @login_required
    def mutate(root, info, **kwargs):
        user_id = kwargs.get('user_id')
        receipt_data = kwargs.get('receipt_data')

        try:
            user = get_user_model().objects.get(pk=user_id)
        except get_user_model().DoesNotExist:
            raise GraphQLError(
                f'User with id: {user_id} does not exist. Could not create receipt for user that does not exist.'
            )

        receipt_instance = Receipt(
            user=user,
            store_name=receipt_data.store_name,
            date=receipt_data.date,
            expense=receipt_data.expense,
            tax=receipt_data.tax,
            cost=receipt_data.cost,
            notes=receipt_data.notes,
            receipt_image=receipt_data.receipt_image,
        )

        try:
            receipt_instance.save()
            if receipt_data.tags:
                input_tags = [tag.strip() for tag in receipt_data.tags]
                for input_tag in input_tags:
                    tag = Tag.objects.get_or_create(
                        tag_name=input_tag
                    )[0]
                    receipt_instance.tags.add(tag)
        except Exception as e:
            raise GraphQLError(e)
        return CreateReceipt(receipt=receipt_instance)


class UpdateReceipt(graphene.Mutation):
    class Arguments:
        receipt_id = graphene.ID(required=True)
        receipt_data = ReceiptInput(required=True)

    receipt = graphene.Field(ReceiptType)

    @login_required
    @is_receipt_owner_or_superuser
    def mutate(root, info, **kwargs):
        receipt_instance = kwargs.get('receipt_instance')
        receipt_data = kwargs.get('receipt_data')

        receipt_instance.store_name = receipt_data.store_name
        receipt_instance.date = receipt_data.date
        receipt_instance.expense = receipt_data.expense
        receipt_instance.tax = receipt_data.tax
        receipt_instance.cost = receipt_data.cost
        receipt_instance.notes = receipt_data.notes
        if receipt_data.receipt_image:
            if receipt_instance.receipt_image:
                public_id = receipt_instance.image_public_id()
                cloudinary.uploader.destroy(public_id)
            receipt_instance.receipt_image = receipt_data.receipt_image
        try:
            tag_ids = []
            if receipt_data.tags:
                tags = [tag.strip() for tag in receipt_data.tags]
                for tag in tags:
                    tag_id = Tag.objects.get_or_create(tag_name=tag)[0]
                    tag_ids.append(tag_id)
            receipt_instance.tags.set(tag_ids)
            receipt_instance.save()
        except Exception as e:
            raise GraphQLError(e)
        return UpdateReceipt(receipt=receipt_instance)


class DeleteReceipt(graphene.Mutation):
    class Arguments:
        receipt_id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(root, info, receipt_id):
        try:
            receipt = Receipt.objects.get(pk=receipt_id)
            if receipt.receipt_image:
                public_id = receipt.image_public_id()
                cloudinary.uploader.destroy(public_id)
            receipt.delete()
            return DeleteReceipt(success=True)
        except Receipt.DoesNotExist:
            raise GraphQLError(
                f'Receipt with id: {receipt_id} does not exist.'
            )


# Tag Schema

class TagType(DjangoObjectType):
    class Meta:
        fields = "__all__"
        model = Tag


class TagQuery(ObjectType):
    tag = graphene.Field(TagType, id=graphene.ID(required=True))
    all_tags = graphene.List(TagType)

    def resolve_tag(self, info, id):
        try:
            return Tag.objects.get(pk=id)
        except Tag.DoesNotExist:
            raise GraphQLError(f'Tag with id: {id} not found.')

    def resolve_all_tags(self, info, **kwargs):
        tags = Tag.objects.all()
        if not tags.exists():
            raise GraphQLError('No tags found.')
        return tags


class CreateTag(graphene.Mutation):
    class Arguments:
        tag_name = graphene.String(required=True)

    tag = graphene.Field(TagType)

    def mutate(root, info, tag_name):
        tag_instance = Tag(
            tag_name
        )
        try:
            tag_instance.save()
        except Exception as e:
            raise GraphQLError(e)
        return CreateTag(tag=tag_instance)


class UpdateTag(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        tag_name = graphene.ID(required=True)

    tag = graphene.Field(TagType)

    def mutate(root, info, id, tag_name):
        try:
            tag_instance = Tag.objects.get(pk=id)
        except Tag.DoesNotExist:
            raise GraphQLError(f'Tag with id: {id} does not exist')

        tag_instance.tag_name = tag_name
        try:
            tag_instance.save()
        except Exception as e:
            raise GraphQLError(e)
        return UpdateTag(tag=tag_instance)


class DeleteTag(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(root, info, id):
        try:
            tag = Tag.objects.get(id=id)
            tag.delete()
            return DeleteTag(success=True)
        except Tag.DoesNotExist:
            raise GraphQLError(f'Tag with id: {id} does not exist')


class Mutation(graphene.ObjectType):
    login = LoginMutation.Field()
    logout = LogoutMutation.Field()
    create_user = CreateUser.Field()
    update_user = UpdateUser.Field()
    delete_user = DeleteUser.Field()
    create_receipt = CreateReceipt.Field()
    update_receipt = UpdateReceipt.Field()
    delete_receipt = DeleteReceipt.Field()
    create_tag = CreateTag.Field()
    update_tag = UpdateTag.Field()
    delete_tag = DeleteTag.Field()


class Query(UserQuery, ReceiptQuery, TagQuery, graphene.ObjectType):
    pass


schema = graphene.Schema(mutation=Mutation, query=Query)
