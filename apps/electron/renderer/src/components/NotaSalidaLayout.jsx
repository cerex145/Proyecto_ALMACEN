import React, { useRef } from 'react';

const NotaSalidaLayout = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-xs">
            {/* --- HEADER: CONTROLES DE NOTA DE SALIDA --- */}
            <div className="bg-orange-600 text-white text-center py-2 font-bold text-lg mb-4">
                CONTROLES DE NOTA DE SALIDA
            </div>

            <div className="max-w-7xl mx-auto px-4 space-y-6">

                {/* --- SECCIÓN SUPERIOR: INPUTS DE SALIDA --- */}
                <div className="border-b-2 border-dashed border-gray-400 pb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-start">

                        {/* Panel Izquierdo: Datos */}
                        <div className="flex-1 space-y-3 w-full">
                            <div className="border border-orange-500 p-2 bg-gray-50 rounded-lg shadow-sm">
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    <div>
                                        <label className="block font-bold text-gray-700 bg-yellow-200 px-1 border border-black mb-1">RUC de Cliente</label>
                                        <input type="text" className="w-full border border-gray-400 p-1 h-6" defaultValue="20606511331" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-white bg-teal-600 px-1 border border-black mb-1">Código Cliente</label>
                                        <select className="w-full border border-gray-400 p-1 h-6">
                                            <option>J-1991-001</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-white bg-teal-600 px-1 border border-black mb-1">Lote</label>
                                        <select className="w-full border border-gray-400 p-1 h-6">
                                            <option>202401035</option>
                                        </select>
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

                            {/* GRID DE DETALLES (Cian) */}
                            <div className="grid grid-cols-8 gap-0 border border-black text-center mt-2">
                                {/* Headers */}
                                <div className="bg-teal-700 text-white font-bold border-r border-black p-1">Fecha Vcto</div>
                                <div className="bg-teal-700 text-white font-bold border-r border-black p-1">UM</div>
                                <div className="bg-teal-700 text-white font-bold border-r border-black p-1">Cant.Bulto</div>
                                <div className="bg-teal-700 text-white font-bold border-r border-black p-1">Cant.Cajas</div>
                                <div className="bg-teal-700 text-white font-bold border-r border-black p-1">Cant.x Caja</div>
                                <div className="bg-teal-700 text-white font-bold border-r border-black p-1">Cant.Fracción</div>
                                <div className="bg-teal-700 text-white font-bold border-r border-black p-1">Cant.Total</div>
                                <div className="bg-teal-700 text-white font-bold border-black p-1">Motivo de Salida</div>

                                {/* Inputs */}
                                <input className="border-r border-black text-center h-6 bg-white" />
                                <input className="border-r border-black text-center h-6 bg-white" />
                                <input className="border-r border-black text-center h-6 bg-white" />
                                <input className="border-r border-black text-center h-6 bg-white" />
                                <input className="ml-1 bg-yellow-300 border border-black text-center h-6 font-bold w-[90%]" />
                                <input className="border-r border-black text-center h-6 bg-white" />
                                <input className="ml-1 bg-yellow-300 border border-black text-center h-6 font-bold w-[90%]" />
                                <input className="border-black text-center h-6 bg-white w-full" />
                            </div>
                        </div>

                        {/* Panel Derecho: Botones */}
                        <div className="flex flex-row lg:flex-row gap-2 justify-center items-end h-full pb-2">
                            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow-md border-2 border-white">INGRESAR</button>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow-md border-2 border-white">ELIMINAR</button>
                            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded shadow-md border-2 border-white">LIMPIAR</button>
                            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded shadow-md border-2 border-white">PDF</button>
                        </div>
                    </div>

                    {/* SECCIÓN INTERMEDIA: INGRESO CANTIDAD (Barra Morada) */}
                    <div className="mt-6 flex items-end gap-4">
                        <div className="flex-1 max-w-lg">
                            <div className="bg-purple-700 text-white font-bold px-2 py-1 inline-block rounded-t-lg text-sm">INGRESO CANTIDAD</div>
                            <div className="border border-purple-700 p-2 bg-gray-100 rounded-b-lg rounded-r-lg shadow-sm grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block font-bold text-white bg-teal-600 px-1 border border-black mb-1">T. Documento</label>
                                    <select className="w-full border border-gray-400 p-1 h-6"><option>Guía...</option></select>
                                </div>
                                <div>
                                    <label className="block font-bold text-white bg-teal-600 px-1 border border-black mb-1">N° de Documento</label>
                                    <select className="w-full border border-gray-400 p-1 h-6"><option></option></select>
                                </div>
                                <div>
                                    <label className="block font-bold text-white bg-teal-600 px-1 border border-black mb-1">Fecha Ingreso</label> {/* Kept as 'Ingreso' per image, logically Salida */}
                                    <input type="date" className="w-full border border-gray-400 p-1 h-6" />
                                </div>
                            </div>
                        </div>
                        <button className="bg-red-700 hover:bg-red-800 text-white font-bold text-lg py-2 px-10 rounded shadow-md border-2 border-yellow-400 mb-2">INGRESAR</button>
                    </div>
                </div>


                {/* --- VISTA PREVIA: NOTA DE SALIDA --- */}
                <div className="border border-black p-4 bg-white relative mt-8">
                    <div className="absolute top-2 right-2 border border-black px-2 py-1 font-bold">N° 25</div>

                    <div className="flex items-center border-b border-black pb-4 mb-4">
                        <div className="w-32 font-bold text-xl text-blue-800 italic">AGUPAL PERU</div>
                        <div className="flex-1 text-center font-bold text-lg">NOTA DE SALIDA</div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-xs mb-6">
                        <div className="space-y-1">
                            <div className="flex"><span className="font-bold w-24">Razón Social :</span> <span>No encontrado</span></div>
                            <div className="flex"><span className="font-bold w-24">Código Cliente :</span> <span>No encontrado</span></div>
                            <div className="flex"><span className="font-bold w-24">RUC :</span> <span>20606511331</span></div>
                            <div className="flex"><span className="font-bold w-24">Dirección :</span> <span>No encontrado</span></div>
                        </div>
                        <div className="space-y-1 text-right">
                            <div className="flex justify-end"><span className="font-bold w-32">Fecha de Salida:</span> <span>08/01/2026</span></div>
                            <div className="flex justify-end"><span className="font-bold w-32">Nro.:</span> <span>T001-1253</span></div>
                        </div>
                    </div>

                    {/* TABLA PREVIEW */}
                    <table className="w-full border-collapse border border-black text-[10px] mb-6">
                        <thead className="bg-black text-white">
                            <tr>
                                <th className="border border-white p-1">Ítem</th>
                                <th className="border border-white p-1">Cod.Producto</th>
                                <th className="border border-white p-1">Producto</th>
                                <th className="border border-white p-1">Lote</th>
                                <th className="border border-white p-1">Fecha Vcto</th>
                                <th className="border border-white p-1">UM</th>
                                {/* Note: 'Fabri.' column is absent in Salida Control grid but let's check image preview grid... Image preview grid has fewer cols than Ingreso? 
                                    Image headers: Item, Cod.Prod, Producto, Lote, Fecha Vcto, UM, Cant.Bulto, Cant.Cajas, Cant.x Caja, Cant.Fracc, Cant.Total, Motivo de Salida.
                                */}
                                <th className="border border-white p-1">Cant.Bulto</th>
                                <th className="border border-white p-1">Cant.Cajas</th>
                                <th className="border border-white p-1">Cant.x Caja</th>
                                <th className="border border-white p-1">Cant.Fracción</th>
                                <th className="border border-white p-1">Cant.Total</th>
                                <th className="border border-white p-1">Motivo de Salida</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-center font-medium">
                                <td className="border border-black p-1">1</td>
                                <td className="border border-black p-1">HRF211011</td>
                                <td className="border border-black p-1 text-left">ANESTHESIA NEEDLES FOR SINGLE USE</td>
                                <td className="border border-black p-1">202401035</td>
                                <td className="border border-black p-1">04/01/2029</td>
                                <td className="border border-black p-1">UND</td>
                                <td className="border border-black p-1">1.00</td>
                                <td className="border border-black p-1">6.00</td>
                                <td className="border border-black p-1">1.00</td>
                                <td className="border border-black p-1">0.00</td>
                                <td className="border border-black p-1">6.00</td>
                                <td className="border border-black p-1">VENTAS</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* FOOTER */}
                    <div className="grid grid-cols-2 border border-black mb-8">
                        <div className="border-r border-black p-2 space-y-4">
                            <div>
                                <h4 className="font-bold underline mb-1">Motivo de la Salida:</h4>
                                <p>(Venta, Devolución, Transferencia entre almacenes, etc.)</p>
                            </div>
                            <div>
                                <h4 className="font-bold underline mb-1">Observaciones:</h4>
                                <p>(Condiciones del producto, empaque, devoluciones, etc.)</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2">
                            <div className="grid grid-rows-2 border-r border-black">
                                <div className="border-b border-black p-1 font-bold">BULTOS</div>
                                <div className="p-1 font-bold">FRACCIONES</div>
                            </div>
                            <div className="grid grid-rows-2">
                                <div className="border-b border-black p-1 font-bold">PALETS</div>
                                <div className="p-1 font-bold">
                                    CANTIDAD TOTAL DE UNIDADES
                                    <div className="text-right text-lg mt-2 pr-4">6</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-[10px] mt-2 mb-8 text-gray-600 px-2 space-y-0.5">
                        <p><span className="font-bold">LEYENDA Cant. Bulto:</span> N° de cajas selladas (empaque primario) <span className="font-bold ml-4">Cant. x Caja:</span> N° de unidades por caja abierta</p>
                        <p><span className="font-bold ml-12">Cant. Cajas:</span> N° de unidades por caja sellada <span className="font-bold ml-8">Cant. Fracción:</span> Unidades sueltas</p>
                        <p><span className="font-bold ml-60">Cant. Total:</span> Total de unidades = (Bultos × Cajas × xCajas) + Saldo</p>
                    </div>

                    <div className="mt-8 flex justify-between px-16 text-xs font-bold items-end">
                        <div className="text-center pt-2 border-t border-black w-48">Jefe de Almacén</div>

                        <div className="w-64">
                            <div className="text-center mb-6 font-bold">QUIEN RECIBE</div>
                            <div className="flex gap-2 mb-2">
                                <span>Nombre:</span>
                                <div className="border-b border-black flex-1 border-dashed"></div>
                            </div>
                            <div className="flex gap-2 mb-8">
                                <span>DNI:</span>
                                <div className="border-b border-black flex-1 border-dashed"></div>
                            </div>
                            <div className="flex gap-2">
                                <span>Fecha de recepción:</span>
                                <div className="border-b border-black flex-1 border-dashed"></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default NotaSalidaLayout;
