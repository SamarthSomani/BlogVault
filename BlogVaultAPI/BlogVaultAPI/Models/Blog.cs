namespace BlogVaultApi.Models
{
    public class Blog
    {
        public Guid BlogId { get; set; }
        public Guid UserId { get; set; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        public DateTime Created { get; set; }

        public User User { get; set; } // Navigation property
        public ICollection<Rating> Ratings { get; set; }
        public ICollection<Comment> Comments { get; set; }
    }
}