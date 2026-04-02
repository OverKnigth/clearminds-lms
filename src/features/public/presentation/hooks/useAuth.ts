import { useState } from 'react';
import { AuthHttpAdapter } from '../../infrastructure/adapters/authHttpAdapter';
import { loginUseCase } from '../../application/useCases/loginUseCase';
import { forgotPasswordUseCase } from '../../application/useCases/forgotPasswordUseCase';
import { resetPasswordUseCase } from '../../application/useCases/resetPasswordUseCase';
import type { LoginCredentials } from '../../domain/entities/auth.entity';

const adapter = new AuthHttpAdapter();

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      return await loginUseCase(adapter, credentials);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await forgotPasswordUseCase(adapter, email);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await resetPasswordUseCase(adapter, token, newPassword);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, forgotPassword, resetPassword, isLoading, error };
}
