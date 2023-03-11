import graphene
import cloudinary.uploader
import operator

from ...models import Receipt
from django.contrib.auth import get_user_model
from django.db.models import QuerySet
from django.db.models import Q
from functools import reduce

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


def filter_queryset(qs: QuerySet, condition, error_msg: str) -> QuerySet:
    filtered_qs = qs.filter(**condition)
    if not filtered_qs.exists():
        raise GraphQLError(error_msg)
    return filtered_qs


class ReceiptType(DjangoObjectType):
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
        cost_gte=graphene.Decimal(),
        cost_lte=graphene.Decimal(),
        tax_gte=graphene.Decimal(),
        tax_lte=graphene.Decimal(),
        notes=graphene.String(),
        tags_contains_any=graphene.String(),
        tags_contains_all=graphene.String(),
    )

    def resolve_receipt(self, info, id):
        try:
            return Receipt.objects.get(pk=id)
        except:
            return GraphQLError(f'No receipt with id: {id} found.')

    def resolve_all_receipts(self, info, **kwargs):
        try:
            return Receipt.objects.all()
        except:
            return GraphQLError('No receipts found.')

    def resolve_all_receipts_by_user(self, info, user_id):
        try:
            user = get_user_model().objects.get(pk=user_id)
        except:
            return GraphQLError(f'No user with user id: {user_id} found.')

        receipts = Receipt.objects.filter(user=user)

        if receipts:
            return receipts
        else:
            return GraphQLError(f'No receipts found for user with user id: {user_id}.')

    def resolve_filtered_receipts(self, info, **kwargs):
        if not kwargs:
            return GraphQLError('Please provide at least one field to filter by. Fields include: userId, storeName, expense, dateGte, dateLte, costGte, costLte, notes, and tags')

        queryset = Receipt.objects.all()
        if not queryset:
            return GraphQLError('No receipts found in the database.')

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
            except:
                raise GraphQLError(f"No user found with id {user_id}")

        if store_name:
            queryset = filter_queryset(
                queryset, 
                {'store_name__icontains': store_name},
                'No receipts found with the specified store name.'
            )

        if expense:
            queryset = filter_queryset(
                queryset, 
                {'expense': expense}, 
                'No receipts found with the specified expense.'
            )

        if date_gte:
            queryset = filter_queryset(
                queryset, 
                {'date__gte': date_gte}, 
                'No receipts found with a date greater than or equal to the specified date.'
            )

        if date_lte:
            queryset = filter_queryset(
                queryset, 
                {'date__lte': date_lte}, 
                'No receipts found with a date less than or equal to the specified date.'
            )

        if cost_gte:
            queryset = filter_queryset(
                queryset, 
                {'cost__gte': cost_gte}, 
                'No receipts found with a cost greater than or equal to the specified cost.'
            )

        if cost_lte:
            queryset = filter_queryset(
                queryset, 
                {'cost__lte': cost_lte}, 
                'No receipts found with a cost less than or equal to the specified cost.'
            )

        if tax_gte:
            queryset = filter_queryset(
                queryset, 
                {'tax__gte': tax_gte}, 
                'No receipts found with a tax greater than or equal to the specified tax.'
            )

        if tax_lte:
            queryset = filter_queryset(
                queryset, 
                {'tax__lte': tax_lte}, 
                'No receipts found with a tax less than or equal to the specified tax.'
            )

        if notes:
            notes = notes.split()
            query = reduce(
                operator.or_, 
                (Q(notes__icontains=note) for note in notes)
            )
            queryset = filter_queryset(
                queryset, 
                {'query': query}, 
                'No receipts found with the specified notes.'
            )

        if tags_contains_any:
            tags = tags_contains_any.split()
            queryset = filter_queryset(
                queryset, 
                {'tags__tag_name__in': tags}, 
                'No receipts found with the specified tags.'
            )

        if tags_contains_all:
            tags = tags_contains_all.split()
            query = reduce(
                operator.and_, 
                (Q(tags__tag_name__icontains=tag) for tag in tags)
            )
            queryset = filter_queryset(
                queryset, 
                {'query': query}, 
                'No receipts found with all of the specified tags.'
            )

        return queryset


class ReceiptInput(graphene.InputObjectType):
    user_id = graphene.ID()
    store_name = graphene.String()
    date = graphene.Date()
    expense = graphene.String()
    tax = graphene.Decimal()
    cost = graphene.Decimal()
    notes = graphene.String()
    receipt_image = Upload(required=False)


class CreateReceipt(graphene.Mutation):
    class Arguments:
        receipt_data = ReceiptInput(required=True)

    receipt = graphene.Field(ReceiptType)

    @staticmethod
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
        except Exception as e:
            print(e)
        return CreateReceipt(receipt=receipt_instance)


class UpdateReceipt(graphene.Mutation):
    class Arguments:
        receipt_data = ReceiptInput(required=True)

    receipt = graphene.Field(ReceiptType)

    @staticmethod
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

    @staticmethod
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
