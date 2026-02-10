from rest_framework import serializers
from .models import Annonce

class AnnonceSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.email")

    class Meta:
        model = Annonce
        fields = "__all__"
