Attribute VB_Name = "Modulo_Boton_NotaSalida"
Sub INGRESAR_PRODUCTO_SALIDA()
    Dim hoja As Worksheet
    Dim tabla As ListObject
    Dim nuevaFila As ListRow
    Dim filaDisponible As Range
    Dim i As Long
    Dim filaEncontrada As Boolean

    Set hoja = ThisWorkbook.Sheets("Nota de Salida")
    Set tabla = hoja.ListObjects("tRNotaSalida")
    filaEncontrada = False

    ' Buscar primera fila vacía en la columna "Cod.Producto" (columna 2)
    For i = 1 To tabla.ListRows.Count
        If IsEmpty(tabla.DataBodyRange(i, 2).Value) Then
            Set filaDisponible = tabla.ListRows(i).Range
            filaEncontrada = True
            Exit For
        End If
    Next i

    ' Si no hay fila vacía, agregar una nueva
    If Not filaEncontrada Then
        Set nuevaFila = tabla.ListRows.Add
        Set filaDisponible = nuevaFila.Range
    End If

    ' Rellenar la fila disponible
    With filaDisponible
        ' .Cells(1, 1) es Ítem (con fórmula automática en tabla)
        .Cells(1, 2).Value = hoja.Range("F9").Value           ' Cod.Producto
        .Cells(1, 3).Value = hoja.Range("G9").Value           ' Producto
        .Cells(1, 4).Value = hoja.Range("H6").Value           ' Lote
        .Cells(1, 5).Value = hoja.Range("J6").Value           ' Fecha Vcto
        .Cells(1, 6).Value = hoja.Range("K6").Value           ' UM
        .Cells(1, 7).Value = hoja.Range("L6").Value           ' Cant.Bulto
        .Cells(1, 8).Value = hoja.Range("M6").Value           ' Cant.Cajas
        .Cells(1, 9).Value = hoja.Range("N6").Value           ' Cant.x Caja
        .Cells(1, 10).Value = hoja.Range("O6").Value          ' Cant.Fracción
        .Cells(1, 11).Value = hoja.Range("P6").Value          ' Cant.Total
        .Cells(1, 12).Value = hoja.Range("Q6").Value          ' Motivo de Salida
    End With

    ' Limpiar campos de entrada
    hoja.Range("F9:G9").ClearContents
    hoja.Range("J6:P6").ClearContents
    hoja.Range("Q6").ClearContents
    ' Lote (E4) NO se limpia

    MsgBox "Producto ingresado correctamente.", vbInformation
End Sub
Sub ELIMINAR_PRODUCTO_S()

    Dim celda As Range
    Dim fila As Long
    Dim columna As Long
    Dim filasAfectadas As Collection
    Dim clave As String
    Dim Respuesta As VbMsgBoxResult
    Dim i As Long

    Set filasAfectadas = New Collection

    ' Validación inicial
    If TypeName(Selection) <> "Range" Then
        MsgBox "Por favor, selecciona una o más celdas dentro del rango permitido (columnas F a P).", vbExclamation
        Exit Sub
    End If

    ' Recorrer celdas seleccionadas
    For Each celda In Selection.Cells
        fila = celda.Row
        columna = celda.Column

        ' Validar rango: columnas F (6) a P (16)
        If columna >= 6 And columna <= 16 Then
            clave = CStr(fila)
            On Error Resume Next
            filasAfectadas.Add fila, clave ' Agrega solo si no se repite
            On Error GoTo 0
        End If
    Next celda

    ' Verificar si hay filas válidas
    If filasAfectadas.Count = 0 Then
        MsgBox "No se seleccionaron celdas dentro del rango válido (columnas F a P).", vbExclamation
        Exit Sub
    End If

    ' Confirmación del usuario
    Respuesta = MsgBox("¿Estás seguro que deseas eliminar el contenido de " & filasAfectadas.Count & " fila(s)?", vbYesNo + vbQuestion, "Confirmar eliminación")

    If Respuesta = vbNo Then Exit Sub

    ' Eliminar contenido de cada fila
    For i = filasAfectadas.Count To 1 Step -1
        fila = filasAfectadas(i)
        Range(Cells(fila, 6), Cells(fila, 16)).ClearContents
    Next i

    MsgBox "Contenido eliminado correctamente en " & filasAfectadas.Count & " fila(s).", vbInformation

End Sub
Sub LIMPIAR_NOTASALIDA()
    Dim Respuesta As VbMsgBoxResult
    
    Respuesta = MsgBox("¿Estás seguro que deseas limpiar todos los datos?", vbYesNo + vbQuestion, "Confirmar limpieza")
    If Respuesta = vbNo Then Exit Sub

    With Hoja4
        .Range("F6").Value = ""
        .Range("G6").Value = ""
        .Range("H6").Value = ""
        .Range("F9").Value = ""
        .Range("G9").Value = ""
        .Range("J6").Value = ""
        .Range("K6").Value = ""
        .Range("L6").Value = ""
        .Range("M6").Value = ""
        .Range("N6").Value = ""
        .Range("O6").Value = ""
        .Range("P6").Value = ""
        .Range("Q6").Value = ""
        .Range("F13").Value = ""
        .Range("G13").Value = ""
        .Range("H13").Value = ""
    End With

    Dim ttNotaSalida As ListObject
    Set ttNotaSalida = Hoja4.ListObjects("tRNotaSalida")
    
    If ttNotaSalida.ListRows.Count >= 2 Then
        Do Until ttNotaSalida.ListRows.Count = 1
            ttNotaSalida.ListRows(2).Delete
        Loop
    End If

    With Hoja4
        ' Limpiar resumen inferior
        .Range("F28:P28").ClearContents
        
        ' Llevar el cursor al inicio
        .Range("E6").Select
    End With

    MsgBox "¡Datos limpiados correctamente!", vbInformation
End Sub

Sub PDF_NOTASALIDA()
    Dim wsSalida As Worksheet
    Dim wsHistorial As Worksheet
    Dim CeldaNombre As Range
    Dim NombreArchivo As String
    Dim RutaArchivo As String
    Dim TextoCabecera As String
    Dim ParteNombre As String
    Dim tablaOrigen As ListObject
    Dim tablaDestino As ListObject
    Dim filaDestino As ListRow
    Dim fila As ListRow
    Dim i As Long
    Dim Respuesta As VbMsgBoxResult

    Set wsSalida = Worksheets("Nota de Salida")       ' Hoja4
    Set wsHistorial = Worksheets("Historial Salida")  ' Hoja6
    Set CeldaNombre = wsSalida.Range("G21")
    Set tablaOrigen = wsSalida.ListObjects("tRNotaSalida")
    Set tablaDestino = wsHistorial.ListObjects("tRHistoSalida")

    ' Obtener nombre para archivo PDF
    If CeldaNombre.Value = "" Then
        ParteNombre = "SinNombre"
    Else
        If InStr(1, CeldaNombre.Value, " ", vbTextCompare) > 0 Then
            ParteNombre = Mid(CeldaNombre.Value, 1, InStr(1, CeldaNombre.Value, " ", vbTextCompare) - 1)
        Else
            ParteNombre = CeldaNombre.Value
        End If
        ParteNombre = LimpiarNombreArchivo(ParteNombre)
    End If

    ' Confirmación
    Respuesta = MsgBox("¿Deseas generar el PDF y guardar los datos en el historial?", vbYesNo + vbQuestion, "Confirmación")
    If Respuesta = vbNo Then Exit Sub

    ' Guardar automáticamente el archivo antes de continuar
    If Application.ActiveWorkbook.Path = "" Then
        MsgBox "Debes guardar el archivo de Excel antes de continuar.", vbExclamation
        Exit Sub
    End If
    Application.ActiveWorkbook.Save

    ' Escribir encabezado temporal
    TextoCabecera = "Nombre: " & ParteNombre & "   Fecha: " & Format(Now, "dd-mm-yyyy") & "   Hora: " & Format(Now, "hh:mm:ss")
    wsSalida.Range("F2").Value = TextoCabecera

    ' Crear nombre de archivo y ruta
    NombreArchivo = ParteNombre & "_" & Format(Now, "dd-mm-yyyy_hh-mm") & ".pdf"
    RutaArchivo = Application.ActiveWorkbook.Path & Application.PathSeparator & NombreArchivo

    ' Exportar a PDF
    On Error GoTo ExportError
    wsSalida.ExportAsFixedFormat _
        Type:=xlTypePDF, _
        Filename:=RutaArchivo, _
        Quality:=xlQualityStandard, _
        IgnorePrintAreas:=False, _
        OpenAfterPublish:=True

    ' Limpiar encabezado temporal
    wsSalida.Range("F2").Value = ""

    ' Validar que la tabla origen tenga datos
    If tablaOrigen.ListRows.Count = 0 Then
        MsgBox "La tabla de origen está vacía. No hay datos para copiar.", vbExclamation
        Exit Sub
    End If

    ' Copiar datos a historial
    For Each fila In tablaOrigen.ListRows
        With tablaDestino
            ' Buscar fila vacía o agregar nueva
            Dim filaLibreEncontrada As Boolean
            Dim lr As ListRow
            filaLibreEncontrada = False

            For Each lr In .ListRows
                If Application.WorksheetFunction.CountA(lr.Range) = 0 Then
                    Set filaDestino = lr
                    filaLibreEncontrada = True
                    Exit For
                End If
            Next lr

            ' Si no hay fila vacía, agregar nueva
            If Not filaLibreEncontrada Then
                Set filaDestino = .ListRows.Add
            End If

            ' Copiar datos
            For i = 1 To tablaOrigen.ListColumns.Count
                filaDestino.Range.Cells(1, i).Value = fila.Range.Cells(1, i).Value
            Next i
            '  Añadir la fecha del día en la última columna
            filaDestino.Range.Cells(1, tablaDestino.ListColumns.Count).Value = Date
        End With
    Next fila

    MsgBox "PDF generado correctamente, archivo guardado y datos enviados al historial.", vbInformation
    Exit Sub

ExportError:
    MsgBox "No se pudo exportar el PDF. Verifica que el archivo no esté abierto o que el nombre sea válido.", vbCritical
End Sub

' Función para limpiar caracteres inválidos en nombres de archivo
Function LimpiarNombreArchivo(s As String) As String
    Dim i As Long
    Dim ch As String
    For i = 1 To Len(s)
        ch = Mid(s, i, 1)
        If InStr("\/:*?""<>|", ch) = 0 Then
            LimpiarNombreArchivo = LimpiarNombreArchivo & ch
        End If
    Next i
End Function

