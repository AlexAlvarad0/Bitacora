from django.db import models

class Mensaje(models.Model):
    texto = models.CharField(max_length=255)  # Campo de texto para el mensaje

    def __str__(self):
        return self.texto