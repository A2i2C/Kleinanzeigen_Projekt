import vine from '@vinejs/vine'

const message = {
  message: vine.string().minLength(1).maxLength(500).trim(),
}

export const messageValidator = vine.compile(
  vine.object({
    ...message,
  })
)
