"""
smartseason/permissions.py
--------------------------
Central home for all custom DRF permission classes.

Keeping permissions here (rather than inside individual app views) means:
  - Access-control rules are auditable in one place.
  - Both `users` and `fields` apps import from the same source of truth.
  - Adding a new role only requires changing this file.
"""

from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Allow access only to authenticated users whose role is 'admin'.
    Used for write operations and admin-only management endpoints.
    """

    message = "You must be an administrator to perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Authenticated users can read any resource they have queryset access to.
    Write operations (POST, PUT, PATCH, DELETE) are restricted to admins.
    """

    message = "Only administrators may modify this resource."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'admin'
