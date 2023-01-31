import graphene
from graphene_django.types import DjangoObjectType, ObjectType
from .tags.schema import tags_schema
from .users.schema import schema as users_schema
from .receipts.schema import schema as receipts_schema

class Query(tags_schema.TagQuery, users_schema.UserQuery, receipts_schema.Query, ObjectType):
    pass

class Mutation(tags_schema.TagMutation, users_schema.UserMutation, receipts_schema.Mutation, ObjectType):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
