"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  ["/", "Início"],
  ["/deputados", "Deputados"],
  ["/circulos", "O meu círculo"],
  ["/votacoes", "Votações"],
  ["/temas", "Temas"],
  ["/retrato", "Retrato"],
  ["/ao-vivo", "Ao vivo"],
  ["/metodologia", "Como funciona"],
] as const;

export default function Menu() {
  const atual = usePathname();
  return (
    <nav aria-label="Principal">
      {ITENS.map(([href, texto]) => {
        const ativo = href === "/" ? atual === "/" : atual.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={ativo ? "page" : undefined}>
            {href === "/ao-vivo" ? <span className="ponto-vivo" aria-hidden="true" /> : null}
            {texto}
          </Link>
        );
      })}
    </nav>
  );
}
