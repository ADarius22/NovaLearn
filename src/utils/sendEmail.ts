export default async function sendEmail(
    to: string,
    subject: string,
    text: string,
  ) {
    console.log('─ Email stub ─');
    console.log('To     :', to);
    console.log('Subject:', subject);
    console.log('Text   :', text);
    console.log('──────────────');
    return Promise.resolve();
  }
  