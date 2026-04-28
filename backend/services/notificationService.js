/**
 * Sends notifications to parents about student registration or course purchases.
 * In a real application, this would use an email (like SendGrid/Nodemailer) 
 * or SMS (like Twilio) service.
 */

const sendParentNotification = async ({ parentName, studentName, action, courseName, price, parentEmail, password }) => {
    const portalLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
    
    let message = '';
    
    if (action === 'registration') {
        message = `Hi ${parentName}, ${studentName} has registered on our LMS. 
To track your child's progress, you can access your portal through this link: ${portalLink}
Your credentials:
ID: ${parentEmail}
Pass: ${password || 'pass123'}

Happy Learning!`;
    } else if (action === 'purchase') {
        message = `Hi ${parentName}, ${studentName} has bought the course "${courseName}" for ₹${price}. 
To track your child's progress, you can access your portal through this link: ${portalLink}
Your credentials:
ID: ${parentEmail}
Pass: ${password || 'pass123'}`;
    }

    // For now, we simulate sending by logging to console
    console.log('--- NOTIFICATION SENT TO PARENT ---');
    console.log(`To: ${parentEmail}`);
    console.log(`Message: \n${message}`);
    console.log('------------------------------------');

    return true;
};

module.exports = { sendParentNotification };
