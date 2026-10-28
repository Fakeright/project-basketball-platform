export function normalizedPlayerIdentityParts(
  firstName: string,
  lastName: string,
  birthDate: string,
) {
  return {
    firstName: firstName.trim().toLowerCase(),
    lastName: lastName.trim().toLowerCase(),
    birthDate,
  }
}
