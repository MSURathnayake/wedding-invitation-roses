/**
 * Wedding invitation backend — Google Apps Script
 * Stores RSVPs in a Google Sheet and guest photos in a Google Drive folder.
 *
 * SETUP: see README.md  (Deploy > New deployment > Web app > Execute as: Me, Access: Anyone)
 */

const RSVP_SHEET = 'RSVPs';
const PHOTO_FOLDER_NAME = 'Wedding Guest Photos';
const HEADERS = ['Timestamp', 'Name', 'Phone', 'Attending', 'Adults', 'Children', 'Total', 'Wish', 'Updated'];

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function digits_(s) {
  return String(s || '').replace(/\D/g, '').slice(-9); // compare on last 9 digits (07x… vs +947x…)
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(RSVP_SHEET);
  if (!sh) {
    sh = ss.insertSheet(RSVP_SHEET);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function findRow_(sh, phone) {
  const key = digits_(phone);
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (digits_(values[i][2]) === key) return i + 1;
  }
  return -1;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'rsvp') return json_(saveRsvp_(data));
    if (data.action === 'lookup') return json_(lookup_(data));
    if (data.action === 'upload') return json_(saveUpload_(data));
    return json_({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, message: 'Wedding backend is running' });
}

/* ---------- RSVP (one row per phone number; sending again updates the same row) ---------- */
function saveRsvp_(d) {
  const sh = sheet_();
  const adults = Number(d.adults) || 0;
  const children = Number(d.children) || 0;
  const row = [
    new Date(),
    String(d.name || '').slice(0, 100),
    "'" + String(d.phone || '').slice(0, 30), // leading ' keeps +94… as text
    d.attending === 'yes' ? 'Yes' : 'No',
    adults,
    children,
    adults + children,
    String(d.message || '').slice(0, 500),
    '',
  ];
  const existing = findRow_(sh, d.phone);
  if (existing > 0) {
    row[0] = sh.getRange(existing, 1).getValue(); // keep first-reply time
    row[8] = new Date();
    sh.getRange(existing, 1, 1, row.length).setValues([row]);
  } else {
    sh.appendRow(row);
  }
  return { ok: true };
}

/* ---------- Returning guest on another device ---------- */
function lookup_(d) {
  const sh = sheet_();
  const r = findRow_(sh, d.phone);
  if (r < 0) return { ok: true, found: false };
  const v = sh.getRange(r, 1, 1, HEADERS.length).getValues()[0];
  return {
    ok: true,
    found: true,
    guest: {
      name: v[1],
      phone: String(v[2]).replace(/^'/, ''),
      attending: v[3] === 'Yes' ? 'yes' : 'no',
      adults: Number(v[4]) || 0,
      children: Number(v[5]) || 0,
      message: v[7],
    },
  };
}

/* ---------- Guest photo uploads -> Drive ---------- */
function photoFolder_() {
  const it = DriveApp.getFoldersByName(PHOTO_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER_NAME);
}

function saveUpload_(d) {
  if (!d.data) return { ok: false, error: 'No image data' };
  if (d.data.length > 9 * 1024 * 1024) return { ok: false, error: 'Image too large' };
  const who = String(d.name || 'Guest').replace(/[^\w\s-]/g, '').slice(0, 40) || 'Guest';
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  const blob = Utilities.newBlob(Utilities.base64Decode(d.data), 'image/jpeg', stamp + ' - ' + who + '.jpg');
  const file = photoFolder_().createFile(blob);
  return { ok: true, id: file.getId() };
}
