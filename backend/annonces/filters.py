import django_filters
from .models import Annonce

class AnnonceFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")

    class Meta:
        model = Annonce
        fields = ["city", "type"]
