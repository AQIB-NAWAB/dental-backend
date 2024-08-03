
import nodeMailer from "nodemailer";


const sendEmail=async(options:any)=>{
    console.log(process.env.SMPT_SERVICE)
const transporter=nodeMailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    service:process.env.SMPT_SERVICE,
    auth:{
        user:process.env.SMPT_MAIL,
        pass:process.env.SMPT_PASSWORD
    }  
})

const mailOptions={
    from:process.env.SMPT_MAIL,
    to:[options.email,'useer4432@gmail.com'],
    subject:options.subject,
    html:options.html
}
await  transporter.sendMail(mailOptions)
}


export {sendEmail};