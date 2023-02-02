import graphene
import graphql_jwt

from django.contrib.auth.models import User

from graphql_jwt.shortcuts import get_token
from django.contrib.auth import login
from rest_framework_jwt.settings import api_settings


class LoginMutation(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    success = graphene.Boolean()
    token = graphene.String()

    def mutate(self, info, email, password):
        def authenticate(email, password):
            print("Email:", email)
            print("Password:", password)
            user = User.objects.get(email=email)
            if user.check_password(password):
                return user
            return None

        user = authenticate(email=email, password=password)
        print("User:", user)

        if user is not None:
            # if user.is_active:
            login(info.context, user)
            return LoginMutation(success=True, token="token")
            # else:
            #     return LoginMutation(success=False, token=None)
        else:
            return LoginMutation(success=False, token=None)


class LogoutMutation(graphene.Mutation):
    success = graphene.Boolean()

    def mutate(self, info, **kwargs):
        # Get the user from the request
        user = info.context.user

        if user.is_anonymous:
            # If the user is not authenticated, there's nothing to do
            return LogoutMutation(success=False)

        # Delete the session cookie
        info.context.delete_cookie(api_settings.JWT_AUTH_COOKIE)

        return LogoutMutation(success=True)


class AuthMutation(graphene.ObjectType):
    login = LoginMutation.Field()
    logout = LogoutMutation.Field()
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()


schema = graphene.Schema(mutation=AuthMutation)
