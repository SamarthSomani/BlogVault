namespace BlogVaultApi.Models
{
    public class Rating
    {
        public Guid RatingId { get; set; }
        public Guid UserId { get; set; }
        public Guid BlogId { get; set; }
        public int RatingStars { get; set; }

        public Blog Blog { get; set; }
        public User User { get; set; }
    }
}