Attribute VB_Name = "Modulo_Boton_Acta_Recep"
Sub InsertarDesdeTRProductos_Acta()
    Dim hojaOrigen As Worksheet, hojaDestino As Worksheet
    Dim tablaOrigen As ListObject, tablaDestino As ListObject
    Dim filaOrigen As ListRow, filaDestino As Range
    Dim docTipo As String, docNumero As String
    Dim filasAgregadas As Long
    Dim necesitaAutoFit As Boolean
    Dim i As Long
    
    ' === Configurar hojas y tablas ===
    Set hojaOrigen = ThisWorkbook.Sheets("Registro Productos")
    Set hojaDestino = ThisWorkbook.Sheets("Acta de Recepcion")
    Set tablaOrigen = hojaOrigen.ListObjects("tRProductos")
    Set tablaDestino = hojaDestino.ListObjects("tRActaRecepcion")
    
    ' === Obtener valores del formulario ===
    docTipo = hojaDestino.Range("E5").Value
    docNumero = hojaDestino.Range("F5").Value
    
    If docTipo = "" Or docNumero = "" Then
        MsgBox "Debe ingresar T. Documento y N° Documento antes de continuar.", vbExclamation
        Exit Sub
    End If
    
    Application.ScreenUpdating = False
    filasAgregadas = 0
    
    ' === Recorrer filas en la tabla origen ===
    For Each filaOrigen In tablaOrigen.ListRows
        If filaOrigen.Range.Cells(1, 12).Value = docTipo And _
           filaOrigen.Range.Cells(1, 13).Value = docNumero Then
           
' === Buscar primera fila vacía ===
Set filaDestino = Nothing
For i = 1 To tablaDestino.ListRows.Count
    If IsEmpty(tablaDestino.DataBodyRange(i, 2).Value) Then
        Set filaDestino = tablaDestino.ListRows(i).Range
        Exit For
    End If
Next i
            
            ' === Si no hay fila vacía, agregar una nueva ===
            If filaDestino Is Nothing Then
                Set filaDestino = tablaDestino.ListRows.Add.Range
            End If
            
            ' === Copiar datos ===
            With filaDestino
                .Cells(1, 2).Value = filaOrigen.Range.Cells(1, 2).Value    ' CODIGO PRODUCTO
                .Cells(1, 3).Value = filaOrigen.Range.Cells(1, 3).Value    ' DESCRIPCIÓN
                .Cells(1, 4).Value = filaOrigen.Range.Cells(1, 23).Value   ' FABRICANTE
                .Cells(1, 5).Value = filaOrigen.Range.Cells(1, 4).Value    ' LOTE/SERIE
                .Cells(1, 6).Value = filaOrigen.Range.Cells(1, 11).Value   ' FE.VCTO.
                .Cells(1, 7).Value = filaOrigen.Range.Cells(1, 22).Value   ' CANT.SOLIC
                .Cells(1, 8).Value = filaOrigen.Range.Cells(1, 22).Value   ' CANT.RECI
            End With
            
            ' === Formato y ajuste ===
            filaDestino.Font.Size = 10
            filaDestino.Cells(1, 6).NumberFormat = "dd/mm/yyyy"
            
            ' Configurar alineación y WrapText
            filaDestino.Cells.HorizontalAlignment = xlLeft
            filaDestino.Cells.WrapText = False
            filaDestino.Cells(1, 3).WrapText = True ' Descripción
            filaDestino.Cells(1, 4).WrapText = True ' Fabricante
            
            ' === Ajustar altura dinámicamente ===
            filaDestino.Rows.AutoFit
            If filaDestino.RowHeight < 20 Then filaDestino.RowHeight = 20
            
            filasAgregadas = filasAgregadas + 1
        End If
    Next filaOrigen
    
    Application.ScreenUpdating = True
    
    If filasAgregadas > 0 Then
        MsgBox filasAgregadas & " producto(s) agregado(s) correctamente al Acta de Recepción.", vbInformation
    Else
        MsgBox "No se encontraron productos con los datos indicados.", vbExclamation
    End If
End Sub

Sub Limpiar_ActaRecepcion()
    Dim hojaDestino As Worksheet
    Dim tablaDestino As ListObject
    Dim Respuesta As VbMsgBoxResult
    
    Set hojaDestino = ThisWorkbook.Sheets("Acta de Recepcion")
    Set tablaDestino = hojaDestino.ListObjects("tRActaRecepcion")
    
    ' Confirmación
    Respuesta = MsgBox("¿Está seguro de que desea limpiar todos los datos del Acta de Recepción?", _
                        vbYesNo + vbQuestion, "Confirmar limpieza")
    If Respuesta = vbNo Then Exit Sub
    
    Application.ScreenUpdating = False
    
    ' Limpiar campos de encabezado (T. Documento y N° Documento)
    hojaDestino.Range("E5").ClearContents
    hojaDestino.Range("F5").ClearContents
    
    ' Limpiar filas de la tabla, dejando la estructura
    If tablaDestino.ListRows.Count >= 1 Then
        Do Until tablaDestino.ListRows.Count = 0
            tablaDestino.ListRows(1).Delete
        Loop
    End If
    
    ' Dejar el cursor en E5
    hojaDestino.Range("E5").Select
    
    Application.ScreenUpdating = True
    
    MsgBox "¡Acta de Recepción limpiada correctamente!", vbInformation
End Sub


Sub PDF_ActaRecepcion()
    Dim CeldaNombre As Range
    Dim NombreArchivo As String
    Dim RutaArchivo As String
    Dim FechaHora As String
    Dim separadorPos As Long

    ' Confirmar con el usuario si desea generar el PDF
    If MsgBox("¿Deseas generar el archivo PDF del Acta de Recepción?", vbQuestion + vbYesNo, "Confirmar") = vbNo Then
        Exit Sub
    End If

    On Error GoTo ExportError ' Control de errores para exportación

    Set CeldaNombre = Hoja7.Range("F15")
    FechaHora = Format(Now, "ddmmyyyy_hhmm")

    ' Generar nombre del archivo
    If Trim(CeldaNombre.Value) = "" Then
        NombreArchivo = "Acta_" & FechaHora & ".pdf"
    Else
        separadorPos = InStr(1, CeldaNombre.Value, "", vbTextCompare)
        If separadorPos > 1 Then
            NombreArchivo = Mid(CeldaNombre.Value, 1, separadorPos - 1)
        Else
            NombreArchivo = CeldaNombre.Value
        End If
        NombreArchivo = NombreArchivo & "_" & FechaHora & ".pdf"
    End If

    ' Ruta donde se guardará el archivo
    RutaArchivo = Application.ActiveWorkbook.Path & Application.PathSeparator & NombreArchivo

    ' Exportar a PDF
    Hoja7.ExportAsFixedFormat Type:=xlTypePDF, Filename:=RutaArchivo, Quality:=xlQualityStandard, _
                               IgnorePrintAreas:=False, OpenAfterPublish:=True

    ' Confirmación al usuario
    MsgBox "PDF generado correctamente, archivo guardado.", vbInformation, "Éxito"
    Hoja7.Range("F15").Select
    Exit Sub

ExportError:
    MsgBox "No se pudo exportar el PDF. Verifica que el archivo no esté abierto o que el nombre sea válido.", vbCritical, "Error al exportar"
End Sub


