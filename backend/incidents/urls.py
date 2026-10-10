from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IncidentViewSet, UserViewSet

router = DefaultRouter()
router.register(r'incidents', IncidentViewSet, basename='incident')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]