import graphene
import cloudinary.uploader
from graphene_django.types import DjangoObjectType, ObjectType
from ...models import Receipt
from graphene_file_upload.scalars import Upload
from graphene_django.converter import convert_django_field
from cloudinary.models import CloudinaryField

# Register a custom converter for CloudinaryField


@convert_django_field.register(CloudinaryField)
def convert_field_to_string(field, registry=None):
    """
    Converter for CloudinaryField to be used by Graphene.
    """
    return graphene.String()


class ReceiptType(DjangoObjectType):
    class Meta:
        fields = "__all__"
        model = Receipt

    def resolve_receipt_image(self, info):
        if self.receipt_image:
            self.receipt_image = self.image_url()
        return self.receipt_image


class Query(ObjectType):
    receipt = graphene.Field(ReceiptType, id=graphene.Int())
    receipts = graphene.List(ReceiptType)

    def resolve_receipt(self, info, **kwargs):
        id = kwargs.get('id')

        if id is not None:
            return Receipt.objects.get(pk=id)

        return None

    def resolve_receipts(self, info, **kwargs):
        return Receipt.objects.all()


class ReceiptInput(graphene.InputObjectType):
    id = graphene.ID()
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
            receipt.delete()
            return DeleteReceipt(success=True, receipt=receipt)
        except Receipt.DoesNotExist:
            return DeleteReceipt(success=False, receipt=None)


class Mutation(graphene.ObjectType):
    create_receipt = CreateReceipt.Field()
    update_receipt = UpdateReceipt.Field()
    delete_receipt = DeleteReceipt.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
