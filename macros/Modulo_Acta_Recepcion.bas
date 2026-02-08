Attribute VB_Name = "Modulo_Acta_Recepcion"
Option Explicit

' === Actualizar listas iniciales para Acta de Recepción ===
Public Sub ActualizarListasActaRecepcion()
    With Sheets("Acta de Recepcion")
        ' Lista única para T. Documento (cmb20)
        CargarListaUnica .OLEObjects("cmb20"), Sheets("Registro Productos").Range("O22:O10000")
    End With
End Sub

' === Cargar lista única ===
Public Sub CargarListaUnica(cmb As OLEObject, rng As Range)
    Dim datos As Variant
    Dim i As Long, item As Variant
    Dim listaUnica As Collection
    Set listaUnica = New Collection
    
    datos = rng.Value
    On Error Resume Next
    For i = 1 To UBound(datos, 1)
        If Not IsEmpty(datos(i, 1)) Then
            Dim existe As Boolean: existe = False
            For Each item In listaUnica
                If item = datos(i, 1) Then
                    existe = True
                    Exit For
                End If
            Next item
            If Not existe Then listaUnica.Add datos(i, 1)
        End If
    Next i
    On Error GoTo 0
    
    cmb.Object.Clear
    For Each item In listaUnica
        cmb.Object.AddItem item
    Next item
End Sub

' === Filtrar números de documento según T. Documento ===
Public Sub FiltrarNumeroPorDocumentoActa(tipoDocSeleccionado As String)
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
    
    With Sheets("Acta de Recepcion").OLEObjects("cmb21").Object
        .Clear
        For Each item In listaFiltrada
            .AddItem item
        Next item
    End With
End Sub

' === Validar si valor existe en colección ===
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

