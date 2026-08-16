// Lokale Entwicklung: leer lassen, damit die relativen /auth/**-Requests
// über proxy.conf.json an http://localhost:3000 (be-shell) weitergeleitet werden.
export const environment = {
  production: false,
  apiUrl: '',
};
