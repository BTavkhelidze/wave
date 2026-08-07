import { calculateProbability, roundNumber } from './constants';

export const calculateVentilation = (
  kitchen: number,
  toilet: number,
  shaxta: number,
  kitchenEType: string,
  damper: string,
  shaftVentT: string
): { result: number | null } => {
  const probAlpaWC = calculateProbability(toilet);
  const probAplaKitchen = calculateProbability(kitchen);

  const dct1 = kitchen % 2 === 0 ? kitchen / 2 : kitchen / 2 + 0.5;
  const dct2 = kitchen % 2 === 0 ? kitchen / 2 : kitchen / 2 - 0.5;

  const dct1WC = toilet % 2 === 0 ? toilet / 2 : toilet / 2 + 0.5;
  const dct2WC = toilet % 2 === 0 ? toilet / 2 : toilet / 2 - 0.5;

  const probAplaKitchendct1 = calculateProbability(dct1);
  const probAplaKitchendct2 = calculateProbability(dct2);

  const probAplaKitchendct1WC = calculateProbability(dct1WC);
  const probAplaKitchendct2WC = calculateProbability(dct2WC);

  const QKittchen = kitchenEType.includes('kedeli')
    ? 180 * kitchen * probAplaKitchen
    : 360 * kitchen * probAplaKitchen;

  const QKittchen1Dct = kitchenEType.includes('kedeli')
    ? 180 * dct1 * probAplaKitchendct1
    : 360 * dct1 * probAplaKitchendct1;

  const QKittchen2Dct = kitchenEType.includes('kedeli')
    ? 180 * dct2 * probAplaKitchendct2
    : 360 * dct2 * probAplaKitchendct2;

  const QWC = 80 * toilet * probAlpaWC;
  const QWC1Dct = 80 * dct1WC * probAplaKitchendct1WC;
  const QWC2Dct = 80 * dct2WC * probAplaKitchendct2WC;

  const airVelocity = shaftVentT.startsWith('natural') ? 2 : 6;

  const haersatarisSIganeKitchenDct1 = roundNumber(
    (1000 * QKittchen1Dct) / (airVelocity * 3.6 * (shaxta - 100))
  );
  const haersatarisSIganeKitchenDct2 = roundNumber(
    (1000 * QKittchen2Dct) / (airVelocity * 3.6 * (shaxta - 100))
  );

  const haersatarisSIganeKitchen = roundNumber(
    (1000 * QKittchen) / (airVelocity * 3.6 * (shaxta - 100))
  );

  const haersatarisSIganeWC = roundNumber(
    (1000 * QWC) / (airVelocity * 3.6 * (shaxta - 100))
  );

  const haersatarisSIganeWC1Dct = roundNumber(
    (1000 * QWC1Dct) / (airVelocity * 3.6 * (shaxta - 100))
  );

  const haersatarisSIganeWC2Dct = roundNumber(
    (1000 * QWC2Dct) / (airVelocity * 3.6 * (shaxta - 100))
  );

  const extraArea = damper.startsWith('yes') ? 400 : 400 + 350;

  function check(haersatari: number): boolean {
    if (Math.max(haersatari) / (shaxta - 100) > 4) {
      return true;
    }

    return false;
  }

  // ! შედეგი არცერთი არ გაიყო
  const resultWcKitWithoutSplit =
    haersatarisSIganeKitchen + haersatarisSIganeWC + extraArea;

  //! ორივე გაიყო
  if (
    haersatarisSIganeWC > (shaxta - 100) * 4 &&
    haersatarisSIganeKitchen > (shaxta - 100) * 4
  ) {
    const splitWcAndKIExtraArea = damper.startsWith('yes') ? 500 : 850;
    const splitWcAndKI =
      haersatarisSIganeWC1Dct +
      haersatarisSIganeWC2Dct +
      haersatarisSIganeKitchenDct1 +
      haersatarisSIganeKitchenDct2 +
      splitWcAndKIExtraArea;
    const res = check(
      Math.max(
        haersatarisSIganeWC1Dct,
        haersatarisSIganeWC2Dct,
        haersatarisSIganeKitchenDct1,
        haersatarisSIganeKitchenDct2
      )
    );

    if (!res) {
      return { result: splitWcAndKI };
    } else {
      return { result: null };
    }
  }

  //! მხოლოდ სამზარეულო გაიყო, არ არის wc

  if (haersatarisSIganeKitchen > (shaxta - 100) * 4 && toilet === 0) {
    const splitOnlyKIExtraArea = damper.startsWith('yes') ? 350 : 350 + 200;
    const splitOnlyKI =
      haersatarisSIganeKitchenDct1 +
      haersatarisSIganeKitchenDct2 +
      splitOnlyKIExtraArea;

    const res = check(
      Math.max(haersatarisSIganeKitchenDct2, haersatarisSIganeKitchenDct1)
    );

    if (!res) {
      return { result: splitOnlyKI };
    } else {
      return { result: null };
    }
  }

  //! მხოლოდ wc გაიყო, არ არის სამზარეულო

  if (haersatarisSIganeWC > (shaxta - 100) * 4 && kitchen === 0) {
    const splitOnlyWcExtraArea = damper.startsWith('yes') ? 400 : 400 + 200;
    const splitOnlyWc =
      haersatarisSIganeWC1Dct + haersatarisSIganeWC2Dct + splitOnlyWcExtraArea;

    const res = check(
      Math.max(haersatarisSIganeWC1Dct, haersatarisSIganeWC2Dct)
    );
    if (!res) {
      return { result: splitOnlyWc };
    } else {
      return { result: null };
    }
  }

  //! მხოლოდ wc გაიყო, არ გაიყო სამზარეულო
  if (
    haersatarisSIganeWC > (shaxta - 100) * 4 &&
    haersatarisSIganeKitchen < (shaxta - 100) * 4
  ) {
    const splitOnlyWcExtraAreawithKI = damper.startsWith('yes') ? 450 : 800;

    const splitOnlyWcWithKI =
      haersatarisSIganeWC1Dct +
      haersatarisSIganeWC2Dct +
      splitOnlyWcExtraAreawithKI +
      haersatarisSIganeKitchen;

    const res = check(
      Math.max(haersatarisSIganeWC1Dct, haersatarisSIganeWC2Dct)
    );
    if (!res) {
      return { result: splitOnlyWcWithKI };
    } else {
      return { result: null };
    }
  }

  //! მხოლოდ სამზარეულო გაიყო, არ გაიყო wc

  if (
    haersatarisSIganeWC < (shaxta - 100) * 4 &&
    haersatarisSIganeKitchen > (shaxta - 100) * 4
  ) {
    const splitOnlyKIExtraAreawithWC = damper.startsWith('yes') ? 450 : 800;
    const splitOnlyKIWithWC =
      haersatarisSIganeKitchenDct2 +
      haersatarisSIganeKitchenDct1 +
      splitOnlyKIExtraAreawithWC +
      haersatarisSIganeWC;

    const res = check(
      Math.max(haersatarisSIganeKitchenDct2, haersatarisSIganeKitchenDct1)
    );
    if (!res) {
      return { result: splitOnlyKIWithWC };
    } else {
      return { result: null };
    }
  }

  if (kitchen === 0) {
    const extraArea = damper.startsWith('yes') ? 350 : 350 + 200;
    return { result: haersatarisSIganeWC + extraArea };
  }
  if (toilet === 0) {
    const extraArea = damper.startsWith('yes') ? 300 : 300 + 200;
    return { result: haersatarisSIganeKitchen + extraArea };
  }

  return {
    result: resultWcKitWithoutSplit,
  };
};
