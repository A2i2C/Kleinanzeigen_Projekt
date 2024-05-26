import vine from '@vinejs/vine'

const message = {
  message: vine.string().minLength(1).maxLength(5000).trim(),
}

const name = {
    name: vine.string().minLength(1).maxLength(100).trim(),
}

const email = {
    email: vine.string().email().trim(),
}

export const contactValidator = vine.compile(
  vine.object({
    ...name,
    ...email,
    ...message,
  })
)
