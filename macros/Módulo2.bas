Attribute VB_Name = "Módulo2"
Sub Mostrar_Todas_Las_Hojas()
    Dim hoja As Worksheet
    Application.ScreenUpdating = False
    For Each hoja In ThisWorkbook.Worksheets
        hoja.Visible = xlSheetVisible
    Next hoja
    Application.ScreenUpdating = True
End Sub

