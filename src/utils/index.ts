export function verifyInputCredentials(email: string, name: string, password: string) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const namePattern = /^[a-zA-Z\s]+$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{5,}$/;
  
    if (!emailPattern.test(email))
      throw new Error('Invalid email format. Example: user@example.com');
    if (!namePattern.test(name))
      throw new Error('Name should contain only letters and spaces.');
    if (!passwordPattern.test(password)) {
      throw new Error(
        'Password must include at least 5 characters, an uppercase letter, and a number.'
      );
    }
  }