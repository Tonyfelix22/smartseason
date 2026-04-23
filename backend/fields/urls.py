from django.urls import path
from .views import (
    FieldListCreateView, 
    FieldDetailView, 
    FieldUpdateListCreateView,
    GlobalRecentUpdateListView
)

urlpatterns = [
    path('', FieldListCreateView.as_view(), name='field-list'),
    path('recent-updates/', GlobalRecentUpdateListView.as_view(), name='global-recent-updates'),
    path('<int:pk>/', FieldDetailView.as_view(), name='field-detail'),
    path('<int:field_pk>/updates/', FieldUpdateListCreateView.as_view(), name='field-updates'),
]
