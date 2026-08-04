module.exports = async () => 
{
    const firstAlphabet = "abcdefghijklmnopqrstuvwxyz";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
    const length = 21;
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let id = "";
    id += firstAlphabet[bytes[0] % firstAlphabet.length];
    for (let i = 1; i < length; i++) {
        id += alphabet[bytes[i] % alphabet.length];
    }
    return id;
};
