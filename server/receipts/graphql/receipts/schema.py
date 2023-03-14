import graphene
import cloudinary.uploader

from ...models import Receipt, Tag
from django.contrib.auth import get_user_model
from django.db.models import QuerySet
from django.db.models import Q
from decimal import Decimal

from cloudinary.models import CloudinaryField

from graphql import GraphQLError
from graphene_django.types import DjangoObjectType, ObjectType
from graphene_file_upload.scalars import Upload
from graphene_django.converter import convert_django_field


# Register a custom converter for CloudinaryField


@convert_django_field.register(CloudinaryField)
def convert_field_to_string(field, registry=None):
    """
    Converter for CloudinaryField to be used by Graphene.
    """
    return graphene.String()


class DecimalType(graphene.Scalar):
    @staticmethod
    def serialize(decimal):
        return float(decimal)

    @staticmethod
    def parse_literal(node):
        return Decimal(node.value)

    @staticmethod
    def parse_value(value):
        return Decimal(value)


class ReceiptType(DjangoObjectType):
    cost = DecimalType()
    tax = DecimalType()

    class Meta:
        fields = "__all__"
        model = Receipt

    def resolve_receipt_image(self, info):
        if self.receipt_image:
            self.receipt_image = self.image_url()
        return self.receipt_image
    

class Query(ObjectType):
    receipt = graphene.Field(ReceiptType, id=graphene.ID(required=True))
    all_receipts = graphene.List(ReceiptType)
    all_receipts_by_user = graphene.List(
        ReceiptType,
        user_id=graphene.ID(required=True)
    )
    filtered_receipts = graphene.List(
        ReceiptType,
        user_id=graphene.ID(),
        store_name=graphene.String(),
        expense=graphene.String(),
        date_gte=graphene.Date(),
        date_lte=graphene.Date(),
        cost_gte=DecimalType(),
        cost_lte=DecimalType(),
        tax_gte=DecimalType(),
        tax_lte=DecimalType(),
        notes=graphene.String(),
        tags_contains_any=graphene.List(graphene.String),
        tags_contains_all=graphene.List(graphene.String),
    )

    def resolve_receipt(self, info, id):
        try:
            return Receipt.objects.get(pk=id)
        except Receipt.DoesNotExist:
            raise GraphQLError(f'No receipt with id: {id} found.')

    def resolve_all_receipts(self, info, **kwargs):
        receipts = Receipt.objects.all()
        if not receipts.exists():
            raise GraphQLError('No receipts found.')
        return receipts

    def resolve_all_receipts_by_user(self, info, user_id):
        try:
            user = get_user_model().objects.get(pk=user_id)
        except get_user_model().DoesNotExist:
            raise GraphQLError(
                f'No user with user id: {user_id} found. Could not query for receipts belonging to a user that does not exist.'
            )

        receipts = Receipt.objects.filter(user=user)
        if not receipts.exists():
            raise GraphQLError(
                f'No receipts found for user with user id: {user_id}.'
            )
        return receipts

    @staticmethod
    def filter_queryset(qs: QuerySet, condition) -> QuerySet:
        filtered_qs = qs.filter(**condition)
        if not filtered_qs.exists():
            raise GraphQLError('No receipts found matching filtered fields.')

        return filtered_qs

    def resolve_filtered_receipts(self, info, **kwargs):
        if not kwargs:
            raise GraphQLError(
                'Please provide at least one field to filter by. Fields include: userId, storeName, expense, dateGte, dateLte, costGte, costLte, notes, and tags')

        queryset = Receipt.objects.all()
        if not queryset.exists():
            raise GraphQLError('No receipts found in the database.')

        user_id = kwargs.get('user_id')
        store_name = kwargs.get('store_name')
        expense = kwargs.get('expense')
        date_gte = kwargs.get('date_gte')
        date_lte = kwargs.get('date_lte')
        cost_gte = kwargs.get('cost_gte')
        cost_lte = kwargs.get('cost_lte')
        tax_gte = kwargs.get('tax_gte')
        tax_lte = kwargs.get('tax_lte')
        notes = kwargs.get('notes')
        tags_contains_any = kwargs.get('tags_contains_any')
        tags_contains_all = kwargs.get('tags_contains_all')

        if user_id:
            try:
                user = get_user_model().objects.get(pk=user_id)
                queryset = queryset.filter(user=user)
            except get_user_model().DoesNotExist:
                raise GraphQLError(
                    f"No user found with id {user_id}. Could not filter receipts belonging to a user that does not exist.")

        if store_name:
            store_name = store_name.strip()
            queryset = Query.filter_queryset(
                queryset,
                {'store_name__icontains': store_name},
            )

        if expense:
            expense = expense.strip()
            queryset = Query.filter_queryset(
                queryset,
                {'expense': expense},
            )

        if date_gte:
            queryset = Query.filter_queryset(
                queryset,
                {'date__gte': date_gte},
            )

        if date_lte:
            queryset = Query.filter_queryset(
                queryset,
                {'date__lte': date_lte},
            )

        if cost_gte:
            queryset = Query.filter_queryset(
                queryset,
                {'cost__gte': cost_gte},
            )

        if cost_lte:
            queryset = Query.filter_queryset(
                queryset,
                {'cost__lte': cost_lte},
            )

        if tax_gte:
            queryset = Query.filter_queryset(
                queryset,
                {'tax__gte': tax_gte},
            )

        if tax_lte:
            queryset = Query.filter_queryset(
                queryset,
                {'tax__lte': tax_lte},
            )

        if notes:
            notes = notes.strip()
            queryset = Query.filter_queryset(
                queryset,
                {'notes__icontains': notes},
            )

            # notes = [note.strip() for note in notes.split(',')]
            # q_objects = Q()
            # for note in notes:
            #     q_objects |= Q(notes__icontains=note)
            # queryset = queryset.filter(q_objects).distinct()
            # if not queryset.exists():
            #     raise GraphQLError(
            #         'No receipts found matching filtered fields.'
            #     )

        if tags_contains_any:
            tags = [tag.strip() for tag in tags_contains_any]
            q_objects = Q()
            for tag in tags:
                q_objects |= Q(tags__tag_name__icontains=tag)
            queryset = queryset.filter(q_objects).distinct()
            if not queryset.exists():
                raise GraphQLError(
                    'No receipts found matching filtered fields.'
                )

        if tags_contains_all:
            tags = [tag.strip() for tag in tags_contains_all]
            for tag in tags:
                queryset = queryset.filter(tags__tag_name__icontains=tag)
            if not queryset.exists():
                raise GraphQLError(
                    'No receipts found matching filtered fields.'
                )

        return queryset


class ReceiptInput(graphene.InputObjectType):
    user_id = graphene.ID()
    store_name = graphene.String()
    date = graphene.Date()
    expense = graphene.String()
    tax = DecimalType()
    cost = DecimalType()
    notes = graphene.String()
    tags = graphene.List(graphene.String)
    receipt_image = Upload()


class CreateReceipt(graphene.Mutation):
    class Arguments:
        receipt_data = ReceiptInput(required=True)

    receipt = graphene.Field(ReceiptType)

    def mutate(root, info, receipt_data=None):
        receipt_instance = Receipt(
            user_id=receipt_data.user_id,
            store_name=receipt_data.store_name,
            date=receipt_data.date,
            expense=receipt_data.expense,
            tax=receipt_data.tax,
            cost=receipt_data.cost,
            notes=receipt_data.notes,
            receipt_image=receipt_data.receipt_image,
        )
        try:
            receipt_instance.save()
            if receipt_data.tags:
                input_tags = [tag.strip() for tag in receipt_data.tags]
                for input_tag in input_tags:
                    tag = Tag.objects.get_or_create(
                        tag_name = input_tag
                    )[0]
                    receipt_instance.tags.add(tag)
        except Exception as e:
            raise GraphQLError(e)
        return CreateReceipt(receipt=receipt_instance)


class UpdateReceipt(graphene.Mutation):
    class Arguments:
        receipt_data = ReceiptInput(required=True)

    receipt = graphene.Field(ReceiptType)

    def mutate(root, info, receipt_data=None):

        receipt_instance = Receipt.objects.get(pk=receipt_data.id)

        if receipt_instance:
            receipt_instance.store_name = receipt_data.store_name
            receipt_instance.date = receipt_data.date
            receipt_instance.expense = receipt_data.expense
            receipt_instance.tax = receipt_data.tax
            receipt_instance.cost = receipt_data.cost
            receipt_instance.notes = receipt_data.notes
            if receipt_instance.receipt_image:
                if receipt_data.receipt_image:
                    public_id = receipt_instance.image_public_id()
                    cloudinary.uploader.destroy(public_id)
                receipt_instance.receipt_image = receipt_data.receipt_image
            try:
                receipt_instance.save()
            except Exception as e:
                print(e)
        return UpdateReceipt(receipt=receipt_instance)


class DeleteReceipt(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()
    receipt = graphene.Field(lambda: ReceiptType)

    def mutate(root, info, id):
        try:
            receipt = Receipt.objects.get(id=id)
            if receipt.receipt_image:
                public_id = receipt.image_public_id()
                cloudinary.uploader.destroy(public_id)
            receipt.delete()
            return DeleteReceipt(success=True, receipt=receipt)
        except Receipt.DoesNotExist:
            return DeleteReceipt(success=False, receipt=None)


class Mutation(graphene.ObjectType):
    create_receipt = CreateReceipt.Field()
    update_receipt = UpdateReceipt.Field()
    delete_receipt = DeleteReceipt.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
