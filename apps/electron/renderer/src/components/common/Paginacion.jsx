import { Button } from './Button';

export function Paginacion({ page, hasMore, loading, setPage, label = 'Páginas del historial' }) {
    if (page === 1 && !hasMore) return null;

    return (
        <nav aria-label={label} className="mb-4 flex items-center justify-end gap-3">
            <Button variant="secondary" size="sm" disabled={loading || page === 1}
                onClick={() => setPage(page - 1)}>Anterior</Button>
            <span className="text-sm text-slate-600">Página {page}</span>
            <Button variant="secondary" size="sm" disabled={loading || !hasMore}
                onClick={() => setPage(page + 1)}>Siguiente</Button>
        </nav>
    );
}
