import graphene
import graphql_jwt
from jwt import api_settings
from django.contrib.auth import authenticate, login


class CustomObtainJSONWebToken(graphql_jwt.ObtainJSONWebToken):
    @classmethod
    def resolve(cls, root, info, **kwargs):
        email = kwargs.get('email')
        password = kwargs.get('password')
        user = authenticate(email=email, password=password)
        return cls.authenticate(user, info, **kwargs)

class LoginMutation(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    success = graphene.Boolean()
    token = graphene.String()

    def mutate(self, info, email, password):
        user = authenticate(username=email, password=password)

        if user is not None:
            # if user.is_active:
            login(info.context, user)
            return LoginMutation(success=True, token=graphql_jwt.encode(graphql_jwt.jwt_payload(user)))
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

        # If the user is authenticated, mark their token as invalid
        # (or simply remove it from the header)
        # jwt_decode_handler = api_settings.JWT_DECODE_HANDLER
        # jwt_payload = jwt_decode_handler(info.context.JWT)
        # jwt_payload['exp'] = timegm(datetime.utcnow().utctimetuple())
        # jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
        # token = jwt_encode_handler(jwt_payload)
        # info.context.JWT = token

        # Delete the session cookie
        info.context.delete_cookie(api_settings.JWT_AUTH_COOKIE)

        return LogoutMutation(success=True)


class AuthMutation(graphene.ObjectType):
    login = LoginMutation.Field()
    logout = LogoutMutation.Field()
    # token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    token_auth = graphql_jwt.CustomObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()


schema = graphene.Schema(mutation=AuthMutation)
