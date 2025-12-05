export type ParticleShape = 'sphere' | 'snowflake' | 'petal' | 'star';

export interface ParticleConfig {
  color: string;
  shape: ParticleShape;
  isExpanded: boolean;
  rotationSpeed: number;
}