import Link from "next/link";
import type { ComponentProps } from "react";

/** Link sem pré-carregamento automático: em 3G, cada cartão visível gastaria dados à toa. */
export default function L(props: ComponentProps<typeof Link>) {
  return <Link prefetch={false} {...props} />;
}
