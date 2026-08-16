// Produktions-Build: fe-shell und be-shell laufen auf getrennten Railway-Domains,
// daher braucht der Browser die vollständige, öffentliche URL des Backends.
export const environment = {
  production: true,
  apiUrl: 'https://be-shell-production.up.railway.app',
};
