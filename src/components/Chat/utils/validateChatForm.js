export const validateChatForm = (form) => {
  const [firstName, ...lastNameParts] = form.name?.value?.trim().split(' ')
  const lastName = lastNameParts?.join(' ')

  if (
    !firstName ||
    !lastName ||
    firstName?.length < 2 ||
    lastName?.length < 2
  ) {
    form.name.setCustomValidity(
      'First and last name must both be at least 2 characters long.'
    )
    form.reportValidity()
    return { valid: false }
  }

  if (firstName?.trim().length > 40) {
    form.name.setCustomValidity(
      'First name cannot be longer than 40 characters.'
    )
    form.reportValidity()
    return { valid: false }
  }

  if (lastName?.trim().length > 80) {
    form.name.setCustomValidity(
      'Last name cannot be longer than 80 characters.'
    )
    form.reportValidity()
    return { valid: false }
  }

  return { valid: true, firstName, lastName }
}
