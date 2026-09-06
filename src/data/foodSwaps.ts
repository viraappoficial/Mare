/**
 * Banco de trocas de alimentos — conteúdo de referência/ajuda, não dado do
 * usuário, por isso fica como constante estática em vez de tabela no banco.
 */
import type { FoodSwapGroup } from "@/types";

export const foodSwaps: FoodSwapGroup[] = [
  {
    id: "swap-proteinas",
    label: "Proteínas",
    items: [
      { id: "p1", name: "Frango grelhado", portion: "150 g" },
      { id: "p2", name: "Patinho", portion: "150 g" },
      { id: "p3", name: "Tilápia", portion: "170 g" },
      { id: "p4", name: "Ovos", portion: "2 unidades" },
      { id: "p5", name: "Atum em água", portion: "1 lata" },
    ],
  },
  {
    id: "swap-carboidratos",
    label: "Carboidratos",
    items: [
      { id: "c1", name: "Arroz", portion: "100–130 g" },
      { id: "c2", name: "Batata", portion: "200 g" },
      { id: "c3", name: "Pão integral", portion: "2 fatias" },
      { id: "c4", name: "Aveia", portion: "40 g" },
    ],
  },
  {
    id: "swap-outros",
    label: "Outros",
    items: [
      { id: "o1", name: "Feijão", portion: "100 g" },
      { id: "o2", name: "Iogurte", portion: "1 pote" },
      { id: "o3", name: "Banana", portion: "1 unidade" },
      { id: "o4", name: "Maçã", portion: "1 unidade" },
      { id: "o5", name: "Legumes", portion: "à vontade" },
      { id: "o6", name: "Azeite", portion: "1 colher de sopa" },
    ],
  },
];
