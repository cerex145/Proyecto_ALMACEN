import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/report.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Table, TableHead, TableBody, TableHeader, TableRow, TableCell } from '../../components/common/Table';
import { Input } from '../../components/common/Input';
import '../../css/pages/reports.css'; // Importing separate CSS as requested

export const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState('stock');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [totals, setTotals] = useState(null);

    // Filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        loadReport();
    }, [activeTab]);

    const loadReport = async () => {
        setLoading(true);
        try {
            let result;
            if (activeTab === 'stock') {
                result = await reportService.getStockReport(true);
                setData(result);
                setTotals({ total: result.length });
            } else if (activeTab === 'ingresos') {
                const res = await reportService.getIngresosReport({ fecha_desde: dateFrom, fecha_hasta: dateTo });
                setData(res.data);
                setTotals(res.totales);
            } else if (activeTab === 'salidas') {
                const res = await reportService.getSalidasReport({ fecha_desde: dateFrom, fecha_hasta: dateTo });
                setData(res.data);
                setTotals(res.totales);
            } else if (activeTab === 'categorias') {
                const res = await reportService.getCategoriasReport();
                setData(res.data);
                setTotals(res.totales);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            await reportService.downloadExcelExport();
        } catch (e) {
            alert('Error al exportar');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Reportes y Estadísticas</h1>
                    <p className="text-slate-500">Visualización de datos operativos</p>
                </div>
                <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30">
                    📂 Exportar Excel Completo
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['stock', 'ingresos', 'salidas', 'categorias'].map(tab => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? 'primary' : 'secondary'}
                        onClick={() => setActiveTab(tab)}
                        className="capitalize"
                    >
                        {tab}
                    </Button>
                ))}
            </div>

            {/* Filter Bar (Only for transactional reports) */}
            {(activeTab === 'ingresos' || activeTab === 'salidas') && (
                <div className="filterBar glass-panel">
                    <Input
                        type="date"
                        label="Desde"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-40"
                    />
                    <Input
                        type="date"
                        label="Hasta"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-40"
                    />
                    <Button onClick={loadReport}>Filtrar</Button>
                </div>
            )}

            {/* Statistics Cards */}
            {totals && (
                <div className="statsGrid">
                    {Object.entries(totals).map(([key, value]) => (
                        <Card key={key} className="reportCard bg-white border-l-4 border-l-blue-500">
                            <CardContent className="pt-6">
                                <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold">
                                    {key.replace(/_/g, ' ')}
                                </p>
                                <p className="text-3xl font-bold text-slate-800 mt-1">
                                    {typeof value === 'number' && key.includes('monto')
                                        ? `$ ${value.toFixed(2)}`
                                        : value}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Main Data Table */}
            <Card className="min-h-[400px]">
                <CardHeader>
                    <CardTitle className="capitalize">Detalle de {activeTab}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-auto max-h-[600px] rounded-lg border border-slate-100">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {activeTab === 'stock' && (
                                        <>
                                            <TableHeader>Código</TableHeader>
                                            <TableHeader>Producto</TableHeader>
                                            <TableHeader>Stock Total</TableHeader>
                                            <TableHeader>Lotes</TableHeader>
                                        </>
                                    )}
                                    {activeTab === 'ingresos' && (
                                        <>
                                            <TableHeader>Fecha</TableHeader>
                                            <TableHeader>N° Ingreso</TableHeader>
                                            <TableHeader>Proveedor</TableHeader>
                                            <TableHeader>Items</TableHeader>
                                            <TableHeader>Monto</TableHeader>
                                        </>
                                    )}
                                    {/* Add other columns dynamically based on tab */}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8">Cargando datos...</TableCell></TableRow>
                                ) : !data || data.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8">No hay datos para mostrar</TableCell></TableRow>
                                ) : (
                                    data.map((row, idx) => (
                                        <TableRow key={idx}>
                                            {activeTab === 'stock' && (
                                                <>
                                                    <TableCell>{row.codigo}</TableCell>
                                                    <TableCell>{row.descripcion}</TableCell>
                                                    <TableCell className="font-bold">{row.stock_actual}</TableCell>
                                                    <TableCell className="text-xs text-slate-500">
                                                        {row.lotes?.map(l => `${l.numero} (${l.cantidad})`).join(', ')}
                                                    </TableCell>
                                                </>
                                            )}
                                            {activeTab === 'ingresos' && (
                                                <>
                                                    <TableCell>{new Date(row.fecha).toLocaleDateString()}</TableCell>
                                                    <TableCell>{row.numero_ingreso}</TableCell>
                                                    <TableCell>{row.proveedor}</TableCell>
                                                    <TableCell>{row.cantidad_productos}</TableCell>
                                                    <TableCell>${row.monto_total}</TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
