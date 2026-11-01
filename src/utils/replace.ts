const profaneWords = ["kerfuffle", "sharbert", "fornax"];

export const replaceProfane = (text: string): string => {
  return text
    .split(" ")
    .map((word) => (profaneWords.includes(word.toLowerCase()) ? "****" : word))
    .join(" ");
};
