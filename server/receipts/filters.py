from django_filters import rest_framework as filters
from .models import Receipt


class ReceiptFilter(filters.FilterSet):
    date_gte = filters.DateFilter(field_name='date', lookup_expr='gte')
    date_lte = filters.DateFilter(field_name='date', lookup_expr='lte')
    cost_gte = filters.NumberFilter(field_name='cost', lookup_expr='gte')
    cost_lte = filters.NumberFilter(field_name='cost', lookup_expr='lte')
    store_name = filters.CharFilter(
        field_name='store_name', 
        lookup_expr='icontains'
    )
    user_id = filters.NumberFilter(field_name='user', lookup_expr='exact')

    class Meta:
        model = Receipt
        fields = [
            'date_gte', 'date_lte', 'cost_gte',
            'cost_lte', 'store_name', 'user_id'
        ]
