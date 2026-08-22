export const generateUniversityId = () => {
  const year = new Date().getFullYear(); // 2026
  const random = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `UNI-${year}-${random}`;
};
