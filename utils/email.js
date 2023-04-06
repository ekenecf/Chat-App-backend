const nodemailer = require('nodemailer')
const dotenv = require('dotenv')

dotenv.config({ path: '../config/index.env' })

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAILPASSWORD,
    },
  })
  let mailOptions = {
    from: process.env.EMAIL,
    to: options.email,
    subject: options.subject,
    html: options.message,
  }
  await transporter.sendMail(mailOptions)
}
module.exports = sendEmail
