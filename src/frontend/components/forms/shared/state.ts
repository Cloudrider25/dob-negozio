export const toggleConcernSelection = (
  concerns: string[],
  concern: string,
): string[] => {
  if (concerns.includes(concern)) {
    return concerns.filter((item) => item !== concern)
  }

  return [...concerns, concern]
}
