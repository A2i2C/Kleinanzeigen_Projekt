import vine from '@vinejs/vine'
let password = {
  password: vine
    .string()
    .regex(/^(?!.*\s)(?=.{8,256}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\-\_\:])/),
}

const vorname = {
  vorname: vine.string().minLength(2).maxLength(50).trim(),
}

const nachname = {
  nachname: vine.string().minLength(2).maxLength(50).trim(),
}

const benutzername = {
  benutzername: vine.string().minLength(3).maxLength(20).trim(),
}

const email = {
  email: vine.string().email().trim(),
}

export const updateProfileValidator = vine.compile(
  vine.object({
    ...email,
    ...benutzername,
    ...vorname,
    ...nachname,
  })
)

export const registrierungsValidator = vine.compile(
  vine.object({
    ...benutzername,
    ...email,
    ...password,
  })
)

export const passwordValidator = vine.compile(
  vine.object({
    ...password,
  })
)
