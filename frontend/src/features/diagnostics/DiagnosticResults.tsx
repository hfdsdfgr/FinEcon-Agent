import { Reserved } from "../../components/Results";
export const diagnostics = [
  ["Durbin-Watson", "残差一阶自相关"],
  ["Ljung-Box", "残差序列相关"],
  ["Jarque-Bera", "残差正态性"],
  ["Breusch-Pagan", "异方差检验"],
  ["White Test", "一般异方差检验"],
  ["VIF", "多重共线性"],
  ["Model Comparison", "AIC / BIC / Adjusted R² / Log likelihood"],
];
export function DiagnosticResults() {
  return (
    <div>
      {diagnostics.map(([name, description]) => (
        <Reserved key={name} name={name} description={description} />
      ))}
    </div>
  );
}
