import cloudinary
import cloudinary.uploader
from cloudinary.models import CloudinaryField
from graphene_django.converter import convert_django_field
import graphene
import graphql_jwt
from django.contrib.auth import login
from django.contrib.auth import logout
from django.contrib.auth import get_user_model
import jwt as pyjwt
from datetime import datetime, timedelta
from django.conf import settings
from graphql import GraphQLError
from graphene_django.types import DjangoObjectType, ObjectType
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from graphql import GraphQLError
import re
from ..models import Receipt
from graphene_file_upload.scalars import Upload
from django.utils.crypto import get_random_string
from ..models import Tag


@convert_django_field.register(CloudinaryField)
def convert_field_to_string(field, registry=None):
    """
    Converter for CloudinaryField to be used by Graphene.
    """
    return graphene.String()

# Auth Schema 

def login_required(func):
    def wrapper(root, info, *args, **kwargs):
        token = info.context.headers.get('Authorization', None)
        if not token:
            raise GraphQLError('Authentication token is required')
        try:
            payload = pyjwt.decode(token, settings.GRAPHQL_JWT["JWT_SECRET_KEY"], algorithms=['HS256'])
        except pyjwt.ExpiredSignatureError:
            raise GraphQLError('Token has expired')
        except pyjwt.InvalidTokenError:
            raise GraphQLError('Invalid token')

        return func(root, info, *args, **kwargs)

    return wrapper



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
        # print("User:", user)

        if user is not None and user.is_active:
            # Login the user to create a session
            login(info.context, user)
            # Generate JWT token
            token = pyjwt.encode({
                'user_id': str(user.id),
                'exp': datetime.utcnow() + timedelta(days=1) # Token expires in 1 day
            }, settings.GRAPHQL_JWT["JWT_SECRET_KEY"], algorithm='HS256')
            
            return LoginMutation(success=True, token=token)
        else:
            return LoginMutation(success=False, token=None, response=None)


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

class UserType(DjangoObjectType):
    class Meta:
        model = get_user_model()


class UserQuery(graphene.ObjectType):
    user = graphene.Field(UserType, id=graphene.Int(required=True))
    users = graphene.List(UserType)

    def resolve_user(self, info, id):
        return get_user_model().objects.get(pk=id)

    def resolve_users(self, info, **kwargs):
        return get_user_model().objects.all()


class CreateUser(graphene.Mutation):
    user = graphene.Field(lambda: UserType)

    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        email = graphene.String(required=True)
    

    @staticmethod
    def validate_username(string):
        if not re.match(r'^[\w.@+-]+$', string):
            raise ValidationError('Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters.')
        if len(string) < 2:
            raise ValidationError('Username must be at least 3 characters long.')
        if len(string) > 20:
            raise ValidationError('Username cannot be more than 30 characters long.')


    def mutate(self, info, username, password, email):
        try:
            CreateUser.validate_username(username)
            validate_password(password)
            validate_email(email)
        except Exception as e:
            return GraphQLError(str(e))

        user = get_user_model()(
            username=username,
            email=email,
        )
        user.set_password(password)
        try:
            user.save()
            print("success")
        except Exception as e:
            print(e)
        return CreateUser(user=user)


class UpdateUser(graphene.Mutation):
    user = graphene.Field(lambda: UserType)

    class Arguments:
        id = graphene.Int(required=True)
        username = graphene.String()
        password = graphene.String()
        email = graphene.String()

    def mutate(self, info, id, username=None, password=None, email=None):
        user = get_user_model().objects.get(pk=id)

        if username:
            user.username = username
        if password:
            user.set_password(password)
        if email:
            user.email = email

        user.save()
        
        return UpdateUser(user=user)


class DeleteUser(graphene.Mutation):
    user = graphene.Field(lambda: UserType)
    success = graphene.Boolean()

    class Arguments:
        id = graphene.ID(required=True)

    @staticmethod
    def mutate(root, info, id):
        try:
            user = get_user_model().objects.get(id=id)
            user.delete()
            return DeleteUser(success=True, user=user)
        except get_user_model().DoesNotExist:
            return DeleteUser(success=False, user=None)
        
# Receipt Schema

class ReceiptType(DjangoObjectType):
    class Meta:
        fields = "__all__"
        model = Receipt

class ReceiptQuery(ObjectType):
    receipt = graphene.Field(ReceiptType, id=graphene.Int())
    receipts = graphene.List(ReceiptType)
    

    def resolve_receipt(self, info, **kwargs):
        id = kwargs.get('id')

        if id is not None:
            return Receipt.objects.get(pk=id)

        return None

    def resolve_receipts(self, info, **kwargs):
        return Receipt.objects.all()


class ReceiptInput(graphene.InputObjectType):
    id = graphene.ID()
    user_id = graphene.ID()
    store_name = graphene.String()
    date = graphene.Date(required=False)
    expense = graphene.String(required=False)
    tax = graphene.Decimal()
    cost = graphene.Decimal()
    notes = graphene.String()
    receipt_image = Upload(required=False)
    


class CreateReceiptResponse(graphene.ObjectType):
    receipt = graphene.Field(ReceiptType)
    csrf_token = graphene.String()

class CreateReceipt(graphene.Mutation):

    class Arguments:
        receipt_data = ReceiptInput(required=True)

    Output = CreateReceiptResponse

    @login_required
    @staticmethod
    def mutate(root, info, receipt_data=None):
        receipt_instance = Receipt(
            user_id=receipt_data.user_id,
            store_name=receipt_data.store_name,
            date=receipt_data.date,
            expense=receipt_data.expense,
            tax=receipt_data.tax,
            cost=receipt_data.cost,
            notes=receipt_data.notes,
            receipt_image=receipt_data.receipt_image,
        )

        # Generate a CSRF token
        csrf_token = get_random_string(length=32)

        try:
            receipt_instance.save()
        except Exception as e:
            print(e)

        # Return the receipt and the CSRF token in the response payload
        response_data = CreateReceiptResponse(
            receipt=receipt_instance,
            csrf_token=csrf_token,
        )
        print(response_data)

        return response_data



class UpdateReceipt(graphene.Mutation):
    class Arguments:
        receipt_data = ReceiptInput(required=True)

    receipt = graphene.Field(ReceiptType)

    @staticmethod
    def mutate(root, info, receipt_data=None):

        receipt_instance = Receipt.objects.get(pk=receipt_data.id)

        if receipt_instance:
            receipt_instance.store_name=receipt_data.store_name
            receipt_instance.date=receipt_data.date
            receipt_instance.expense=receipt_data.expense
            receipt_instance.tax=receipt_data.tax
            receipt_instance.cost=receipt_data.cost
            receipt_instance.notes=receipt_data.notes
            receipt_instance.receipt_image=receipt_data.receipt_image
            try:
                receipt_instance.save()
            except Exception as e:
                print(e)
        return UpdateReceipt(receipt=receipt_instance)

class DeleteReceipt(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()
    receipt = graphene.Field(lambda: ReceiptType)

    @staticmethod
    def mutate(root, info, id):
        try:
            receipt = Receipt.objects.get(id=id)
            receipt.delete()
            return DeleteReceipt(success=True, receipt=receipt)
        except Receipt.DoesNotExist:
            return DeleteReceipt(success=False, receipt=None)


# Tag Schema

class TagType(DjangoObjectType):
    class Meta:
        fields = "__all__"
        model = Tag

class TagQuery(ObjectType):
    tag = graphene.Field(TagType, id=graphene.Int())
    tags = graphene.List(TagType)
    

    def resolve_tag(self, info, **kwargs):
        id = kwargs.get('id')

        if id is not None:
            return Tag.objects.get(pk=id)

        return None

    def resolve_tags(self, info, **kwargs):
        return Tag.objects.all()

class TagInput(graphene.InputObjectType):
    id = graphene.ID()
    tag_name = graphene.String()

class CreateTag(graphene.Mutation):
    class Arguments:
        tag_data = TagInput(required=True)
    tag = graphene.Field(TagType)

    @staticmethod
    def mutate(root, info, tag_data=None):
        tag_instance = Tag(
            tag_name=tag_data.tag_name
        )
        try:
            tag_instance.save()
        except Exception as e:
            print(e)
        return CreateTag(tag=tag_instance)

class UpdateTag(graphene.Mutation):
    class Arguments:
        tag_data = TagInput(required=True)
    
    tag = graphene.Field(TagType)

    @staticmethod
    def mutate(root, info, tag_data=None):

        tag_instance = Tag.objects.get(pk=tag_data.id)

        if tag_instance:
            tag_instance.tag_name=tag_data.tag_name
        try:
            tag_instance.save()
        except Exception as e:
            print(e)
        return UpdateTag(tag=tag_instance)

class DeleteTag(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()
    tag = graphene.Field(lambda: TagType)

    @staticmethod
    def mutate(root, info, id):
        try:
            tag = Tag.objects.get(id=id)
            tag.delete()
            return DeleteTag(success=True, tag=tag)
        except Tag.DoesNotExist:
            return DeleteTag(success=False, tag=None)

class Mutation(graphene.ObjectType):
    login_mutation = LoginMutation.Field()
    logout_mutation = LogoutMutation.Field()
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