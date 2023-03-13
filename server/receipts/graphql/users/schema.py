import graphene
from graphene_django.types import DjangoObjectType, ObjectType
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from graphql import GraphQLError

User = get_user_model()

class UserType(DjangoObjectType):
    class Meta:
        model = User


class UserQuery(graphene.ObjectType):
    user = graphene.Field(UserType, id=graphene.Int(required=True))
    users = graphene.List(UserType)

    def resolve_user(self, info, id):
        return User.objects.get(pk=id)

    def resolve_users(self, info, **kwargs):
        return User.objects.all()


class CreateUser(graphene.Mutation):
    user = graphene.Field(lambda: UserType)

    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        email = graphene.String(required=True)

    def mutate(self, info, username, password, email):
        try:
            validate_password(password)
            validate_email(email)
        except Exception as e:
            return GraphQLError(str(e))

        # Check if a user with the given username or email already exists
        if User.objects.filter(username=username).exists():
            raise GraphQLError('Username already taken')
        if User.objects.filter(email=email).exists():
            raise GraphQLError('Email already taken')

        user = User(
            username=username,
            email=email,
        )
        user.set_password(password)
        user.save()

        return CreateUser(user=user)


class UpdateUser(graphene.Mutation):
    user = graphene.Field(lambda: UserType)

    class Arguments:
        id = graphene.Int(required=True)
        username = graphene.String()
        password = graphene.String()
        email = graphene.String()

    def mutate(self, info, id, username=None, password=None, email=None):
        user = User.objects.get(pk=id)

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
            user = User.objects.get(id=id)
            user.delete()
            return DeleteUser(success=True, user=user)
        except User.DoesNotExist:
            return DeleteUser(success=False, user=None)


class UserMutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    update_user = UpdateUser.Field()
    delete_user = DeleteUser.Field()


schema = graphene.Schema(query=UserQuery, mutation=UserMutation)
