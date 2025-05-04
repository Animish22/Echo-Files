import {z} from 'zod' 

export const verificationEmailSchema = z.object({
    verificationCode : z.string().min(1 , {message : "Verification Code is Required"}).min(6 , {message : "Verification code is of 6 characters"})
})

export type verificationEmailType = z.infer<typeof verificationEmailSchema>