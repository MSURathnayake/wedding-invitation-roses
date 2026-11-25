// ============================================================
//  EDIT EVERYTHING HERE — names, date, venue, families, phones.
//  (All details below are placeholders; replace with the real ones.)
// ============================================================
const CONFIG = {
  // Paste your deployed Google Apps Script Web App URL here (see README.md).
  // Leave empty to run in DEMO mode (RSVP + uploads are kept only in this browser).
  appsScriptUrl: '',

  bride: 'Sachini',
  groom: 'Dimuth',

  // Wedding start time. NOTE: keep the +05:30 (Sri Lanka time).
  weddingDate: '2027-03-10T17:00:00+05:30',
  timeZone: 'Asia/Colombo',

  tagline: 'We invite you to celebrate love and commitment with us',
  receptionNote: 'Reception to Follow',

  venue: {
    name: 'Grand Ballroom, Mount Lavinia Hotel',
    address: 'Hotel Road, Mount Lavinia, Sri Lanka',
    mapsQuery: 'Mount Lavinia Hotel, Sri Lanka',
  },

  events: [
    { title: 'Wedding Ceremony', time: '2027-03-10T17:00:00+05:30', place: 'Grand Ballroom' },
    { title: 'Reception & Dinner', time: '2027-03-10T19:00:00+05:30', place: 'Garden Terrace' },
  ],

  couplePhoto: 'couple.jpg',
  coupleNote: 'Two hearts, one story — and we would be honoured to have you with us as it begins.',

  families: [
    {
      side: 'The Groom',
      name: 'Dimuth Perera',
      line: 'Son of',
      parents: 'Mr. Nimal Perera & Mrs. Kamani Perera',
      place: 'Colombo',
    },
    {
      side: 'The Bride',
      name: 'Sachini Fernando',
      line: 'Daughter of',
      parents: 'Mr. Ruwan Fernando & Mrs. Shyamali Fernando',
      place: 'Kandy',
    },
  ],

  // Replace with the real pre-shoot photos (put them in public/assets/ and list here).
  gallery: ['couple.jpg', 'g1.jpg', 'g2.jpg', 'g3.jpg', 'g4.jpg'],

  contacts: [
    { role: 'Groom', name: 'Dimuth', phone: '+94771234567' },
    { role: 'Bride', name: 'Sachini', phone: '+94777654321' },
  ],

  // Guest photo upload opens on the wedding day (00:00 Sri Lanka time) and stays open.
  uploadOpensAt: '2027-03-10T00:00:00+05:30',

  maxGuestsPerAdultsField: 10,
};

export default CONFIG;
