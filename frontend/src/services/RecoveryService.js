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

  /**
   * Forces a password change for the currently authenticated user
   * @param {string} password - The new password
   * @returns {Promise<Object>} - The updated user profile
   */
  async forcePasswordChange(password) {
    const response = await api.post('/auth/force-password-change', { password });
    return response.data;
  }
}

export default new RecoveryService();
