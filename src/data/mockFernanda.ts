/**
 * Dados mockados da Fernanda.
 *
 * Toda a interface lê os dados a partir daqui — nenhum componente deve ter
 * números "hardcoded" espalhados. Quando o Supabase entrar, cada bloco abaixo
 * vira uma query nas tabelas equivalentes (ver o mapeamento em
 * `src/types/index.ts`).
 *
 * Os números de saúde (calorias, macros, IMC, metabolismo) são estimativas
 * para organização pessoal, não prescrição médica/nutricional.
 */
import type {
  CalculatedMetrics,
  FoodSwapGroup,
  Goal,
  Meal,
  Measurement,
  Profile,
  Workout,
  WorkoutLog,
  WeeklySummary,
  WeightEntry,
} from "@/types";

// ---------------------------------------------------------------------------
// profiles
// ---------------------------------------------------------------------------
export const profile: Profile = {
  id: "fernanda-1",
  name: "Fernanda",
  age: 21,
  heightCm: 180,
  sex: "feminino",
  createdAt: "2026-08-01",
};

// ---------------------------------------------------------------------------
// user_goals
// ---------------------------------------------------------------------------
export const goal: Goal = {
  id: "goal-1",
  profileId: profile.id,
  startingWeightKg: 90,
  currentWeightKg: 88.7,
  activityMultiplier: 1.45,
  deficitPercent: 20,
  weeklyWorkoutTarget: 5,
  calorieTarget: 2040,
  proteinTargetG: 144,
  fatTargetG: 72,
  carbTargetG: 204,
  waterTargetMl: 3150,
  waterTargetTrainingDayMl: 3650,
  updatedAt: "2026-09-01",
};

// ---------------------------------------------------------------------------
// "cálculos automáticos" (ver src/lib/calculations.ts para as fórmulas)
// ---------------------------------------------------------------------------
export const calculatedMetrics: CalculatedMetrics = {
  bmi: 27.8,
  bmr: 1759,
  tdee: 2550,
  calorieTarget: goal.calorieTarget,
  proteinTargetG: goal.proteinTargetG,
  fatTargetG: goal.fatTargetG,
  carbTargetG: goal.carbTargetG,
  waterTargetMl: goal.waterTargetMl,
  waterTargetTrainingDayMl: goal.waterTargetTrainingDayMl,
};

// ---------------------------------------------------------------------------
// daily_logs — estado "hoje" usado no dashboard e na tela Hoje
// ---------------------------------------------------------------------------
export const today = {
  date: "2026-09-06",
  caloriesConsumed: 1420,
  proteinConsumedG: 96,
  waterMl: 2100,
  workoutsThisWeek: 3,
};

// ---------------------------------------------------------------------------
// timeline do dia — card "Seu dia" no dashboard
// ---------------------------------------------------------------------------
export const dayTimeline = [
  { time: "07:05", label: "Café" },
  { time: "12:30", label: "Almoço" },
  { time: "14:10", label: "Pré-treino" },
  { time: "14:30", label: "Academia" },
  { time: "16:15", label: "Pós-treino" },
  { time: "19:15", label: "Lanche" },
  { time: "23:05", label: "Ceia leve" },
];

// ---------------------------------------------------------------------------
// meals — plano alimentar sugerido do dia
// ---------------------------------------------------------------------------
export const dailyPlan: Meal[] = [
  {
    id: "meal-agua-cedo",
    time: "06:40",
    title: "Água",
    items: ["400–500 ml"],
  },
  {
    id: "meal-cafe",
    time: "07:05",
    title: "Café da manhã",
    items: ["2 ovos", "2 fatias de pão integral", "1 banana"],
    approxCalories: 390,
    approxProteinG: 24,
  },
  {
    id: "meal-lanche-manha",
    time: "10:00",
    title: "Lanche opcional",
    items: ["Iogurte natural + fruta"],
    optional: true,
  },
  {
    id: "meal-almoco",
    time: "12:30",
    title: "Almoço",
    items: [
      "120 g arroz",
      "100 g feijão",
      "150 g proteína",
      "150 g legumes/salada",
    ],
    approxCalories: 600,
    approxProteinG: 45,
  },
  {
    id: "meal-pre-treino",
    time: "14:10",
    title: "Pré-treino",
    items: ["1 banana", "20 g aveia", "café opcional"],
  },
  {
    id: "meal-pos-treino",
    time: "16:15",
    title: "Pós-treino",
    items: [
      "1 wrap",
      "120 g frango seco/desfiado",
      "salada",
      "ou atum/carne magra",
    ],
  },
  {
    id: "meal-lanche-faculdade",
    time: "19:15",
    title: "Lanche faculdade",
    items: ["Iogurte + aveia + fruta", "ou sanduíche"],
  },
  {
    id: "meal-ceia",
    time: "23:05",
    title: "Ceia leve",
    items: ["2 ovos + legumes", "ou iogurte proteico"],
  },
];

// ---------------------------------------------------------------------------
// banco de trocas — não é uma tabela própria hoje, mas seria `meals` com uma
// categoria/tag (proteina | carboidrato | outro)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// workouts — catálogo simples usado na tela Treinos
// ---------------------------------------------------------------------------
export const workoutCatalog: Workout[] = [
  { id: "w-inferiores", focus: "inferiores", title: "Inferiores" },
  { id: "w-superiores", focus: "superiores", title: "Superiores" },
  { id: "w-fullbody", focus: "full_body", title: "Full body" },
  { id: "w-cardio", focus: "cardio", title: "Cardio/caminhada" },
  { id: "w-misto", focus: "misto", title: "Misto" },
];

// ---------------------------------------------------------------------------
// workout_logs — semana atual, exibida na tela Treinos
// ---------------------------------------------------------------------------
export const weekWorkouts: WorkoutLog[] = [
  {
    id: "wl-seg",
    profileId: profile.id,
    date: "2026-09-01",
    weekday: "seg",
    status: "feito",
    focus: "inferiores",
    durationMinutes: 55,
  },
  {
    id: "wl-ter",
    profileId: profile.id,
    date: "2026-09-02",
    weekday: "ter",
    status: "feito",
    focus: "superiores",
    durationMinutes: 50,
  },
  {
    id: "wl-qua",
    profileId: profile.id,
    date: "2026-09-03",
    weekday: "qua",
    status: "faltou",
  },
  {
    id: "wl-qui",
    profileId: profile.id,
    date: "2026-09-04",
    weekday: "qui",
    status: "feito",
    focus: "inferiores",
    durationMinutes: 60,
  },
  {
    id: "wl-sex",
    profileId: profile.id,
    date: "2026-09-05",
    weekday: "sex",
    status: "pendente",
  },
  {
    id: "wl-sab",
    profileId: profile.id,
    date: "2026-09-06",
    weekday: "sab",
    status: "pendente",
  },
  {
    id: "wl-dom",
    profileId: profile.id,
    date: "2026-09-07",
    weekday: "dom",
    status: "pendente",
  },
];

export const cardioMinutesThisWeek = 40;

// ---------------------------------------------------------------------------
// weight_logs — histórico usado na tela Evolução
// ---------------------------------------------------------------------------
export const weightHistory: WeightEntry[] = [
  { id: "wt-0", profileId: profile.id, date: "2026-08-04", weightKg: 90.0, label: "Semana 1" },
  { id: "wt-1", profileId: profile.id, date: "2026-08-11", weightKg: 89.5, label: "Semana 2" },
  { id: "wt-2", profileId: profile.id, date: "2026-08-18", weightKg: 89.1, label: "Semana 3" },
  { id: "wt-3", profileId: profile.id, date: "2026-08-25", weightKg: 88.7, label: "Semana 4" },
];

// ---------------------------------------------------------------------------
// measurements — última medição registrada
// ---------------------------------------------------------------------------
export const latestMeasurement: Measurement = {
  id: "meas-1",
  profileId: profile.id,
  date: "2026-08-25",
  waistCm: 84,
  hipCm: 108,
  thighCm: 60,
  armCm: 29,
};

export const measurementHistory: Measurement[] = [
  { id: "meas-0", profileId: profile.id, date: "2026-08-04", waistCm: 87, hipCm: 107, thighCm: 59, armCm: 28.5 },
  latestMeasurement,
];

// ---------------------------------------------------------------------------
// weekly_summaries — resumo detalhado da semana
// ---------------------------------------------------------------------------
export const weeklySummary: WeeklySummary = {
  id: "ws-1",
  profileId: profile.id,
  weekStart: "2026-09-01",
  workoutsCompleted: 3,
  workoutsTarget: 5,
  daysLogged: 6,
  adherencePercent: 86,
  avgCaloriesLogged: 1980,
  estimatedDeficit: 570,
  theoreticalLossKg: 0.52,
  avgWeightKg: 88.9,
  actualWeightChangeKg: -0.4,
};
