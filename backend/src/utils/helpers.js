function maskPaymentDetails(type, details) {
    const masked = { ...details };

    switch (type) {
      case 'card':
        if (masked.cardNumber) {
          masked.cardNumber = `****-****-****-${masked.cardNumber.slice(-4)}`;
        }
        break;
      case 'paypal':
        if (masked.paypalEmail) {
          const [username, domain] = masked.paypalEmail.split('@');
          masked.paypalEmail = `${username.slice(0, 2)}***@${domain}`;
        }
        break;
      case 'wallet':
        if (masked.walletId) {
          masked.walletId = `***${masked.walletId.slice(-4)}`;
        }
        break;
    }

    return masked;
}

module.exports = { maskPaymentDetails };