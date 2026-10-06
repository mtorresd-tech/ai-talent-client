import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@geb/api-client';
import type { InformeIncognito } from '../api/bandejas';
import { ModalInformeIncognito } from './ModalInformeIncognito';

function informe(overrides: Partial<InformeIncognito> = {}): InformeIncognito {
  return {
    alias: 'Candidato 100',
    generadoEn: '2026-08-14T00:00:00Z',
    aniosExperienciaTotal: 6.9,
    nivelAcademicoMaximo: 'Especialización',
    experiencia: [],
    estudios: [],
    competencias: [],
    desgloseAfinidad: null,
    ...overrides,
  };
}

const base = {
  abierto: true,
  informe: informe(),
  jobApplicationId: 'APP-123',
  enviando: false,
  error: null,
  onDecidir: vi.fn(),
  onCerrar: vi.fn(),
};

describe('ModalInformeIncognito', () => {
  it('con estudios y experiencia vacíos muestra el estado vacío de cada sección nueva', () => {
    render(
      <ModalInformeIncognito {...base} informe={informe({ experiencia: [], estudios: [] })} />,
    );

    expect(screen.getByText('Sin estudios registrados')).toBeInTheDocument();
    expect(screen.getByText('Sin experiencia registrada')).toBeInTheDocument();
  });

  it('pinta la lista completa de experiencia con cargo, compañía y rango de fechas (cargo actual)', () => {
    render(
      <ModalInformeIncognito
        {...base}
        informe={informe({
          experiencia: [
            {
              cargo: 'Analista de datos',
              compania: 'Grupo Energía Bogotá',
              funciones: 'Construcción de reportes',
              fechaInicio: '2022-01-01',
              fechaFin: null,
            },
            {
              cargo: 'Practicante',
              compania: null,
              funciones: null,
              fechaInicio: null,
              fechaFin: null,
            },
          ],
        })}
      />,
    );

    expect(screen.getByText('Analista de datos')).toBeInTheDocument();
    expect(screen.getByText('Grupo Energía Bogotá')).toBeInTheDocument();
    expect(screen.getByText('Construcción de reportes')).toBeInTheDocument();
    expect(screen.getAllByText(/Actualidad/).length).toBeGreaterThan(0);

    expect(screen.getByText('Practicante')).toBeInTheDocument();
  });

  it('pinta el rango de fechas con fechaFin poblado (cargo ya finalizado)', () => {
    render(
      <ModalInformeIncognito
        {...base}
        informe={informe({
          experiencia: [
            {
              cargo: 'Analista de datos',
              compania: 'Grupo Energía Bogotá',
              funciones: null,
              fechaInicio: '2020-03-01',
              fechaFin: '2022-06-30',
            },
          ],
        })}
      />,
    );

    expect(screen.queryByText(/Actualidad/)).not.toBeInTheDocument();
    expect(screen.getByText(/2020/)).toBeInTheDocument();
  });

  it('agrupa los estudios en Formación académica mostrando siempre el dato real completo', () => {
    render(
      <ModalInformeIncognito
        {...base}
        informe={informe({
          estudios: [
            {
              nivelAcademico: 'Titulado',
              nombreEstudio: 'Ingeniero de Sistemas',
              institucion: 'Universidad Nacional',
            },
            {
              nivelAcademico: 'Especializacion',
              nombreEstudio: 'Especializacion en gerencia de proyectos',
              institucion: null,
            },
          ],
        })}
      />,
    );

    const grupoPregrado = screen.getByText('Profesión / pregrado').closest('div') as HTMLElement;
    expect(within(grupoPregrado).getByText('Ingeniero de Sistemas')).toBeInTheDocument();
    expect(within(grupoPregrado).getByText('Titulado')).toBeInTheDocument();
    expect(within(grupoPregrado).getByText('Universidad Nacional')).toBeInTheDocument();

    const grupoPostgrado = screen.getByText('Postgrados').closest('div') as HTMLElement;
    expect(
      within(grupoPostgrado).getByText('Especializacion en gerencia de proyectos'),
    ).toBeInTheDocument();
    expect(within(grupoPostgrado).getByText('Especializacion')).toBeInTheDocument();
  });

  it('con nombreEstudio nulo usa "Formación académica" como título de respaldo', () => {
    render(
      <ModalInformeIncognito
        {...base}
        informe={informe({
          estudios: [{ nivelAcademico: 'Tecnico', nombreEstudio: null, institucion: null }],
        })}
      />,
    );

    const grupoPregrado = screen.getByText('Profesión / pregrado').closest('div') as HTMLElement;
    expect(within(grupoPregrado).getByText('Formación académica')).toBeInTheDocument();
    expect(within(grupoPregrado).getByText('Tecnico')).toBeInTheDocument();
  });

  it('muestra la fila Áreas con los valores únicos de competencias, sin depender de estudios[]', () => {
    render(
      <ModalInformeIncognito
        {...base}
        informe={informe({
          estudios: [
            {
              nivelAcademico: 'Titulado',
              nombreEstudio: 'Ingeniero de Sistemas',
              institucion: null,
            },
          ],
          competencias: ['SQL', 'Python'],
        })}
      />,
    );

    expect(screen.getByText('Áreas')).toBeInTheDocument();
    expect(screen.getByText('SQL, Python')).toBeInTheDocument();
  });

  it('sin competencias, la fila Áreas no se muestra', () => {
    render(
      <ModalInformeIncognito
        {...base}
        informe={informe({
          estudios: [
            {
              nivelAcademico: 'Titulado',
              nombreEstudio: 'Ingeniero de Sistemas',
              institucion: null,
            },
          ],
          competencias: [],
        })}
      />,
    );

    expect(screen.queryByText('Áreas')).not.toBeInTheDocument();
  });

  it('no renderiza la sección de competencias cuando el arreglo está vacío', () => {
    render(<ModalInformeIncognito {...base} informe={informe({ competencias: [] })} />);

    expect(screen.queryByText('Competencias')).not.toBeInTheDocument();
  });

  it('sin desglose de afinidad, la tarjeta muestra su estado vacío y el modal no se rompe', () => {
    render(<ModalInformeIncognito {...base} informe={informe({ desgloseAfinidad: null })} />);

    const dialogo = screen.getByRole('dialog');
    expect(within(dialogo).getByText('Sin resultado de afinidad')).toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('con jobApplicationId no nulo muestra Aprobar, Rechazar, Cerrar y el campo de comentario', () => {
    render(<ModalInformeIncognito {...base} />);

    const dialogo = screen.getByRole('dialog');
    expect(within(dialogo).getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Rechazar' })).toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Aprobar' })).toBeInTheDocument();
    expect(within(dialogo).getByLabelText('Comentario')).toBeInTheDocument();
  });

  it('el botón Rechazar está deshabilitado con el comentario vacío y se habilita al escribir', async () => {
    const usuario = userEvent.setup();
    render(<ModalInformeIncognito {...base} />);

    const botonRechazar = screen.getByRole('button', { name: 'Rechazar' });
    expect(botonRechazar).toBeDisabled();

    await usuario.type(screen.getByLabelText('Comentario'), 'No cumple el nivel de inglés');
    expect(botonRechazar).toBeEnabled();
  });

  it('al pulsar Aprobar llama a onDecidir con APRUEBA, sin motivo y con el comentario escrito', async () => {
    const usuario = userEvent.setup();
    const onDecidir = vi.fn();
    render(<ModalInformeIncognito {...base} onDecidir={onDecidir} />);

    await usuario.type(screen.getByLabelText('Comentario'), 'Buen perfil técnico');
    await usuario.click(screen.getByRole('button', { name: 'Aprobar' }));

    expect(onDecidir).toHaveBeenCalledWith('APRUEBA', undefined, 'Buen perfil técnico');
  });

  it('al pulsar Rechazar llama a onDecidir con RECHAZA y el mismo texto como motivo y comentario', async () => {
    const usuario = userEvent.setup();
    const onDecidir = vi.fn();
    render(<ModalInformeIncognito {...base} onDecidir={onDecidir} />);

    await usuario.type(
      screen.getByLabelText('Comentario'),
      'No cumple el nivel de inglés requerido',
    );
    await usuario.click(screen.getByRole('button', { name: 'Rechazar' }));

    expect(onDecidir).toHaveBeenCalledWith(
      'RECHAZA',
      'No cumple el nivel de inglés requerido',
      'No cumple el nivel de inglés requerido',
    );
  });

  it('con enviando en true deshabilita los tres botones y el cierre por Esc/click afuera', async () => {
    const usuario = userEvent.setup();
    const onCerrar = vi.fn();
    render(<ModalInformeIncognito {...base} enviando onCerrar={onCerrar} />);

    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Aprobar' })).toBeDisabled();

    await usuario.keyboard('{Escape}');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('con jobApplicationId nulo muestra el mensaje de candidato no identificado y deshabilita las decisiones', () => {
    render(<ModalInformeIncognito {...base} jobApplicationId={null} />);

    const dialogo = screen.getByRole('dialog');
    expect(
      within(dialogo).getByText(/no fue posible identificar al candidato/i),
    ).toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Aprobar' })).toBeDisabled();
    expect(within(dialogo).getByRole('button', { name: 'Rechazar' })).toBeDisabled();
    expect(within(dialogo).queryByLabelText('Comentario')).not.toBeInTheDocument();
  });

  it('con error no nulo muestra el mensaje sin cerrar el modal', () => {
    const error = new ApiError(
      { title: 'La compuerta ya no corresponde', status: 409 },
      'corr-409',
    );
    render(<ModalInformeIncognito {...base} error={error} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/La compuerta ya no corresponde/)).toBeInTheDocument();
    expect(screen.getByText(/corr-409/)).toBeInTheDocument();
  });

  it('al reabrir con un informe distinto el campo de comentario queda vacío', async () => {
    const usuario = userEvent.setup();
    const { rerender } = render(<ModalInformeIncognito {...base} />);

    await usuario.type(screen.getByLabelText('Comentario'), 'Texto del informe anterior');

    rerender(
      <ModalInformeIncognito
        {...base}
        informe={informe({ alias: 'Candidato 200' })}
        jobApplicationId="APP-456"
      />,
    );

    expect(screen.getByLabelText('Comentario')).toHaveValue('');
  });
});
