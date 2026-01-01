using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieTicketingAPI.Data;
using MovieTicketingAPI.Models;

namespace MovieTicketingAPI.Controllers
{
    [ApiController]
    [Route("api/movies")]
    public class MoviesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public MoviesController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/movies
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Movie>>> GetAllMovies()
        {
            return await _db.Movies.ToListAsync();
        }

        // GET: api/movies/location/Hyderabad
        [HttpGet("location/{location}")]
public async Task<ActionResult<IEnumerable<Movie>>> GetMoviesByLocation(string location)
{
    var movies = await _db.Movies
        .Where(m => m.Location.ToLower() == location.ToLower())
        .ToListAsync();

    return movies;
}

    }
}
