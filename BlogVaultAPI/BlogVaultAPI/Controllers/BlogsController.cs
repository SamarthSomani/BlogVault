using BlogVaultApi.Data;
using BlogVaultApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class BlogsController : ControllerBase
{
    private readonly BlogContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public BlogsController(BlogContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    [HttpPost("createBlog")]
    public IActionResult CreateBlog([FromBody] BlogInputDto blogInput)
    {
        if (string.IsNullOrEmpty(blogInput.Title) || string.IsNullOrEmpty(blogInput.Content))
        {
            return BadRequest("Title and content are required.");
        }

        var uId = _httpContextAccessor?.HttpContext?.Session.GetString("UserId");
        if (string.IsNullOrEmpty(uId))
        {
            return BadRequest("Invalid user");
        }

        try
        {
            Guid userId = Guid.Parse(uId);

            var newBlog = new Blog
            {
                BlogId = Guid.NewGuid(),
                UserId = userId,
                Title = blogInput.Title,
                Content = blogInput.Content,
                Created = DateTime.Now
            };

            _context.Blogs.Add(newBlog);
            _context.SaveChanges();

            return Ok("Blog created successfully.");
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("{blogId}")]
    public async Task<IActionResult> GetBlogDetails([FromRoute] Guid blogId)
    {
        var blogDetails = await _context.Blogs
            .Where(blog => blog.BlogId == blogId)
            .Join(_context.Users,
                  blog => blog.UserId,
                  user => user.UserId,
                  (blog, user) => new BlogDetailsDto
                  {
                      Title = blog.Title,
                      Content = blog.Content,
                      Created = blog.Created,
                      Username = user.Username,
                      Name = user.Name
                  })
            .FirstOrDefaultAsync();
        Console.WriteLine(blogDetails);
        if (blogDetails == null)
        {
            return NotFound($"Blog with id {blogId} not found.");
        }

        return Ok(blogDetails);
    }

    [HttpDelete("{blogId}/deleteBlog")]
    public IActionResult DeleteBlog([FromRoute] Guid blogId)
    {
        // Retrieve the UserId and BlogId from the session
        var userId = _httpContextAccessor?.HttpContext?.Session.GetString("UserId");
        //var blogIdString = _httpContextAccessor?.HttpContext?.Session.GetString("BlogId");

        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("User ID is not available in the session.");
        }


        // Fetch the blog from the database using BlogId and UserId
        var blog = _context.Blogs.FirstOrDefault(b => b.BlogId == blogId && b.UserId == Guid.Parse(userId));

        if (blog == null)
        {
            return NotFound("Blog not found or you do not have permission to delete this blog.");
        }

        // Remove the blog from the database
        _context.Blogs.Remove(blog);
        _context.SaveChanges();

        return Ok("Blog deleted successfully.");
    }

    [HttpGet("allBlogs")]
    public async Task<List<BlogViewDto>> GetAllBlogsAsync()
    {
        return await _context.Blogs
            .Join(_context.Users,
                  blog => blog.UserId,
                  user => user.UserId,
                  (blog, user) => new BlogViewDto
                  {
                      Title = blog.Title,
                      Name = user.Name,
                      BlogId = blog.BlogId.ToString()
                  })
            .ToListAsync();
    }

    [HttpGet("myBlogs")]
    public async Task<List<BlogViewDto>> GetMyBlogs()
    {
        var userId_string = _httpContextAccessor?.HttpContext?.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userId_string))
        { 
            return new List<BlogViewDto>(); 
        }

        var userData = _context.Users.FirstOrDefault(b => b.UserId == Guid.Parse(userId_string));
        return await _context.Blogs
            .Where(blog => blog.UserId == userData!.UserId)
            .Join(_context.Users,
                  blog => blog.UserId,
                  user => user.UserId,
                  (blog, user) => new BlogViewDto
                  {
                      Title = blog.Title,
                      Name = user.Name,
                      BlogId = blog.BlogId.ToString()
                  })
            .ToListAsync();
    }

    [HttpGet("{blogId}/ratingsCount")]
    public IActionResult GetTotalRatingsForBlog([FromRoute] Guid blogId)
    {
        var result = _context.Ratings.Count(r => r.BlogId == blogId);
        return Ok(new {totalRatings = result});
    }

    [HttpGet("{blogId}/averageRating")]
    public IActionResult GetAverageRatingForBlog([FromRoute] Guid blogId)
    {
        var ratings = _context.Ratings
                              .Where(r => r.BlogId == blogId)
                              .Select(r => r.RatingStars);

        if (ratings.Any())
        {
            return Ok(new { averageRating = ratings.Average() });
        }

        return Ok(new { averageRating = 0.0 }); ; // Return 0 if there are no ratings
    }

    [HttpPost("{blogId}/addComment")]
    public IActionResult AddComment([FromRoute] Guid blogId, [FromBody] AddCommentDto request)
    {
        if (string.IsNullOrEmpty(request.content))
        {
            return BadRequest("Comment content cannot be empty.");
        }

        var userIdString = _httpContextAccessor?.HttpContext?.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdString))
        {
            return Unauthorized("User is not logged in.");
        }

        Guid userId = Guid.Parse(userIdString);

        var blog = _context.Blogs.FirstOrDefault(b => b.BlogId == blogId);
        if (blog == null)
        {
            return NotFound("Blog not found.");
        }

        var comment = new Comment
        {
            CommentId = Guid.NewGuid(),
            BlogId = blogId,
            UserId = userId,
            Content = request.content,
            DateAndTime = DateTime.Now
        };

        _context.Comments.Add(comment);
        _context.SaveChanges();

        return Ok("Comment added successfully.");
    }

    [HttpGet("{blogId}/allComments")]
    public IActionResult GetComments([FromRoute] Guid blogId)
    {
        var blog = _context.Blogs.FirstOrDefault(b => b.BlogId == blogId);
        if (blog == null)
        {
            return NotFound("Blog not found.");
        }

        var comments = _context.Comments
                               .Where(c => c.BlogId == blogId)
                               .Select(c => new
                               {
                                   commentId = c.CommentId.ToString(),
                                   content = c.Content,
                                   dateTime = c.DateAndTime.ToString("o"),
                                   username = c.User.Username // Assuming User entity has Username property
                               })
                               //.OrderByDescending(c => c.DateAndTime)
                               .ToList();

        if (comments.Count == 0)
        {
            return Ok("No comments found for this blog.");
        }

        return Ok(comments);
    }

    [HttpPost("{blogId}/addOrUpdateRating")]
    public IActionResult AddOrUpdateRating([FromRoute] Guid blogId, [FromBody] AddRatingDto ard)
    {
        int? ratingStars = ard.stars;
        if (ratingStars == null)
        {
            return BadRequest("Rating is required");
        }
        // Validate the rating value
        if (ratingStars < 1 || ratingStars > 5)
        {
            return BadRequest("Rating must be between 1 and 5 stars.");
        }

        // Retrieve UserId and BlogId from session
        var userIdString = _httpContextAccessor?.HttpContext?.Session.GetString("UserId");
        //var blogIdString = _httpContextAccessor?.HttpContext?.Session.GetString("BlogId");

        if (string.IsNullOrEmpty(userIdString))
        {
            return BadRequest("User not found in session.");
        }

        var userId = Guid.Parse(userIdString);
        //var blogId = Guid.Parse(blogIdString);

        // Check if the rating already exists for this user and blog
        var existingRating = _context.Ratings.FirstOrDefault(r => r.UserId == userId && r.BlogId == blogId);

        if (existingRating != null)
        {
            // Update existing rating
            existingRating.RatingStars = ratingStars.Value;
        }
        else
        {
            // Create a new rating
            var newRating = new Rating
            {
                RatingId = Guid.NewGuid(),
                UserId = userId,
                BlogId = blogId,
                RatingStars = ratingStars.Value
            };

            _context.Ratings.Add(newRating);
        }

        // Save changes to the database
        _context.SaveChanges();

        return Ok("Rating added or updated successfully.");
    }

    [HttpGet("{blogId}/checkUserAccess")]
    public IActionResult CheckUserAccess(Guid blogId)
    {
        // Get UserId from session
        var sessionUserId = _httpContextAccessor?.HttpContext?.Session.GetString("UserId");
        if (string.IsNullOrEmpty(sessionUserId))
        {
            return Unauthorized(new {access = false});
        }

        // Find the blog by blogId
        var blog = _context.Blogs.SingleOrDefault(b => b.BlogId == blogId);
        if (blog == null)
        {
            return NotFound(new {access = false});
        }

        // Check if the session UserId matches the blog's UserId
        if (blog.UserId.ToString() == sessionUserId)
        {
            return Ok(new {access = true});
        }
        else
        {
            return Ok(new { access = false});
        }
    }

}
