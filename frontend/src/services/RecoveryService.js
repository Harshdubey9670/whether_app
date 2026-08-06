import api from './api';

/**
 * Temporary Development Login Recovery Service
 * Provides bypass mechanisms for authentication during development.
 * MUST NOT be used in production.
 */
class RecoveryService {
  /**
   * Initiates a login recovery bypass
   * @param {string} email - The email to recover
   * @returns {Promise<Object>} - The recovered user profile with token cookie
   */
  async devLoginRecovery(email) {
    const response = await api.post('/auth/dev-login-recovery', { email });
    return response.data;
  }

  async forcePasswordChange(password) {
    const response = await api.post('/auth/force-password-change', { password });
    return response.data;
  }

  // WebAuthn Passkeys
  async registerPasskey() {
    const { startRegistration } = await import('@simplewebauthn/browser');
    const { data: options } = await api.get('/auth/webauthn/register');
    const attResp = await startRegistration({ optionsJSON: options });
    const { data: verification } = await api.post('/auth/webauthn/register', attResp);
    return verification;
  }

  async authenticatePasskey(email) {
    const { startAuthentication } = await import('@simplewebauthn/browser');
    const { data: options } = await api.post('/auth/webauthn/authenticate-options', { email });
    const asseResp = await startAuthentication({ optionsJSON: options });
    const { data: verification } = await api.post('/auth/webauthn/authenticate', { email, response: asseResp });
    return verification;
  }

  // Recovery Codes
  async generateRecoveryCodes() {
    const response = await api.post('/auth/recovery-codes');
    return response.data;
  }

  async verifyRecoveryCode(email, code) {
    const response = await api.post('/auth/verify-recovery-code', { email, code });
    return response.data;
  }
}

export default new RecoveryService();
