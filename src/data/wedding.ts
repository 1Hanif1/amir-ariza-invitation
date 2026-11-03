/**
 * All wedding content lives here. Components only read from this file, so a
 * correction made here appears everywhere it is used.
 *
 * Source: amir-arizawedding (T)_014304.pdf, the family's printed invitation.
 *
 * Search for "CONFIRM" to find every item the family should check.
 */

export type Colourway = 'saffron' | 'iris' | 'rose';

export interface ProgrammeItem {
  time: string;
  label: string;
}

export interface Venue {
  name: string;
  /** Address lines, as printed on the invitation. */
  address: string[];
  /** The text Google Maps searches for when a guest asks for directions. */
  mapsDestination: string;
}

export interface WeddingEvent {
  id: string;
  name: string;
  /** Shown on its own line beneath the name, so it never breaks at a hyphen. */
  nameDetail?: string;
  /** Used in the date links at the foot of the hero. */
  shortName: string;
  city: string;
  colourway: Colourway;
  /** ISO date, used for the <time> element. */
  isoDate: string;
  weekday: string;
  day: string;
  shortMonth: string;
  monthYear: string;
  /** Left unset where the invitation prints no Hijri date. */
  hijri?: string;
  /** The event's own invitation wording. */
  wording: string;
  /** Printed above the date on some invitation pages. */
  blessingWord?: string;
  /** For events with a single time. */
  time?: { label?: string; value: string };
  /** For events with a timed programme. */
  programme?: { intro: string; items: ProgrammeItem[]; closing: string };
  host?: string;
  venue: Venue;
}

export const couple = {
  groom: { full: 'Sayed Amir Hussain Jafri', short: 'Amir' },
  bride: { full: 'Syeda Ariza Naqvi', short: 'Ariza' },
  headline: 'The Wedding Celebration',
  date: {
    iso: '2026-12-20',
    weekday: 'Sunday',
    day: '20',
    month: 'December',
    year: '2026',
    display: '20 December 2026',
  },
};

export const bismillah = {
  arabic: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  transliteration: 'Bismillahir Rahmanir Raheem',
  english: 'In the Name of Allah, The Most Beneficent, The Most Merciful',
};

export const invitation = {
  // CONFIRM: the PDF prints "By the race of". Corrected here to "grace".
  invocation:
    'By the grace of Chahardah Masomeen (A.S.) & with the blessings of Imam-e-Zaman (A.T.F.S.)',
  host: {
    honorific: 'Late Janab Al-Hajj',
    name: 'Sayed Mohammed Ali Jafri Sahab',
    place: 'Qazi Sarai, Faizabad, U.P.',
  },
  request: 'Request the honour of your family’s presence at the',
  occasion: { name: 'Reception', detail: '(Dawat-e-Walima)' },
  relation: 'of his beloved grandson',
  groom: {
    name: couple.groom.full,
    // The PDF is missing the closing bracket on this line.
    parents: '(S/o. Mrs. & Mr. Sayed Mumtaz Haider Jafri Sahab (Papa Bhai))',
  },
  joiner: 'With',
  bride: {
    name: couple.bride.full,
    // CONFIRM: spelled "Syed" and "Shahi" in the PDF, kept exactly as printed.
    parents: '(D/o. Mrs. & Mr. Syed Shahi Abbas Naqvi)',
  },
  blessingWord: 'Insha Allah',
  date: 'On Sunday, 20th December 2026',
  hijri: '10 Rajab 1448 Hijri',
  dinner: 'Dinner: 8:00 PM onwards',
  venueLabel: 'Venue',
  venue: { name: 'Parsee Gymkhana', address: 'Marine Drive, Mumbai - 400 002' },
  // CONFIRM: the PDF prints "With Best Commitments". Corrected to "Compliments".
  compliments: {
    label: 'With Best Compliments',
    from: ['Sayed Family', 'Relatives & Friends'],
  },
};

export const celebrationsIntro = 'Three evenings in two cities.';

export const events: WeddingEvent[] = [
  {
    id: 'haldi',
    // CONFIRM: the brief asked for a neutral placeholder because PDF text
    // extraction shows no name, but page 3 of the PDF prints "Haldi Ceremony"
    // as artwork. To use the placeholder, set name to 'A Family Celebration',
    // shortName to 'Celebration', and end the wording at "cordially invites you".
    name: 'Haldi Ceremony',
    shortName: 'Haldi',
    city: 'Mumbai',
    colourway: 'saffron',
    isoDate: '2026-12-11',
    weekday: 'Friday',
    day: '11',
    shortMonth: 'Dec',
    monthYear: 'December 2026',
    wording: 'The family of Sayed Amir Hussain Jafri cordially invites you to the Haldi Ceremony.',
    time: { value: '7:00 PM' },
    venue: {
      name: 'Vinca I & Vinca II',
      address: ['The Sahil Hotel, 292, Bellasis Road', 'Mumbai Central, Mumbai - 400 008'],
      mapsDestination: 'The Sahil Hotel, 292 Bellasis Road, Mumbai Central, Mumbai 400008',
    },
  },
  {
    id: 'nikah',
    name: 'Nikah',
    shortName: 'Nikah',
    city: 'Lucknow',
    colourway: 'iris',
    isoDate: '2026-12-17',
    weekday: 'Thursday',
    day: '17',
    shortMonth: 'Dec',
    monthYear: 'December 2026',
    hijri: '7 Rajab 1448 Hijri',
    // CONFIRM: the PDF prints "You are request to attend". Corrected to "requested".
    wording: 'You are requested to attend the Nikah Ceremony of my beloved son Sayed Amir Hussain Jafri.',
    programme: {
      intro: 'As per the following programme',
      items: [
        { time: '7:00 PM', label: 'Arrival of Baraat' },
        { time: '7:30 PM', label: 'Hadees-e-Kisa' },
        { time: '8:00 PM', label: 'Nikah' },
      ],
      closing: 'Followed by dinner',
    },
    host: 'Mrs. & Mr. Sayed Mumtaz Haider Jafri',
    venue: {
      name: 'Lalabagh Palace',
      address: ['Dubagga, Kanpur Ring Road', 'Lucknow - 226 003'],
      mapsDestination: 'Lalabagh Palace, Dubagga, Kanpur Ring Road, Lucknow 226003',
    },
  },
  {
    id: 'reception',
    name: 'Reception',
    nameDetail: '(Dawat-e-Walima)',
    shortName: 'Reception',
    city: 'Mumbai',
    colourway: 'rose',
    isoDate: '2026-12-20',
    weekday: 'Sunday',
    day: '20',
    shortMonth: 'Dec',
    monthYear: 'December 2026',
    hijri: '10 Rajab 1448 Hijri',
    wording: 'Sayed Amir Hussain Jafri with Syeda Ariza Naqvi',
    blessingWord: 'Insha Allah',
    time: { label: 'Dinner', value: '8:00 PM onwards' },
    venue: {
      name: 'Parsee Gymkhana',
      address: ['Marine Drive', 'Mumbai - 400 002'],
      mapsDestination: 'Parsee Gymkhana, Marine Drive, Mumbai 400002',
    },
  },
];

export const blessing = {
  text: 'May Allah! Guide this marriage to the best of Understanding, Happiness, Prosperity, Success and a Righteous Path...',
  close: 'Aameen',
};

export const site = {
  // CONFIRM: replace with the real address before sharing. WhatsApp cannot show
  // the preview image until this points at the live site.
  url: 'https://example.com',
  title: 'Amir & Ariza | The Wedding Celebration',
  description:
    'The wedding celebration of Sayed Amir Hussain Jafri and Syeda Ariza Naqvi: Haldi in Mumbai on 11 December, Nikah in Lucknow on 17 December and Reception in Mumbai on 20 December 2026.',
  themeColor: '#F4EBDD',
  ogImage: '/og-image.jpg',
};

export const navigation = [
  { href: '#home', label: 'Home' },
  { href: '#invitation', label: 'Invitation' },
  { href: '#celebrations', label: 'Celebrations' },
  { href: '#blessing', label: 'Blessing' },
];

/** Opens Google Maps directions to a venue from the guest's current location. */
export function directionsUrl(destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
