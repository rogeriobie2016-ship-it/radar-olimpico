const CAMINHOS: Record<string, string> = {
  inicio: "M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10M10 19.5v-5h4v5",
  radar: "M12 12l5.5-5.5M12 21a9 9 0 1 1 9-9M12 16.5a4.5 4.5 0 1 1 4.5-4.5",
  calendario: "M4 8.5h16M7.5 3v3.5M16.5 3v3.5M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  descubra: "M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3ZM18.5 16.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z",
  lista: "M7 3.5h10a1 1 0 0 1 1 1v16l-6-4-6 4v-16a1 1 0 0 1 1-1Z",
  menu: "M4 7h16M4 12h16M4 17h16",
  fechar: "M6 6l12 12M18 6L6 18",
  escada: "M4 20h4v-4h4v-4h4V8h4M4 20V16",
  ciencia: "M9.5 3h5M10.5 3v6.5L5 18.5A1.7 1.7 0 0 0 6.5 21h11a1.7 1.7 0 0 0 1.5-2.5L13.5 9.5V3M8 15h8",
  joc: "M4 7.5h16v10H4zM4 11h16M8 15h3",
  professor: "M3 9.5 12 5l9 4.5L12 14 3 9.5ZM7 11.5V16c1.4 1.3 3 2 5 2s3.6-.7 5-2v-4.5M21 9.5V15",
  busca: "M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14ZM20 20l-4-4",
  sol: "M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3 7 7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7",
  lua: "M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z",
  seta: "M5 12h14M13 6l6 6-6 6",
  externo: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  whatsapp: "M4 20l1.3-4.2A8 8 0 1 1 8.4 18.8L4 20ZM9 8.5c-.5 0-1 .6-1 1.5 0 2.5 3.5 6 6 6 .9 0 1.5-.5 1.5-1l-.2-1-2-.8-.8 1c-1-.4-2.3-1.7-2.7-2.7l1-.8-.8-2-1-.2Z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  download: "M12 4v11M7.5 11 12 15.5 16.5 11M5 20h14",
  filtro: "M4 6h16M7 12h10M10 18h4",
  alerta: "M12 4 2.5 20h19L12 4ZM12 10v4.5M12 17.5v.5",
  trofeu: "M8 4h8v6a4 4 0 0 1-8 0V4ZM8 6H4.5c0 3 1.5 5 3.8 5.3M16 6h3.5c0 3-1.5 5-3.8 5.3M12 14v3.5M8.5 20.5h7L15 17.5H9l-.5 3Z",
};

export function Icone({ nome, tamanho = 22, className }: { nome: string; tamanho?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={CAMINHOS[nome]} />
    </svg>
  );
}
