Attribute VB_Name = "Modulo_Boton_NI"
Sub InsertarDesdeTRProductos()
    Dim hojaOrigen As Worksheet, hojaDestino As Worksheet
    Dim tablaOrigen As ListObject, tablaDestino As ListObject
    Dim filaOrigen As ListRow, filaDestino As Range
    Dim docTipo As String, docNumero As String, fechaIngreso As String
    Dim filasAgregadas As Long
    Dim c As Range
    Dim necesitaAutoFit As Boolean
    Dim i As Long

    ' === Configurar hojas y tablas ===
    Set hojaOrigen = ThisWorkbook.Sheets("Registro Productos")
    Set hojaDestino = ThisWorkbook.Sheets("Nota de Ingreso")
    Set tablaOrigen = hojaOrigen.ListObjects("tRProductos")
    Set tablaDestino = hojaDestino.ListObjects("tRNotaIngreso")

    ' === Obtener valores del formulario ===
    docTipo = Trim(hojaDestino.Range("F13").Value)           ' T. Documento
    docNumero = Trim(hojaDestino.Range("G13").Value)         ' N° Documento
    fechaIngreso = Trim(hojaDestino.Range("H13").Value)      ' Fecha Ingreso

    ' === Validaciones previas ===
    If docTipo = "" Or docNumero = "" Or fechaIngreso = "" Then
        MsgBox "Debe ingresar T. Documento, N° Documento y Fecha Ingreso antes de continuar.", vbExclamation
        Exit Sub
    End If

    Application.ScreenUpdating = False
    filasAgregadas = 0

      ' === Recorrer filas en la tabla origen ===
        For Each filaOrigen In tablaOrigen.ListRows
           If Trim(filaOrigen.Range.Cells(1, 12).Value) = Trim(docTipo) And _
              Trim(filaOrigen.Range.Cells(1, 13).Value) = Trim(docNumero) And _
              Format(filaOrigen.Range.Cells(1, 10).Value, "dd/mm/yyyy") = Format(fechaIngreso, "dd/mm/yyyy") Then
       
            ' === Buscar primera fila vacía en la tabla destino ===
            Set filaDestino = Nothing
            For i = 1 To tablaDestino.ListRows.Count
                If IsEmpty(tablaDestino.DataBodyRange(i, 2).Value) Then
                    Set filaDestino = tablaDestino.ListRows(i).Range
                    Exit For
                End If
            Next i

            ' === Si no hay fila vacía, agregamos una nueva ===
            If filaDestino Is Nothing Then
                Set filaDestino = tablaDestino.ListRows.Add.Range
            End If

            necesitaAutoFit = False

            ' === Copiar datos mapeados ===
            With filaDestino
                .Cells(1, 2).Value = filaOrigen.Range.Cells(1, 2).Value   ' Cod.Producto
                .Cells(1, 3).Value = filaOrigen.Range.Cells(1, 3).Value   ' Producto
                .Cells(1, 4).Value = filaOrigen.Range.Cells(1, 4).Value   ' Lote
                .Cells(1, 5).Value = filaOrigen.Range.Cells(1, 11).Value  ' Fecha Vcto
                .Cells(1, 6).Value = filaOrigen.Range.Cells(1, 16).Value  ' UM
                .Cells(1, 7).Value = filaOrigen.Range.Cells(1, 23).Value  ' Fabri.
                .Cells(1, 8).Value = filaOrigen.Range.Cells(1, 17).Value  ' Temp.
                .Cells(1, 9).Value = filaOrigen.Range.Cells(1, 18).Value  ' Cant.Bulto
                .Cells(1, 10).Value = filaOrigen.Range.Cells(1, 19).Value ' Cant.Cajas
                .Cells(1, 11).Value = filaOrigen.Range.Cells(1, 20).Value ' Cant.x Caja
                .Cells(1, 12).Value = filaOrigen.Range.Cells(1, 21).Value ' Cant.Fracción
                .Cells(1, 13).Value = filaOrigen.Range.Cells(1, 22).Value ' Cant.Total
            End With

            ' === Formato y ajuste ===
            For Each c In filaDestino.Cells
                If IsNumeric(c.Value) And Not IsEmpty(c.Value) Then
                    c.HorizontalAlignment = xlRight
                    c.WrapText = False
                Else
                    c.HorizontalAlignment = xlLeft
                    If c.Column = tablaDestino.ListColumns("Producto").Index Or _
                       c.Column = tablaDestino.ListColumns("Fabri.").Index Then
                        c.WrapText = True
                        necesitaAutoFit = True
                    Else
                        c.WrapText = False
                    End If
                End If
            Next c

            ' === Ajuste de altura ===
            If necesitaAutoFit Then
                filaDestino.Rows.AutoFit
                If filaDestino.RowHeight < 19 Then filaDestino.RowHeight = 19
            Else
                filaDestino.RowHeight = 19
            End If

            filasAgregadas = filasAgregadas + 1
        End If
    Next filaOrigen

    Application.ScreenUpdating = True

    If filasAgregadas > 0 Then
        MsgBox filasAgregadas & " producto(s) agregado(s) correctamente.", vbInformation
        ' === Limpiar campos del formulario ===
        With hojaDestino
            .Range("F13").Value = ""
            .Range("G13").Value = ""
            .Range("H13").Value = ""
        End With
    Else
        MsgBox "No se encontraron productos con los datos indicados (T. Documento, N° Documento y Fecha).", vbExclamation
    End If
End Sub
