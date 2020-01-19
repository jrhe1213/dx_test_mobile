const keycloakRealm = 'org5024663852';
// const keycloakRealm = 'org3814548266';

// const adminBaseLink = 'https://dev.api.publishxi.ca';
const adminBaseLink = 'http://localhost:3000';

// const baseLink = `https://${keycloakRealm}.dev.api.publishxi.ca`;
const baseLink = 'http://localhost:3000';

const h5p = 'https://dev-h5p.publishxi.ca';

// const keycloakUrl = 'demo';
const keycloakUrl = 'testorg';

const keycloakAuthUrl = 'http://localhost:8080/auth';
// const keycloakAuthUrl = 'https://dev-keycloak.publishxi.ca/auth';

export const formatImageLink = imgGUID => `${baseLink}/picture?ImageGUID=${imgGUID}&OrgUrl=${keycloakUrl}`;

export default {
  apiKey: '80ac2e02-7bfc-4e56-bcfc-0d94a6b4f6eb',
  keycloakHost: `${keycloakAuthUrl}/realms/${keycloakRealm}`,
  keycloakClient: 'nodejs-connect',
  youtubeApiKey: 'AIzaSyBzRce9jyYMSKWXe_QePl7wkXgdCwihZQw',
  appVersion: '1.0.7',
  baseLink: `${baseLink}`,
  adminBaseLink: `${adminBaseLink}`,
  keycloakUrl: `${keycloakUrl}`,

  keycloakRealm: `${keycloakRealm}`,

  viewBaseLink: `${baseLink}/uploads/${keycloakRealm}/`,
  zipFileBaseLink: `${baseLink}/uploads/${keycloakRealm}/zip/`,
  h5pBaseLink: `${h5p}?Realm=${keycloakRealm}&H5p=`,
  defaultCardImageWidth: 150,
  defaultCardImageHeight: 110,
  defaultElementImageWidth: 200,
  defaultElementImageHeight: 200,

  defaultNumberOfSections: 10,
};
