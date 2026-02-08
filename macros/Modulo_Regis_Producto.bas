Attribute VB_Name = "Modulo_Regis_Producto"
Function FiltrarLista(rango As Range, texto As String) As Variant
    Dim celda As Range
    Dim resultado() As String
    Dim contador As Integer
    contador = 0

    For Each celda In rango
        If LCase(celda.Value) Like LCase("*" & texto & "*") Then
            ReDim Preserve resultado(contador)
            resultado(contador) = celda.Value
            contador = contador + 1
        End If
    Next celda

    If contador = 0 Then
        ReDim resultado(0)
        resultado(0) = ""
    End If

    FiltrarLista = resultado
End Function
