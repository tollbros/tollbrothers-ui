export const convertId15to18 = (id15) => {
  // this converts the 15 character id to 18 character id for salesforce
  let suffix = ''
  const mapping = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ012345'

  for (let block = 0; block < 3; block++) {
    let loop = 0

    for (let position = 4; position >= 0; position--) {
      const char = id15.charAt(block * 5 + position)

      if (char >= 'A' && char <= 'Z') {
        loop += 1 << position
      }
    }

    suffix += mapping.charAt(loop)
  }

  return id15 + suffix
}

export const createMessagePayload = (message, firstName, lastName, index) => {
  const formatedMessage = {
    id: `${message.identifier}`,
    payload: message.entryPayload?.abstractMessage?.staticContent,
    type: message.entryType,
    text: message.entryPayload?.abstractMessage?.staticContent.text,
    timestamp: message.clientTimestamp,
    role: message.sender?.role,
    sender:
      message.sender.role === 'EndUser' && message.senderDisplayName === 'Guest'
        ? `${firstName} ${lastName}`
        : message.senderDisplayName
  }

  if (message.sender?.role !== 'EndUser') {
    formatedMessage.image = `https://cdn.tollbrothers.com/images/osc/${convertId15to18(
      message.sender?.subject
    )}.jpg`
  }

  return formatedMessage
}

export const convertTimeStamp = (timestamp) => {
  const date = new Date(timestamp)
  const formattedDate = date.toLocaleDateString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })
  const time = formattedDate.split(', ')[1]
  return time
}

export const popNextUUID = () => crypto.randomUUID()
