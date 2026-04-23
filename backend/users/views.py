from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserSerializer, RegisterSerializer

# Fix 2 — IsAdmin imported from the central permissions module
from smartseason.permissions import IsAdmin

User = get_user_model()


# ---------------------------------------------------------------------------
# Note: IsAdmin is defined in smartseason/permissions.py (Fix 2)
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Auth / profile endpoints
# ---------------------------------------------------------------------------

class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Create a new user account.
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    """
    GET /api/auth/me/
    Return the currently authenticated user's profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# User management (admin only)
# ---------------------------------------------------------------------------

class UserListView(generics.ListAPIView):
    """
    GET /api/users/
    List all users in the system.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.all().order_by('id')


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/users/{id}/  Retrieve a user.
    PATCH  /api/users/{id}/  Partially update a user.
    PUT    /api/users/{id}/  Fully update a user.
    DELETE /api/users/{id}/  Delete a user.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.all()
