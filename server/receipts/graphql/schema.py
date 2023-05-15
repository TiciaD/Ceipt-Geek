from ..models import Receipt, Tag, PasswordRecovery
from django.contrib.auth import get_user_model
from django.db.models import QuerySet
from django.db.models import Q
from django.db.models import F

import graphene
from graphql import GraphQLError
from graphene_file_upload.scalars import Upload
from graphene_django.types import DjangoObjectType, ObjectType
from graphene_django.converter import convert_django_field

import cloudinary.uploader
from cloudinary.models import CloudinaryField

import os
from django.core.mail import send_mail

import jwt as pyjwt
from .decorators import is_superuser, login_required, is_owner_or_superuser
from django.contrib.auth import login
from django.contrib.auth import logout
from django.conf import settings
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

import re
from datetime import datetime, timedelta
from django.db.models import Sum
from decimal import Decimal
from .sort import sort_dataset


# AUTH SCHEMA


class LoginMutation(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    success = graphene.Boolean()
    token = graphene.String()

    def mutate(self, info, email, password):
        def authenticate(email, password):
            try:
                user = get_user_model().objects.get(email=email)
            except get_user_model().DoesNotExist:
                raise GraphQLError("Invalid credentials")

            if user.check_password(password):
                return user
            raise GraphQLError("Invalid credentials")

        user = authenticate(email=email, password=password)

        if user.is_active:
            # Login the user to create a session
            login(info.context, user)
            # Generate JWT token
            token = pyjwt.encode(
                {
                    "user_id": str(user.id),
                    "exp": datetime.utcnow()
                    + timedelta(days=1),  # Token expires in 1 day
                },
                settings.GRAPHQL_JWT["JWT_SECRET_KEY"],
                algorithm="HS256",
            )

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


# USER SCHEMA


User = get_user_model()


class UserType(DjangoObjectType):
    class Meta:
        model = User
        exclude = ("password",)


class ExtendedUserType(DjangoObjectType):
    receipt_count = graphene.Int()
    tags_count = graphene.Int()

    class Meta:
        model = User
        exclude = ("password",)


class UserQuery(graphene.ObjectType):
    user = graphene.Field(ExtendedUserType)
    get_user = graphene.Field(UserType, id=graphene.Int(), email=graphene.String())
    all_users = graphene.List(
        UserType, sort_by=graphene.List(graphene.String, required=False)
    )

    @login_required
    def resolve_user(self, info, **kwargs):
        user = kwargs.get("auth_user")

        user.receipt_count = user.receipt_set.count()
        user.tags_count = user.tag_set.count()

        return user

    @login_required
    @is_superuser
    def resolve_get_user(self, info, **kwargs):
        kwargs.pop("auth_user_id")
        kwargs.pop("auth_user")
        id = kwargs.get("id")
        email = kwargs.get("email")

        if id is None and email is None:
            raise GraphQLError("Please enter a user id and/or email to query by.")

        user = User.objects.filter(**kwargs).first()
        if user:
            return user
        elif id and email:
            raise GraphQLError(f"No user found with id: {id} and email: {email}")
        elif id:
            raise GraphQLError(f"No user found with id: {id}")
        else:
            raise GraphQLError(f"No user found with email: {email}")

    @login_required
    @is_superuser
    def resolve_all_users(self, info, **kwargs):
        sort_by = kwargs.get("sort_by")
        users = User.objects.all()
        if not users.exists():
            raise GraphQLError("No users found.")
        if sort_by:
            users = sort_dataset(users, sort_by)
        return users


class CreateUser(graphene.Mutation):
    user = graphene.Field(lambda: UserType)

    class Arguments:
        email = graphene.String(required=True)
        username = graphene.String(required=True)
        password = graphene.String(required=True)

    @staticmethod
    def validate_username(string):
        if not re.match(r"^[\w.@+-]+$", string):
            raise ValidationError(
                "Enter a valid username. Username may contain only letters, numbers, and @/./+/-/_ characters."
            )
        if len(string) < 3:
            raise ValidationError("Username must be at least 3 characters long.")
        if len(string) > 30:
            raise ValidationError("Username cannot be more than 30 characters long.")

    def mutate(self, info, **kwargs):
        email = kwargs.get("email")
        username = kwargs.get("username")
        password = kwargs.get("password")

        if User.objects.filter(username=username).exists():
            raise GraphQLError("Username already taken")
        if User.objects.filter(email=email).exists():
            raise GraphQLError("Email already taken")

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
        email = graphene.String()
        username = graphene.String()
        updated_password = graphene.String()
        current_password = graphene.String()

    @staticmethod
    def validate_username(string):
        if not re.match(r"^[\w.@+-]+$", string):
            raise ValidationError(
                "Enter a valid username. Username may contain only letters, numbers, and @/./+/-/_ characters."
            )
        if len(string) < 3:
            raise ValidationError("Username must be at least 3 characters long.")
        if len(string) > 30:
            raise ValidationError("Username cannot be more than 30 characters long.")

    @login_required
    def mutate(self, info, **kwargs):
        user_id = kwargs.get("auth_user_id")
        user = kwargs.get("auth_user")
        email = kwargs.get("email")
        username = kwargs.get("username")
        updated_password = kwargs.get("updated_password")
        current_password = kwargs.get("current_password")

        if email or updated_password:
            if not current_password:
                raise GraphQLError(
                    "Current password required to update email or password"
                )
            if not user.check_password(current_password):
                raise GraphQLError("Invalid password")

        if (
            username
            and User.objects.filter(username=username).exclude(pk=user_id).exists()
        ):
            raise GraphQLError("Username already taken")
        if email and User.objects.filter(email=email).exclude(pk=user_id).exists():
            raise GraphQLError("Email already taken")

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

        if updated_password:
            try:
                validate_password(updated_password)
            except Exception as e:
                raise GraphQLError(e)

        if username:
            user.username = username
        if updated_password:
            user.set_password(updated_password)
        if email:
            user.email = email

        try:
            user.save()
            login(info.context, user)
        except Exception as e:
            raise GraphQLError(e)

        return UpdateUser(user=user)


class DeleteUser(graphene.Mutation):
    success = graphene.Boolean()

    @login_required
    def mutate(root, info, **kwargs):
        user_id = kwargs.get("auth_user_id")
        user = kwargs.get("auth_user")

        if user:
            receipts = Receipt.objects.filter(user=user)
            for receipt in receipts:
                if receipt.receipt_image:
                    public_id = receipt.image_public_id()
                    cloudinary.uploader.destroy(public_id)
            user.delete()
            return DeleteUser(success=True)
        else:
            raise GraphQLError(f"User with id: {user_id} does not exist")


# RECEIPT SCHEMA


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
    receipt = graphene.Field(ReceiptType, receipt_id=graphene.ID(required=True))
    all_receipts = graphene.List(
        ReceiptType,
        user_id=graphene.ID(required=False),
        sort_by=graphene.List(graphene.String, required=False),
    )
    all_receipts_by_user = graphene.List(
        ReceiptType, sort_by=graphene.List(graphene.String, required=False)
    )
    filtered_receipts = graphene.List(
        ReceiptType,
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
        sort_by=graphene.List(graphene.String, required=False),
    )
    total_expenditure_by_date = graphene.Float(
        date_gte=graphene.Date(required=True),
        date_lte=graphene.Date(required=True),
    )

    @login_required
    @is_owner_or_superuser("receipt")
    def resolve_receipt(self, info, **kwargs):
        receipt = kwargs.get("receipt_instance")
        return receipt

    @login_required
    @is_superuser
    def resolve_all_receipts(self, info, **kwargs):
        user_id = kwargs.get("user_id")
        sort_by = kwargs.get("sort_by")

        if user_id is not None:
            try:
                user = get_user_model().objects.get(pk=user_id)
            except get_user_model().DoesNotExist:
                raise GraphQLError(
                    f"No user with user id: {user_id} found. Could not query for receipts belonging to a user that does not exist."
                )
            receipts = Receipt.objects.filter(user=user)
        else:
            receipts = Receipt.objects.all()

        if not receipts.exists():
            if user_id is not None:
                raise GraphQLError(
                    f"No receipts found for user with user id: {user_id}"
                )
            else:
                raise GraphQLError("No receipts found.")

        if sort_by:
            receipts = sort_dataset(receipts, sort_by)

        return receipts

    @login_required
    def resolve_all_receipts_by_user(self, info, **kwargs):
        user_id = kwargs.get("auth_user_id")
        sort_by = kwargs.get("sort_by")

        receipts = Receipt.objects.filter(user_id=user_id)

        if not receipts.exists():
            raise GraphQLError(f"No receipts found for user with user id: {user_id}.")
        if sort_by:
            receipts = sort_dataset(receipts, sort_by)

        return receipts

    @staticmethod
    def filter_queryset(qs: QuerySet, condition) -> QuerySet:
        filtered_qs = qs.filter(**condition)
        if not filtered_qs.exists():
            raise GraphQLError("No receipts found matching filtered fields.")

        return filtered_qs

    @login_required
    def resolve_filtered_receipts(self, info, **kwargs):
        user_id = kwargs.pop("auth_user_id")
        sort_by = kwargs.get("sort_by")

        if not kwargs:
            raise GraphQLError(
                "Please provide at least one field to filter by. Fields include: storeName, expense, dateGte, dateLte, costGte, costLte, notes, and tags"
            )

        queryset = Receipt.objects.filter(user_id=user_id)
        if not queryset.exists():
            raise GraphQLError(
                f"No receipts belonging to user with user_id: {user_id} found."
            )

        store_name = kwargs.get("store_name")
        expense = kwargs.get("expense")
        date_gte = kwargs.get("date_gte")
        date_lte = kwargs.get("date_lte")
        cost_gte = kwargs.get("cost_gte")
        cost_lte = kwargs.get("cost_lte")
        tax_gte = kwargs.get("tax_gte")
        tax_lte = kwargs.get("tax_lte")
        notes = kwargs.get("notes")
        tags_contains_any = kwargs.get("tags_contains_any")
        tags_contains_all = kwargs.get("tags_contains_all")

        if store_name:
            store_name = store_name.strip()
            queryset = Query.filter_queryset(
                queryset,
                {"store_name__icontains": store_name},
            )

        if expense:
            expense = expense.strip()
            queryset = Query.filter_queryset(
                queryset,
                {"expense": expense},
            )

        if date_gte:
            queryset = Query.filter_queryset(
                queryset,
                {"date__gte": date_gte},
            )

        if date_lte:
            queryset = Query.filter_queryset(
                queryset,
                {"date__lte": date_lte},
            )

        if cost_gte:
            queryset = Query.filter_queryset(
                queryset,
                {"cost__gte": cost_gte},
            )

        if cost_lte:
            queryset = Query.filter_queryset(
                queryset,
                {"cost__lte": cost_lte},
            )

        if tax_gte:
            queryset = Query.filter_queryset(
                queryset,
                {"tax__gte": tax_gte},
            )

        if tax_lte:
            queryset = Query.filter_queryset(
                queryset,
                {"tax__lte": tax_lte},
            )

        if notes:
            notes = notes.strip()
            queryset = Query.filter_queryset(
                queryset,
                {"notes__icontains": notes},
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
                raise GraphQLError("No receipts found matching filtered fields.")

        if tags_contains_all:
            tags = [tag.strip() for tag in tags_contains_all]
            for tag in tags:
                queryset = queryset.filter(tags__tag_name__icontains=tag)
            if not queryset.exists():
                raise GraphQLError("No receipts found matching filtered fields.")
        if sort_by:
            queryset = sort_dataset(queryset, sort_by)

        return queryset

    @login_required
    def resolve_total_expenditure_by_date(self, info, **kwargs):
        user_id = kwargs.get("auth_user_id")
        date_gte = kwargs.get("date_gte")
        date_lte = kwargs.get("date_lte")

        receipts = Receipt.objects.filter(
            user_id=user_id,
            date__gte=date_gte,
            date__lte=date_lte,
        )

        total_cost = receipts.aggregate(Sum("cost"))["cost__sum"] or Decimal("0")

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
        user_id = kwargs.get("auth_user_id")
        receipt_data = kwargs.get("receipt_data")

        receipt_instance = Receipt(
            user_id=user_id,
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
                        tag_name=input_tag, user_id=user_id
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
    @is_owner_or_superuser("receipt")
    def mutate(root, info, **kwargs):
        user_id = kwargs.get("auth_user_id")
        receipt_instance = kwargs.get("receipt_instance")
        receipt_data = kwargs.get("receipt_data")

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
                    tag_id = Tag.objects.get_or_create(tag_name=tag, user_id=user_id)[0]
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

    @login_required
    @is_owner_or_superuser("receipt")
    def mutate(root, info, **kwargs):
        receipt = kwargs.get("receipt_instance")
        try:
            if receipt.receipt_image:
                public_id = receipt.image_public_id()
                cloudinary.uploader.destroy(public_id)
            receipt.delete()
            return DeleteReceipt(success=True)
        except Exception as e:
            raise GraphQLError(e)


# TAG SCHEMA


class TagType(DjangoObjectType):
    class Meta:
        fields = "__all__"
        model = Tag


class TagQuery(ObjectType):
    tag = graphene.Field(TagType, tag_id=graphene.ID(required=True))
    all_tags = graphene.List(
        TagType,
        user_id=graphene.ID(required=False),
        sort_by=graphene.List(graphene.String, required=False),
    )
    all_users_tags = graphene.List(
        TagType, sort_by=graphene.List(graphene.String, required=False)
    )

    @login_required
    @is_owner_or_superuser("tag")
    def resolve_tag(self, info, **kwargs):
        tag_instance = kwargs.get("tag_instance")
        try:
            return tag_instance
        except Tag.DoesNotExist:
            raise GraphQLError(f"Tag with id: {id} not found.")

    @is_superuser
    def resolve_all_tags(self, info, **kwargs):
        user_id = kwargs.get("user_id")
        sort_by = kwargs.get("sort_by")
        tags = Tag.objects.all()
        if user_id:
            tags = tags.filter(user_id=user_id)
        if sort_by:
            tags = sort_dataset(tags, sort_by)
        if not tags.exists():
            raise GraphQLError("No tags found.")
        return tags

    @login_required
    def resolve_all_users_tags(self, info, **kwargs):
        user_id = kwargs.get("auth_user_id")
        sort_by = kwargs.get("sort_by")
        tags = Tag.objects.all().filter(user_id=user_id)
        if not tags:
            raise GraphQLError("No tags found")
        if sort_by:
            tags = sort_dataset(tags, sort_by)
        return tags


class CreateTag(graphene.Mutation):
    class Arguments:
        tag_name = graphene.String(required=True)

    tag = graphene.Field(TagType)

    @login_required
    def mutate(root, info, **kwargs):
        user_id = kwargs.get("auth_user_id")
        tag_name = kwargs.get("tag_name")
        tag_instance = Tag(tag_name=tag_name, user_id=user_id)
        if Tag.objects.filter(tag_name=tag_name, user_id=user_id).exists():
            raise GraphQLError("Tag already exist")
        try:
            tag_instance.save()
        except Exception as e:
            raise GraphQLError(e)
        return CreateTag(tag=tag_instance)


class UpdateTag(graphene.Mutation):
    class Arguments:
        tag_id = graphene.ID(required=True)
        tag_name = graphene.ID(required=True)

    tag = graphene.Field(TagType)

    @login_required
    @is_owner_or_superuser("tag")
    def mutate(root, info, **kwargs):
        tag_id = kwargs["tag_id"]
        tag_name = kwargs["tag_name"]
        tag_instance = kwargs["tag_instance"]
        user_id = kwargs.get("auth_user_id")
        tag_instance.tag_name = tag_name
        tag_instance.user_id = user_id
        try:
            tag_instance.save()
        except Exception as e:
            raise GraphQLError(e)
        return UpdateTag(tag=tag_instance)


class DeleteTag(graphene.Mutation):
    class Arguments:
        tag_id = graphene.ID(required=True)

    success = graphene.Boolean()

    @login_required
    @is_owner_or_superuser("tag")
    def mutate(root, info, **kwargs):
        tag_instance = kwargs.get("tag_instance")
        try:
            tag_instance.delete()
            return DeleteTag(success=True)
        except Tag.DoesNotExist:
            raise GraphQLError(f"Tag with id: {id} does not exist")


# PASSWORD RECOVERY SCHEMA

# class PasswordRecoveryType(DjangoObjectType):
#     user_id = graphene.ID()


class PasswordRecoveryQuery(ObjectType):
    password_recovery = graphene.Field(graphene.ID, token=graphene.String(required=True))

    def resolve_password_recovery(self, info, **kwargs):
        token = kwargs.get("token")

        try: 
            PasswordRecovery.objects.get(token=token)
        except PasswordRecovery.DoesNotExist:
            raise GraphQLError("Password reset request not found.")
        
        try:
            payload = pyjwt.decode(
                token,
                settings.GRAPHQL_JWT["JWT_SECRET_KEY"],
                algorithms=['HS256']
            )
            user_id = payload.get('user_id')
            
            get_user_model().objects.get(pk=user_id)

        except pyjwt.ExpiredSignatureError:
            raise GraphQLError('This link has expired. Please send another password reset request.')
        except get_user_model().DoesNotExist:
            raise GraphQLError(
                'The account associated with this password reset request no longer exists.'
            )
        
        return user_id    


class RequestPasswordReset(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(root, info, **kwargs):
        email = kwargs.get("email")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise GraphQLError(f"Account with email: {email} not found")

        token = pyjwt.encode(
            {
                "user_id": str(user.id),
                "exp": datetime.utcnow() + timedelta(hours=1),
            },
            settings.GRAPHQL_JWT["JWT_SECRET_KEY"],
            algorithm="HS256",
        )

        password_recovery_instance = PasswordRecovery(token=token, user=user)
        try:
            password_recovery_instance.save()
        except Exception as e:
            raise GraphQLError(e)

        frontend_url = os.getenv("FRONTEND_URL")
        send_count = send_mail(
            "Ceipt Geek Account Password Reset",  # subject
            f"Please follow this link to reset your password: {frontend_url}/resetpassword/{token}",  # message
            "ceiptgeek@gmail.com",  # from email address
            [email],  # recipient email address
            fail_silently=False,
        )

        if send_count == 1:
            return RequestPasswordReset(
                success=True, 
                message="Password reset email successfully sent to your email address."
            )
        else:
            return RequestPasswordReset(
                success=False,
                message="Something went wrong sending the password reset email. Please try again.",
            )
        
class ResetPassword(graphene.Mutation):
    class Arguments:
        token = graphene.String(required=True)
        password = graphene.String(required=True)
        user_id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(root, info, **kwargs):
        token = kwargs.get("token")
        password = kwargs.get("password")
        user_id = kwargs.get("user_id")

        try: 
            password_recovery_instance = PasswordRecovery.objects.get(token=token)
        except PasswordRecovery.DoesNotExist:
            raise GraphQLError("Password reset request not found. Please send another password reset request.")
        
        try:
            payload = pyjwt.decode(
                token,
                settings.GRAPHQL_JWT["JWT_SECRET_KEY"],
                algorithms=['HS256']
            )
            payload_user_id = payload.get('user_id')

            if str(payload_user_id) != str(user_id):
                raise GraphQLError("Token user id does not match the request user id. Please send another password reset request.")
            
            user = get_user_model().objects.get(pk=user_id)

        except pyjwt.ExpiredSignatureError:
            password_recovery_instance.delete()
            raise GraphQLError('This password reset request has expired. Please send another password reset request.')
        except get_user_model().DoesNotExist:
            password_recovery_instance.delete()
            raise GraphQLError(
                'The account associated with this password reset request no longer exists.'
            )
        
        try:
            validate_password(password)
            user.set_password(password)
            user.save()

            password_recovery_instance.delete()

            return ResetPassword(success=True)
        except Exception as e:
            raise GraphQLError(e)


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
    request_password_reset = RequestPasswordReset.Field()
    reset_password = ResetPassword.Field()


class Query(UserQuery, ReceiptQuery, TagQuery, PasswordRecoveryQuery, graphene.ObjectType):
    pass


schema = graphene.Schema(mutation=Mutation, query=Query)
