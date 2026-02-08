Attribute VB_Name = "Módulo1"
Sub Registro_Clientes()
    Application.ScreenUpdating = False
    Worksheets("Registro Clientes").Visible = True
    Worksheets("Registro Productos").Visible = False
    Worksheets("Nota de Ingreso").Visible = False
    Worksheets("Nota de Salida").Visible = False
    Worksheets("Historial Ingreso").Visible = False
    Worksheets("Historial Salida").Visible = False
    Worksheets("Acta de Recepcion").Visible = False
    Worksheets("Kardex").Visible = False
    Worksheets("Ajustes").Visible = False
End Sub
Sub Registro_Productos()
    Application.ScreenUpdating = False
    Worksheets("Registro Productos").Visible = True
    Worksheets("Registro Clientes").Visible = False
    Worksheets("Nota de Ingreso").Visible = False
    Worksheets("Nota de Salida").Visible = False
    Worksheets("Historial Ingreso").Visible = False
    Worksheets("Historial Salida").Visible = False
    Worksheets("Acta de Recepcion").Visible = False
    Worksheets("Kardex").Visible = False
    Worksheets("Ajustes").Visible = False
End Sub
Sub Nota_de_Ingreso()
    Application.ScreenUpdating = False
    Worksheets("Nota de Ingreso").Visible = True
    Worksheets("Registro Productos").Visible = False
    Worksheets("Registro Clientes").Visible = False
    Worksheets("Nota de Salida").Visible = False
    Worksheets("Historial Ingreso").Visible = False
    Worksheets("Historial Salida").Visible = False
    Worksheets("Acta de Recepcion").Visible = False
    Worksheets("Kardex").Visible = False
    Worksheets("Ajustes").Visible = False
End Sub
Sub Nota_de_Salida()
    Application.ScreenUpdating = False
    Worksheets("Nota de Salida").Visible = True
    Worksheets("Nota de Ingreso").Visible = False
    Worksheets("Registro Productos").Visible = False
    Worksheets("Registro Clientes").Visible = False
    Worksheets("Historial Ingreso").Visible = False
    Worksheets("Historial Salida").Visible = False
    Worksheets("Acta de Recepcion").Visible = False
    Worksheets("Kardex").Visible = False
    Worksheets("Ajustes").Visible = False
End Sub
Sub Historial_Ingreso()
    Application.ScreenUpdating = False
    Worksheets("Historial Ingreso").Visible = True
    Worksheets("Nota de Salida").Visible = False
    Worksheets("Nota de Ingreso").Visible = False
    Worksheets("Registro Productos").Visible = False
    Worksheets("Registro Clientes").Visible = False
    Worksheets("Historial Salida").Visible = False
    Worksheets("Acta de Recepcion").Visible = False
    Worksheets("Kardex").Visible = False
    Worksheets("Ajustes").Visible = False
End Sub
Sub Historial_Salida()
    Application.ScreenUpdating = False
    Worksheets("Historial Salida").Visible = True
    Worksheets("Historial Ingreso").Visible = False
    Worksheets("Nota de Salida").Visible = False
    Worksheets("Nota de Ingreso").Visible = False
    Worksheets("Registro Productos").Visible = False
    Worksheets("Registro Clientes").Visible = False
    Worksheets("Acta de Recepcion").Visible = False
    Worksheets("Kardex").Visible = False
    Worksheets("Ajustes").Visible = False
End Sub
Sub Acta_de_Recepcion()
    Application.ScreenUpdating = False
    Worksheets("Acta de Recepcion").Visible = True
    Worksheets("Historial Salida").Visible = False
    Worksheets("Historial Ingreso").Visible = False
    Worksheets("Nota de Salida").Visible = False
    Worksheets("Nota de Ingreso").Visible = False
    Worksheets("Registro Productos").Visible = False
    Worksheets("Registro Clientes").Visible = False
    Worksheets("Kardex").Visible = False
    Worksheets("Ajustes").Visible = False
End Sub
Sub Kardex_Hoja()
    Application.ScreenUpdating = False
    Worksheets("Kardex").Visible = True
    Worksheets("Acta de Recepcion").Visible = False
    Worksheets("Historial Salida").Visible = False
    Worksheets("Historial Ingreso").Visible = False
    Worksheets("Nota de Salida").Visible = False
    Worksheets("Nota de Ingreso").Visible = False
    Worksheets("Registro Productos").Visible = False
    Worksheets("Registro Clientes").Visible = False
    Worksheets("Ajustes").Visible = False
End Sub

Sub Ajustes()
    Application.ScreenUpdating = False
    Worksheets("Ajustes").Visible = True
    Worksheets("Acta de Recepcion").Visible = False
    Worksheets("Historial Salida").Visible = False
    Worksheets("Historial Ingreso").Visible = False
    Worksheets("Nota de Salida").Visible = False
    Worksheets("Nota de Ingreso").Visible = False
    Worksheets("Registro Productos").Visible = False
    Worksheets("Registro Clientes").Visible = False
    Worksheets("Kardex").Visible = False
End Sub
