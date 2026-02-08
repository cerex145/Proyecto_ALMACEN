Attribute VB_Name = "Modulo_Regis_Cliente"
Sub ActualizarListasComboBoxes_Clientes()
    ' Código para llenar ComboBoxes
End Sub

Function lista(rng As Range, criterio As String) As Variant
    Dim celda As Range, resultado() As String
    Dim i As Long
    i = 0
    For Each celda In rng
        If LCase(celda.Value) Like LCase("*" & criterio & "*") Then
            ReDim Preserve resultado(i)
            resultado(i) = celda.Value
            i = i + 1
        End If
    Next celda
    If i = 0 Then
        ReDim resultado(0)
        resultado(0) = ""
    End If
    lista = resultado
End Function




