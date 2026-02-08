Attribute VB_Name = "Modulo_Boton_Historia_Salida"
Sub Eliminar_Historia_Salida()

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
        MsgBox "Por favor, selecciona una o más celdas dentro del rango permitido (D5:P...)", vbExclamation
        Exit Sub
    End If

    ' Recorrer celdas seleccionadas
    For Each celda In Selection.Cells
        fila = celda.Row
        columna = celda.Column

        ' Validar rango: fila > 4 y columnas D (4) a P (16)
        If fila > 4 And columna >= 4 And columna <= 16 Then
            clave = CStr(fila)
            On Error Resume Next
            filasAfectadas.Add fila, clave ' Agrega solo si no se repite
            On Error GoTo 0
        End If
    Next celda

    ' Verificar si hay filas válidas para eliminar
    If filasAfectadas.Count = 0 Then
        MsgBox "No se seleccionaron celdas dentro del rango válido (columnas D a P, filas mayores a 4).", vbExclamation
        Exit Sub
    End If

    ' Confirmación del usuario
    Respuesta = MsgBox("¿Estás seguro que deseas eliminar el contenido de " & filasAfectadas.Count & " fila(s)?", vbYesNo + vbQuestion, "Confirmar eliminación")

    If Respuesta = vbNo Then Exit Sub

    ' Eliminar contenido fila por fila (de abajo hacia arriba por seguridad)
    For i = filasAfectadas.Count To 1 Step -1
        fila = filasAfectadas(i)
        Range(Cells(fila, 4), Cells(fila, 16)).ClearContents
    Next i

    MsgBox "Contenido eliminado correctamente en " & filasAfectadas.Count & " fila(s).", vbInformation

End Sub

