
import graphene
from graphene_django.types import DjangoObjectType, ObjectType
from .models import Receipt
from graphene_file_upload.scalars import Upload
from django.contrib.auth.models import User


class ReceiptType(DjangoObjectType):
    class Meta:
        fields = "__all__"
        model = Receipt

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
    cost = graphene.Decimal()
    tax = graphene.Decimal()
    receipt_image = Upload(required=False)
    


class CreateReceipt(graphene.Mutation):
    class Arguments:
        receipt_data = ReceiptInput(required=True)

    # ok = graphene.Boolean()
    receipt = graphene.Field(ReceiptType)

    @staticmethod
    def mutate(root, info, receipt_data=None):
        receipt_instance = Receipt(
            user_id=receipt_data.user_id,
            store_name=receipt_data.store_name,
            date=receipt_data.date,
            cost=receipt_data.cost,
            tax=receipt_data.tax,
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
            # receipt_instance.id=receipt_data.id
            receipt_instance.store_name=receipt_data.store_name
            receipt_instance.date=receipt_data.date
            receipt_instance.cost=receipt_data.cost
            receipt_instance.tax=receipt_data.tax
            receipt_instance.receipt_image=receipt_data.receipt_image

            try:
                receipt_instance.save()
            except Exception as e:
                print(e)
            return UpdateReceipt(receipt=receipt_instance)
        return UpdateReceipt(book=None)

class Mutation(graphene.ObjectType):
    create_receipt = CreateReceipt.Field()
    update_receipt = UpdateReceipt.Field()



# schema = graphene.Schema(query=Query)
schema = graphene.Schema(query=Query, mutation=Mutation)