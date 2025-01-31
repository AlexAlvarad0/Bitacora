from django.urls import path
from .views import LoginView
from .views import LoginView, FormularioView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('formulario/', FormularioView.as_view(), name='formulario'),
]