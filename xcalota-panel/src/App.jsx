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

function Modal({ open, title, subtitle, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <div className="modalHeader">
          <div>
            <div className="modalTitle">{title}</div>
            {subtitle && <div className="modalSub">{subtitle}</div>}
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

function Step({ n, title, desc, active, done }) {
  return (
    <div className={`step ${active ? "step--active" : ""} ${done ? "step--done" : ""}`}>
      <div className="stepNum">{done ? "✓" : n}</div>
      <div>
        <div className="stepTitle">{title}</div>
        <div className="stepDesc">{desc}</div>
      </div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast toast--${toast.type}`}>
      <div className="toastDot" />
      <div className="toastMsg">{toast.message}</div>
    </div>
  );
}

/**
 * "Login" simples (mock) só pra ficar familiar e guiado.
 * Depois você troca por auth real no backend.
 */
function loadAccount() {
  try {
    return JSON.parse(localStorage.getItem("xcalota_account") || "null");
  } catch {
    return null;
  }
}
function saveAccount(acc) {
  localStorage.setItem("xcalota_account", JSON.stringify(acc));
}

export default function App() {
  // onboarding
  const [account, setAccount] = useState(loadAccount());

  // dados
  const [restaurants, setRestaurants] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // ui
  const [q, setQ] = useState("");
  const [toast, setToast] = useState(null);
  const [openAccount, setOpenAccount] = useState(false);
  const [openRestaurant, setOpenRestaurant] = useState(false);

  // account form
  const [accName, setAccName] = useState(account?.name || "");
  const [accEmail, setAccEmail] = useState(account?.email || "");
  const [accPass, setAccPass] = useState("");

  // restaurant form
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);

  // load list (best effort)
  async function fetchRestaurants() {
    setLoadingList(true);
    try {
      const res = await fetch(`${API}/restaurants`);
      if (!res.ok) throw new Error("no-get");
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.items || data.data || []);
      setRestaurants(list);
    } catch {
      // se não tiver GET ainda, só mostra vazio (sem tecnês)
      setRestaurants([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    fetchRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!slug) setSlug(slugify(nome));
  }, [nome]); // não depende de slug

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

  // steps
  const step1Done = !!account;
  const step2Done = restaurants.length > 0; // quando houver GET, isso fica real
  const step1Active = !step1Done;
  const step2Active = step1Done && !step2Done;
  const step3Active = step1Done && (step2Done || restaurants.length >= 0);

  async function handleCreateAccount(e) {
    e.preventDefault();
    if (!accName.trim() || !accEmail.trim() || accPass.length < 4) {
      showToast("error", "Preencha nome, e-mail e uma senha (mín. 4 caracteres).");
      return;
    }
    const newAcc = { name: accName.trim(), email: accEmail.trim() };
    saveAccount(newAcc);
    setAccount(newAcc);
    setOpenAccount(false);
    showToast("success", "Conta criada! Agora vamos cadastrar seu restaurante.");
    setOpenRestaurant(true);
  }

  async function handleCreateRestaurant(e) {
    e.preventDefault();
    const payload = { nome: nome.trim(), slug: slugify(slug || nome) };
    if (!payload.nome || !payload.slug) {
      showToast("error", "Preencha o nome do restaurante.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${API}/restaurants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("create-fail");

      showToast("success", "Restaurante cadastrado com sucesso!");
      setOpenRestaurant(false);
      setNome("");
      setSlug("");

      // tenta atualizar a lista (se existir GET)
      await fetchRestaurants();

      // fallback: se ainda não existe GET, mantém uma lista local amigável
      // (só pra UX não parecer quebrada)
      setRestaurants((prev) => {
        if (prev.length === 0) return [{ ...payload, id: payload.slug }];
        return prev;
      });
    } catch {
      showToast("error", "Não consegui cadastrar agora. Tente novamente em instantes.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="logo">🍕</div>
          <div>
            <div className="brandName">Xcalota</div>
            <div className="brandSub">Cadastro rápido do seu restaurante</div>
          </div>
        </div>

        <div className="topActions">
          {account ? (
            <div className="userChip" title={account.email}>
              <span className="userDot" />
              <span className="userName">{account.name}</span>
            </div>
          ) : (
            <button className="btn btn--primary" onClick={() => setOpenAccount(true)}>
              Criar minha conta
            </button>
          )}

          <button
            className="btn btn--ghost"
            onClick={() => setOpenRestaurant(true)}
            disabled={!account}
            title={!account ? "Crie sua conta primeiro" : "Cadastrar restaurante"}
          >
            + Cadastrar restaurante
          </button>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="heroLeft">
            <div className="kicker">Bem-vindo 👋</div>
            <h1>Vamos colocar seu restaurante no ar em poucos passos.</h1>
            <p>
              Sem complicação. Você cria sua conta, cadastra o restaurante e depois adiciona cardápio e WhatsApp.
            </p>

            <div className="steps">
              <Step
                n="1"
                title="Crie sua conta"
                desc="Nome, e-mail e senha. Só para organizar seus dados."
                active={step1Active}
                done={step1Done}
              />
              <Step
                n="2"
                title="Cadastre seu restaurante"
                desc="Nome do restaurante e pronto. O sistema gera o link automático."
                active={step2Active}
                done={step2Done}
              />
              <Step
                n="3"
                title="Próximo: cardápio e WhatsApp"
                desc="Você adiciona itens, fotos e um botão de pedido no WhatsApp."
                active={step3Active}
                done={false}
              />
            </div>

            <div className="ctaRow">
              {!account ? (
                <button className="btn btn--primary btn--lg" onClick={() => setOpenAccount(true)}>
                  Começar agora
                </button>
              ) : (
                <button className="btn btn--primary btn--lg" onClick={() => setOpenRestaurant(true)}>
                  Cadastrar meu restaurante
                </button>
              )}

              <button
                className="btn btn--ghost btn--lg"
                onClick={() => showToast("info", "Em breve: tutorial com imagens e vídeos curtos.")}
              >
                Ver como funciona
              </button>
            </div>
          </div>

          <div className="heroRight">
            <div className="preview">
              <div className="previewTitle">Exemplo de resultado</div>
              <div className="previewCard">
                <div className="previewBadge">Página do restaurante</div>
                <div className="previewH">/r/seu-restaurante</div>
                <div className="previewP">Cardápio • Fotos • Botão WhatsApp</div>
                <div className="previewMini">
                  “Fica bonito no celular e passa confiança para o cliente.”
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panelTop">
            <div>
              <h2>Seus restaurantes</h2>
              <div className="hint">
                {account
                  ? "Aqui você vê e gerencia tudo. Comece cadastrando seu restaurante."
                  : "Crie sua conta para começar a cadastrar seus restaurantes."}
              </div>
            </div>

            <div className="searchBox">
              <span className="searchIcon">🔎</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nome…"
                disabled={restaurants.length === 0}
              />
            </div>
          </div>

          {loadingList ? (
            <div className="skeletonGrid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeletonCard" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="emptyIcon">🏪</div>
              <div className="emptyTitle">
                {account ? "Nenhum restaurante cadastrado ainda" : "Crie sua conta para começar"}
              </div>
              <div className="emptyText">
                {account
                  ? "Clique no botão abaixo e cadastre o seu primeiro restaurante. Leva menos de 1 minuto."
                  : "É rápido e você já começa com tudo organizado."}
              </div>

              <div className="emptyActions">
                {!account ? (
                  <button className="btn btn--primary btn--lg" onClick={() => setOpenAccount(true)}>
                    Criar minha conta
                  </button>
                ) : (
                  <button className="btn btn--primary btn--lg" onClick={() => setOpenRestaurant(true)}>
                    Cadastrar meu restaurante
                  </button>
                )}
                <button
                  className="btn btn--ghost btn--lg"
                  onClick={() => showToast("info", "Em breve: suporte via WhatsApp e onboarding guiado.")}
                >
                  Falar com suporte
                </button>
              </div>
            </div>
          ) : (
            <div className="grid">
              {filtered.map((r) => {
                const name = r.nome || r.name || "Sem nome";
                const s = r.slug || "";
                const id = r.id || r._id || s || name;

                return (
                  <div key={id} className="card">
                    <div className="cardTitle">{name}</div>
                    <div className="cardSub">
                      Link: <span className="mono">/r/{s || "seu-restaurante"}</span>
                    </div>

                    <div className="cardActions">
                      <button
                        className="btn btn--ghost"
                        onClick={() => showToast("info", "Em breve: editar dados do restaurante.")}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn--primary"
                        onClick={() => showToast("info", "Próximo passo: tela de cardápio e WhatsApp.")}
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

      {/* Modal conta */}
      <Modal
        open={openAccount}
        title="Criar minha conta"
        subtitle="Só para organizar seus restaurantes. É rápido."
        onClose={() => setOpenAccount(false)}
      >
        <form className="form" onSubmit={handleCreateAccount}>
          <label className="field">
            <span>Seu nome</span>
            <input value={accName} onChange={(e) => setAccName(e.target.value)} placeholder="Ex.: Maria" autoFocus />
          </label>
          <label className="field">
            <span>E-mail</span>
            <input value={accEmail} onChange={(e) => setAccEmail(e.target.value)} placeholder="Ex.: maria@email.com" />
          </label>
          <label className="field">
            <span>Senha</span>
            <input value={accPass} onChange={(e) => setAccPass(e.target.value)} placeholder="Crie uma senha" type="password" />
            <div className="fieldHint">Depois você pode trocar e recuperar pelo e-mail (quando ativarmos o login real).</div>
          </label>

          <div className="formActions">
            <button className="btn btn--ghost" type="button" onClick={() => setOpenAccount(false)}>
              Cancelar
            </button>
            <button className="btn btn--primary" type="submit">
              Criar conta
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal restaurante */}
      <Modal
        open={openRestaurant}
        title="Cadastrar restaurante"
        subtitle="Preencha o nome e pronto. O link é gerado automaticamente."
        onClose={() => !creating && setOpenRestaurant(false)}
      >
        <form className="form" onSubmit={handleCreateRestaurant}>
          <label className="field">
            <span>Nome do restaurante</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Maria Açaí" autoFocus />
          </label>

          <label className="field">
            <span>Link (apelido)</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Ex.: maria-acai" />
            <div className="fieldHint">Pode deixar como está. Você pode mudar depois.</div>
          </label>

          <div className="formActions">
            <button className="btn btn--ghost" type="button" onClick={() => setOpenRestaurant(false)} disabled={creating}>
              Cancelar
            </button>
            <button className="btn btn--primary" type="submit" disabled={creating}>
              {creating ? "Salvando..." : "Cadastrar restaurante"}
            </button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} />
    </div>
  );
}
