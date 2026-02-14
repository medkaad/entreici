from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, MeView, ToggleFavoriteView, MyFavoritesView, PublicProfileView, UpdateMeView, ChangePasswordView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("<int:id>/", PublicProfileView.as_view(), name="public-profile"),
    path("favorites/toggle/", ToggleFavoriteView.as_view()),
    path("favorites/", MyFavoritesView.as_view()),
    path("me/update/", UpdateMeView.as_view(), name="update-me"),
    path("change-password/", ChangePasswordView.as_view()),
]
