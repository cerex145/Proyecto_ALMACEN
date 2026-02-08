Attribute VB_Name = "Modulo_Boton_NotaIngreso"
Sub INGRESAR_PRODUCTO()
    Dim hoja As Worksheet
    Dim tabla As ListObject
    Dim nuevaFila As ListRow
    Dim filaDisponible As Range
    Dim siguienteItem As Long
    Dim i As Long
    Dim filaEncontrada As Boolean
    
    Set hoja = ThisWorkbook.Sheets("Nota de Ingreso")
    Set tabla = hoja.ListObjects("tRNotaIngreso")
    filaEncontrada = False

    ' Buscar primera fila vacía en la columna "Cod.Producto"
    For i = 1 To tabla.ListRows.Count
        If IsEmpty(tabla.DataBodyRange(i, 2).Value) Then ' Columna 2 = Cod. Producto
            Set filaDisponible = tabla.ListRows(i).Range
            filaEncontrada = True
            Exit For
        End If
    Next i

    ' Si no hay fila vacía, se agrega una nueva
    If Not filaEncontrada Then
        Set nuevaFila = tabla.ListRows.Add
        Set filaDisponible = nuevaFila.Range
    End If

    ' Calcular número de ítem
    If tabla.ListRows.Count = 0 Then
        siguienteItem = 1
    Else
        On Error Resume Next
        siguienteItem = Application.WorksheetFunction.Max(tabla.ListColumns(1).DataBodyRange) + 1
        If siguienteItem = 0 Then siguienteItem = 1
        On Error GoTo 0
    End If

    ' Llenar la fila
    With filaDisponible
        .Cells(1, 2).Value = hoja.Range("F9").Value               ' Cod. Producto
        .Cells(1, 3).Value = hoja.Range("G9").Value               ' Producto
        .Cells(1, 4).Value = hoja.Range("H6").Value               ' Lote
        .Cells(1, 5).Value = hoja.Range("I9").Value               ' Fecha Vcto
        .Cells(1, 6).Value = hoja.Range("J9").Value               ' UM
        .Cells(1, 7).Value = hoja.Range("K9").Value               ' Fabri.
        .Cells(1, 8).Value = hoja.Range("L9").Value               ' Temp.
        .Cells(1, 9).Value = hoja.Range("M9").Value               ' Cant. Bulto
        .Cells(1, 10).Value = hoja.Range("N9").Value              ' Cant. Cajas
        .Cells(1, 11).Value = hoja.Range("O9").Value             ' Cant. x Caja
        .Cells(1, 12).Value = hoja.Range("P9").Value             ' Cant. Fracción
        .Cells(1, 13).Value = hoja.Range("Q9").Value             ' Cant. Total
    End With

    ' Limpiar campos de entrada
    hoja.Range("F9:G9").ClearContents
    hoja.Range("I9:Q9").ClearContents

    MsgBox "Producto ingresado correctamente", vbInformation
End Sub
Sub ELIMINAR_PRODUCTO_N()

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
        MsgBox "Por favor, selecciona una o más celdas dentro del rango permitido (E28:Q...)", vbExclamation
        Exit Sub
    End If

    ' Recorrer celdas seleccionadas
    For Each celda In Selection.Cells
        fila = celda.Row
        columna = celda.Column

        ' Validar rango: fila > 27 y columnas E (5) a Q (17)
        If fila > 27 And columna >= 5 And columna <= 17 Then
            clave = CStr(fila)
            On Error Resume Next
            filasAfectadas.Add fila, clave ' Agrega solo si no se repite
            On Error GoTo 0
        End If
    Next celda

    ' Verificar si hay filas válidas
    If filasAfectadas.Count = 0 Then
        MsgBox "No se seleccionaron celdas dentro del rango válido (columnas E a Q, filas mayores a 27).", vbExclamation
        Exit Sub
    End If

    ' Confirmación del usuario
    Respuesta = MsgBox("¿Estás seguro que deseas eliminar el contenido de " & filasAfectadas.Count & " fila(s)?", vbYesNo + vbQuestion, "Confirmar eliminación")

    If Respuesta = vbNo Then Exit Sub

    ' Eliminar contenido de cada fila
    For i = filasAfectadas.Count To 1 Step -1
        fila = filasAfectadas(i)
        Range(Cells(fila, 6), Cells(fila, 17)).ClearContents
    Next i

    MsgBox "Contenido eliminado correctamente en " & filasAfectadas.Count & " fila(s).", vbInformation

End Sub
Sub LIMPIAR_NOTAINGRESO()
    Dim Respuesta As VbMsgBoxResult
    
    Respuesta = MsgBox("¿Estás seguro que deseas limpiar todos los datos?", vbYesNo + vbQuestion, "Confirmar limpieza")
    If Respuesta = vbNo Then Exit Sub

    With Hoja3
        ' Limpiar campos superiores
        .Range("F6:G6").ClearContents
        .Range("H6").ClearContents
        
        ' Limpiar datos de producto
        .Range("F9:Q9").ClearContents
    End With
    
    ' Limpiar filas de la tabla, dejando solo la primera
    Dim ttNotaIngreso As ListObject
    Set ttNotaIngreso = Hoja3.ListObjects("tRNotaIngreso")
    
    If ttNotaIngreso.ListRows.Count >= 2 Then
        Do Until ttNotaIngreso.ListRows.Count = 1
            ttNotaIngreso.ListRows(2).Delete
        Loop
    End If

    With Hoja3
        ' Limpiar resumen inferior
        .Range("F28:Q28").ClearContents
        
        ' Llevar el cursor al inicio
        .Range("E6").Select
    End With

    MsgBox "¡Datos limpiados correctamente!", vbInformation
End Sub

Sub PDF_NOTAINGRESO()
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

    Set wsSalida = Worksheets("Nota de Ingreso")        ' Hoja3
    Set wsHistorial = Worksheets("Historial Ingreso")   ' Hoja5
    Set CeldaNombre = wsSalida.Range("G21")
    Set tablaOrigen = wsSalida.ListObjects("tRNotaIngreso")
    Set tablaDestino = wsHistorial.ListObjects("tRHistoIngreso")

    ' Obtener nombre válido para el archivo
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

    ' Confirmación del usuario
    Respuesta = MsgBox("¿Deseas generar el PDF y guardar los datos en el historial?", vbYesNo + vbQuestion, "Confirmación")
    If Respuesta = vbNo Then Exit Sub

    ' Guardado automático antes de continuar
    If Application.ActiveWorkbook.Path = "" Then
        MsgBox "Debes guardar el archivo de Excel antes de continuar.", vbExclamation
        Exit Sub
    End If
    Application.ActiveWorkbook.Save

    ' Encabezado temporal
    TextoCabecera = "Nombre: " & ParteNombre & "   Fecha: " & Format(Now, "dd-mm-yyyy") & "   Hora: " & Format(Now, "hh:mm:ss")
    wsSalida.Range("F2").Value = TextoCabecera

    ' Crear nombre y ruta del archivo PDF
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

    ' Limpiar encabezado
    wsSalida.Range("F2").Value = ""

    ' Validar que haya datos
    If tablaOrigen.ListRows.Count = 0 Then
        MsgBox "La tabla de origen está vacía. No hay datos para copiar.", vbExclamation
        Exit Sub
    End If

' Copiar a historial
For Each fila In tablaOrigen.ListRows
    With tablaDestino
        ' Buscar fila vacía si existe
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

        ' Copiar fila desde origen
        For i = 1 To tablaOrigen.ListColumns.Count
            filaDestino.Range.Cells(1, i).Value = fila.Range.Cells(1, i).Value
        Next i

        ' ?? Añadir la fecha del día en la última columna
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


