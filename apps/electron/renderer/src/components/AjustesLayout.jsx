import React from 'react';

const AjustesLayout = () => {
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
        { est: 'Activo', def: 'Cliente actualmente en uso o con transacción vigente.' },
        { est: 'Inactivo', def: 'Cliente sin actividad reciente. No realiza transacciones por un tiempo.' },
        { est: 'Pendiente', def: 'Cliente en proceso de registro o esperando verificación/aprobación.' },
        { est: 'Potencial', def: 'Cliente con intención de hacer negocios, pero aún no ha concretado nada.' },
        { est: 'Bloqueado', def: 'Cliente restringido por incumplimientos, riesgos/tto o decisión administrativa.' },
    ];

    // DATA: Tipo de Documento
    const documentos = [
        { tipo: 'Factura', def: '', caso: '' },
        { tipo: 'Invoice', def: "Término inglés para 'Factura'. Se usa comúnmente en transacciones internacionales o con proveedores extranjeros.", caso: 'Utilizado para importaciones de medicamentos, productos médicos u otros insumos desde el extranjero.' },
        { tipo: 'Boleta de Venta', def: 'Comprobante de pago que se emite al consumidor final cuando la operación no requiere crédito fiscal (no se deduce IGV).', caso: 'Se emite cuando vendes productos al público general, como en una botica o venta minorista.' },
        { tipo: 'Guía de Remisión Remitente', def: 'Documento obligatorio que ampara el traslado físico de bienes dentro del país, emitido por quien envía la mercadería.', caso: 'Debes emitirla cuando transportas medicamentos entre almacenes, hacia clientes, o por devolución.' },
        { tipo: 'Guía de Remisión Transportista', def: 'Documento que emite la empresa de transporte cuando el traslado no lo haces directamente el remitente.', caso: 'Si contratas una empresa externa para entregar tus productos, esta debe emitir esta guía además de la tuya.' },
        { tipo: 'Orden de Compra', def: 'Documento interno o entre empresas que formaliza un pedido. No tiene valor tributario, pero sirve para control comercial.', caso: 'Es lo que te envía un cliente (clínica, hospital, botica) como solicitud de compra de productos médicos o farmacéuticos.' },
    ];

    // DATA: Unidades
    const unidades = [
        { cod: 'UND', desc: 'Unidad', tipo: 'General, comprimidos, cápsulas, viales' },
        { cod: 'AMP', desc: 'Ampolla', tipo: 'Inyectables' },
        { cod: 'FRS', desc: 'Frasco', tipo: 'Líquidos, jarabes, soluciones' },
        { cod: 'BLT', desc: 'Blíster', tipo: 'Tabletas, cápsulas' },
        { cod: 'TUB', desc: 'Tubo', tipo: 'Cremas, ungüentos' },
        { cod: 'SOB', desc: 'Sobre', tipo: 'Polvos, sales orales' },
        { cod: 'CJ', desc: 'Caja', tipo: 'Empaque externo' },
        { cod: 'KG', desc: 'Kilogramo', tipo: 'Polvos, materia prima, a granel' },
        { cod: 'G', desc: 'Gramo', tipo: 'Dosificación pequeña de polvo' },
        { cod: 'LT', desc: 'Litro', tipo: 'Soluciones, materia prima líquida' },
        { cod: 'ML', desc: 'Mililitro', tipo: 'Soluciones en menor cantidad' },
        { cod: 'BUL', desc: 'Bulto', tipo: 'Cantidad grande de cajas o sacos' },
        { cod: 'ROL', desc: 'Rollo', tipo: 'Material de empaque' },
        { cod: 'PAC', desc: 'Paquete', tipo: 'Material agrupado' },
    ];

    // DATA: Departamentos
    const departamentos = ['Amazonas', 'Áncash', 'Apurimac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'];

    // DATA: Provincias (Partial list from image)
    const provincias = ['Abancay', 'Aco', 'Acobamba', 'Acora', 'Acoria', 'Aija', 'Ambo', 'Andahuaylas', 'Antas', 'Arequipa', 'Ascope', 'Asunción', 'Atalaya', 'Ayavire', 'Aymaraes', 'Bagua', 'Barranca', 'Bolivar', 'Bolognesi', 'Bongará', 'Cajamarca', 'Cajatambo', 'Callao', 'Camana', 'Camaná', 'Canas', 'Canchis'];

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
                    <div className="md:col-span-2">
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

                    {/* Provincias */}
                    <div className="md:col-span-3">
                        <div className="bg-[#4472C4] text-white font-bold p-1 pl-2 flex justify-between items-center rounded-t-sm">
                            <span>Provincia</span>
                            <span className="cursor-pointer px-2">▼</span>
                        </div>
                        <div className="border border-gray-300 max-h-[400px] overflow-y-auto">
                            <table className="w-full">
                                <tbody>
                                    {provincias.map((prov, i) => (
                                        <tr key={i} className={i % 2 === 0 ? 'bg-[#D9E1F2]' : 'bg-white'}>
                                            <td className="p-1 px-2 border-b border-gray-300">{prov}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Unidades */}
                    <div className="md:col-span-7">
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

export default AjustesLayout;
