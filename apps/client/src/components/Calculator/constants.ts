const calculateProbability = (count: number): number => {
  if (count >= 1 && count <= 4) return 1;
  if (count <= 9) return 0.78;
  if (count <= 14) return 0.63;
  if (count <= 19) return 0.53;
  if (count <= 24) return 0.49;
  if (count <= 29) return 0.46;
  if (count <= 34) return 0.44;
  if (count <= 39) return 0.42;
  if (count <= 49) return 0.41;
  if (count >= 50) return 0.38;
  return 0;
};

function roundNumber(value: number): number {
  if (value <= 75) return 50;
  if (value <= 115) return 100;
  if (value <= 165) return 150;
  if (value <= 215) return 200;
  if (value <= 265) return 250;
  if (value <= 315) return 300;
  if (value <= 365) return 350;
  if (value <= 415) return 400;
  if (value <= 465) return 450;
  if (value <= 515) return 500;
  if (value <= 565) return 550;
  if (value <= 615) return 600;
  if (value <= 665) return 650;
  if (value <= 715) return 700;
  if (value <= 765) return 750;
  if (value <= 815) return 800;
  if (value <= 865) return 850;
  if (value <= 915) return 900;
  if (value <= 965) return 950;
  if (value <= 1015) return 1000;
  if (value <= 1065) return 1050;
  if (value <= 1115) return 1100;
  if (value <= 1165) return 1150;
  if (value <= 1215) return 1200;
  if (value <= 1265) return 1250;
  if (value <= 1315) return 1300;
  if (value <= 1365) return 1350;
  if (value <= 1415) return 1400;
  if (value <= 1465) return 1450;
  if (value <= 1515) return 1500;
  if (value <= 1565) return 1550;
  if (value <= 1615) return 1600;
  if (value <= 1665) return 1650;
  if (value <= 1715) return 1700;
  if (value <= 1765) return 1750;
  if (value <= 1815) return 1800;
  if (value <= 1865) return 1850;
  if (value <= 1915) return 1900;
  if (value <= 1965) return 1950;

  return 2000;
}

export { calculateProbability, roundNumber };
