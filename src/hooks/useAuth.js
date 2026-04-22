import { useState, useCallback } from 'react';

/**
 * Hook de autenticación global.
 *
 * Expone el estado del usuario y tres acciones:
 * - login(credentials)   → autentica con el backend y persiste la sesión
 * - register(userData)   → crea cuenta nueva y autentica en un solo paso
 * - logout()             → elimina sesión y limpia estado
 *
 * El token JWT se almacena en localStorage bajo la clave "carpool_token".
 * El objeto user se almacena en "carpool_user" para persistir entre recargas.
 *
 * Mientras el backend no esté implementado, login() y register() simulan
 * una respuesta exitosa con un usuario de demostración.
 *
 * @returns {{
 *   user: object|null,
 *   isAuthenticated: boolean,
 *   login: function,
 *   register: function,
 *   logout: function
 * }}
 */
function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('carpool_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = user !== null;

  /**
   * Persiste usuario y token en localStorage y actualiza el estado.
   * @param {object} userData  — Objeto de usuario devuelto por la API
   * @param {string} token     — JWT devuelto por la API
   */
  const persistSession = useCallback((userData, token) => {
    localStorage.setItem('carpool_token', token);
    localStorage.setItem('carpool_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  /**
   * Inicia sesión con correo y contraseña.
   * @param {{ Correo: string, Contrasena: string }} credentials
   * @throws {{ messages: string[] }} si la autenticación falla
   */
  const login = useCallback(async ({ Correo, Contrasena }) => {
    // TODO: reemplazar con fetch('/api/auth/login', { method: 'POST', ... })
    // Simulación de sesión para desarrollo sin backend
    if (!Correo || !Contrasena) {
      throw { messages: ['Completa todos los campos.'] };
    }
    const mockUser = { id: 1, NombreCompleto: 'Usuario Demo', Correo };
    persistSession(mockUser, 'mock-jwt-token');
  }, [persistSession]);

  /**
   * Registra un nuevo usuario y abre sesión automáticamente.
   * @param {{ NombreCompleto: string, Correo: string, Telefono?: string,
   *           Contrasena: string, Contrasena_confirmation: string }} userData
   * @throws {{ messages: string[] }} si el registro falla
   */
  const register = useCallback(async (userData) => {
    // TODO: reemplazar con fetch('/api/auth/register', { method: 'POST', ... })
    const mockUser = { id: 2, NombreCompleto: userData.NombreCompleto, Correo: userData.Correo };
    persistSession(mockUser, 'mock-jwt-token');
  }, [persistSession]);

  /**
   * Elimina la sesión activa del almacenamiento local y del estado.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('carpool_token');
    localStorage.removeItem('carpool_user');
    setUser(null);
  }, []);

  return { user, isAuthenticated, login, register, logout };
}

export { useAuth };
