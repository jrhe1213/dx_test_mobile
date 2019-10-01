import axios from 'axios';

// Library
import { refresh } from 'react-native-app-auth';

// config
import config from '../config';

import { getCurrentDateTime, dateTimeByParams } from '.';

const keycloakConfig = {
  issuer: config.keycloakHost,
  clientId: config.keycloakClient,
  redirectUrl: 'redirect:/callback',
  scopes: ['openid', 'profile'],
  dangerouslyAllowInsecureHttpRequests: true,
};

const api = (url, params, isApiKey, auth, isTokenRefreshed) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (auth) {
    headers.Authorization = `Bearer ${auth.token}`;
  }
  if (isApiKey) {
    headers['api-key'] = config.apiKey;
  }

  return axios({
    url,
    method: 'post',
    headers,
    data: params,
    timeout: 5000,
  })
    .then((response) => {
      if (response.status !== 200) {
        throw new Error(response.status);
      }
      return {
        Data: response.data,
        keycloak: auth,
        isTokenRefreshed,
      };
    })
    .catch((error) => {
      if (error.response && error.response.data) {
        return {
          Data: {
            Confirmation: 'FAIL',
            StatusCode: error.response.status || 403,
            Message: error.response.data.Message || error.message,
          },
        };
      }
      return {
        Data: {
          Confirmation: 'FAIL',
          Message: error.message || 'Network Error Exception',
        },
      };
    });
};

export const dxApi = async (url, params, isApiKey, keycloak) => {
  try {
    let validAuth;
    let isTokenRefreshed;

    if (keycloak) {
      // Check the expiry - change back
      if (keycloak.expiryDate && getCurrentDateTime(keycloak.expiryDate) < getCurrentDateTime()) {
        // #1. keycloak login mode
        if (!keycloak.isSkipLoginSuccess) {
          // Refresh token
          const response = await refresh(keycloakConfig, {
            refreshToken: keycloak.refreshToken,
          });
          const formattedResponse = {
            expiryDate: response.accessTokenExpirationDate,
            token: response.accessToken,
            refreshToken: response.refreshToken,
          };
          validAuth = formattedResponse;
          isTokenRefreshed = true;
        } else {
          // #2. skip login model
          const params = {
            OrgUrl: config.keycloakUrl,
            AnonymousUserGUID: keycloak.deviceId,
          };
          const response = await dxAdminApi('/user/anonymous_login', params, true);
          const {
            Confirmation,
            Response,
          } = response.Data;
          if (Confirmation === 'SUCCESS') {
            const keycloak = Response.Keycloak;
            const formattedResponse = {
              token: keycloak.access_token,
              refreshToken: keycloak.refresh_token,
              expiryDate: dateTimeByParams(keycloak.expires_in),
            };
            validAuth = formattedResponse;
            isTokenRefreshed = true;
          }
        }
      } else {
        validAuth = keycloak;
      }
    }
    const formattedUrl = config.baseLink + url;
    return api(formattedUrl, params, isApiKey, validAuth, isTokenRefreshed);
  } catch (error) {
    throw new Error('Login required');
  }
};

export const dxAdminApi = async (url, params, isApiKey, keycloak) => {
  try {
    let validAuth;
    let isTokenRefreshed;
    if (keycloak) {
      // Check the expiry - change back
      if (getCurrentDateTime(keycloak.expiryDate) < getCurrentDateTime()) {
        // Refresh token
        const response = await refresh(keycloakConfig, {
          refreshToken: keycloak.refreshToken,
        });
        const formattedResponse = {
          expiryDate: response.accessTokenExpirationDate,
          token: response.accessToken,
          refreshToken: response.refreshToken,
        };
        validAuth = formattedResponse;
        isTokenRefreshed = true;
      } else {
        validAuth = keycloak;
      }
    }
    const formattedUrl = config.adminBaseLink + url;
    return api(formattedUrl, params, isApiKey, validAuth, isTokenRefreshed);
  } catch (error) {
    throw new Error('Login required');
  }
};
