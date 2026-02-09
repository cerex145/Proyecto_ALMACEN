import React from 'react';

export const AjustesPage = () => {
    // DATA: Categoría
    const categorias = [
        { cat: 'Bajo', def: 'No representa peligro significativo. Cliente confiable con historial estable.' },
        { cat: 'Medio', def: 'Puede implicar algunos riesgos. Cliente nuevo o con antecedentes poco claros.' },
        { cat: 'Alto', def: 'Riesgo considerable. Cliente con antecedentes problemáticos o inestables.' },
        { cat: 'No verificado', def: 'Aún no se ha evaluado. Información incompleta o pendiente de análisis.' },
        { cat: 'Crítico', def: 'Riesgo extremo. Requiere atención inmediata y protocolos especiales.' },
    ];

    // DATA: Estado
    const estados = [
        { est: 'Activo', def: 'Cliente actualmente en uso o con transacciones vigentes.' },
        { est: 'Inactivo', def: 'Cliente sin actividad reciente.' },
        { est: 'Pendiente', def: 'Cliente en proceso de registro o verificación.' },
        { est: 'Potencial', def: 'Cliente con intención de compra aún no concretada.' },
        { est: 'Bloqueado', def: 'Cliente restringido por incumplimientos o riesgo alto.' },
    ];

    // DATA: Tipo de Documento
    const documentos = [
        { tipo: 'Factura', def: 'Comprobante de pago con crédito fiscal.', caso: 'Ventas a empresas' },
        { tipo: 'Invoice', def: 'Factura en inglés.', caso: 'Importaciones' },
        { tipo: 'Boleta de Venta', def: 'Comprobante sin crédito fiscal.', caso: 'Venta al consumidor final' },
        { tipo: 'Guía de Remisión Remitente', def: 'Documento de traslado emitido por quien envía la mercadería.', caso: 'Transporte propio' },
        { tipo: 'Guía de Remisión Transportista', def: 'Documento emitido por empresa de transporte.', caso: 'Transporte tercerizado' },
        { tipo: 'Orden de Compra', def: 'Documento de un pedido formal.', caso: 'Control comercial' },
    ];

    // DATA: Unidades
    const unidades = [
        { cod: 'UND', desc: 'Unidad', tipo: 'General' },
        { cod: 'AMP', desc: 'Ampolla', tipo: 'Inyectables' },
        { cod: 'FRS', desc: 'Frasco', tipo: 'Líquidos' },
        { cod: 'BLT', desc: 'Blíster', tipo: 'Tabletas, cápsulas' },
        { cod: 'TUB', desc: 'Tubo', tipo: 'Cremas' },
        { cod: 'SOB', desc: 'Sobre', tipo: 'Polvos' },
        { cod: 'CJ', desc: 'Caja', tipo: 'Empaque externo' },
        { cod: 'KG', desc: 'Kilogramo', tipo: 'Materia prima' },
        { cod: 'G', desc: 'Gramo', tipo: 'Dosificación pequeña' },
        { cod: 'LT', desc: 'Litro', tipo: 'Líquidos' },
        { cod: 'ML', desc: 'Mililitro', tipo: 'Líquidos pequeños' },
        { cod: 'BUL', desc: 'Bulto', tipo: 'Cantidad grande' },
        { cod: 'ROL', desc: 'Rollo', tipo: 'Empaque' },
        { cod: 'PAC', desc: 'Paquete', tipo: 'Material agrupado' },
    ];

    // DATA: Departamentos
    const departamentos = ['Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'];

    return (
        <div className="min-h-screen bg-white font-sans text-xs p-6">
            <button className="bg-[#4472C4] text-white font-bold py-2 px-6 rounded mb-8 hover:bg-blue-700 transition">
                VER HOJA
            </button>

            <div className="space-y-8">

                {/* --- SECCIÓN 1: Clasificaciones --- */}
                <div className="space-y-6">
                    {/* Tabla Categoría */}
                    <div>
                        <div className="bg-[#4472C4] text-white font-bold p-1 pl-2 flex justify-between items-center rounded-t-sm">
                            <span>Categoría</span>
                            <span className="cursor-pointer px-2">-</span>
                        </div>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead className="bg-[#4472C4] text-white">
                                <tr>
                                    <th className="p-1 text-left w-48 border-r border-white">Categoría</th>
                                    <th className="p-1 text-left">Definición</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorias.map((item, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-[#D9E1F2]' : 'bg-white'}>
                                        <td className="p-1 border border-gray-300 font-bold">{item.cat}</td>
                                        <td className="p-1 border border-gray-300">{item.def}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Tabla Estado */}
                    <div>
                        <div className="bg-[#4472C4] text-white font-bold p-1 pl-2 flex justify-between items-center rounded-t-sm">
                            <span>Estado</span>
                            <span className="cursor-pointer px-2">-</span>
                        </div>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead className="bg-[#4472C4] text-white">
                                <tr>
                                    <th className="p-1 text-left w-48 border-r border-white">Estado</th>
                                    <th className="p-1 text-left">Definición</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estados.map((item, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-[#D9E1F2]' : 'bg-white'}>
                                        <td className="p-1 border border-gray-300 font-bold">{item.est}</td>
                                        <td className="p-1 border border-gray-300">{item.def}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Tabla Tipos Doc */}
                    <div>
                        <div className="bg-[#4472C4] text-white font-bold p-1 pl-2 flex justify-between items-center rounded-t-sm">
                            <span>Tipo de Documento</span>
                            <span className="cursor-pointer px-2">-</span>
                        </div>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead className="bg-[#4472C4] text-white">
                                <tr>
                                    <th className="p-1 text-left w-48 border-r border-white">Tipo de Documento</th>
                                    <th className="p-1 text-left border-r border-white">Definición</th>
                                    <th className="p-1 text-left">En tu caso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documentos.map((item, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-[#D9E1F2]' : 'bg-white'}>
                                        <td className="p-1 border border-gray-300 font-bold">{item.tipo}</td>
                                        <td className="p-1 border border-gray-300">{item.def}</td>
                                        <td className="p-1 border border-gray-300">{item.caso}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="h-px bg-gray-300 my-8"></div>

                {/* --- SECCIÓN 2: Tablas de Ubicación y Unidades --- */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Departamentos */}
                    <div className="md:col-span-3">
                        <div className="bg-[#4472C4] text-white font-bold p-1 pl-2 flex justify-between items-center rounded-t-sm">
                            <span>Departamento</span>
                            <span className="cursor-pointer px-2">▼</span>
                        </div>
                        <div className="border border-gray-300 max-h-[400px] overflow-y-auto">
                            <table className="w-full">
                                <tbody>
                                    {departamentos.map((dep, i) => (
                                        <tr key={i} className={i % 2 === 0 ? 'bg-[#D9E1F2]' : 'bg-white'}>
                                            <td className="p-1 px-2 border-b border-gray-300">{dep}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Unidades */}
                    <div className="md:col-span-9">
                        <div className="bg-[#4472C4] text-white font-bold p-1 pl-2 flex justify-between items-center rounded-t-sm">
                            <div className="flex gap-8">
                                <span>Código</span>
                                <span>Descripción</span>
                                <span>Tipo de producto</span>
                            </div>
                            <span className="cursor-pointer px-2">▼</span>
                        </div>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead className="bg-[#4472C4] text-white">
                                <tr>
                                    <th className="p-1 text-left w-16 border-r border-white">Código</th>
                                    <th className="p-1 text-left w-32 border-r border-white">Descripción</th>
                                    <th className="p-1 text-left">Tipo de producto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unidades.map((item, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-[#D9E1F2]' : 'bg-white'}>
                                        <td className="p-1 border border-gray-300 font-bold">{item.cod}</td>
                                        <td className="p-1 border border-gray-300">{item.desc}</td>
                                        <td className="p-1 border border-gray-300">{item.tipo}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>
        </div>
    );
};


