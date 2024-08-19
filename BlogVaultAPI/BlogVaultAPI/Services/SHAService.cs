using System.Security.Cryptography;
using System.Text;

namespace BlogVaultApi.Services
{
    public class SHAService
    {
        public static string ComputeSha256Hash(string rawData)
        {
            // Create a SHA256 object
            using (SHA256 sha256Hash = SHA256.Create())
            {
                // Compute the hash - returns a byte array
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));

                // Convert the byte array to a string of hexadecimal characters
                StringBuilder builder = new StringBuilder();
                foreach (byte b in bytes)
                {
                    builder.Append(b.ToString("x2"));
                }

                return builder.ToString();
            }
        }
    }
}
