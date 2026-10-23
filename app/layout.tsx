import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter, Unbounded } from "next/font/google";
import "./globals.css";
import Contador from "@/components/Contador";
import Menu from "@/components/Menu";
import { meta, dataHora } from "@/lib/dados";

// Unbounded para o nome, títulos e números grandes: larga e com carácter, mas legível em tamanhos pequenos.
const display = Unbounded({ subsets: ["latin"], display: "swap", variable: "--fonte-display", weight: ["600", "800"] });
const texto = Inter({ subsets: ["latin"], display: "swap", variable: "--fonte-texto" });

export const metadata: Metadata = {
  title: { default: "Políticos de Portugal", template: "%s · Políticos de Portugal" },
  description:
    "Quem nos representa na Assembleia da República e o que fez com o mandato. Só dados oficiais e públicos, sem ranking, nota ou recomendação de voto.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#1740c8" };

export default function Layout({ children }: { children: React.ReactNode }) {
  const m = meta();
  return (
    <html lang="pt-PT" className={`${display.variable} ${texto.variable}`}>
      <body>
        <a className="salto" href="#conteudo">
          Saltar para o conteúdo
        </a>
        <div className="aviso-teste">Versão de testes · os dados são oficiais, o site ainda está em construção</div>
        <header className="topo">
          <div className="dentro">
            <Link className="marca display" href="/">
              Políticos <span>de</span> Portugal
            </Link>
            <Menu />
          </div>
        </header>
        <main id="conteudo">{children}</main>
        <footer className="rodape">
          <div className="dentro">
            <Link className="marca display" href="/">
              Políticos <span>de</span> Portugal
            </Link>
            <p>
              Aberto e gratuito, para toda a gente. Só dados oficiais e públicos, em linguagem simples. Sem ranking,
              nota ou recomendação de voto.
            </p>
            <nav aria-label="Rodapé">
              <Link href="/deputados">Deputados</Link>
              <Link href="/circulos">O meu círculo</Link>
              <Link href="/votacoes">Votações</Link>
              <Link href="/temas">Temas</Link>
              <Link href="/retrato">Retrato do Parlamento</Link>
              <Link href="/ao-vivo">Ao vivo</Link>
              <Link href="/metodologia">Metodologia e fontes</Link>
              <Link href="/metodologia#privacidade">Privacidade</Link>
            </nav>
            <p>
              Dados da Assembleia da República ({m.legislatura} Legislatura), recolhidos em {dataHora(m.recolhidoEm)}.
            </p>
          </div>
        </footer>
        <Contador />
      </body>
    </html>
  );
}
