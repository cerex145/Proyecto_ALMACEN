import React from 'react';

const ActaRecepcionLayout = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-xs">
            {/* HEADER: Formulario de Registro */}
            <div className="bg-teal-700 text-white text-center py-1 font-bold mb-4 border-b-4 border-teal-900">
                Formulario de Registro de Productos, Entradas y Salidas
            </div>

            <div className="max-w-7xl mx-auto px-4">

                {/* --- SECCIÓN DE CONTROL SUPERIOR --- */}
                <div className="flex gap-8 items-start mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {/* Ingreso Cantidad Panel */}
                    <div className="flex-1 max-w-md">
                        <div className="bg-purple-800 text-white font-bold px-2 py-1 inline-block rounded-t-lg text-sm w-full text-center">INGRESO CANTIDAD</div>
                        <div className="border border-purple-800 p-2 bg-gray-100 rounded-b-lg shadow-sm grid grid-cols-2 gap-0">
                            <div className="border-r border-gray-400">
                                <label className="block font-bold text-white bg-teal-600 px-1 border border-black text-center">T. Documento</label>
                                <input className="w-full border border-gray-400 p-1 h-8" />
                            </div>
                            <div>
                                <label className="block font-bold text-white bg-purple-700 px-1 border border-black text-center">N° de Documento</label>
                                <select className="w-full border border-gray-400 p-1 h-8"><option></option></select>
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex-1 flex gap-4 items-center h-full pt-6">
                        <button className="bg-red-800 hover:bg-red-900 text-white font-bold py-2 px-8 rounded shadow-md border-2 border-yellow-400 text-lg">INGRESAR</button>
                        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-8 rounded shadow-md border-2 border-white text-lg">LIMPIAR</button>
                        <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-8 rounded shadow-md border-2 border-white text-lg">PDF</button>
                    </div>
                </div>


                {/* --- FORMATO ACTA DE RECEPCIÓN --- */}
                <div className="border-2 border-black p-1 relative mb-12">
                    <div className="absolute top-0 right-0 p-1 font-bold text-xs">N° 6</div>

                    {/* Header Acta */}
                    <div className="border border-black flex items-center p-4 mb-1">
                        <div className="w-48 font-bold text-2xl text-blue-800 italic flex items-center gap-2">
                            {/* Logo Placeholder */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                            AGUPAL PERU
                        </div>
                        <div className="flex-1 text-center font-bold text-xl uppercase tracking-widest">ACTA DE RECEPCION</div>
                        <div className="w-32 text-right font-bold text-xs">POE.ALM. 01.01</div>
                    </div>

                    {/* Tabla Datos Generales */}
                    <div className="grid grid-cols-12 border border-black text-[10px] mb-1">
                        {/* Col 1: Datos Generales */}
                        <div className="col-span-5 border-r border-black">
                            <div className="bg-gray-300 font-bold text-center border-b border-black py-1">DATOS GENERALES</div>
                            <div className="grid grid-cols-[100px_1fr] h-full">
                                <div className="border-b border-r border-black p-1 font-bold flex items-center">CLIENTE:</div>
                                <div className="border-b border-black p-1 flex items-center">No encontrado</div>

                                <div className="border-b border-r border-black p-1 font-bold flex items-center">PROVEEDOR:</div>
                                <div className="border-b border-black p-1 flex items-center">No encontrado</div>

                                <div className="border-r border-black p-1 font-bold flex items-center">FECHA:</div>
                                <div className="p-1 flex items-center">No encontrado</div>
                            </div>
                        </div>

                        {/* Col 2: Tipo Documentario */}
                        <div className="col-span-4 border-r border-black">
                            <div className="bg-gray-300 font-bold text-center border-b border-black py-1">TIPO DOCUMENTARIO</div>
                            <div className="grid grid-cols-[1fr_30px_1fr] h-full">
                                <div className="border-b border-r border-black p-1 font-bold">PACKING LIST</div>
                                <div className="border-b border-r border-black p-1"></div>
                                <div className="border-b border-black p-1 font-bold">IMPORTACION</div>

                                <div className="border-b border-r border-black p-1 font-bold">INVOICE</div>
                                <div className="border-b border-r border-black p-1 text-center">✓</div>
                                <div className="border-b border-black p-1 font-bold text-[9px]">PCIKGPE20251129OP</div>

                                <div className="border-b border-r border-black p-1 font-bold">GUIA REMISION</div>
                                <div className="border-b border-r border-black p-1"></div>
                                <div className="border-b border-black p-1 font-bold">COMPRA LOCAL</div>

                                <div className="border-r border-black p-1 font-bold">FACTURA</div>
                                <div className="border-r border-black p-1"></div>
                                <div className="p-1 font-bold">DEVOLUCION</div>
                            </div>
                        </div>

                        {/* Col 3: Tipo Ingreso */}
                        <div className="col-span-1 border-r border-black">
                            <div className="bg-gray-300 font-bold text-center border-b border-black py-1">TYPE</div>
                            <div className="flex items-center justify-center border-b border-black h-[25px]">✓</div>
                            <div className="flex items-center justify-center border-b border-black h-[25px]"></div>
                            <div className="flex items-center justify-center border-b border-black h-[25px]"></div>
                            <div className="flex items-center justify-center h-[26px]"></div>
                        </div>

                        {/* Col 4: Tipo Conteo */}
                        <div className="col-span-2">
                            <div className="bg-gray-300 font-bold text-center border-b border-black py-1">TIPO DE CONTEO Y REVISION</div>
                            <div className="grid grid-cols-[1fr_30px_30px] h-full">
                                <div className="border-b border-r border-black p-1 text-center flex items-center justify-center font-bold text-[9px]">CONTEO AL 100%</div>
                                <div className="border-b border-r border-black p-1 text-center flex items-center justify-center font-bold">A</div>
                                <div className="border-b border-black p-1 text-center flex items-center justify-center">✓</div>

                                <div className="border-b border-r border-black p-1 text-center flex items-center justify-center font-bold text-[9px]">CONTEO POR MUESTREO</div>
                                <div className="border-b border-r border-black p-1 text-center flex items-center justify-center font-bold">B</div>
                                <div className="border-b border-black p-1 text-center flex items-center justify-center"></div>

                                <div className="border-r border-black p-1 text-center flex items-center justify-center font-bold text-[8px]">CONT. SIM APERT. DE CAJA</div>
                                <div className="border-r border-black p-1 text-center flex items-center justify-center font-bold">C</div>
                                <div className="border-black p-1 text-center flex items-center justify-center font-bold text-[9px]">15° - 25° C</div>
                            </div>
                        </div>
                    </div>


                    {/* TABLA PRODUCTOS VACIA */}
                    <div className="border border-black mb-1 min-h-[100px]">
                        <table className="w-full text-[9px] border-collapse">
                            <thead>
                                <tr className="bg-gray-300 font-bold border-b border-black">
                                    <th className="border-r border-black p-1 w-8">N°</th>
                                    <th className="border-r border-black p-1 w-32">CODIGO PRODUCTO</th>
                                    <th className="border-r border-black p-1 w-64">DESCRIPCIÓN DEL PRODUCTO</th>
                                    <th className="border-r border-black p-1 w-24">FABRICANTE</th>
                                    <th className="border-r border-black p-1 w-24">LOTE/SERIE</th>
                                    <th className="border-r border-black p-1 w-20">F.VCTO.</th>
                                    <th className="border-r border-black p-1 w-16">CANT.SOLIC</th>
                                    <th className="border-r border-black p-1 w-16">CANT.RECI</th>
                                    <th className="border-b border-black p-0 w-32" colSpan={2}>
                                        <div className="border-b border-black p-1">ASPECTO</div>
                                        <div className="grid grid-cols-2">
                                            <div className="border-r border-black p-1">EMB.</div>
                                            <div className="p-1">ENV.</div>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Rows go here */}
                                <tr className="h-6"><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td></tr>
                                <tr className="h-6 border-t border-gray-200"><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="border-b border-black mb-1 pb-1 px-1 text-[10px] italic">
                        OBSERVACIONES: <span className="border-b border-black inline-block w-full h-4"></span>
                    </div>


                    {/* FOOTER FIRMAS */}
                    <div className="border border-black text-[9px]">
                        <div className="grid grid-cols-2 border-b border-black">
                            <div className="border-r border-black">
                                <div className="bg-gray-200 p-1 font-bold border-b border-black">RECIBIDO Auxiliar de Recepcion</div>
                                <div className="p-1 grid grid-cols-[50px_1fr] border-b border-gray-200">
                                    <span>NOMBRE:</span> <span className="font-bold text-center">ROGER E. BLANCAS RAMOS</span>
                                </div>
                                <div className="h-10"></div>
                                <div className="p-1 grid grid-cols-[50px_1fr_50px_1fr] border-t border-gray-200">
                                    <span>FECHA:</span> <span>09/01/2026</span>
                                    <span>FIRMA</span> <span></span>
                                </div>
                            </div>
                            <div>
                                <div className="bg-gray-200 p-1 font-bold border-b border-black">Verificado por Jefe de Almacen</div>
                                <div className="p-1 grid grid-cols-[50px_1fr] border-b border-gray-200">
                                    <span>NOMBRE:</span> <span className="font-bold text-center">JANET H. T. NARVAEZ HUAMAM</span>
                                </div>
                                <div className="h-10"></div>
                                <div className="p-1 grid grid-cols-[50px_1fr_100px] border-t border-gray-200">
                                    <span>FECHA: 09/01/2026</span>
                                    <span></span>
                                    <span className="text-center">FIRMA Y SELLO</span>
                                </div>
                            </div>
                        </div>

                        {/* LEYENDA */}
                        <div className="p-1 bg-white">
                            <div className="font-bold underline mb-1">LEYENDA</div>
                            <div className="flex gap-4 mb-2 font-bold">
                                <span>EMB: Embalaje</span>
                                <span>√: Conforme</span>
                                <span>X: No Conforme</span>
                                <span>NA: No Aplica</span>
                                <span>DT: Director Técnico</span>
                                <span>Q.F. A: Farmacéutico Asistente</span>
                            </div>
                            <div className="space-y-1 text-gray-800">
                                <p><span className="font-bold">Características de Conformidad:</span></p>
                                <p><span className="font-bold">DESCRIPCION:</span> Nombre del producto, Concentración, forma farmacéutica, presentación farmacéutica de acuerdo al documento.</p>
                                <p><span className="font-bold">EMBALAJE:</span> Embalaje, Limpio, no arrugado, no roto, no húmedo, no se encuentre abierto, u otro signo que indique deterioro del producto. Corresponde al producto, limpio, no arrugado, no roto, no húmedo, no se encuentre abierto o evidencia que no ha sido aperturado. Legibles, indelebles y en caso de etiquetas bien adheridas al envase con datos de descripción completos.</p>
                                <p><span className="font-bold">ENVASE:</span> que no ha sido aperturado. Legibles, indelebles y en caso de etiquetas bien adheridas al envase con datos de descripción completos.</p>
                            </div>
                        </div>
                        <div className="text-right p-1 font-bold">FR.ALM.01.01</div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ActaRecepcionLayout;
