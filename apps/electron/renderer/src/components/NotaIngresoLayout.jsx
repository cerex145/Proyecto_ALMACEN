import React, { useRef } from 'react';

const NotaIngresoLayout = () => {
    // Refs for PDF generation (future use)
    const contentRef = useRef(null);

    return (
        <div className="min-h-screen bg-white font-sans text-xs">
            {/* --- HEADER: CONTROLES DE NOTA DE INGRESO --- */}
            <div className="bg-purple-900 text-white text-center py-2 font-bold text-lg mb-4">
                CONTROLES DE NOTA DE INGRESO
            </div>

            <div className="max-w-7xl mx-auto px-4 space-y-6">

                {/* --- SECCIÓN SUPERIOR: INGRESO INDIVIDUAL --- */}
                <div className="border-b-2 border-dashed border-gray-400 pb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-start">

                        {/* Panel Izquierdo: Datos Cliente/Producto */}
                        <div className="flex-1 space-y-3 w-full">
                            <div className="bg-purple-700 text-white font-bold px-2 py-1 inline-block rounded-t-lg text-sm">INGRESO INDIVIDUAL</div>
                            <div className="border border-purple-700 p-2 bg-gray-100 rounded-b-lg rounded-r-lg shadow-sm">
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    <div>
                                        <label className="block font-bold text-gray-700 bg-yellow-200 px-1 border border-black mb-1">RUC de Cliente</label>
                                        <input type="text" className="w-full border border-gray-400 p-1 h-6" defaultValue="20605712241" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-white bg-teal-600 px-1 border border-black mb-1">Código Cliente</label>
                                        <select className="w-full border border-gray-400 p-1 h-6">
                                            <option>CLI-2241-001</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-white bg-teal-600 px-1 border border-black mb-1">Lote</label>
                                        <input type="text" className="w-full border border-gray-400 p-1 h-6" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    <div className="col-span-1">
                                        <label className="block font-bold text-white bg-teal-600 px-1 border border-black mb-1">Cod.Producto</label>
                                        <input type="text" className="w-full border border-gray-400 p-1 h-6" />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block font-bold text-white bg-teal-600 px-1 border border-black mb-1">Producto</label>
                                        <select className="w-full border border-gray-400 p-1 h-6">
                                            <option>Seleccione...</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* GRID LARGO DE DETALLES */}
                            <div className="grid grid-cols-8 gap-0 border border-black text-center mt-2">
                                {/* Headers */}
                                <div className="bg-teal-700 text-white font-bold border-r border-black p-1">Fecha Vcto</div>
                                <div className="bg-teal-700 text-white font-bold border-r border-black p-1">UM</div>
                                <div className="bg-teal-700 text-white font-bold border-r border-black p-1">Fabri.</div>
                                <div className="bg-teal-700 text-white font-bold border-r border-black p-1">Temp.</div>
                                <div className="bg-teal-700 text-white font-bold border-r border-black p-1">Cant.Bulto</div>
                                <div className="bg-teal-700 text-white font-bold border-r border-black p-1">Cant.Cajas</div>
                                <div className="bg-teal-700 text-white font-bold border-r border-black p-1">Cant.x Caja</div>
                                <div className="bg-teal-700 text-white font-bold border-black p-1">Cant.Fracción</div>

                                {/* Inputs */}
                                <input className="border-r border-black text-center h-6 bg-white" />
                                <input className="border-r border-black text-center h-6 bg-white" />
                                <input className="border-r border-black text-center h-6 bg-white" />
                                <input className="border-r border-black text-center h-6 bg-white" />
                                <input className="border-r border-black text-center h-6 bg-white" />
                                <input className="border-r border-black text-center h-6 bg-white" />
                                <input className="bg-yellow-100 border-r border-black text-center h-6 font-bold" />
                                <input className="bg-white text-center h-6 border-black" />
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-yellow-300 border border-black px-2 py-1 font-bold">Cant.Total: <span className="ml-2">0.00</span></div>
                            </div>
                        </div>

                        {/* Panel Derecho: Botones */}
                        <div className="flex flex-row lg:flex-col gap-2 min-w-[150px] justify-center pt-8">
                            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md border-2 border-white">INGRESAR</button>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md border-2 border-white">ELIMINAR</button>
                            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded shadow-md border-2 border-white">LIMPIAR</button>
                            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded shadow-md border-2 border-white">PDF</button>
                        </div>
                    </div>

                    {/* SECCIÓN INTERMEDIA: INGRESO CANTIDAD */}
                    <div className="mt-4 flex items-end gap-4">
                        <div className="flex-1 max-w-lg">
                            <div className="bg-purple-700 text-white font-bold px-2 py-1 inline-block rounded-t-lg text-sm">INGRESO CANTIDAD</div>
                            <div className="border border-purple-700 p-2 bg-gray-100 rounded-b-lg rounded-r-lg shadow-sm grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block font-bold text-white bg-teal-600 px-1 border border-black mb-1">T. Documento</label>
                                    <select className="w-full border border-gray-400 p-1 h-6"><option>Guía...</option></select>
                                </div>
                                <div>
                                    <label className="block font-bold text-white bg-teal-600 px-1 border border-black mb-1">N° de Documento</label>
                                    <select className="w-full border border-gray-400 p-1 h-6"><option>0001-...</option></select>
                                </div>
                                <div>
                                    <label className="block font-bold text-white bg-teal-600 px-1 border border-black mb-1">Fecha Ingreso</label>
                                    <input type="date" className="w-full border border-gray-400 p-1 h-6" />
                                </div>
                            </div>
                        </div>
                        <button className="bg-red-700 start-end hover:bg-red-800 text-white font-bold text-lg py-2 px-8 rounded shadow-md border-2 border-yellow-400">INGRESAR</button>
                    </div>
                </div>


                {/* --- FORMATO DE IMPRESIÓN / VISTA PREVIA --- */}
                <div className="border border-black p-4 bg-white relative">
                    <div className="absolute top-2 right-2 border border-black px-2 py-1 font-bold">N° 6</div>

                    <div className="flex items-center border-b border-black pb-4 mb-4">
                        <div className="w-32 font-bold text-xl text-blue-800 italic">AGUPAL PERU</div>
                        <div className="flex-1 text-center font-bold text-lg">NOTA DE INGRESO</div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-xs mb-6">
                        <div className="space-y-1">
                            <div className="flex"><span className="font-bold w-24">Razón Social :</span> <span>MIRET MEDICAL ASOCIADOS S.A.C. MIRET MED</span></div>
                            <div className="flex"><span className="font-bold w-24">Código Cliente :</span> <span>CLI-2241-001</span></div>
                            <div className="flex"><span className="font-bold w-24">RUC :</span> <span>20605712241</span></div>
                            <div className="flex"><span className="font-bold w-24">Dirección :</span> <span>JR. DIANA INT.11,MZ.D2,LT.25,1 Y 2 PIS URB.SANTA MARIA DE SURCO</span></div>
                        </div>
                        <div className="space-y-1 text-right">
                            <div className="flex justify-end"><span className="font-bold w-32">Fecha de Ingreso:</span> <span>09/01/2026</span></div>
                        </div>
                    </div>

                    {/* TABLA PRINCIPAL */}
                    <table className="w-full border-collapse border border-black text-[10px] mb-6">
                        <thead className="bg-black text-white">
                            <tr>
                                <th className="border border-white p-1">Ítem</th>
                                <th className="border border-white p-1">Cod.Producto</th>
                                <th className="border border-white p-1">Producto</th>
                                <th className="border border-white p-1">Lote</th>
                                <th className="border border-white p-1">Fecha Vcto</th>
                                <th className="border border-white p-1">UM</th>
                                <th className="border border-white p-1">Fabri.</th>
                                <th className="border border-white p-1">Temp.</th>
                                <th className="border border-white p-1">Cant.Bulto</th>
                                <th className="border border-white p-1">Cant.Cajas</th>
                                <th className="border border-white p-1">Cant.x Caja</th>
                                <th className="border border-white p-1">Cant.Fracción</th>
                                <th className="border border-white p-1">Cant.Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Rows ficticias para demo visual */}
                            <tr className="text-center font-medium">
                                <td className="border border-black p-1">1</td>
                                <td className="border border-black p-1">RSC051125</td>
                                <td className="border border-black p-1 text-left">BrilliantTM Introducer Kit - 5Fr</td>
                                <td className="border border-black p-1">202511603</td>
                                <td className="border border-black p-1">02/11/2026</td>
                                <td className="border border-black p-1">UND</td>
                                <td className="border border-black p-1">LEPU INT</td>
                                <td className="border border-black p-1">15° 25°C</td>
                                <td className="border border-black p-1">1.00</td>
                                <td className="border border-black p-1">1.00</td>
                                <td className="border border-black p-1">300.00</td>
                                <td className="border border-black p-1">0.00</td>
                                <td className="border border-black p-1">300.00</td>
                            </tr>
                            <tr className="text-center font-medium bg-gray-50">
                                <td className="border border-black p-1">2</td>
                                <td className="border border-black p-1">RSC061125</td>
                                <td className="border border-black p-1 text-left">BrilliantTM Introducer Kit 6Fr</td>
                                <td className="border border-black p-1">202512604</td>
                                <td className="border border-black p-1">10/12/2026</td>
                                <td className="border border-black p-1">UND</td>
                                <td className="border border-black p-1">LEPU INT</td>
                                <td className="border border-black p-1">15° 25°C</td>
                                <td className="border border-black p-1">1.00</td>
                                <td className="border border-black p-1">1.00</td>
                                <td className="border border-black p-1">1200.00</td>
                                <td className="border border-black p-1">0.00</td>
                                <td className="border border-black p-1">1200.00</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* FOOTER DE LA NOTA */}
                    <div className="grid grid-cols-2 border border-black mb-8">
                        <div className="border-r border-black p-2 space-y-4">
                            <div>
                                <h4 className="font-bold underline mb-1">Motivo de la Salida:</h4>
                                <p>(Describir causa)</p>
                            </div>
                            <div>
                                <h4 className="font-bold underline mb-1">Observaciones:</h4>
                                <p>(Condiciones, daños, etc.)</p>
                            </div>
                            <div className="text-[10px] mt-4 text-gray-600 space-y-0.5">
                                <p><span className="font-bold">LEYEN Cant. Bulto:</span> N° de cajas selladas (empaque primario)</p>
                                <p><span className="font-bold ml-9">Cant. Cajas:</span> N° de unidades por caja sellada</p>
                                <p><span className="font-bold ml-9">Cant. x Caja:</span> N° de unidades por caja abierta</p>
                            </div>
                        </div>
                        <div className="grid grid-rows-2">
                            <div className="grid grid-cols-2 border-b border-black">
                                <div className="border-r border-black p-1 font-bold">BULTOS</div>
                                <div className="p-1 font-bold">PALETS</div>
                            </div>
                            <div className="grid grid-cols-2">
                                <div className="border-r border-black p-1 font-bold">FRACCIONES</div>
                                <div className="p-1 font-bold">CANTIDAD TOTAL DE UNIDADES</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-between px-16 text-xs font-bold">
                        <div className="text-center pt-2 border-t border-black w-48">Jefe de Almacén</div>
                        <div className="text-center pt-2 border-t border-black w-48">Verificado por</div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default NotaIngresoLayout;
