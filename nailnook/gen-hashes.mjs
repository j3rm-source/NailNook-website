import bcrypt from 'bcryptjs'

const pins = { Admin: '0000', Sarah: '1234', Mike: '5678' }
for (const [name, pin] of Object.entries(pins)) {
  console.log(`${name}: ${bcrypt.hashSync(pin, 10)}`)
}
