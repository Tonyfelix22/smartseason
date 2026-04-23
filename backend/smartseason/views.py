from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Simple health check endpoint for Render/deployment services.
    Returns 200 OK if the application is running.
    """
    return JsonResponse({"status": "healthy", "service": "smartseason-backend"}, status=200)
