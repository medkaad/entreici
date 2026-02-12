from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    ville = serializers.CharField(write_only=True)
    quartier = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "password",
            "ville",
            "quartier",
        ]

    def create(self, validated_data):
        ville = validated_data.pop("ville")
        quartier = validated_data.pop("quartier", "")

        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        user.profile.ville = ville
        user.profile.quartier = quartier
        user.profile.save()

        return user


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "role",
            "is_verified",
        ]
