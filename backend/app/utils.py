from office365.sharepoint.client_context import ClientContext
from office365.runtime.auth.user_credential import UserCredential
import io
import pandas as pd

def upload_to_sharepoint(data, file_name):
    sharepoint_url = "https://agrosuper.sharepoint.com/sites/PanelPlantaRosario"
    folder_path = "/sites/PanelPlantaRosario/Documentos compartidos/1.- Torre de Control/1.- Gestión TC/2- Registro Bitácora TC (interfaz web)"
    username = 'user'
    password = 'password'

    ctx = ClientContext(sharepoint_url).with_credentials(
        UserCredential(username, password)
    )

    # Crear un DataFrame con los datos
    df = pd.DataFrame([data])

    # Guardar el DataFrame en un archivo Excel en memoria
    excel_file = io.BytesIO()
    df.to_excel(excel_file, index=False)
    excel_file.seek(0)

    # Subir el archivo a SharePoint
    target_folder = ctx.web.get_folder_by_server_relative_url(folder_path)
    target_file = target_folder.upload_file(file_name, excel_file.read()).execute_query()

    return target_file.serverRelativeUrl