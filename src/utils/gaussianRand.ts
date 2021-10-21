export function gaussianRand() {
  let rand = 0;

  for (let i = 0; i < 6; i += 1) {
    rand += Math.random();
  }

  return rand / 6;
}
