import type { PartId, SignalStageId } from './parts';

export interface SignalStage {
  readonly id: SignalStageId;
  readonly title: string;
  readonly kicker: string;
  readonly partIds: readonly PartId[];
  readonly summary: string;
  readonly detail: string;
  readonly outsideInstrument?: boolean;
}

/**
 * The electrical story, in the order a pluck travels through the instrument.
 * The amplifier is a stage for the learner, not a part of the guitar.
 */
export const SIGNAL_PATH: readonly SignalStage[] = [
  {
    id: 'strings',
    title: 'Strings',
    kicker: 'The source',
    partIds: ['strings'],
    summary: 'A vibrating steel string is the source of every electric guitar sound.',
    detail:
      'Plucking changes the string’s tension and sets it swinging. The string itself moves very little air, so an electric guitar barely makes a sound until something senses that motion. Everything after this stage exists to turn it into a voltage.',
  },
  {
    id: 'neck-pickup',
    title: 'Neck pickup',
    kicker: 'Transduction',
    partIds: ['neck-pickup'],
    summary: 'Turns string motion into a small alternating voltage.',
    detail:
      'A magnet and two coils sit under the strings. As the steel string moves through the magnetic field, it induces a current in the coils. Near the neck the string sweeps a wider arc, so this pickup favours the fundamental and sounds round and warm.',
  },
  {
    id: 'bridge-pickup',
    title: 'Bridge pickup',
    kicker: 'Transduction',
    partIds: ['bridge-pickup'],
    summary: 'Senses the same vibration at the brightest point of the string.',
    detail:
      'Near the bridge the string’s arc is tighter, so the coil sees more upper-harmonic motion and less fundamental. The two coils are wired in series and out of phase to cancel hum while doubling the signal.',
  },
  {
    id: 'selector',
    title: 'Selector switch',
    kicker: 'Routing',
    partIds: ['selector-switch'],
    summary: 'Routes one pickup, the other, or both to the controls.',
    detail:
      'The three-way toggle connects the hot lead of the neck pickup, the bridge pickup, or both in parallel. Because each pickup keeps its own volume and tone settings, the middle position is a mix, not a blend knob.',
  },
  {
    id: 'volume',
    title: 'Volume controls',
    kicker: 'Level',
    partIds: ['volume-knobs'],
    summary: 'Set how much of the pickup signal reaches the jack.',
    detail:
      'Each volume pot is a variable resistor to ground. Turning it down reduces amplitude, and because the cable and pot capacitance interact with the pickup’s inductance, it also rolls off some treble. That is why a good clean sound can be found by backing off the guitar volume.',
  },
  {
    id: 'tone',
    title: 'Tone controls',
    kicker: 'Filtering',
    partIds: ['tone-knobs'],
    summary: 'Shunt treble to ground through a capacitor.',
    detail:
      'The tone pot and a 0.022 µF capacitor form a low-pass filter. Turning the knob down lowers the cutoff frequency, so the sound gets darker rather than quieter. The two tone controls work independently, one per pickup.',
  },
  {
    id: 'output',
    title: 'Output jack',
    kicker: 'Output',
    partIds: ['output-jack'],
    summary: 'Hands the signal to the cable.',
    detail:
      'The 1/4-inch mono jack sends the hot signal on the tip and ground on the sleeve. From here the guitar is no longer acoustic or magnetic — it is an electrical signal on a shielded cable, ready for the amplifier.',
  },
  {
    id: 'amplifier',
    title: 'Amplifier',
    kicker: 'Destination',
    partIds: [],
    summary: 'Turns a millivolt signal into the sound you hear.',
    detail:
      'The amp’s preamp boosts the tiny voltage, the tone stack shapes it, and the power amp drives a speaker. This is outside the instrument, but it is the end of the signal path: without it, the guitar’s output is far too weak to move air.',
    outsideInstrument: true,
  },
];

export const SIGNAL_STAGE_BY_ID: Readonly<Record<SignalStageId, SignalStage>> = Object.freeze(
  Object.fromEntries(SIGNAL_PATH.map((stage) => [stage.id, stage])) as Record<SignalStageId, SignalStage>,
);

export function stageForPart(partId: PartId): SignalStage | null {
  return SIGNAL_PATH.find((stage) => stage.partIds.includes(partId)) ?? null;
}

export function stageIndexForPart(partId: PartId): number {
  return SIGNAL_PATH.findIndex((stage) => stage.partIds.includes(partId));
}
