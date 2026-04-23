from rest_framework import serializers
from .models import Field, FieldUpdate
from users.serializers import UserSerializer


# ---------------------------------------------------------------------------
# FieldUpdate serializers
# ---------------------------------------------------------------------------

class FieldUpdateSerializer(serializers.ModelSerializer):
    """
    Full serializer for creating / reading field updates.
    `field` and `agent` are set automatically by the view — not required in
    the request body.
    """
    agent_detail = UserSerializer(source='agent', read_only=True)
    field_name = serializers.ReadOnlyField(source='field.name')

    class Meta:
        model = FieldUpdate
        fields = [
            'id',
            'field', 'field_name',
            'agent', 'agent_detail',
            'stage',
            'notes',
            'created_at',
        ]
        read_only_fields = ['id', 'field', 'agent', 'agent_detail', 'created_at']


# ---------------------------------------------------------------------------
# Field serializers
# ---------------------------------------------------------------------------

class FieldListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer used for the list endpoint — no nested updates
    to keep response payloads lean.
    """
    assigned_agent_detail = UserSerializer(source='assigned_agent', read_only=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    status = serializers.ReadOnlyField()

    class Meta:
        model = Field
        fields = [
            'id',
            'name',
            'crop_type',
            'planting_date',
            'stage', 'status',
            'assigned_agent', 'assigned_agent_detail',
            'created_by', 'created_by_detail',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'status']


class FieldSerializer(serializers.ModelSerializer):
    """
    Full serializer used for create / retrieve / update operations.
    Includes all nested updates on retrieve.
    """
    assigned_agent_detail = UserSerializer(source='assigned_agent', read_only=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    status = serializers.ReadOnlyField()
    updates = FieldUpdateSerializer(many=True, read_only=True)

    class Meta:
        model = Field
        fields = [
            'id',
            'name',
            'crop_type',
            'planting_date',
            'stage', 'status',
            'assigned_agent', 'assigned_agent_detail',
            'created_by', 'created_by_detail',
            'created_at', 'updated_at',
            'updates',
        ]
        read_only_fields = [
            'id',
            'created_at', 'updated_at',
            'status',
            'created_by', 'created_by_detail',
        ]

    # `created_by` is injected by the view's perform_create() — the serializer
    # has no need to access the HTTP request context.
