/**
 * Fórmulas usadas para gerar os "cálculos automáticos" (IMC, metabolismo
 * basal, gasto diário e metas de macros). São as mesmas fórmulas que geraram
 * os números em `src/data/mockFernanda.ts` — ficam aqui para quando o
 * cálculo precisar rodar de verdade (ex: ao editar o perfil), em vez de vir
 * fixo do mock.
 *
 * Importante: são estimativas de organização pessoal, não prescrição
 * médica/nutricional.
 */

export function calculateBMI(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/** Mifflin-St Jeor */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: "feminino" | "masculino" | "outro"
) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === "masculino") return base + 5;
  if (sex === "feminino") return base - 161;
  return base - 78; // média simples para "outro"
}

export function calculateTDEE(bmr: number, activityMultiplier: number) {
  return bmr * activityMultiplier;
}

export function calculateCalorieTarget(tdee: number, deficitPercent: number) {
  return tdee * (1 - deficitPercent / 100);
}

/** ~2g de proteína por kg de peso corporal, arredondado */
export function calculateProteinTarget(weightKg: number) {
  return Math.round(weightKg * 1.6);
}

/** ~0.8g de gordura por kg de peso corporal */
export function calculateFatTarget(weightKg: number) {
  return Math.round(weightKg * 0.8);
}

export function calculateCarbTarget(
  calorieTarget: number,
  proteinG: number,
  fatG: number
) {
  const remaining = calorieTarget - proteinG * 4 - fatG * 9;
  return Math.round(Math.max(remaining, 0) / 4);
}

/** ~35ml por kg de peso corporal como referência-base */
export function calculateWaterTarget(weightKg: number) {
  return Math.round(weightKg * 35);
}

export function calculateWaterTargetTrainingDay(baseMl: number) {
  return Math.round(baseMl * 1.15);
}

/** 7700 kcal ≈ 1kg de gordura, apenas como estimativa interna do mock */
export const KCAL_PER_KG = 7700;

export function estimateTheoreticalLossKg(totalDeficitKcal: number) {
  return totalDeficitKcal / KCAL_PER_KG;
}
