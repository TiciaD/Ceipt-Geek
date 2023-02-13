import graphene
import graphql_jwt
from django.contrib.auth import login
from django.contrib.auth import logout
from django.contrib.auth import get_user_model
import jwt as pyjwt
from datetime import datetime, timedelta
from django.conf import settings



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
            user = get_user_model().objects.get(email=email)
            if user.check_password(password):
                return user
            return None

        user = authenticate(email=email, password=password)
        print("User:", user)

        if user is not None and user.is_active:
            # Login the user to create a session
            login(info.context, user)
            # Generate JWT token
            token = pyjwt.encode({
                'user_id': str(user.id),
                'exp': datetime.utcnow() + timedelta(days=1) # Token expires in 1 day
            }, settings.SECRET_KEY, algorithm='HS256')
            
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



class AuthMutation(graphene.ObjectType):
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    login_mutation = LoginMutation.Field()
    logout_mutation = LogoutMutation.Field()


schema = graphene.Schema(mutation=AuthMutation)
