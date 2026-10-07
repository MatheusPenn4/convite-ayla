/**
 * Sensor de inclinação do celular.
 *
 * Android e a maioria dos navegadores liberam o sensor direto. No iPhone (iOS 13+)
 * o Safari exige que a página peça permissão DENTRO de um toque do usuário;
 * por isso esta função é chamada no toque que abre o envelope e no toque na janela.
 */
type PermissionResult = "granted" | "denied";
type OrientationWithPermission = { requestPermission?: () => Promise<PermissionResult> };

let state: "unknown" | "pending" | "granted" | "denied" = "unknown";

export function requestMotionPermission() {
  if (typeof window === "undefined" || state === "pending" || state === "granted" || state === "denied") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const DOE = window.DeviceOrientationEvent as unknown as OrientationWithPermission | undefined;
  if (!DOE || typeof DOE.requestPermission !== "function") return; // não precisa pedir

  state = "pending";
  DOE.requestPermission()
    .then((result) => {
      state = result === "granted" ? "granted" : "denied";
    })
    .catch(() => {
      // Chamado fora de um toque válido: tenta de novo no próximo toque.
      state = "unknown";
    });
}
