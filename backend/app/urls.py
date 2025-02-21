from django.urls import path
from .views import LoginView, FormularioView, SKULoadView, UserProfileView, BitacoraDataView, CargaMasivaView, ExcelDataView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('formulario/', FormularioView.as_view(), name='formulario'),
    path('sku/', SKULoadView.as_view(), name='sku-load'),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    path('bitacora/', BitacoraDataView.as_view(), name='bitacora-data'),
    path('carga-masiva/', CargaMasivaView.as_view(), name='carga-masiva'),
    path('excel-data/', ExcelDataView.as_view(), name='excel-data'),
]
