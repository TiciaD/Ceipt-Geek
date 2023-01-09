from django_filters import rest_framework as filters
from django_filters import BaseInFilter
from django.db.models import Q, Count
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
    user_id = filters.NumberFilter(field_name='user__id', lookup_expr='exact')
    tags_contains_any = filters.CharFilter(method='filter_tags_contains_any')
    tags_contains_all = filters.CharFilter(method='filter_tags_contains_all')

    class Meta:
        model = Receipt
        fields = [
            'date_gte', 'date_lte', 'cost_gte',
            'cost_lte', 'store_name', 'user_id',
            'tags_contains_any', 'tags_contains_all'
        ]

    def filter_tags_contains_any(self, queryset, name, value):
        tags = value.split(',')
        q_objects = Q()
        for tag in tags:
            q_objects |= Q(tags__tag_name__icontains=tag)
        return queryset.filter(q_objects).distinct()

    def filter_tags_contains_all(self, queryset, name, value):
        tags = value.split(',')
        for tag in tags:
            queryset = queryset.filter(tags__tag_name__iexact=tag)
        return queryset

