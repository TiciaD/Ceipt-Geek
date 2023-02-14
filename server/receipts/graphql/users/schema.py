import graphene
from graphene_django.types import DjangoObjectType, ObjectType
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from graphql import GraphQLError
import re


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


class UserMutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    update_user = UpdateUser.Field()
    delete_user = DeleteUser.Field()


schema = graphene.Schema(query=UserQuery, mutation=UserMutation)
