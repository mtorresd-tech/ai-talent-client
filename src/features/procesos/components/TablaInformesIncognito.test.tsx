import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RespuestaPaginada } from '../../../shared/tipos/dominio';
import type { InformeIncognito } from '../api/bandejas';
import { TablaInformesIncognito } from './TablaInformesIncognito';

function informe(overrides: Partial<InformeIncognito> = {}): InformeIncognito {
  return {
    alias: 'Candidato 100',
    generadoEn: '2026-08-14T00:00:00Z',
    aniosExperienciaTotal: 6.9,
    nivelAcademicoMaximo: 'Especialización',
    experiencia: [],
    estudios: [],
    competencias: ['SQL', 'Python'],
    desgloseAfinidad: {
      porcentajeTotal: 77.7,
      porcentajeFortalezas: null,
      porcentajeExperiencia: null,
      porcentajeEstudios: null,
      fortalezas: [],
      debilidades: [],
      comentarios: null,
    },
    ...overrides,
  };
}

function respuesta(informes: InformeIncognito[]): RespuestaPaginada<InformeIncognito> {
  return {
    data: informes,
    meta: { page: 1, pageSize: 5, total: informes.length, totalPages: 1 },
  };
}

const props = {
  cargando: false,
  error: null,
  pagina: 0,
  tamanoPagina: 5,
  onCambioPagina: vi.fn(),
  onVerInforme: vi.fn(),
  onReintentar: vi.fn(),
};

describe('TablaInformesIncognito', () => {
  it('muestra alias, fecha de generación y competencias, sin columnas de afinidad, experiencia ni nivel académico', () => {
    render(<TablaInformesIncognito {...props} respuesta={respuesta([informe()])} />);

    const encabezados = screen.getAllByRole('columnheader').map((c) => c.textContent);
    expect(encabezados).toEqual(['Candidato', 'Generado', 'Competencias', '']);

    const fila = screen.getByText('Candidato 100').closest('tr') as HTMLElement;
    expect(within(fila).getByText('SQL')).toBeInTheDocument();
    expect(within(fila).getByText('Python')).toBeInTheDocument();
    // El detalle vive en el modal, no en la tabla.
    expect(within(fila).queryByText('78%')).not.toBeInTheDocument();
    expect(within(fila).queryByText(/años/)).not.toBeInTheDocument();
    expect(within(fila).queryByText('Especialización')).not.toBeInTheDocument();
  });

  it('renderiza "—" en competencias cuando el informe no trae ninguna', () => {
    render(
      <TablaInformesIncognito {...props} respuesta={respuesta([informe({ competencias: [] })])} />,
    );

    const fila = screen.getByText('Candidato 100').closest('tr') as HTMLElement;
    expect(within(fila).getByText('—')).toBeInTheDocument();
  });

  it('el ícono de ojo invoca onVerInforme con el informe de la fila', async () => {
    const onVerInforme = vi.fn();
    const dato = informe();

    render(
      <TablaInformesIncognito
        {...props}
        onVerInforme={onVerInforme}
        respuesta={respuesta([dato])}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Ver informe de Candidato 100' }));
    expect(onVerInforme).toHaveBeenCalledWith(dato);
  });

  it('muestra el estado vacío propio cuando no hay informes', () => {
    render(<TablaInformesIncognito {...props} respuesta={respuesta([])} />);

    expect(
      screen.getByText('Esta vacante no tiene informes anonimizados por revisar.'),
    ).toBeInTheDocument();
  });
});
