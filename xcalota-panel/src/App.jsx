import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://3.138.190.230/api";

function slugify(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <div className="modalHeader">
          <div>
            <div className="modalTitle">{title}</div>
            <div className="modalHint">Preencha os dados e crie em 1 clique.</div>
          </div>
          <button className="iconBtn" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);

  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return restaurants;
    return restaurants.filter((r) => {
      const n = (r.nome || r.name || "").toLowerCase();
      const s = (r.slug || "").toLowerCase();
      return n.includes(query) || s.includes(query);
    });
  }, [restaurants, q]);

  function showToast(type, message) {
    setToast({ type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 3200);
  }

  async function fetchRestaurants() {
    setLoadingList(true);
    setErrorList("");
    try {
      const res = await fetch(`${API}/restaurants`);
      if (!res.ok) throw new Error(`Falha ao listar (HTTP ${res.status})`);
      const data = await res.json();

      // aceita formatos comuns: array direto ou { items: [] }
      const list = Array.isArray(data) ? data : (data.items || data.data || []);
      setRestaurants(list);
    } catch (e) {
      setErrorList(
        "Não consegui carregar a lista de restaurantes. Verifique se existe GET /api/restaurants."
      );
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    fetchRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // auto sugerir slug a partir do nome (sem forçar)
    if (!slug) setSlug(slugify(nome));
  }, [nome]); // intencionalmente não depende de slug

  async function handleCreate(e) {
    e.preventDefault();
    const payload = { nome: nome.trim(), slug: slugify(slug || nome) };
    if (!payload.nome || !payload.slug) {
      showToast("error", "Preencha nome e slug.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${API}/restaurants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Falha ao criar (HTTP ${res.status})`);

      showToast("success", "Restaurante criado com sucesso!");
      setOpenCreate(false);
      setNome("");
      setSlug("");

      await fetchRestaurants();
    } catch (e) {
      showToast("error", "Erro ao criar restaurante. Verifique os dados.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="logo">🍕</div>
          <div className="brandText">
            <div className="brandName">Xcalota</div>
            <div className="brandSub">Painel de Restaurantes</div>
          </div>
          <Badge tone="success">API: {API.replace("http://", "").replace("https://", "")}</Badge>
        </div>

        <div className="topbarActions">
          <button className="btn btn--ghost" onClick={() => fetchRestaurants()}>
            Atualizar
          </button>
          <button className="btn btn--primary" onClick={() => setOpenCreate(true)}>
            + Novo restaurante
          </button>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="heroLeft">
            <h1>Organize seus restaurantes com cara de produto.</h1>
            <p>
              Listagem clara, criação rápida e base pronta para evoluir com cardápio público,
              integrações e automações.
            </p>

            <div className="searchRow">
              <div className="searchBox">
                <span className="searchIcon">⌕</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por nome ou slug…"
                />
              </div>
              <div className="miniStats">
                <div className="stat">
                  <div className="statLabel">Total</div>
                  <div className="statValue">{restaurants.length}</div>
                </div>
                <div className="stat">
                  <div className="statLabel">Exibindo</div>
                  <div className="statValue">{filtered.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="heroRight">
            <div className="previewCard">
              <div className="previewTitle">Próxima etapa</div>
              <div className="previewText">
                Publicar uma página por restaurante:
                <span className="mono"> /r/:slug</span>
              </div>
              <div className="previewText subtle">
                Ex.: <span className="mono">/r/maria-acai</span> com botão WhatsApp e cardápio.
              </div>
              <div className="previewActions">
                <button className="btn btn--ghost" onClick={() => showToast("info", "Em breve: páginas públicas por slug.")}>
                  Ver roadmap
                </button>
                <button className="btn btn--primary" onClick={() => setOpenCreate(true)}>
                  Criar agora
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <h2>Restaurantes</h2>
              <div className="panelHint">Clique em “Gerenciar” para evoluirmos a próxima tela.</div>
            </div>
          </div>

          {loadingList ? (
            <div className="skeletonGrid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeletonCard" />
              ))}
            </div>
          ) : errorList ? (
            <div className="emptyState error">
              <div className="emptyIcon">⚠️</div>
              <div className="emptyTitle">Falha ao carregar</div>
              <div className="emptyText">{errorList}</div>
              <button className="btn btn--primary" onClick={() => fetchRestaurants()}>
                Tentar novamente
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="emptyState">
              <div className="emptyIcon">🗂️</div>
              <div className="emptyTitle">Nenhum restaurante encontrado</div>
              <div className="emptyText">
                {restaurants.length === 0
                  ? "Crie o primeiro restaurante para começar."
                  : "Tente buscar por outro termo."}
              </div>
              <button className="btn btn--primary" onClick={() => setOpenCreate(true)}>
                + Criar restaurante
              </button>
            </div>
          ) : (
            <div className="grid">
              {filtered.map((r) => {
                const name = r.nome || r.name || "Sem nome";
                const s = r.slug || "";
                const id = r.id || r._id || s;

                return (
                  <div key={id} className="card">
                    <div className="cardTop">
                      <div className="cardTitle">{name}</div>
                      <Badge>{s || "sem-slug"}</Badge>
                    </div>

                    <div className="cardBody">
                      <div className="row">
                        <div className="rowLabel">URL futura</div>
                        <div className="rowValue mono">/r/{s || "seu-slug"}</div>
                      </div>
                      <div className="row">
                        <div className="rowLabel">Status</div>
                        <div className="rowValue">
                          <Badge tone="info">Ativo</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="cardActions">
                      <button
                        className="btn btn--ghost"
                        onClick={() => showToast("info", "Em breve: editar e configurar cardápio.")}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn--primary"
                        onClick={() => showToast("info", `Próximo passo: tela de gestão do "${name}".`)}
                      >
                        Gerenciar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Modal open={openCreate} title="Novo restaurante" onClose={() => !creating && setOpenCreate(false)}>
        <form onSubmit={handleCreate} className="form">
          <label className="field">
            <span>Nome</span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Maria Açaí"
              autoFocus
            />
          </label>

          <label className="field">
            <span>Slug</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Ex.: maria-acai"
            />
            <div className="fieldHint">
              Dica: deixe vazio que eu gero automaticamente a partir do nome.
            </div>
          </label>

          <div className="formActions">
            <button type="button" className="btn btn--ghost" onClick={() => setOpenCreate(false)} disabled={creating}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={creating}>
              {creating ? "Criando..." : "Criar restaurante"}
            </button>
          </div>
        </form>
      </Modal>

      {toast && (
        <div className={`toast toast--${toast.type}`}>
          <div className="toastDot" />
          <div className="toastMsg">{toast.message}</div>
        </div>
      )}
    </div>
  );
}
