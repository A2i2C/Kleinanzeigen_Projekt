import vine from '@vinejs/vine'

const password = {
  password: vine
    .string()
    .regex(/^(?!.*\s)(?=.{8,256}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)
}

const benutzername = {
  benutzername: vine.string().minLength(3).maxLength(20).trim()
}

const email = {
  email: vine.string().email().trim()
}

const profilepicture = {
  profilbild: vine.file({ size: '2mb', extnames: ['jpg', 'png', 'jpeg'] }),
}

export const registrierungsValidator = vine.compile(
  vine.object({
    ...benutzername,
    ...email,
    ...password
  })
)

export const profilepictureValidator = vine.compile(
  vine.object({
    ...profilepicture,
  })
)

export const passwordValidator = vine.compile(
  vine.object({
    ...password,
  })
)

export const benutzernameValidator = vine.compile(
  vine.object({
    ...benutzername,
  })
)

export const emailValidator = vine.compile(
  vine.object({
    ...email,
  })
)
