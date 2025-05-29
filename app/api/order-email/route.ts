// import { NextRequest, NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';

// export async function POST(request: NextRequest) {
//   try {
//     const { paymentIntentId, customerInfo, items, totalPrice } = await request.json();

//     // Create transporter (you can use Gmail, SendGrid, or any SMTP service)
//     const transporter = nodemailer.createTransporter({
//       host: process.env.SMTP_HOST,
//       port: parseInt(process.env.SMTP_PORT || '587'),
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     // Generate order confirmation email HTML
//     const emailHTML = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <title>Order Confirmation</title>
//         <style>
//           body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//           .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
//           .order-details { margin: 20px 0; }
//           .item { border-bottom: 1px solid #eee; padding: 15px 0; }
//           .item:last-child { border-bottom: none; }
//           .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
//           .footer { background-color: #f8f9fa; padding: 20px; margin-top: 30px; text-align: center; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>Thank you for your order!</h1>
//             <p>Order Confirmation #${paymentIntentId}</p>
//           </div>
          
//           <div class="order-details">
//             <h2>Order Details</h2>
            
//             <h3>Shipping Information</h3>
//             <p>
//               ${customerInfo.firstName} ${customerInfo.lastName}<br>
//               ${customerInfo.email}<br>
//               ${customerInfo.phone}<br>
//               ${customerInfo.address}<br>
//               ${customerInfo.city}, ${customerInfo.state} ${customerInfo.postalCode}<br>
//               ${customerInfo.country}
//             </p>
            
//             <h3>Items Ordered</h3>
//             ${items.map((item: any) => `
//               <div class="item">
//                 <strong>${item.title}</strong><br>
//                 Type: ${item.type}<br>
//                 ${item.size ? `Size: ${item.size}<br>` : ''}
//                 Quantity: ${item.quantity}<br>
//                 Price: ₦${(item.price * item.quantity).toLocaleString()}
//               </div>
//             `).join('')}
            
//             <div class="total">
//               Total: ₦${totalPrice.toLocaleString()}
//             </div>
//           </div>
          
//           <div class="footer">
//             <p>We'll send you a shipping notification when your order is on its way!</p>
//             <p>If you have any questions, please contact us at support@yourstore.com</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     // Send confirmation email to customer
//     await transporter.sendMail({
//       from: process.env.FROM_EMAIL || 'noreply@yourstore.com',
//       to: customerInfo.email,
//       subject: `Order Confirmation #${paymentIntentId}`,
//       html: emailHTML,
//     });

//     // Send notification email to admin (optional)
//     if (process.env.ADMIN_EMAIL) {
//       await transporter.sendMail({
//         from: process.env.FROM_EMAIL || 'noreply@yourstore.com',
//         to: process.env.ADMIN_EMAIL,
//         subject: `New Order Received - #${paymentIntentId}`,
//         html: `
//           <h2>New Order Received</h2>
//           <p><strong>Order ID:</strong> ${paymentIntentId}</p>
//           <p><strong>Customer:</strong> ${customerInfo.firstName} ${customerInfo.lastName}</p>
//           <p><strong>Email:</strong> ${customerInfo.email}</p>
//           <p><strong>Total:</strong> ₦${totalPrice.toLocaleString()}</p>
//           <p><strong>Items:</strong> ${items.length}</p>
//           ${emailHTML}
//         `,
//       });
//     }

//     return NextResponse.json({ success: true });

//   } catch (error) {
//     console.error('Error sending confirmation email:', error);
    
//     // Don't fail the order if email fails
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: 'Failed to send confirmation email',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 200 } // Still return 200 since the order succeeded
//     );
//   }
// }