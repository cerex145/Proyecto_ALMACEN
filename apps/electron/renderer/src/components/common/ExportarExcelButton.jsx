import { useState } from 'react';
import { Button } from './Button';
import { openApiDocument } from '../../services/api';

export function ExportarExcelButton({ recurso }) {
    const [exportando, setExportando] = useState(false);

    const exportar = async () => {
        setExportando(true);
        try {
            await openApiDocument('/api/' + recurso + '/exportar');
        } catch (error) {
            window.alert(error.message || 'No se pudo exportar el archivo Excel.');
        } finally {
            setExportando(false);
        }
    };

    return <Button variant="secondary" isLoading={exportando} onClick={exportar}>Exportar a Excel</Button>;
}
