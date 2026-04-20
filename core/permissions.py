from rest_framework.permissions import BasePermission

class IsOwner(BasePermission):
    """Object-level: only the owner can access."""
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
