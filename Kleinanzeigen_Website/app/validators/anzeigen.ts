import vine from '@vinejs/vine'

const title = {
  title: vine.string().minLength(2).maxLength(50).trim()
}

const description = {
  description: vine.string().minLength(2).maxLength(1000).trim().nullable()
}

const price = {
  price: vine.number().decimal([0, 2]).positive()
}

const shipping = {
  shipping: vine.number().decimal([0, 2]).positive().max(62).nullable()
}

const images = {
  images: vine.array(
   vine.file({
    size: '2mb',
    extnames: ['jpg', 'jpeg', 'png']
  })
  )
}

export const createAnzeigeValidator = vine.compile(
    vine.object({
        ...title,
        ...description,
        ...price,
      ...shipping,
    })
)

export const imageValidator = vine.compile(
  vine.object({
    ...images
  })
)