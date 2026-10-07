export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}) {
  try {
    if (!path) return '/';

    // Intercepta qualquer redirecionamento OAuth ou deep link com parâmetros de autenticação
    // para evitar que o Expo Router tente navegar para uma rota inexistente e cause crash no app
    if (
      path.includes('oauth') ||
      path.includes('code=') ||
      path.includes('state=') ||
      path.includes('token=') ||
      path.includes('error=') ||
      path.includes('autocare') ||
      path.startsWith('com.')
    ) {
      return '/';
    }

    return path;
  } catch {
    return '/';
  }
}

