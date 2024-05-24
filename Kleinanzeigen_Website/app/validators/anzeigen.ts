import vine from '@vinejs/vine'

const title = {
  title: vine.string().minLength(2).maxLength(50).trim(),
}

const description = {
  description: vine.string().minLength(2).maxLength(1500).trim().nullable().optional(),
}

const price = {
  price: vine.number().decimal([0, 2]).positive().max(1000000.99),
}

const shipping = {
  shipping: vine.number().decimal([0, 2]).positive().max(61.99).nullable().optional(),
}

export const shippingValidator = vine.compile(
  vine.object({
    ...shipping,
  })
)

export const createAnzeigeValidator = vine.compile(
  vine.object({
    ...title,
    ...description,
    ...price,
  })
)
