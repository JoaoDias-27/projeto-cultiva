// Integracao remota do Cultiva+ com o Supabase.
// A chave publishable/anon pode ficar no frontend. NUNCA coloque service_role/secret key aqui.

const SUPABASE_URL = "https://tbypodcokquwisvxvmfw.supabase.co";
const SUPABASE_KEY = "sb_publishable_NizCXYZ57rKBAyOKRGNL7A_w5C37Hfh";
const REMOTE_ROW_ID = "cultiva-main";
const DATABASE_KEY = "cultiva_platform_db_v2";
const REST_URL = `${SUPABASE_URL}/rest/v1/app_state`;

let hydrating = false;
let saveTimer = null;

async function supabaseRequest(path = "", options = {}) {
  const response = await fetch(`${REST_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase ${response.status}: ${message}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function loadRemoteDatabase() {
  try {
    const rows = await supabaseRequest(`?id=eq.${encodeURIComponent(REMOTE_ROW_ID)}&select=data&limit=1`);
    return rows?.[0]?.data ?? null;
  } catch (error) {
    console.warn("Cultiva+: nao foi possivel carregar os dados remotos.", error);
    return null;
  }
}

async function saveRemoteDatabase(rawDatabase) {
  if (hydrating || !rawDatabase) return;

  try {
    const data = JSON.parse(rawDatabase);
    await supabaseRequest(`?on_conflict=id`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        id: REMOTE_ROW_ID,
        data,
        updated_at: new Date().toISOString()
      })
    });
    window.dispatchEvent(new CustomEvent("cultiva:synced"));
  } catch (error) {
    console.warn("Cultiva+: falha ao salvar no Supabase.", error);
  }
}

function scheduleRemoteSave(rawDatabase) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveRemoteDatabase(rawDatabase), 250);
}

// O projeto atual usa localStorage como camada de estado. Mantemos essa API
// para nao quebrar a interface existente e transformamos a gravacao em sync remoto.
const originalSetItem = Storage.prototype.setItem;
const originalRemoveItem = Storage.prototype.removeItem;

Storage.prototype.setItem = function (key, value) {
  originalSetItem.call(this, key, value);
  if (this === window.localStorage && key === DATABASE_KEY) {
    scheduleRemoteSave(value);
  }
};

Storage.prototype.removeItem = function (key) {
  originalRemoveItem.call(this, key);
  if (this === window.localStorage && key === DATABASE_KEY) {
    scheduleRemoteSave(null);
  }
};

// O top-level await garante que, quando app.js iniciar, a copia remota ja
// esteja no localStorage e possa ser usada pelo codigo atual.
hydrating = true;
const remoteDatabase = await loadRemoteDatabase();
if (remoteDatabase) {
  originalSetItem.call(window.localStorage, DATABASE_KEY, JSON.stringify(remoteDatabase));
}
hydrating = false;

window.CultivaSupabase = {
  url: SUPABASE_URL,
  async reload() {
    const data = await loadRemoteDatabase();
    if (data) {
      hydrating = true;
      originalSetItem.call(window.localStorage, DATABASE_KEY, JSON.stringify(data));
      hydrating = false;
      window.location.reload();
    }
  }
};
