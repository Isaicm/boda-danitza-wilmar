/**
 * GOOGLE APPS SCRIPT — RSVP Boda Danitza & Wilmar
 * ══════════════════════════════════════════════════════
 *
 * INSTRUCCIONES DE CONFIGURACIÓN (solo una vez):
 *
 * 1. Ve a Google Drive → Nuevo → Google Sheets
 *    Nómbralo: "RSVP Boda Danitza & Wilmar"
 *
 * 2. Renombra la primera hoja como "Confirmaciones"
 *
 * 3. En la fila 1, agrega estos encabezados en las columnas A-G:
 *    Timestamp | Nombre | Asistencia | Acompañantes | Nombres Acompañantes | Mensaje
 *
 * 4. En el menú del Sheet: Extensiones → Apps Script
 *
 * 5. Borra el código existente y pega TODO el contenido de este archivo
 *
 * 6. IMPORTANTE — Reemplaza TU_SPREADSHEET_ID_AQUI con el ID real de tu hoja:
 *    El ID está en la URL de tu Sheet:
 *    https://docs.google.com/spreadsheets/d/[AQUI_ESTA_EL_ID]/edit
 *
 * 7. Guarda el script (Ctrl+S o ⌘+S)
 *
 * 8. Ejecuta la función testRSVP() manualmente para verificar que funciona:
 *    Menú superior → Ejecutar → Selecciona "testRSVP" → Ejecutar
 *    Si pide permisos, acéptalos todos.
 *    Revisa el Sheet — debe aparecer una fila de prueba.
 *
 * 9. Haz clic en "Implementar" → "Nueva implementación" (o "Gestionar implementaciones"
 *    si ya existe una, y luego editar → nueva versión)
 *    - Tipo: Aplicación web
 *    - Descripción: RSVP Boda v2
 *    - Ejecutar como: Yo (tu cuenta de Google)
 *    - Quién tiene acceso: Cualquier persona
 *    Haz clic en "Implementar" → copia la URL
 *
 * 10. En js/main.js, asegúrate de que SHEETS_URL tenga esa URL.
 *
 * ══════════════════════════════════════════════════════
 */

// ← REEMPLAZA ESTE VALOR con el ID de tu Google Sheet
var SPREADSHEET_ID = '1nZfC08hEb0rKxlWF9_4rRCfUpH7VZyhpdvqOZ8SOWkA';
var SHEET_NAME     = 'Confirmaciones';

/* ─────────────────────────────────────────────
   Guarda una fila en el Sheet.
   Acepta datos desde e.parameter (GET o POST url-encoded)
───────────────────────────────────────────── */
function guardarRSVP(p) {
  var sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName(SHEET_NAME);

  if (!sheet) throw new Error('Hoja "' + SHEET_NAME + '" no encontrada. Verifica que existe una hoja con ese nombre exacto.');

  sheet.appendRow([
    new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
    p.nombre        || '',
    p.asistencia    || '',
    p.invitados     || '0',
    p.nombresAcomp  || '',
    p.mensaje       || ''
  ]);
}

/* ─────────────────────────────────────────────
   Respuesta JSON con cabeceras CORS para que
   el frontend pueda leer si hubo éxito o error.
───────────────────────────────────────────── */
function jsonResponse(obj) {
  var output = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

/* ─────────────────────────────────────────────
   doPost — recibe el formulario RSVP
───────────────────────────────────────────── */
function doPost(e) {
  try {
    var p = (e && e.parameter) ? e.parameter : {};
    guardarRSVP(p);
    return jsonResponse({ ok: true });
  } catch (err) {
    Logger.log('Error doPost: ' + err.message);
    return jsonResponse({ ok: false, error: err.message });
  }
}

/* ─────────────────────────────────────────────
   doGet — también acepta el formulario vía GET
   (más fácil de depurar, y funciona como ping)
───────────────────────────────────────────── */
function doGet(e) {
  try {
    var p = (e && e.parameter) ? e.parameter : {};

    // Si viene con el campo "nombre" es una sumisión real del formulario
    if (p.nombre) {
      guardarRSVP(p);
      return jsonResponse({ ok: true, via: 'GET' });
    }

    // Si no, es un ping de diagnóstico
    return jsonResponse({ ok: true, status: 'RSVP script activo', sheet: SHEET_NAME, idOk: SPREADSHEET_ID !== 'TU_SPREADSHEET_ID_AQUI' });

  } catch (err) {
    Logger.log('Error doGet: ' + err.message);
    return jsonResponse({ ok: false, error: err.message });
  }
}

/* ─────────────────────────────────────────────
   testRSVP — ejecuta esto manualmente desde el
   editor para verificar que todo funciona ANTES
   de desplegar. Debe aparecer una fila en el Sheet.
───────────────────────────────────────────── */
function testRSVP() {
  guardarRSVP({
    nombre:        'TEST - Borrar',
    asistencia:    'Sí, estaré ahí',
    invitados:     '2',
    nombresAcomp:  'Ana Prueba, Pedro Prueba',
    mensaje:       'Fila de prueba — puedes borrarla'
  });
  Logger.log('✅ testRSVP OK — revisa el Sheet, debe haber una fila nueva.');
}
