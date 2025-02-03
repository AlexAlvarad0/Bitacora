from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .utils import upload_to_sharepoint
from office365.sharepoint.client_context import ClientContext
from office365.runtime.auth.user_credential import UserCredential
import pandas as pd
import io
import openpyxl
from openpyxl.styles import PatternFill
from datetime import datetime

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

class SKULoadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Configurar SharePoint
            sharepoint_url = "https://agrosuper.sharepoint.com/sites/PanelPlantaRosario"
            folder_path = "/sites/PanelPlantaRosario/Documentos compartidos/1.- Torre de Control/1.- Gestión TC/2- Registro Bitácora TC (interfaz web)"
            archivo_excel = 'SKU.xlsx'

            ctx = ClientContext(sharepoint_url).with_credentials(
                UserCredential('aialvarado@agrosuper.com', 'Produccion2025.')
            )

            # Leer el archivo existente desde SharePoint
            response = ctx.web.get_file_by_server_relative_url(folder_path + "/" + archivo_excel).execute_query()
            file_content = io.BytesIO()
            response.download(file_content).execute_query()
            file_content.seek(0)

            # Leer el archivo Excel
            df_sku = pd.read_excel(file_content)

            # Verificar que el archivo tenga las columnas esperadas
            if 'SKU' not in df_sku.columns or 'Producto' not in df_sku.columns:
                return Response({'error': 'El archivo SKU.xlsx no tiene el formato esperado.'}, status=status.HTTP_400_BAD_REQUEST)

            # Generar las opciones en el formato "SKU - Producto"
            sku_options = ["Seleccionar..."] + [f"{row['SKU']} - {row['Producto']}" for _, row in df_sku.iterrows()]

            return Response({'skuOptions': sku_options}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class FormularioView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Obtener los datos del formulario
            data = request.data

            # Definir colores para cada tipo de desviación
            desviacion_colors = {
                'D1': '00FF00',  # Verde
                'D2': 'FFFF00',  # Amarillo
                'D3': 'FFA500',  # Naranja
                'D4': 'FF0000'   # Rojo
            }

            # Configurar SharePoint
            sharepoint_url = "https://agrosuper.sharepoint.com/sites/PanelPlantaRosario"
            folder_path = "/sites/PanelPlantaRosario/Documentos compartidos/1.- Torre de Control/1.- Gestión TC/2- Registro Bitácora TC (interfaz web)"
            archivo_excel = 'Bitácora TC.xlsx'

            ctx = ClientContext(sharepoint_url).with_credentials(
                UserCredential('aialvarado@agrosuper.com', 'Produccion2025.')
            )

            # Leer el archivo existente desde SharePoint
            response = ctx.web.get_file_by_server_relative_url(folder_path + "/" + archivo_excel).execute_query()
            file_content = io.BytesIO()
            response.download(file_content).execute_query()
            file_content.seek(0)

            # Leer el archivo Excel
            df_existente = pd.read_excel(file_content)

            # Obtener el nombre completo del usuario autenticado
            user = request.user
            full_name = f"{user.first_name} {user.last_name}"
            # Crear un nuevo registro
            nuevo_registro = pd.DataFrame([{
                "Fecha y Hora": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                "Tipo Notificación": data.get('tipo_notificacion'),
                "Sentido": data.get('sentido'),
                "Canal de Comunicación": data.get('canal_comunicacion'),
                "Emisor": full_name,
                "Área": data.get('area'),
                "Unidad": data.get('unidad'),
                "Indicador": data.get('indicador').title(),
                "Valor %": data.get('valor'),
                "Desviación": data.get('desviacion'),
                "Hora de Desviación": data.get('hora_desviacion'),
                "Respuesta": data.get('respuesta'),
                "SKU": data.get('sku'),
                "Producto": data.get('producto'),
                "Receptor": data.get('receptor').title(),
                "Observaciones": data.get('observaciones')
            }])

            # Combinar los datos existentes con el nuevo registro
            df_final = pd.concat([df_existente, nuevo_registro], ignore_index=True)

            # Guardar el DataFrame en un archivo Excel en memoria
            excel_file = io.BytesIO()
            df_final.to_excel(excel_file, index=False)
            excel_file.seek(0)

            # Aplicar formato condicional a la columna de Desviación
            workbook = openpyxl.load_workbook(excel_file)
            worksheet = workbook.active

            desv_col = None
            for idx, col in enumerate(df_final.columns):
                if col == 'Desviación':
                    desv_col = idx + 1
                    break

            if desv_col is not None:
                for row in range(2, len(df_final) + 2):
                    cell = worksheet.cell(row=row, column=desv_col)
                    if cell.value in desviacion_colors:
                        cell.fill = PatternFill(
                            start_color=desviacion_colors[cell.value],
                            end_color=desviacion_colors[cell.value],
                            fill_type='solid'
                        )

            # Autoajustar el ancho de todas las columnas
            for col in worksheet.columns:
                max_length = 0
                column = openpyxl.utils.get_column_letter(col[0].column)
                for cell in col:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = (max_length + 2)
                worksheet.column_dimensions[column].width = adjusted_width

            # Guardar los cambios en el archivo Excel
            excel_file = io.BytesIO()
            workbook.save(excel_file)
            excel_file.seek(0)

            # Subir el archivo actualizado a SharePoint
            target_folder = ctx.web.get_folder_by_server_relative_url(folder_path)
            target_file = target_folder.upload_file(archivo_excel, excel_file.read()).execute_query()

            return Response({'message': 'Registro guardado exitosamente'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        data = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        }
        return Response(data)

class BitacoraDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Configurar SharePoint
            sharepoint_url = "https://agrosuper.sharepoint.com/sites/PanelPlantaRosario"
            folder_path = "/sites/PanelPlantaRosario/Documentos compartidos/1.- Torre de Control/1.- Gestión TC/2- Registro Bitácora TC (interfaz web)"
            archivo_excel = 'Bitácora TC.xlsx'

            ctx = ClientContext(sharepoint_url).with_credentials(
                UserCredential('user', 'pass')
            )

            # Leer el archivo existente desde SharePoint
            response = ctx.web.get_file_by_server_relative_url(folder_path + "/" + archivo_excel).execute_query()
            file_content = io.BytesIO()
            response.download(file_content).execute_query()
            file_content.seek(0)

            # Leer el archivo Excel
            df = pd.read_excel(file_content)

            # Convertir el DataFrame a JSON
            data = df.to_dict(orient='records')

            return Response({'data': data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)