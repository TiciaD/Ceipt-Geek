import graphene
from graphene_django.types import DjangoObjectType, ObjectType
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from graphql import GraphQLError



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
        firstname= graphene.String(required=False)
        lastname= graphene.String(required=False)
        password = graphene.String(required=True)
        email = graphene.String(required=True)


    def mutate(self, info, username, firstname, lastname, password, email):
        try:
            validate_password(password)
            validate_email(email)
        except Exception as e:
            return GraphQLError(str(e))

        user = get_user_model()(
            username=username,
            email=email,
            last_name=lastname,
            first_name=firstname,
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
        firstname = graphene.String()
        lastname = graphene.String()
        email = graphene.String()

    def mutate(self, info, id, username=None, firstname=None, lastname=None, password=None, email=None):
        user = get_user_model().objects.get(pk=id)

        if username:
            user.username = username
        if firstname:
            user.firstname = firstname
        if lastname:
            user.lastname = lastname
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
