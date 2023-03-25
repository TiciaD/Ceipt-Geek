from ..models import Receipt, Tag
from django.contrib.auth import get_user_model

import jwt as pyjwt
from django.conf import settings

import re
from graphql.error import GraphQLError



def login_required(func):
    def wrapper(root, info, *args, **kwargs):
        user = info.context.user
        if not user.is_authenticated:
            raise GraphQLError('Please login to perform this action')

        authorization_header = info.context.headers.get('Authorization', None)
        if authorization_header is None:
            raise GraphQLError('Authorization token is required')
        
        pattern = re.compile("^Bearer\s(.+)$")
        match = pattern.match(authorization_header)
        if not match:
            raise GraphQLError("Invalid Authorization token format")
        
        token = authorization_header.split()[1]

        try:
            payload = pyjwt.decode(
                token,
                settings.GRAPHQL_JWT["JWT_SECRET_KEY"],
                algorithms=['HS256']
            )

            user_id = payload.get('user_id')
            if str(user_id) != str(user.id):
                raise GraphQLError('Token does not belong to logged in user')

            user = get_user_model().objects.get(pk=user_id)

            kwargs['auth_user_id'] = user_id
            kwargs['auth_user'] = user
        except pyjwt.ExpiredSignatureError:
            raise GraphQLError('Token has expired')
        except pyjwt.InvalidTokenError:
            raise GraphQLError('Invalid token')
        except get_user_model().DoesNotExist:
            raise GraphQLError(
                'The user associated with this token no longer exists'
            )

        return func(root, info, *args, **kwargs)

    return wrapper


def is_owner_or_superuser(model):
    def decorator(func):
        def wrapper(root, info, *args, **kwargs):
            user_id = kwargs.get('auth_user_id')

            if model == 'receipt':
                receipt_id = kwargs.get('receipt_id')

                try:
                    receipt_instance = Receipt.objects.get(pk=receipt_id)
                except Receipt.DoesNotExist:
                    raise GraphQLError(
                        f'Receipt with id: {receipt_id} does not exist.'
                    )
                
                # print(
                #     f'user_id: {user_id}, receipt user_id: {receipt_instance.user.id}, superuser: {info.context.user.is_superuser}'
                # )
                
                if str(receipt_instance.user.id) == str(user_id) or info.context.user.is_superuser:
                    kwargs['receipt_instance'] = receipt_instance
                    return func(root, info, *args, **kwargs)
                else:
                    raise GraphQLError(
                        'You do not have permission to perform this action'
                    )

        return wrapper
    
    return decorator


def is_superuser(func):
    def wrapper(root, info, *args, **kwargs):
        user = info.context.user
        if user.is_superuser:
            return func(root, info, *args, **kwargs)
        else:
            raise GraphQLError(
                'You do not have permission to perform this action'
            )
    
    return wrapper