Attribute VB_Name = "Modulo_Boton_NS"
Sub InsertarDesdeTRProductos_Salida()
    Dim hojaOrigen As Worksheet, hojaDestino As Worksheet
    Dim tablaOrigen As ListObject, tablaDestino As ListObject
    Dim filaOrigen As ListRow, filaDestino As Range
    Dim docTipo As String, docNumero As String, fechaIngreso As String
    Dim filasAgregadas As Long
    Dim i As Long
    
    ' === Configurar hojas y tablas ===
    Set hojaOrigen = ThisWorkbook.Sheets("Registro Productos")
    Set hojaDestino = ThisWorkbook.Sheets("Nota de Salida")
    Set tablaOrigen = hojaOrigen.ListObjects("tRProductos")
    Set tablaDestino = hojaDestino.ListObjects("tRNotaSalida")
    
    ' === Obtener valores desde celdas ===
    docTipo = hojaDestino.Range("F13").Value
    docNumero = hojaDestino.Range("G13").Value
    fechaIngreso = hojaDestino.Range("H13").Value

    ' === Validar campos obligatorios ===
    If docTipo = "" Or docNumero = "" Or fechaIngreso = "" Then
        MsgBox "Debe ingresar el Tipo de Documento, N° Documento y Fecha de Ingreso para continuar.", vbExclamation
        Exit Sub
    End If
    
    Application.ScreenUpdating = False
    filasAgregadas = 0
    
      ' === Recorrer filas en la tabla origen ===
        For Each filaOrigen In tablaOrigen.ListRows
           If Trim(filaOrigen.Range.Cells(1, 12).Value) = Trim(docTipo) And _
              Trim(filaOrigen.Range.Cells(1, 13).Value) = Trim(docNumero) And _
              Format(filaOrigen.Range.Cells(1, 10).Value, "dd/mm/yyyy") = Format(fechaIngreso, "dd/mm/yyyy") Then
              
            ' === Buscar primera fila vacía ===
            Set filaDestino = Nothing
            For i = 1 To tablaDestino.ListRows.Count
                If IsEmpty(tablaDestino.DataBodyRange(i, 2).Value) Then
                    Set filaDestino = tablaDestino.ListRows(i).Range
                    Exit For
                End If
            Next i

            ' === Si no hay, agregar nueva ===
            If filaDestino Is Nothing Then
                Set filaDestino = tablaDestino.ListRows.Add.Range
            End If

            ' === Copiar datos ===
            With filaDestino
                .Cells(1, 2).Value = filaOrigen.Range.Cells(1, 2).Value   ' CODIGO
                .Cells(1, 3).Value = filaOrigen.Range.Cells(1, 3).Value   ' PRODUCTO
                .Cells(1, 4).Value = filaOrigen.Range.Cells(1, 4).Value   ' LOTE
                .Cells(1, 5).Value = filaOrigen.Range.Cells(1, 11).Value  ' FE.VCTO.
                .Cells(1, 6).Value = filaOrigen.Range.Cells(1, 16).Value  ' UM
                .Cells(1, 7).Value = filaOrigen.Range.Cells(1, 18).Value  ' CANT.BULTO
                .Cells(1, 8).Value = filaOrigen.Range.Cells(1, 19).Value  ' CANT.CAJAS
                .Cells(1, 9).Value = filaOrigen.Range.Cells(1, 20).Value  ' CANT.xCAJA
                .Cells(1, 10).Value = filaOrigen.Range.Cells(1, 21).Value ' CANT.FRACCION
                .Cells(1, 11).Value = filaOrigen.Range.Cells(1, 22).Value ' CANT.TOTAL
            End With
            
            ' === Formato y ajuste ===
            filaDestino.Font.Size = 10
            filaDestino.Cells(1, 5).NumberFormat = "dd/mm/yyyy"
            filaDestino.Cells.HorizontalAlignment = xlLeft
            filaDestino.Cells.WrapText = False
            filaDestino.Cells(1, 3).WrapText = True
            filaDestino.Rows.AutoFit
            If filaDestino.RowHeight < 20 Then filaDestino.RowHeight = 20
            
            filasAgregadas = filasAgregadas + 1
        End If
    Next filaOrigen

    Application.ScreenUpdating = True

    If filasAgregadas > 0 Then
        MsgBox filasAgregadas & " producto(s) agregado(s) correctamente en Nota de Salida.", vbInformation

        ' === Limpiar campos usados ===
        hojaDestino.Range("F13").ClearContents
        hojaDestino.Range("G13").ClearContents
        hojaDestino.Range("H13").ClearContents

        ' === Ocultar comboboxes si se desea reiniciar la vista ===
        With hojaDestino
            .OLEObjects("cmb18").Visible = False
            .OLEObjects("cmb19").Visible = False
            .OLEObjects("cmb21").Visible = False
        End With
    Else
        MsgBox "No se encontraron productos con los datos indicados.", vbExclamation
    End If
End Sub

