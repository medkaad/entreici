from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

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
            "first_name",
            "last_name",
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
    ville = serializers.CharField(source="profile.ville", read_only=True)
    quartier = serializers.CharField(source="profile.quartier", read_only=True)
    score = serializers.FloatField(source="profile.score", read_only=True)
    total_reviews = serializers.IntegerField(source="profile.total_reviews", read_only=True)
    badge = serializers.CharField(source="profile.badge", read_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "is_verified",
            "ville",
            "quartier",
            "score",
            "total_reviews",
            "badge",
        ]

class UpdateProfileSerializer(serializers.ModelSerializer):
    ville = serializers.CharField(source="profile.ville", required=False)
    quartier = serializers.CharField(source="profile.quartier", required=False)
    description = serializers.CharField(source="profile.description", required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "username",
            "ville",
            "quartier",
            "description",
        ]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})

        # update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # update profile fields
        profile = instance.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)

        profile.save()

        return instance

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mot de passe actuel incorrect.")
        return value

    def validate_new_password(self, value):
        validate_password(value)  # utilise les validateurs Django
        return value

    def save(self, **kwargs):
        user = self.context["request"].user
        new_password = self.validated_data["new_password"]
        user.set_password(new_password)
        user.save()
        return user

class PublicProfileSerializer(serializers.ModelSerializer):
    ville = serializers.CharField(source="profile.ville", read_only=True)
    quartier = serializers.CharField(source="profile.quartier", read_only=True)
    description = serializers.CharField(source="profile.description", read_only=True)
    score = serializers.FloatField(source="profile.score", read_only=True)
    total_reviews = serializers.IntegerField(source="profile.total_reviews", read_only=True)
    badge = serializers.CharField(source="profile.badge", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "is_verified",
            "ville",
            "quartier",
            "description",
            "score",
            "total_reviews",
            "badge",
        ]
