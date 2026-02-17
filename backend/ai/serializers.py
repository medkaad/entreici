from rest_framework import serializers

class AIGenerateAnnonceSerializer(serializers.Serializer):
    draft = serializers.CharField(max_length=2000, allow_blank=False)
    ville = serializers.CharField(max_length=120, required=False, allow_blank=True)
    quartier = serializers.CharField(max_length=120, required=False, allow_blank=True)
    type_hint = serializers.CharField(max_length=50, required=False, allow_blank=True)
    category_hint = serializers.CharField(max_length=120, required=False, allow_blank=True)
    price_hint = serializers.CharField(max_length=50, required=False, allow_blank=True)
