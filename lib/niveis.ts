// Intensidade da cor do mapa pelo número de deputados do círculo (1 = menos, 5 = mais).
export const nivel = (n: number) => (n <= 3 ? 1 : n <= 6 ? 2 : n <= 10 ? 3 : n <= 20 ? 4 : 5);
