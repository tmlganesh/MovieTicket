using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieTicketingAPI.Data;
using MovieTicketingAPI.Models;

namespace MovieTicketingAPI.Controllers
{
    [ApiController]
    [Route("api/shows")]
    public class ShowsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ShowsController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/shows/movie/1
        [HttpGet("movie/{movieId}")]
        public async Task<ActionResult<IEnumerable<Show>>> GetShowsByMovie(int movieId)
        {
            var shows = await _db.Shows
                .AsNoTracking()
                .Where(s => s.MovieId == movieId)
                .OrderBy(s => s.ShowTime)
                .ToListAsync();

            // Auto-create shows if none exist for this movie
            if (!shows.Any())
            {
                var movie = await _db.Movies.FindAsync(movieId);
                if (movie == null) return NotFound("Movie not found");

                var newShows = new List<Show>();
                var baseDate = DateTime.Today;
                for (int day = 0; day < 3; day++)
                {
                    var showDate = baseDate.AddDays(day);
                    newShows.Add(new Show { MovieId = movieId, ShowTime = showDate.AddHours(10).AddMinutes(30) });
                    newShows.Add(new Show { MovieId = movieId, ShowTime = showDate.AddHours(14) });
                    newShows.Add(new Show { MovieId = movieId, ShowTime = showDate.AddHours(18).AddMinutes(30) });
                    newShows.Add(new Show { MovieId = movieId, ShowTime = showDate.AddHours(21) });
                }
                await _db.Shows.AddRangeAsync(newShows);
                await _db.SaveChangesAsync();
                shows = newShows;
            }

            return shows;
        }
    }
}
