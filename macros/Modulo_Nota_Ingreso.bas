Attribute VB_Name = "Modulo_Nota_Ingreso"
'MODULO INGRESO

Public Sub ActualizarListasNotaIngreso()
    With Sheets("Nota de Ingreso")
        ' Cargar RUC
        CargarListaUnica .OLEObjects("cmb8"), Sheets("Registro Productos").Range("I22:I10000")
        
        ' Cargar T. Documento
        CargarListaUnica .OLEObjects("cmb16"), Sheets("Registro Productos").Range("O22:O10000")
    End With
End Sub


Public Sub CargarListaUnica(cmb As OLEObject, rng As Range)
    Dim datos As Variant
    Dim i As Long, item As Variant
    Dim existe As Boolean
    Dim listaUnica As Collection
    Set listaUnica = New Collection

    datos = rng.Value
    On Error Resume Next
    For i = 1 To UBound(datos, 1)
        existe = False
        For Each item In listaUnica
            If item = datos(i, 1) Then
                existe = True
                Exit For
            End If
        Next item
        If Not existe And Not IsEmpty(datos(i, 1)) Then
            listaUnica.Add datos(i, 1)
        End If
    Next i
    On Error GoTo 0

    cmb.Object.Clear
    For Each item In listaUnica
        cmb.Object.AddItem item
    Next item
End Sub

Public Sub FiltrarCodigoPorRUC(rucSeleccionado As String)
    Dim hoja As Worksheet
    Dim rucs As Variant, codigos As Variant
    Dim i As Long, item As Variant
    Dim listaFiltrada As Collection
    Set hoja = Sheets("Registro Productos")
    Set listaFiltrada = New Collection

    rucs = hoja.Range("I22:I10000").Value
    codigos = hoja.Range("J22:J10000").Value

    On Error Resume Next
    For i = 1 To UBound(rucs, 1)
        If rucs(i, 1) = rucSeleccionado Then
            If Not ValorExiste(listaFiltrada, codigos(i, 1)) Then
                listaFiltrada.Add codigos(i, 1)
            End If
        End If
    Next i
    On Error GoTo 0

    With Sheets("Nota de Ingreso").OLEObjects("cmb9").Object
        .Clear
        For Each item In listaFiltrada
            .AddItem item
        Next item
    End With
End Sub

Public Sub FiltrarLotePorCodigo(rucSeleccionado As String, codigoClienteSeleccionado As String)
    Dim hoja As Worksheet
    Dim rucs As Variant, codigos As Variant, lotes As Variant
    Dim i As Long, item As Variant
    Dim listaFiltrada As Collection
    Set hoja = Sheets("Registro Productos")
    Set listaFiltrada = New Collection

    rucs = hoja.Range("I22:I10000").Value
    codigos = hoja.Range("J22:J10000").Value
    lotes = hoja.Range("G22:G10000").Value

    On Error Resume Next
    For i = 1 To UBound(rucs, 1)
        If rucs(i, 1) = rucSeleccionado And codigos(i, 1) = codigoClienteSeleccionado Then
            If Not ValorExiste(listaFiltrada, lotes(i, 1)) Then
                listaFiltrada.Add lotes(i, 1)
            End If
        End If
    Next i
    On Error GoTo 0

    With Sheets("Nota de Ingreso").OLEObjects("cmb10").Object
        .Clear
        For Each item In listaFiltrada
            .AddItem item
        Next item
    End With
End Sub

Public Sub FiltrarProductoPorLote(rucSeleccionado As String, codigoClienteSeleccionado As String, loteSeleccionado As String)
    Dim hoja As Worksheet
    Dim rucs As Variant, codigos As Variant, lotes As Variant, productos As Variant
    Dim i As Long, item As Variant
    Dim listaFiltrada As Collection
    Set hoja = Sheets("Registro Productos")
    Set listaFiltrada = New Collection

    rucs = hoja.Range("I22:I10000").Value
    codigos = hoja.Range("J22:J10000").Value
    lotes = hoja.Range("G22:G10000").Value
    productos = hoja.Range("F22:F10000").Value

    On Error Resume Next
    For i = 1 To UBound(rucs, 1)
        If rucs(i, 1) = rucSeleccionado And codigos(i, 1) = codigoClienteSeleccionado And lotes(i, 1) = loteSeleccionado Then
            If Not ValorExiste(listaFiltrada, productos(i, 1)) Then
                listaFiltrada.Add productos(i, 1)
            End If
        End If
    Next i
    On Error GoTo 0

    With Sheets("Nota de Ingreso").OLEObjects("cmb11").Object
        .Clear
        For Each item In listaFiltrada
            .AddItem item
        Next item
    End With
End Sub

Private Function ValorExiste(col As Collection, valor As Variant) As Boolean
    Dim x As Variant
    For Each x In col
        If x = valor Then
            ValorExiste = True
            Exit Function
        End If
    Next x
    ValorExiste = False
End Function
Public Sub CompletarInfoProducto(productoSeleccionado As String)
    Dim hoja As Worksheet
    Set hoja = Sheets("Registro Productos")

    Dim i As Long
    Dim productos As Variant, codProd As Variant, fVcto As Variant, um As Variant
    Dim fabri As Variant, temp As Variant, cBulto As Variant, cCajas As Variant
    Dim cCaja As Variant, cFraccion As Variant, cTotal As Variant
    Dim rucs As Variant, codigos As Variant, lotes As Variant

    Dim rucSeleccionado As String
    Dim codigoSeleccionado As String
    Dim loteSeleccionado As String

    With Sheets("Nota de Ingreso")
        rucSeleccionado = NormalizarTexto(.OLEObjects("cmb8").Object.Value)
        codigoSeleccionado = NormalizarTexto(.OLEObjects("cmb9").Object.Value)
        loteSeleccionado = NormalizarTexto(.OLEObjects("cmb10").Object.Value)
        productoSeleccionado = NormalizarTexto(.OLEObjects("cmb11").Object.Value)
    End With

    ' Cargar datos
    productos = hoja.Range("F22:F10000").Value
    codProd = hoja.Range("E22:E10000").Value
    fVcto = hoja.Range("N22:N10000").Value
    um = hoja.Range("S22:S10000").Value
    fabri = hoja.Range("Z22:Z10000").Value
    temp = hoja.Range("T22:T10000").Value
    cBulto = hoja.Range("U22:U10000").Value
    cCajas = hoja.Range("V22:V10000").Value
    cCaja = hoja.Range("W22:W10000").Value
    cFraccion = hoja.Range("X22:X10000").Value
    cTotal = hoja.Range("Y22:Y10000").Value
    rucs = hoja.Range("I22:I10000").Value
    codigos = hoja.Range("J22:J10000").Value
    lotes = hoja.Range("G22:G10000").Value

    For i = 1 To UBound(productos, 1)
        If NormalizarTexto(productos(i, 1)) = productoSeleccionado And _
           NormalizarTexto(rucs(i, 1)) = rucSeleccionado And _
           NormalizarTexto(codigos(i, 1)) = codigoSeleccionado And _
           NormalizarTexto(lotes(i, 1)) = loteSeleccionado Then

            With Sheets("Nota de Ingreso")
                .Range("F9").Value = codProd(i, 1)
                .Range("I9").Value = fVcto(i, 1)
                .Range("J9").Value = um(i, 1)
                .Range("K9").Value = fabri(i, 1)
                .Range("L9").Value = temp(i, 1)
                .Range("M9").Value = cBulto(i, 1)
                .Range("N9").Value = cCajas(i, 1)
                .Range("O9").Value = cCaja(i, 1)
                .Range("P9").Value = cFraccion(i, 1)
                .Range("Q9").Value = cTotal(i, 1)
            End With
            Exit For
        End If
    Next i
End Sub



Public Sub FiltrarNumeroPorDocumento(tipoDocSeleccionado As String)
    Dim hoja As Worksheet
    Dim tipos As Variant, numeros As Variant
    Dim i As Long, item As Variant
    Dim listaFiltrada As Collection
    Set hoja = Sheets("Registro Productos")
    Set listaFiltrada = New Collection

    tipos = hoja.Range("O22:O10000").Value
    numeros = hoja.Range("P22:P10000").Value

    On Error Resume Next
    For i = 1 To UBound(tipos, 1)
        If tipos(i, 1) = tipoDocSeleccionado Then
            If Not ValorExiste(listaFiltrada, numeros(i, 1)) Then
                listaFiltrada.Add numeros(i, 1)
            End If
        End If
    Next i
    On Error GoTo 0

    With Sheets("Nota de Ingreso").OLEObjects("cmb17").Object
        .Clear
        For Each item In listaFiltrada
            .AddItem item
        Next item
    End With
End Sub

Public Sub FiltrarFechaPorDocumento(tipoDocSeleccionado As String, nroDocSeleccionado As String)
    Dim hoja As Worksheet
    Dim tipos As Variant, numeros As Variant, fechas As Variant
    Dim i As Long, item As Variant
    Dim listaFiltrada As Collection

    Set hoja = Sheets("Registro Productos")
    Set listaFiltrada = New Collection

    tipos = hoja.Range("O22:O10000").Value
    numeros = hoja.Range("P22:P10000").Value
    fechas = hoja.Range("M22:M10000").Value

    On Error Resume Next
    For i = 1 To UBound(tipos, 1)
        If tipos(i, 1) = tipoDocSeleccionado And numeros(i, 1) = nroDocSeleccionado Then
            If Not ValorExiste(listaFiltrada, fechas(i, 1)) Then
                listaFiltrada.Add fechas(i, 1)
            End If
        End If
    Next i
    On Error GoTo 0

    With Sheets("Nota de Ingreso").OLEObjects("cmb20").Object
        .Clear
        For Each item In listaFiltrada
            .AddItem Format(item, "dd/mm/yyyy")
        Next item
    End With
End Sub


Private Function NormalizarTexto(texto As Variant) As String
    If IsError(texto) Or IsEmpty(texto) Then
        NormalizarTexto = ""
    Else
        Dim tmp As String
        tmp = CStr(texto)
        
        ' Reemplazar caracteres invisibles y especiales
        tmp = Replace(tmp, vbCrLf, " ")
        tmp = Replace(tmp, vbCr, " ")
        tmp = Replace(tmp, vbLf, " ")
        tmp = Replace(tmp, vbTab, " ")
        tmp = Replace(tmp, Chr(160), " ") ' espacio no separable
        tmp = Replace(tmp, Chr(34), "")   ' comillas dobles
        tmp = Replace(tmp, Chr(39), "")   ' comillas simples

        ' Quitar espacios duplicados y convertir a mayúsculas
        tmp = Application.WorksheetFunction.Trim(tmp)
        Do While InStr(tmp, "  ") > 0
            tmp = Replace(tmp, "  ", " ")
        Loop
        
        NormalizarTexto = UCase(tmp)
    End If
End Function


