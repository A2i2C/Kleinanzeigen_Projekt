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

const images = {
  images: vine.array(
    vine.file({
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })
  ),
}

const imagearray = {
  images: vine.array(
    vine.file({
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })
  ),
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

export const imageValidator = vine.compile(
  vine.object({
    ...images,
  })
)

export const imageArrayValidator = vine.compile(
  vine.object({
    ...imagearray,
  })
)
