Attribute VB_Name = "Modulo_Productos"
Sub AGREGAR_PRODUCTO()

    Dim REG_SANITARIO As String, producto As String, lote As String
    Dim T_DOC As String, ruc As String, RAZON As String
    Dim FABRICANTE As String, um As String, temp As String
    Dim PROCEDENCIA As String, OBSERVACIONES As String
    Dim COD_PRODUCTO As String, PROVEEDOR As String, FECHA_VCTO As Variant
    Dim fila As Long, CODIGO_INTERNO As String, CODIGO_CLIENTE As String, N_DOC As String
    Dim CantBulto As Double, CantCajas As Double, CantPorCaja As Double, CantFraccion As Double
    Dim CantidadTotal As Double
    Dim celda As Range, ws As Worksheet
    Dim camposFaltantes As String

    On Error Resume Next
    Set ws = ThisWorkbook.Sheets("Registro Productos")
    On Error GoTo 0
    If ws Is Nothing Then
        MsgBox "La hoja 'Registro de Productos' no existe. Verifica el nombre exactamente como aparece en Excel.", vbCritical
        Exit Sub
    End If

    With ws
        ' Datos del cliente
        ruc = Trim(.Range("F3").Value)
        CODIGO_CLIENTE = Trim(.Range("F4").Value)
        RAZON = Trim(.Range("F5").Value)
        T_DOC = .Range("F6").Value
        N_DOC = .Range("F7").Value
        REG_SANITARIO = Trim(.Range("F8").Value)

        ' Datos del producto
        PROVEEDOR = Trim(.Range("K3").Value)
        COD_PRODUCTO = Trim(.Range("K4").Value)
        producto = Trim(.Range("K5").Value)
        lote = Trim(.Range("K6").Value)
        FABRICANTE = Trim(.Range("K7").Value)
        PROCEDENCIA = Trim(.Range("K8").Value)
        FECHA_VCTO = .Range("K9").Value
        UND = Trim(.Range("K10").Value)
        um = Trim(.Range("K11").Value)
        temp = Trim(.Range("K12").Value)

        CantBulto = Val(.Range("K13").Value)
        CantCajas = Val(.Range("K14").Value)
        CantPorCaja = Val(.Range("K15").Value)
        CantFraccion = Val(.Range("K16").Value)

        ' Validaciones adicionales
        If CantCajas < 0 Or CantPorCaja < 0 Or CantFraccion < 0 Then
            MsgBox "Las cantidades no pueden ser negativas.", vbExclamation
            Exit Sub
        End If

        If CantPorCaja = 0 Then
            MsgBox "La cantidad por caja no puede ser cero.", vbExclamation
            Exit Sub
        End If

        ' Cálculo de Cantidad Total
        CantidadTotal = (CantCajas * CantPorCaja) + CantFraccion

        OBSERVACIONES = Trim(.Range("K17").Value)

        ' Validar campos obligatorios
        camposFaltantes = ""
        If ruc = "" Then camposFaltantes = camposFaltantes & "• RUC del Cliente" & vbCrLf
        If CODIGO_CLIENTE = "" Then camposFaltantes = camposFaltantes & "• Código Cliente" & vbCrLf
        If RAZON = "" Then camposFaltantes = camposFaltantes & "• Razón Social" & vbCrLf
        If producto = "" Then camposFaltantes = camposFaltantes & "• Producto" & vbCrLf
        If lote = "" Then camposFaltantes = camposFaltantes & "• Lote" & vbCrLf
        If COD_PRODUCTO = "" Then camposFaltantes = camposFaltantes & "• Código Producto" & vbCrLf
        If REG_SANITARIO = "" Then camposFaltantes = camposFaltantes & "• Registro Sanitario" & vbCrLf
        If FECHA_VCTO = "" Then
            camposFaltantes = camposFaltantes & "• Fecha de Vencimiento" & vbCrLf
        ElseIf Not IsDate(FECHA_VCTO) Or FECHA_VCTO < Date Then
            camposFaltantes = camposFaltantes & "• Fecha de Vencimiento inválida o vencida" & vbCrLf
        End If

        If camposFaltantes <> "" Then
            MsgBox "Faltan completar los siguientes campos obligatorios:" & vbCrLf & camposFaltantes, vbExclamation, "Validación"
            Exit Sub
        End If

        ' Buscar fila vacía desde fila 22
        fila = 22
        Do While Not IsEmpty(.Cells(fila, 5))
            fila = fila + 1
        Loop

        CODIGO_INTERNO = "INT-P" & Format(fila - 20, "0000")

        ' Insertar datos
        With .Cells
            .item(fila, 5).Value = COD_PRODUCTO
            .item(fila, 6).Value = producto
            .item(fila, 7).Value = lote
            .item(fila, 8).Value = REG_SANITARIO
            .item(fila, 9).Value = ruc
            .item(fila, 10).Value = CODIGO_CLIENTE
            .item(fila, 11).Value = PROVEEDOR
            .item(fila, 12).Value = RAZON
            .item(fila, 13).Value = Date
            .item(fila, 14).Value = FECHA_VCTO
            .item(fila, 15).Value = T_DOC
            .item(fila, 16).Value = N_DOC
            .item(fila, 17).Value = CODIGO_INTERNO
            .item(fila, 18).Value = "UND"
            .item(fila, 19).Value = um
            .item(fila, 20).Value = temp
            .item(fila, 21).Value = CantBulto
            .item(fila, 22).Value = CantCajas
            .item(fila, 23).Value = CantPorCaja
            .item(fila, 24).Value = CantFraccion
            .item(fila, 25).Value = CantidadTotal
            .item(fila, 26).Value = FABRICANTE
            .item(fila, 27).Value = PROCEDENCIA
            .item(fila, 28).Value = OBSERVACIONES
        End With

        ' Aplicar formato
        For Each celda In .Range(.Cells(fila, 5), .Cells(fila, 28))
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

        MsgBox "Producto registrado correctamente.", vbInformation

        ' Limpiar campos
        .Range("K3:K18").ClearContents
        .Range("K3").Select
    End With

End Sub

Sub ELIMINAR_PRODUCTO()

    Dim fila As Long
    Dim columna As Long
    Dim Respuesta As VbMsgBoxResult

    ' Obtener fila y columna de la celda activa
    fila = ActiveCell.Row
    columna = ActiveCell.Column

    ' Validar que esté dentro del rango válido: fila > 21 y columnas D (4) a AB (28)
    If fila <= 21 Or columna < 4 Or columna > 28 Then
        MsgBox "Selecciona una celda válida dentro de la tabla de productos (D22:AB...).", vbExclamation
        Exit Sub
    End If

    ' Verifica si hay datos en alguna columna clave, por ejemplo columna F
    If Cells(fila, 6).Value = "" Then
        MsgBox "La fila seleccionada no contiene datos de producto.", vbExclamation
        Exit Sub
    End If

    ' Confirmación de eliminación
    Respuesta = MsgBox("¿Está seguro que deseas eliminar este registro?", vbYesNo + vbQuestion, "Confirmar eliminación")

    If Respuesta = vbYes Then
        ' Eliminar solo el contenido desde columna E (5) hasta AB (28)
        Range(Cells(fila, 5), Cells(fila, 28)).ClearContents
        MsgBox "Contenido del producto eliminado correctamente (columna D se mantuvo).", vbInformation
    End If

End Sub

Sub LIMPIAR_P_CLIENTE()
    Dim ws As Worksheet
    
    Set ws = ThisWorkbook.Sheets("Registro Productos")
    
    With ws
        ' Limpiar solo los datos del cliente
        .Range("F3:F4").ClearContents
        .Range("F6:F8").ClearContents
        
        ' Opcional: poner el cursor en G3 para empezar con nuevo cliente
        .Range("G3").Select
    End With
End Sub

