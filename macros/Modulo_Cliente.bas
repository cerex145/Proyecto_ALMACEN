Attribute VB_Name = "Modulo_Cliente"
Sub AGENDAR_CLIENTE()

    Dim ruc As String, RAZON As String, direccion As String
    Dim DISTRITO As String, PROVINCIA As String, DEPARTAMENTO As String
    Dim TELEFONO As String, EMAIL As String, CONTACTO As String
    Dim RIESGO As String, ESTADO As String
    Dim NFILA As Long, ULTIMOS_RUC As String, COD_BASE As String
    Dim COD_CLIENTE As String, maxNum As Integer, celda As Range
    Dim i As Long

    ' Obtener valores del formulario (E4:E14)
    ruc = Trim(Range("H4").Value)
    RAZON = Trim(Range("H5").Value)
    direccion = Trim(Range("H6").Value)
    DISTRITO = Trim(Range("H7").Value)
    PROVINCIA = Trim(Range("H8").Value)
    DEPARTAMENTO = Trim(Range("H9").Value)
    TELEFONO = Trim(Range("H10").Value)
    EMAIL = Trim(Range("H11").Value)
    CONTACTO = Trim(Range("H12").Value)
    RIESGO = Trim(Range("H13").Value)
    ESTADO = Trim(Range("H14").Value)

    If RAZON = "" Or ruc = "" Then
        MsgBox "Complete al menos los campos de RUC del Cliente y Razón Social.", vbExclamation
        Exit Sub
    End If

    If Len(ruc) < 4 Then
        MsgBox "El RUC debe tener al menos 4 dígitos.", vbCritical
        Exit Sub
    End If

    ' Generar base del código con los últimos 4 dígitos del RUC
    ULTIMOS_RUC = Right(ruc, 4)
    COD_BASE = "CLI-" & ULTIMOS_RUC & "-"

    ' Buscar el mayor número existente para esta base
    maxNum = 0
    For i = 22 To Cells(Rows.Count, "E").End(xlUp).Row
        If Left(Cells(i, 5).Value, Len(COD_BASE)) = COD_BASE Then
            Dim numPart As String
            numPart = Mid(Cells(i, 2).Value, Len(COD_BASE) + 1)
            If IsNumeric(numPart) Then
                If CInt(numPart) > maxNum Then maxNum = CInt(numPart)
            End If
        End If
    Next i

    ' Crear nuevo código con correlativo siguiente
    COD_CLIENTE = COD_BASE & Format(maxNum + 1, "000")

    ' Buscar primera fila vacía en la columna E desde la fila 22
    NFILA = 22
    Do While Not IsEmpty(Cells(NFILA, "E"))
        NFILA = NFILA + 1
    Loop

    ' Insertar datos
    Cells(NFILA, 5).Value = COD_CLIENTE
    Cells(NFILA, 6).Value = ruc
    Cells(NFILA, 7).Value = RAZON
    Cells(NFILA, 8).Value = direccion
    Cells(NFILA, 9).Value = DISTRITO
    Cells(NFILA, 10).Value = PROVINCIA
    Cells(NFILA, 11).Value = DEPARTAMENTO
    Cells(NFILA, 12).Value = TELEFONO
    Cells(NFILA, 13).Value = EMAIL
    Cells(NFILA, 14).Value = CONTACTO
    Cells(NFILA, 15).Value = RIESGO
    Cells(NFILA, 16).Value = Date
    Cells(NFILA, 17).Value = ESTADO

    ' Aplicar formato
    For Each celda In Range(Cells(NFILA, 4), Cells(NFILA, 17))
        With celda
            .Font.Name = "Consolas"
            .Font.Bold = False
            If IsNumeric(.Value) Then
                .HorizontalAlignment = xlRight
            Else
                .HorizontalAlignment = xlLeft
            End If
        End With
    Next celda

    MsgBox "Se ha registrado correctamente al cliente: " & RAZON & vbCrLf & "Código: " & COD_CLIENTE, vbInformation

    ' Limpiar formulario
    Range("H4:H14").ClearContents
    Range("H4").Select

End Sub


Sub ELIMINAR_CLIENTE()

    Dim fila As Long
    Dim columna As Long

    fila = ActiveCell.Row
    columna = ActiveCell.Column

    ' Validar si la celda seleccionada está dentro del rango válido (D22:Q...)
    If fila <= 21 Or columna < 4 Or columna > 17 Then
        MsgBox "Por favor, seleccione una celda dentro de la tabla de clientes (D22:Q...).", vbExclamation
        Exit Sub
    End If

    ' Verificar si hay datos en la columna E (columna 5, RUC)
    If Cells(fila, 5).Value <> "" Then
        If MsgBox("¿Está seguro que desea eliminar este registro?", vbYesNo + vbQuestion, "Confirmar eliminación") = vbYes Then
            ' Limpiar solo desde columna E (5) hasta Q (17), dejando D (4) intacta
            Range(Cells(fila, 5), Cells(fila, 17)).ClearContents
            MsgBox "Contenido del cliente eliminado correctamente (columna D se mantuvo).", vbInformation
        End If
    Else
        MsgBox "La fila seleccionada no contiene datos de cliente.", vbExclamation
    End If

End Sub

