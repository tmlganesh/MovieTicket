using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieTicketingAPI.Data;
using MovieTicketingAPI.Models;

namespace MovieTicketingAPI.Controllers
{
    [ApiController]
    [Route("api/seed")]
    public class SeedController : ControllerBase
    {
        private readonly AppDbContext _db;

        public SeedController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/seed/shows
        [HttpGet("shows")]
        public async Task<IActionResult> SeedShows()
        {
            var movies = await _db.Movies.AsNoTracking().ToListAsync();
            if (!movies.Any())
            {
                return BadRequest("No movies found");
            }

            // Check existing shows
            var existingCount = await _db.Shows.CountAsync();
            
            var shows = new List<Show>();
            var baseDate = DateTime.Today;

            foreach (var movie in movies)
            {
                // Check if shows exist for this movie
                var hasShows = await _db.Shows.AnyAsync(s => s.MovieId == movie.Id);
                if (hasShows) continue;

                for (int day = 0; day < 3; day++)
                {
                    var showDate = baseDate.AddDays(day);
                    shows.Add(new Show { MovieId = movie.Id, ShowTime = showDate.AddHours(10).AddMinutes(30) });
                    shows.Add(new Show { MovieId = movie.Id, ShowTime = showDate.AddHours(14) });
                    shows.Add(new Show { MovieId = movie.Id, ShowTime = showDate.AddHours(18).AddMinutes(30) });
                    shows.Add(new Show { MovieId = movie.Id, ShowTime = showDate.AddHours(21) });
                }
            }

            if (shows.Any())
            {
                await _db.Shows.AddRangeAsync(shows);
                await _db.SaveChangesAsync();
            }

            return Ok(new { message = $"Added {shows.Count} shows. Total shows: {existingCount + shows.Count}" });
        }

        // GET: api/seed/seats/{showId}
        [HttpGet("seats/{showId}")]
        public async Task<IActionResult> SeedSeats(int showId)
        {
            var show = await _db.Shows.FindAsync(showId);
            if (show == null)
            {
                return NotFound("Show not found");
            }

            var existingSeats = await _db.Seats.AnyAsync(s => s.ShowId == showId);
            if (existingSeats)
            {
                return Ok(new { message = "Seats already exist for this show" });
            }

            var seats = new List<Seat>();
            var rows = new[] { "A", "B", "C", "D", "E" };

            foreach (var row in rows)
            {
                for (int num = 1; num <= 10; num++)
                {
                    seats.Add(new Seat
                    {
                        ShowId = showId,
                        SeatNumber = $"{row}{num}",
                        IsBooked = false
                    });
                }
            }

            await _db.Seats.AddRangeAsync(seats);
            await _db.SaveChangesAsync();

            return Ok(new { message = $"Added {seats.Count} seats for show {showId}" });
        }
    }
}
