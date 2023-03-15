import graphene
import cloudinary.uploader

from ...models import Receipt
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password

from graphene_django.types import DjangoObjectType
from graphql import GraphQLError

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
                f"No user found with id: {id} and email: {email}")
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

    def mutate(self, info, username, password, email):
        if User.objects.filter(username=username).exists():
            raise GraphQLError('Username already taken')
        if User.objects.filter(email=email).exists():
            raise GraphQLError('Email already taken')
        
        try:
            validate_email(email)
            validate_password(password)
        except Exception as e:
            raise GraphQLError(e)

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


class UserMutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    update_user = UpdateUser.Field()
    delete_user = DeleteUser.Field()


schema = graphene.Schema(query=UserQuery, mutation=UserMutation)
