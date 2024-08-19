using System;

namespace BlogVaultApi.Models
{
    public class Comment
    {
        public Guid CommentId { get; set; }
        public Guid BlogId { get; set; }
        public Guid UserId { get; set; }
        public DateTime DateAndTime { get; set; }
        public string Content { get; set; }

        public Blog Blog { get; set; }
        public User User { get; set; }
    }
}
