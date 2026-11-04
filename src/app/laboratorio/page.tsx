import type { Metadata } from "next";
import { dadosLab } from "@/lab/dados";
import { LabCliente } from "@/lab/LabCliente";

export const metadata: Metadata = {
  title: "Laboratório Vivo",
  description: "Um laboratório em 3D para explorar no navegador: ande, use os equipamentos e descubra as olimpíadas de cada campo do conhecimento.",
};

export default function Laboratorio() {
  return <LabCliente {...dadosLab()} />;
}
