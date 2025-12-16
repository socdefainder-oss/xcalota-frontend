import { useState } from "react";
import "./App.css";

/* =====================================================
   FORMULÁRIO DE CRIAÇÃO DE RESTAURANTE
   ===================================================== */
function CreateRestaurantForm() {
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("http://3.138.190.230/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, slug }),
      });

      if (!res.ok) {
        throw new Error("Erro ao criar restaurante");
      }

      setMsg("✅ Restaurante criado com sucesso!");
      setNome("");
      setSlug("");
    } catch (err) {
      setMsg("❌ Erro ao criar restaurante. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 420,
        margin: "30px auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <input
        placeholder="Nome do restaurante"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />

      <input
        placeholder="Slug (ex: pizzaria-do-joao)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Criando..." : "Criar restaurante"}
      </button>

      {msg && <p style={{ textAlign: "center" }}>{msg}</p>}
    </form>
  );
}

/* =====================================================
   APP
   ===================================================== */
function App() {
  const scrollToForm = () => {
    const el = document.getElementById("form-criar-restaurante");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}>

      {/* ================= HERO ================= */}
      <section style={{ padding: "80px 20px", textAlign: "center" }}>
        <h1>Xcalota — Sistema simples e inteligente para restaurantes e delivery</h1>

        <p style={{ maxWidth: 800, margin: "20px auto" }}>
          Centralize pedidos, cardápio e operação em um único painel.
          Menos confusão no atendimento. Mais controle no dia a dia.
          Mais vendas no final do mês.
        </p>

        <p style={{ maxWidth: 700, margin: "0 auto 30px" }}>
          O Xcalota foi criado para quem precisa trabalhar rápido,
          sem sistemas complicados e sem depender de TI.
        </p>

        <button onClick={scrollToForm} style={{ marginRight: 10 }}>
          Criar meu restaurante grátis
        </button>

        <button>Ver demonstração</button>
      </section>

      {/* ================= POSICIONAMENTO ================= */}
      <section style={{ padding: "40px 20px", textAlign: "center", background: "#fafafa" }}>
        <p style={{ maxWidth: 800, margin: "0 auto 10px" }}>
          Plataforma em crescimento, desenvolvida para restaurantes que querem
          organizar a operação e evoluir com segurança.
        </p>

        <p style={{ maxWidth: 800, margin: "0 auto" }}>
          O Xcalota faz parte de um ecossistema tecnológico pensado para
          simplificar a gestão, reduzir erros operacionais e preparar
          seu negócio para crescer no digital.
        </p>
      </section>

      {/* ================= SEGMENTOS ================= */}
      <section style={{ padding: "60px 20px" }}>
        <h2 style={{ textAlign: "center" }}>O Xcalota é para você que...</h2>

        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 30,
          }}
        >
          <div style={{ maxWidth: 300 }}>
            <h3>🍽️ Restaurantes</h3>
            <p>
              Atendimento em balcão, retirada ou consumo no local.
              Organize pedidos e mantenha o fluxo funcionando.
            </p>
          </div>

          <div style={{ maxWidth: 300 }}>
            <h3>🛵 Delivery</h3>
            <p>
              Centralize pedidos, reduza erros e ganhe velocidade
              no atendimento do seu delivery.
            </p>
          </div>

          <div style={{ maxWidth: 300 }}>
            <h3>🏪 Operações Digitais</h3>
            <p>
              Para quem tem mais de uma operação ou pensa em escalar.
              Base organizada e pronta para crescer.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FUNCIONALIDADES ================= */}
      <section style={{ padding: "60px 20px", background: "#fafafa" }}>
        <h2 style={{ textAlign: "center" }}>Soluções para o seu dia a dia</h2>

        <div style={{ maxWidth: 900, margin: "30px auto" }}>
          <h3>📊 Para a gestão</h3>
          <p>
            Tenha clareza sobre o que está acontecendo na sua operação,
            sem depender de planilhas ou controles improvisados.
          </p>

          <h3>⚙️ Para a operação</h3>
          <p>
            Menos etapas, menos erro e mais agilidade no atendimento.
            Tudo pensado para o ritmo real de um restaurante.
          </p>

          <h3>📱 Para o dia a dia</h3>
          <p>
            Interface leve, prática e direta, funcionando no navegador,
            sem complicação.
          </p>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2>Pronto para organizar sua operação?</h2>
        <button onClick={scrollToForm}>
          Criar meu restaurante agora
        </button>
      </section>

      {/* ================= FORMULÁRIO ================= */}
      <section
        id="form-criar-restaurante"
        style={{ padding: "80px 20px", background: "#f5f5f5" }}
      >
        <h2 style={{ textAlign: "center" }}>
          🍕 Criar meu restaurante no Xcalota
        </h2>

        <CreateRestaurantForm />
      </section>

      {/* ================= FOOTER ================= */}
      <footer style={{ padding: "40px 20px", background: "#222", color: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <strong>Xcalota</strong>
          <ul>
            <li>Sobre</li>
            <li>Como funciona</li>
            <li>Planos e preços (em breve)</li>
            <li>Seja parceiro</li>
          </ul>

          <strong>Sistemas</strong>
          <ul>
            <li>Sistema para Restaurantes</li>
            <li>Sistema para Delivery</li>
            <li>Sistema para Loja de Açaí</li>
          </ul>
        </div>
      </footer>

    </div>
  );
}

export default App;
