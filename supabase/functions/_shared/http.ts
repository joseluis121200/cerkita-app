// Utilidades HTTP comunes a todas las Edge Functions.
export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export function errorResponse(message: string, status: number): Response {
  return json({ error: message }, status);
}

/** Lee el cuerpo JSON; si no es JSON válido devuelve null (Zod lo rechazará después). */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch (error) {
    console.warn('Body is not valid JSON', error instanceof Error ? error.message : String(error));
    return null;
  }
}
