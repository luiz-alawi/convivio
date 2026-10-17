// Os cinco pilares da AMF. A ordem aqui é a ordem das pétalas no logo e no gráfico do perfil.
export const PILLARS = [
  { id: 'internacionalidade', name: 'Internacionalidade' },
  { id: 'estudo', name: 'Estudo' },
  { id: 'trabalho', name: 'Trabalho' },
  { id: 'ciencia', name: 'Ciência' },
  { id: 'moralidade', name: 'Alta moralidade' },
] as const;

export type PillarId = (typeof PILLARS)[number]['id'];

export const PILLAR_IDS = PILLARS.map((p) => p.id) as [PillarId, ...PillarId[]];

export type PillarPoints = Record<PillarId, number>;

export const emptyPillarPoints = (): PillarPoints => ({
  internacionalidade: 0,
  estudo: 0,
  trabalho: 0,
  ciencia: 0,
  moralidade: 0,
});
