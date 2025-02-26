import { indicadorWords } from './dictionaries/indicadorDictionary';
import { receptorWords } from './dictionaries/receptorDictionary';

// Calcula la distancia de Levenshtein entre dos strings
const levenshteinDistance = (str1, str2) => {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator,
      );
    }
  }
  return track[str2.length][str1.length];
};

// Encuentra la palabra más cercana en el diccionario correspondiente
export const findClosestWord = (word, field) => {
  if (!word || typeof word !== 'string') return '';
  word = word.toLowerCase().trim();
  
  // Seleccionar el diccionario según el campo
  const dictionary = field === 'receptor' ? receptorWords : 
                    field === 'indicador' ? indicadorWords :
                    [...indicadorWords, ...receptorWords]; // Para observaciones u otros campos

  // Si la palabra está en el diccionario, devuélvela tal cual
  if (dictionary.includes(word)) return word;

  // Encuentra la palabra más cercana
  let closest = word;
  let minDistance = Infinity;

  dictionary.forEach(dictWord => {
    const distance = levenshteinDistance(word, dictWord);
    if (distance < minDistance && distance <= 2) {
      minDistance = distance;
      closest = dictWord;
    }
  });

  return closest;
};

export const autocorrectText = (text, field) => {
  if (!text || typeof text !== 'string') return '';
  
  // Dividir el texto por espacios y otros caracteres de separación
  const words = text.split(/[\s,.-]+/);
  
  const correctedWords = words.map(word => 
    word.length >= 3 ? findClosestWord(word, field) : word
  );

  return correctedWords.join(' ');
};
