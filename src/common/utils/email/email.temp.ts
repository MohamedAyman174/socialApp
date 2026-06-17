export const emailTemplate =(otp:number)=>{
    return `html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Message - Saraha App</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">

  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; margin-top:20px; border-radius:8px; overflow:hidden;">
    
    <!-- Header -->
    <tr>
      <td style="background:#6C63FF; padding:20px; text-align:center; color:#ffffff;">
        <h1 style="margin:0;">Saraha</h1>
        <p style="margin:5px 0 0;">You’ve got a new message 👀</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:30px; color:#333;">
        <h2 style="margin-top:0;">Hello,</h2>
        <p>You just received a new anonymous message on your Saraha profile.</p>

        <!-- Message Box -->
        <div style="background:#f9f9f9; border-left:4px solid #6C63FF; padding:15px; margin:20px 0; border-radius:5px;">
          <p style="margin:0; font-style:italic;">
            "Your OTP code is: <strong>${otp}</strong>"
          </p>
        </div>

        <p>Curious to know more? Click below to view and reply.</p>

        <!-- Button -->
        <div style="text-align:center; margin:30px 0;">
          <a href="#" style="background:#6C63FF; color:#ffffff; text-decoration:none; padding:12px 25px; border-radius:5px; font-weight:bold;">
            View Message
          </a>
        </div>

        <p style="font-size:14px; color:#777;">
          If you didn’t expect this email, you can safely ignore it.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#f0f0f0; text-align:center; padding:15px; font-size:12px; color:#999;">
        © 2026 Saraha App. All rights reserved.
      </td>
    </tr>

  </table>

</body>
</html>
`

}