from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views import ChangePasswordView, LoginView, LogoutView, ProfileView, RegisterView

urlpatterns = [
    # Auth — endpoints 1-5
    path("register/", RegisterView.as_view(), name="auth-register"),        # 1
    path("login/", LoginView.as_view(), name="auth-login"),                  # 2
    path("logout/", LogoutView.as_view(), name="auth-logout"),               # 3
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"), # 4
    path("token/verify/", TokenVerifyView.as_view(), name="token-verify"),   # 5

    # Profile — endpoints 6-8
    path("profile/", ProfileView.as_view(), name="user-profile"),            # 6 & 7
    path("change-password/", ChangePasswordView.as_view(), name="change-password"), # 8
]
