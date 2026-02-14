from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny

from annonces.models import Annonce
from django.shortcuts import get_object_or_404

from .serializers import RegisterSerializer, ProfileSerializer, UpdateProfileSerializer, ChangePasswordSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    queryset = User.objects.all()
    permission_classes = [AllowAny]

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        serializer = UpdateProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(ProfileSerializer(request.user).data)
    
class ToggleFavoriteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        annonce_id = request.data.get("annonce_id")
        annonce = get_object_or_404(Annonce, id=annonce_id)

        user = request.user

        if annonce in user.favorites.all():
            user.favorites.remove(annonce)
            return Response({"message": "Retiré des favoris"}, status=200)
        else:
            user.favorites.add(annonce)
            return Response({"message": "Ajouté aux favoris"}, status=200)

class MyFavoritesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favorites = request.user.favorites.all()
        from annonces.serializers import AnnonceSerializer
        serializer = AnnonceSerializer(favorites, many=True)
        return Response(serializer.data)

class PublicProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    #permission_classes = [AllowAny]
    serializer_class = ProfileSerializer
    queryset = User.objects.all()
    lookup_field = "id"

class UpdateMeView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateProfileSerializer

    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "Mot de passe modifié avec succès."})

