import type { Metadata } from "next";
import Link from "next/link";
import { Climate_Crisis } from "next/font/google";
import "./globals.css";
import { meta, dataHora } from "@/lib/dados";

// Só no nome do site. Sem eixo YEAR definido fica no valor por omissão (1979): letras sólidas, sem o efeito de derreter.
const marca = Climate_Crisis({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Políticos de Portugal", template: "%s · Políticos de Portugal" },
  description:
    "Quem nos representa na Assembleia da República e o que fez com o mandato. Só dados oficiais e públicos, sem ranking, nota ou recomendação de voto.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const m = meta();
  return (
    <html lang="pt-PT">
      <body>
        <a className="salto" href="#conteudo">
          Saltar para o conteúdo
        </a>
        <div className="aviso-teste">Versão de testes. Os dados são oficiais; o site ainda está em construção.</div>
        <header className="topo">
          <div className="dentro">
            <Link className={`marca ${marca.className}`} href="/">
              Políticos de Portugal
            </Link>
            <nav aria-label="Principal">
              <Link href="/">Deputados</Link>
              <Link href="/circulos">Quem me representa</Link>
              <Link href="/metodologia">Metodologia e fontes</Link>
            </nav>
          </div>
        </header>
        <main id="conteudo" className="dentro">
          {children}
        </main>
        <footer className="rodape">
          <div className="dentro">
            <p>
              Dados oficiais da Assembleia da República (dados abertos, {m.legislatura} Legislatura), recolhidos em{" "}
              {dataHora(m.recolhidoEm)}. <Link href="/metodologia">Como contamos e o que ainda não cobrimos</Link>.
            </p>
            <p>Sem ranking, nota ou recomendação de voto. Listas por ordem alfabética.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
