from ..models import Receipt, Tag
from django.contrib.auth import get_user_model

import jwt as pyjwt
from django.conf import settings

import re
from graphql.error import GraphQLError



def login_required(func):
    def wrapper(root, info, *args, **kwargs):
        authorization_header = info.context.headers.get('Authorization', None)
        if authorization_header is None:
            raise GraphQLError('Authentication token is required')
        
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

            kwargs['user_id'] = payload.get('user_id')
        except pyjwt.ExpiredSignatureError:
            raise GraphQLError('Token has expired')
        except pyjwt.InvalidTokenError:
            raise GraphQLError('Invalid token')

        return func(root, info, *args, **kwargs)

    return wrapper


def is_receipt_owner_or_superuser(func):
    def wrapper(root, info, *args, **kwargs):
        user_id = kwargs.get('user_id')
        receipt_id = kwargs.get('receipt_id')

        try:
            receipt_instance = Receipt.objects.get(pk=receipt_id)
        except Receipt.DoesNotExist:
            raise GraphQLError(
                f'Receipt with id: {receipt_id} does not exist.'
            )
        
        print(
            f'user_id: {user_id}, receipt user_id: {receipt_instance.user.id}, superuser: {info.context.user.is_superuser}')
        
        if str(receipt_instance.user.id) == str(user_id) or info.context.user.is_superuser:
            kwargs['receipt_instance'] = receipt_instance
            return func(root, info, *args, **kwargs)
        else:
            raise GraphQLError(
                'You do not have permission to perform this action'
            )

    return wrapper
