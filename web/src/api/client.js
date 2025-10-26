const BASE_URL = '/api'; // com proxy do Vite

function headers() {
  const h = { 'Content-Type': 'application/json' };
  const uid = localStorage.getItem('dd:userId');
  if (uid) h['x-user-id'] = uid;
  return h;
}

async function parseError(res) {
  const txt = await res.text();
  try {
    const j = JSON.parse(txt);
    return j.error || j.message || txt || res.statusText;
  } catch {
    return txt || res.statusText;
  }
}

function onNetworkFail(err) {
  if (err && err.name === 'TypeError') {
    return new Error('Não foi possível conectar ao servidor. Verifique se a API está em http://localhost:3333 e o proxy do Vite está ativo.');
  }
  return err instanceof Error ? err : new Error(String(err || 'Erro desconhecido'));
}

export async function apiGet(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { headers: headers() });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  } catch (e) { throw onNetworkFail(e); }
}

export async function apiPost(path, body) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  } catch (e) { throw onNetworkFail(e); }
}

export async function apiPut(path, body) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  } catch (e) { throw onNetworkFail(e); }
}

export async function apiDel(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: headers() });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  } catch (e) { throw onNetworkFail(e); }
}
