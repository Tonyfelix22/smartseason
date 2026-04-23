from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound

from .models import Field, FieldUpdate
from .serializers import FieldSerializer, FieldListSerializer, FieldUpdateSerializer

# Fix 2 — import permissions from the central module, not defined inline
from smartseason.permissions import IsAdminOrReadOnly


# ---------------------------------------------------------------------------
# Field endpoints
# ---------------------------------------------------------------------------

class FieldListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/fields/
        List fields visible to the requesting user.
        Admins see all fields; agents see only their assigned fields.

    POST /api/fields/
        Create a new field (admin only).
        `created_by` is automatically set to the requesting user.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    def get_serializer_class(self):
        # Lean serializer for lists; full serializer for writes
        return FieldListSerializer if self.request.method == 'GET' else FieldSerializer

    def get_queryset(self):
        # Fix 4 — role-based scoping delegated to the model's QuerySet manager
        return (
            Field.objects
            .visible_to(self.request.user)
            .select_related('assigned_agent', 'created_by')
            .order_by('-created_at')
        )

    def perform_create(self, serializer):
        # Fix 3 — created_by set here in the view, not inside the serializer
        serializer.save(created_by=self.request.user)


class FieldDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/fields/{id}/   Retrieve full field detail (includes update history).
    PATCH  /api/fields/{id}/   Partially update a field (admin only).
    PUT    /api/fields/{id}/   Fully update a field (admin only).
    DELETE /api/fields/{id}/   Delete a field (admin only).
    """
    serializer_class = FieldSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    def get_queryset(self):
        # Fix 4 — same visible_to() manager used consistently across all views
        return (
            Field.objects
            .visible_to(self.request.user)
            .select_related('assigned_agent', 'created_by')
            .prefetch_related('updates__agent')
            .order_by('-created_at')
        )


# ---------------------------------------------------------------------------
# FieldUpdate endpoints
# ---------------------------------------------------------------------------

class FieldUpdateListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/fields/{field_pk}/updates/
         List all updates for a specific field (ordered newest first).

    POST /api/fields/{field_pk}/updates/
         Post a new update for the field.
         - `agent` is automatically set to the requesting user.
         - `field` is set from the URL parameter.
         - Stage sync is handled by FieldUpdate.save() on the model (Fix 1).
    """
    serializer_class = FieldUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _get_accessible_field(self):
        """
        Fix 4 — reuses visible_to() so access rules live in one place.
        Raises 404 (not 403) to avoid leaking the existence of a field.
        """
        qs = Field.objects.visible_to(self.request.user)
        try:
            return qs.get(pk=self.kwargs['field_pk'])
        except Field.DoesNotExist:
            raise NotFound("Field not found or you do not have access to it.")

    def get_queryset(self):
        self._get_accessible_field()  # access guard
        return (
            FieldUpdate.objects
            .filter(field_id=self.kwargs['field_pk'])
            .select_related('agent')
            .order_by('-created_at')
        )

    def perform_create(self, serializer):
        field = self._get_accessible_field()
        # Fix 1 — no stage-sync here; FieldUpdate.save() handles it automatically
        serializer.save(agent=self.request.user, field=field)


class GlobalRecentUpdateListView(generics.ListAPIView):
    """
    GET /api/fields/recent-updates/
        List recent updates across all fields visible to the user.
    """
    serializer_class = FieldUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only show updates for fields the user can actually see
        visible_fields = Field.objects.visible_to(self.request.user)
        return (
            FieldUpdate.objects
            .filter(field__in=visible_fields)
            .select_related('agent', 'field')
            .order_by('-created_at')[:10]
        )
