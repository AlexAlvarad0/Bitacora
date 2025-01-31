from rest_framework import viewsets
from .models import Mensaje
from .serializers import MensajeSerializer

class MensajeViewSet(viewsets.ModelViewSet):
    queryset = Mensaje.objects.all()  # Obtiene todos los mensajes
    serializer_class = MensajeSerializer  # Usa el serializador de Mensaje