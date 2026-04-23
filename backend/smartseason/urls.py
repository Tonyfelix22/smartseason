from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import health_check

urlpatterns = [
    # Health check
    path('', health_check, name='health_check_root'),
    path('api/health/', health_check, name='health_check'),
    
    # Django admin
    path('admin/', admin.site.urls),

    # JWT authentication
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Users app  (register, me, users list/detail)
    path('api/auth/', include('users.urls')),

    # Fields app  (fields + nested updates)
    path('api/fields/', include('fields.urls')),
]
