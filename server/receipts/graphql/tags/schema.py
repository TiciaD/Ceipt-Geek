import graphene
from graphene_django.types import DjangoObjectType, ObjectType
from ...models import Tag


class TagType(DjangoObjectType):
    class Meta:
        fields = "__all__"
        model = Tag

class TagQuery(ObjectType):
    tag = graphene.Field(TagType, id=graphene.Int())
    tags = graphene.List(TagType)
    

    def resolve_tag(self, info, **kwargs):
        id = kwargs.get('id')

        if id is not None:
            return Tag.objects.get(pk=id)

        return None

    def resolve_tags(self, info, **kwargs):
        return Tag.objects.all()

class TagInput(graphene.InputObjectType):
    id = graphene.ID()
    tag_name = graphene.String()

class CreateTag(graphene.Mutation):
    class Arguments:
        tag_data = TagInput(required=True)
    tag = graphene.Field(TagType)

    @staticmethod
    def mutate(root, info, tag_data=None):
        tag_instance = Tag(
            tag_name=tag_data.tag_name
        )
        try:
            tag_instance.save()
        except Exception as e:
            print(e)
        return CreateTag(tag=tag_instance)

class UpdateTag(graphene.Mutation):
    class Arguments:
        tag_data = TagInput(required=True)
    
    tag = graphene.Field(TagType)

    @staticmethod
    def mutate(root, info, tag_data=None):

        tag_instance = Tag.objects.get(pk=tag_data.id)

        if tag_instance:
            tag_instance.tag_name=tag_data.tag_name
        try:
            tag_instance.save()
        except Exception as e:
            print(e)
        return UpdateTag(tag=tag_instance)

class DeleteTag(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()
    tag = graphene.Field(lambda: TagType)

    @staticmethod
    def mutate(root, info, id):
        try:
            tag = Tag.objects.get(id=id)
            tag.delete()
            return DeleteTag(success=True, tag=tag)
        except Tag.DoesNotExist:
            return DeleteTag(success=False, tag=None)

class TagMutation(graphene.ObjectType):
    create_tag = CreateTag.Field()
    update_tag = UpdateTag.Field()
    delete_tag = DeleteTag.Field()



schema = graphene.Schema(query=TagQuery, mutation=TagMutation)