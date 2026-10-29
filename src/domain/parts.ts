export type PartCategory = 'body' | 'neck' | 'electronics' | 'hardware' | 'strings';

export type SignalStageId =
  | 'strings'
  | 'neck-pickup'
  | 'bridge-pickup'
  | 'selector'
  | 'volume'
  | 'tone'
  | 'output'
  | 'amplifier';

export const PART_IDS = [
  'body-back',
  'maple-top',
  'body-binding',
  'pickguard',
  'control-cavity-cover',
  'neck',
  'fretboard',
  'frets',
  'inlays',
  'neck-binding',
  'nut',
  'headstock',
  'headstock-veneer',
  'logo',
  'truss-rod-cover',
  'tuners',
  'strings',
  'neck-pickup',
  'bridge-pickup',
  'pickup-rings',
  'pickup-poles',
  'bridge',
  'saddles',
  'bridge-posts',
  'tailpiece',
  'volume-knobs',
  'tone-knobs',
  'selector-switch',
  'switch-ring',
  'output-jack',
  'strap-buttons',
] as const;

export type PartId = (typeof PART_IDS)[number];

export interface CategoryInfo {
  readonly id: PartCategory;
  readonly label: string;
  readonly blurb: string;
}

export const CATEGORIES: readonly CategoryInfo[] = [
  {
    id: 'body',
    label: 'Body & finish',
    blurb: 'The slab, the carve, and the lacquer that hold everything together.',
  },
  {
    id: 'neck',
    label: 'Neck & fretboard',
    blurb: 'Scale length, fret placement, and the playing surface.',
  },
  {
    id: 'electronics',
    label: 'Electronics',
    blurb: 'Where string motion becomes a voltage.',
  },
  {
    id: 'hardware',
    label: 'Hardware',
    blurb: 'The metal and plastic that anchors, adjusts, and protects.',
  },
  {
    id: 'strings',
    label: 'Strings',
    blurb: 'The only part of the instrument that actually vibrates.',
  },
];

export interface PartInfo {
  readonly id: PartId;
  readonly name: string;
  readonly shortName: string;
  readonly category: PartCategory;
  readonly tagline: string;
  readonly purpose: string;
  readonly mechanism: string;
  readonly material: string;
  readonly fact: string;
  readonly signalStage?: SignalStageId;
}

interface PartData extends Omit<PartInfo, 'id'> {}

/**
 * The single source of teaching copy. Every physical part in the scene has an
 * entry here; the hover card, inspector, index, and tour all read from it.
 */
const PART_DATA: Record<PartId, PartData> = {
  'body-back': {
    name: 'Mahogany body',
    shortName: 'Body',
    category: 'body',
    tagline: 'The solid slab that anchors the neck, pickups, bridge, and every control.',
    purpose:
      'The body is the instrument’s structural and acoustic foundation. It holds the neck joint, the pickups, the bridge and tailpiece, and the routed control cavity.',
    mechanism:
      'A single slab of mahogany is shaped, routed, and drilled before the maple cap is glued on. Its mass and stiffness damp some frequencies and reinforce others, which is a large part of why a Les Paul sustains the way it does.',
    material: 'African mahogany',
    fact: 'A finished 1959 Standard weighs roughly 9 lb (4 kg) — heavy for a solid-body guitar, and part of the Les Paul’s reputation.',
  },
  'maple-top': {
    name: 'Carved maple top',
    shortName: 'Maple top',
    category: 'body',
    tagline: 'Adds stiffness, brightness, and the arched silhouette of a Burst.',
    purpose:
      'The maple cap stiffens the body and adds upper-harmonic brightness to the mahogany’s warmth. Its carved dome is the shape your forearm rests on.',
    mechanism:
      'A thick maple book-match is glued to the mahogany, then carved into a crown that rises toward the centre. Just inside the binding the surface dips into the recurve, a shallow trough that catches light and makes the carve legible.',
    material: 'Flamed maple',
    fact: 'The sunburst is sprayed by hand: amber in the centre, then cherry, then a dark rim. Every Burst fades differently because the dyes are light-sensitive.',
  },
  'body-binding': {
    name: 'Body binding',
    shortName: 'Binding',
    category: 'body',
    tagline: 'Covers the seam between the maple top and the mahogany side.',
    purpose:
      'Binding protects the edge of the maple cap and gives the body a crisp cream outline that reads from across a stage.',
    mechanism:
      'A channel is routed around the perimeter, a flexible plastic strip is glued in, and the excess is scraped flush. On a Burst the binding yellows with age, which is why vintage examples look tobacco-stained rather than white.',
    material: 'Aged cream celluloid',
    fact: 'Binding is also a tell: a refinished or recarved guitar often gives itself away where the binding meets the top.',
  },
  pickguard: {
    name: 'Pickguard',
    shortName: 'Pickguard',
    category: 'hardware',
    tagline: 'Shields the lacquer from pick strokes and hides the wiring channel.',
    purpose:
      'The pickguard takes the wear that would otherwise reach the maple top, and it covers the shallow channel routed for the pickup wires.',
    mechanism:
      'A single-ply cream plate is screwed to the top with small nickel screws. It floats just above the finish, so it can be removed without disturbing the pickups or their rings.',
    material: 'Cream celluloid',
    fact: 'Many players remove the pickguard entirely; the screw holes are part of why original ’59s are so often “guard off”.',
  },
  'control-cavity-cover': {
    name: 'Control cavity cover',
    shortName: 'Cavity cover',
    category: 'electronics',
    tagline: 'Seals the chamber that holds the pots, capacitor, and switch wiring.',
    purpose:
      'The cover closes the control cavity on the back, keeping dust and moisture away from the potentiometers and wiring while giving a technician access.',
    mechanism:
      'A black plastic plate sits in a shallow recess and is held by four screws. Inside, the four pots, a tone capacitor, and the selector wiring meet in a small, crowded chamber.',
    material: 'Black ABS plastic',
    fact: 'The cavity is often used to date a guitar: pot codes and solder joints reveal far more than the serial number.',
  },
  neck: {
    name: 'Set neck',
    shortName: 'Neck',
    category: 'neck',
    tagline: 'Carries the fretboard and couples string energy into the body.',
    purpose:
      'The neck sets the scale length, carries the playing surface, and joins the body at the heel. Its stiffness and mass shape how the whole instrument responds.',
    mechanism:
      'A mahogany neck is glued into a mortise-and-tenon joint rather than bolted on. The long tenon gives more contact area with the body, which builders associate with sustain and a seamless feel at the heel.',
    material: 'Mahogany',
    fact: 'The neck angle is set during the joint: too shallow and the bridge runs out of adjustment, too steep and the strings sit too high.',
  },
  fretboard: {
    name: 'Rosewood fretboard',
    shortName: 'Fretboard',
    category: 'neck',
    tagline: 'Provides the playing surface and the wear resistance frets need.',
    purpose:
      'The fretboard holds the frets at exact positions and gives the player a stable, comfortable surface under the fingers.',
    mechanism:
      'A 12-inch radius crowns the board across its width, so the strings can be set low without choking on bends. The board is glued to the neck and bounded by cream binding that hides the fret ends.',
    material: 'Indian rosewood',
    fact: 'The scale is 24.75 in, but the board’s 22nd fret sits over the body — the neck joint is closer to the bridge than it looks.',
  },
  frets: {
    name: 'Frets',
    shortName: 'Frets',
    category: 'neck',
    tagline: 'Set the vibrating length of every note.',
    purpose:
      'Pressing a string against a fret changes its effective length, which changes the pitch. The fret positions are the whole tuning system.',
    mechanism:
      'Nickel-silver wire is seated in slots cut across the board. Each fret is spaced by equal temperament: the 12th fret sits exactly halfway along the scale, and each semitone is a factor of 2^(1/12).',
    material: 'Nickel-silver',
    fact: 'Fret wear is why old guitars need refrets; the first few frets take the most punishment from open chords.',
  },
  inlays: {
    name: 'Trapezoid inlays',
    shortName: 'Inlays',
    category: 'neck',
    tagline: 'Mark the fret positions a player needs at a glance.',
    purpose:
      'The inlays are visual landmarks for the 3rd, 5th, 7th, 9th, 12th, 15th, 17th, 19th, and 21st frets. The 12th gets two, because it is the octave.',
    mechanism:
      'Trapezoid pockets are routed into the rosewood and filled with a pearloid material, then sanded flush with the radius. Side dots do the same job for the player’s peripheral vision.',
    material: 'Pearloid cellulose',
    fact: 'The trapezoid shape replaced the earlier dot and block markers; it is one of the fastest ways to date a Les Paul.',
  },
  'neck-binding': {
    name: 'Fretboard binding',
    shortName: 'Neck binding',
    category: 'neck',
    tagline: 'Hides the fret ends and protects the edge of the board.',
    purpose:
      'Binding gives the fretboard a finished edge and keeps the fret tangs from catching a player’s hand during vibrato or slides.',
    mechanism:
      'Cream plastic strip is glued to the sides of the board before the frets are dressed. The fret ends are filed flush and the binding is scraped and polished, so the neck feels continuous rather than toothed.',
    material: 'Aged cream celluloid',
    fact: '“Nibs” — the binding that covers each fret end — are a hallmark of a bound Gibson board and a common check when verifying a refret.',
  },
  nut: {
    name: 'Bone nut',
    shortName: 'Nut',
    category: 'neck',
    tagline: 'Sets string spacing and defines the open-string endpoint.',
    purpose:
      'The nut spaces the strings over the fretboard and sets the zero point of the scale length at the headstock end.',
    mechanism:
      'Six slots are cut to depth and width for the string gauges. Cut too low and open strings buzz; too high and the first frets play sharp and feel stiff.',
    material: 'Bone',
    fact: 'The nut is a service part: changing string gauge usually means cutting a new set of slots or replacing it.',
  },
  headstock: {
    name: 'Headstock',
    shortName: 'Headstock',
    category: 'neck',
    tagline: 'Holds the tuners and anchors the strings at the far end.',
    purpose:
      'The headstock carries the tuning machines and provides the break angle that keeps strings seated at the nut.',
    mechanism:
      'The open-book profile is angled back about 17 degrees. That angle pulls each string down through its nut slot, so it does not rattle or jump out when played hard.',
    material: 'Mahogany',
    fact: 'The 17-degree pitch is a Gibson signature — and the reason a Les Paul headstock needs a little more care when it falls.',
  },
  'headstock-veneer': {
    name: 'Headstock veneer',
    shortName: 'Veneer',
    category: 'neck',
    tagline: 'Gives the headstock its black face and carries the branding.',
    purpose:
      'The veneer is the cosmetic face of the headstock. It provides a smooth black surface for the logo and script.',
    mechanism:
      'A thin black fibre or holly veneer is glued to the angled face before the tuner holes are drilled. The edges are sanded flush with the mahogany behind it.',
    material: 'Black fibre veneer',
    fact: 'On many vintage Gibsons the veneer is holly, dyed black — a detail restorers go to great lengths to match.',
  },
  logo: {
    name: 'Headstock logo',
    shortName: 'Logo',
    category: 'neck',
    tagline: 'Identifies the instrument and its maker.',
    purpose:
      'The inlaid wordmark is the most recognisable piece of branding on the guitar — and, for a learner, a handy orientation mark.',
    mechanism:
      'A pearloid “Gibson” inlay is set into the black veneer, along with the “Les Paul Model” script nearer the nut. The inlay is set before the headstock is finished.',
    material: 'Pearloid inlay',
    fact: 'The open-book headstock and this inlay are among the most copied shapes in guitar history.',
  },
  'truss-rod-cover': {
    name: 'Truss rod cover',
    shortName: 'Truss cover',
    category: 'neck',
    tagline: 'Covers the adjustment nut for the neck’s truss rod.',
    purpose:
      'The cover hides the truss-rod access point while keeping the headstock face clean.',
    mechanism:
      'A steel rod runs inside the neck and counteracts string tension. When the neck relief drifts, a technician removes this two-screw cover and turns the nut to straighten or relax the neck.',
    material: 'Black plastic',
    fact: 'A truss rod is not a fix for a twisted neck; it adjusts relief — the slight forward bow that lets strings vibrate freely.',
  },
  tuners: {
    name: 'Tuning machines',
    shortName: 'Tuners',
    category: 'hardware',
    tagline: 'Tune each string, and hold it there under tension.',
    purpose:
      'Each machine head turns a post that winds the string. The gear ratio makes small, precise tension changes possible.',
    mechanism:
      'A worm gear drives a pinion at roughly 14:1 or 18:1, so the button turns many times for one post revolution. The string wraps around the post and is held by the capstan and a few tidy winds.',
    material: 'Nickel-plated brass and steel',
    fact: 'The 3+3 layout keeps the strings straight from nut to post and spreads the tuner mass evenly on the headstock.',
  },
  strings: {
    name: 'Strings',
    shortName: 'Strings',
    category: 'strings',
    tagline: 'The only part of the instrument that actually vibrates.',
    purpose:
      'Steel strings convert the energy of a pluck into a vibrating mass. Everything downstream exists to sense that motion.',
    mechanism:
      'A wound string has a steel core and a nickel or steel wrap; the wrap adds mass without making the string too stiff. The vibrating length is set by the nut and the bridge, and changed by fretting.',
    material: 'Nickel-wound steel',
    fact: 'A typical set runs .010–.046 in. The plain high E is a single wire; the low E is a core wrapped in a thinner wire.',
    signalStage: 'strings',
  },
  'neck-pickup': {
    name: 'Neck humbucker',
    shortName: 'Neck pickup',
    category: 'electronics',
    tagline: 'Senses the strings near the neck for a warm, round voice.',
    purpose:
      'The neck pickup converts string motion into a small alternating voltage. Its position makes it fuller and softer than the bridge pickup.',
    mechanism:
      'Two coils share a magnet. The string disturbs the magnetic field, inducing a current in the coils; wiring the coils in series and out of phase cancels hum while doubling the signal. Closer to the neck, the string travels through a wider arc, emphasising the fundamental.',
    material: 'Alnico magnet, enamel wire, cream ABS bobbins',
    fact: 'The original PAF (“Patent Applied For”) pickups were never potted, which is why they can squeal under high gain — and why they sound so open.',
    signalStage: 'neck-pickup',
  },
  'bridge-pickup': {
    name: 'Bridge humbucker',
    shortName: 'Bridge pickup',
    category: 'electronics',
    tagline: 'Senses the strings near the bridge for bite and definition.',
    purpose:
      'The bridge pickup turns string motion into voltage at the brightest point of the string, where the harmonics are strongest.',
    mechanism:
      'Near the bridge the string’s arc is tighter, so the coil sees more high-frequency motion and less fundamental. The two coils are wired in series for a hotter, hum-cancelling signal.',
    material: 'Alnico magnet, enamel wire, cream ABS bobbins',
    fact: 'Pickup height is a real tone control: closer to the strings means more output, more attack, and often more magnetic pull on the string.',
    signalStage: 'bridge-pickup',
  },
  'pickup-rings': {
    name: 'Pickup mounting rings',
    shortName: 'Pickup rings',
    category: 'hardware',
    tagline: 'Hold each humbucker at the right height under the strings.',
    purpose:
      'The rings support the pickups and let a technician raise or lower them to balance output against the strings.',
    mechanism:
      'Cream plastic rings are screwed to the top; the pickup hangs from two height screws threaded into the ring or the body. The bridge ring is taller because the strings sit higher there.',
    material: 'Cream ABS',
    fact: 'The slanted bridge ring is not cosmetic: it follows the string plane so the pickup stays parallel to the strings.',
  },
  'pickup-poles': {
    name: 'Pole pieces',
    shortName: 'Pole pieces',
    category: 'electronics',
    tagline: 'Focus the magnetic field under each string.',
    purpose:
      'Each pole piece concentrates the magnetic field at one string, so every string is sensed with a similar strength.',
    mechanism:
      'Six steel screws or slugs per coil sit under the strings. On adjustable poles, turning a screw changes its height and thus the magnetic coupling for that string.',
    material: 'Nickel-plated steel',
    fact: 'Staggered poles follow the fretboard radius; flat poles are cheaper and still common.',
  },
  bridge: {
    name: 'Tune-o-matic bridge',
    shortName: 'Bridge',
    category: 'hardware',
    tagline: 'Sets string height, spacing, and intonation.',
    purpose:
      'The bridge defines the speaking end of each string and transfers its downward force into the body.',
    mechanism:
      'Six saddles sit on a nickel bar. The thumbwheels set the whole bridge height, while each saddle screw moves that string’s contact point fore and aft to correct intonation.',
    material: 'Nickel-plated zinc',
    fact: 'The ABR-1 fitted to a Burst is a tune-o-matic with a narrow body; it is the sound and feel many players mean by “Les Paul bridge”.',
  },
  saddles: {
    name: 'Bridge saddles',
    shortName: 'Saddles',
    category: 'hardware',
    tagline: 'Define each string’s intonation point.',
    purpose:
      'The saddle is the exact point where a string leaves the bridge. Moving it changes the string’s speaking length.',
    mechanism:
      'Each saddle has a notch for its string and a screw that slides it along the bridge. The low strings need more compensation than the high strings, so the saddle line is never perfectly straight.',
    material: 'Nickel-plated zinc',
    fact: 'A guitar can be perfectly in tune open and still sour up the neck — that is a saddle and intonation problem, not a tuner problem.',
  },
  'bridge-posts': {
    name: 'Bridge posts & thumbwheels',
    shortName: 'Bridge posts',
    category: 'hardware',
    tagline: 'Couple the bridge to the body and set its height.',
    purpose:
      'The posts transfer string load into the mahogany and let the bridge be raised or lowered without removing the strings.',
    mechanism:
      'Steel posts are threaded into anchors set in the body. The thumbwheels beneath the bridge bear on the posts, so turning them changes action and string height.',
    material: 'Nickel-plated steel',
    fact: 'Post lean is a real failure mode on vintage guitars; the string pull is constant and the wood is not.',
  },
  tailpiece: {
    name: 'Stopbar tailpiece',
    shortName: 'Tailpiece',
    category: 'hardware',
    tagline: 'Anchors the string ends and sets the break angle over the bridge.',
    purpose:
      'The stopbar holds the ball ends of the strings and pulls them rearward, creating the downward break angle across the saddles.',
    mechanism:
      'A solid aluminium or zinc bar sits on two studs. Lowering it increases the break angle, which adds tension behind the bridge and changes feel and sustain.',
    material: 'Aluminium',
    fact: '“Top-wrapping” — running the strings over the top of the stopbar — reduces the break angle and is a long-standing Les Paul setup trick.',
  },
  'volume-knobs': {
    name: 'Volume controls',
    shortName: 'Volume',
    category: 'electronics',
    tagline: 'Set how much pickup signal reaches the output.',
    purpose:
      'The two volume knobs control each pickup’s level independently, so a player can mix them or fade one in with the selector in the middle.',
    mechanism:
      'Each knob turns a potentiometer wired as a variable resistor between the pickup and the output. Turning down bleeds signal to ground; the cable’s capacitance also rolls off treble as the level drops.',
    material: 'Amber top-hat knobs, audio-taper potentiometers',
    fact: '“Woman tone” is a wiring and capacitor trick, not a myth: the tone control and volume interaction can produce a nasal, vocal midrange.',
    signalStage: 'volume',
  },
  'tone-knobs': {
    name: 'Tone controls',
    shortName: 'Tone',
    category: 'electronics',
    tagline: 'Bleed treble to ground through a capacitor.',
    purpose:
      'The tone knobs darken the pickup’s sound by shunting high frequencies to ground, leaving the lower frequencies intact.',
    mechanism:
      'A potentiometer and a 0.022 µF capacitor form a low-pass filter across the signal. Turning the knob down lowers the cutoff, so the sound gets rounder rather than simply quieter.',
    material: 'Amber top-hat knobs, 0.022 µF capacitor',
    fact: 'The capacitor value is a voicing choice: 0.022 µF is the classic Gibson value; 0.047 µF would roll off much more.',
    signalStage: 'tone',
  },
  'selector-switch': {
    name: 'Pickup selector',
    shortName: 'Selector',
    category: 'electronics',
    tagline: 'Chooses the neck pickup, the bridge pickup, or both.',
    purpose:
      'The three-way toggle routes one pickup, the other, or both to the volume and tone controls.',
    mechanism:
      'A spring-loaded toggle moves a contact between three lugs. The middle position connects both pickups in parallel, which is why it sounds leaner than either pickup alone.',
    material: 'Nickel-plated brass',
    fact: 'The switch is not a blend control: the two pickups keep their own volume and tone settings even in the middle position.',
    signalStage: 'selector',
  },
  'switch-ring': {
    name: 'Poker chip',
    shortName: 'Switch ring',
    category: 'hardware',
    tagline: 'Labels the selector’s rhythm and treble positions.',
    purpose:
      'The printed ring tells a player which direction selects the neck or bridge pickup without looking at the wiring.',
    mechanism:
      'A cream plastic ring sits under the switch nut, with “Rhythm” toward the neck pickup and “Treble” toward the bridge. The wording follows the pickup positions, not the physical switch direction on every guitar.',
    material: 'Cream ABS',
    fact: 'The nickname comes from its shape and markings; collectors care about the exact font and colour of original rings.',
  },
  'output-jack': {
    name: 'Output jack',
    shortName: 'Jack',
    category: 'electronics',
    tagline: 'Hands the signal to the cable and on to the amplifier.',
    purpose:
      'The jack is the instrument’s output connector: the point where the guitar’s millivolt signal leaves the body.',
    mechanism:
      'A 1/4-inch mono jack has a tip contact for signal and a sleeve contact for ground. The tip springs against the plug’s tip; the sleeve grounds the cable shield.',
    material: 'Nickel-plated steel',
    fact: 'A crackling or intermittent Les Paul is often a loose jack nut, not a bad pickup — the jack takes the cable’s leverage every time you move.',
    signalStage: 'output',
  },
  'strap-buttons': {
    name: 'Strap buttons',
    shortName: 'Strap buttons',
    category: 'hardware',
    tagline: 'Anchor a guitar strap so the instrument can be played standing.',
    purpose:
      'The two buttons hold the strap at the upper horn and the tail of the body, balancing the guitar’s weight.',
    mechanism:
      'Each button is a flanged metal pin screwed into the body. A strap end fits over the flange, and a strap lock can be added to stop it slipping off.',
    material: 'Nickel-plated steel',
    fact: 'A Les Paul balances differently from a Strat: the rear button position pulls the neck up and the body sits lower.',
  },
};

export const PARTS: readonly PartInfo[] = PART_IDS.map((id) => ({ id, ...PART_DATA[id] }));

export const PART_BY_ID: Readonly<Record<PartId, PartInfo>> = Object.freeze(
  Object.fromEntries(PARTS.map((part) => [part.id, part])) as Record<PartId, PartInfo>,
);

export const CATEGORY_BY_ID: Readonly<Record<PartCategory, CategoryInfo>> = Object.freeze(
  Object.fromEntries(CATEGORIES.map((category) => [category.id, category])) as Record<
    PartCategory,
    CategoryInfo
  >,
);

export function isPartId(value: string): value is PartId {
  return Object.prototype.hasOwnProperty.call(PART_BY_ID, value);
}

export function getPart(id: string | null | undefined): PartInfo | null {
  if (!id || !isPartId(id)) return null;
  return PART_BY_ID[id];
}

export interface CategoryGroup {
  readonly category: CategoryInfo;
  readonly parts: readonly PartInfo[];
}

export function groupPartsByCategory(parts: readonly PartInfo[] = PARTS): readonly CategoryGroup[] {
  return CATEGORIES.map((category) => ({
    category,
    parts: parts.filter((part) => part.category === category.id),
  })).filter((group) => group.parts.length > 0);
}

export function partsInCategory(category: PartCategory): readonly PartInfo[] {
  return PARTS.filter((part) => part.category === category);
}
