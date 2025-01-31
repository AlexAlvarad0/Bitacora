from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MensajeViewSet  # Importa la vista correcta

# Configura el router para la API
router = DefaultRouter()
router.register(r'mensajes', MensajeViewSet)  # Registra la vista de MensajeViewSet

# Define las URL patterns
urlpatterns = [
    path('', include(router.urls)),  # Incluye las URLs generadas por el router
]